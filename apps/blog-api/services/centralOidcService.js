const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcryptjs');
const { Op, fn, col, where } = require('sequelize');
let modelCache;
const getModels = () => modelCache || (modelCache = require('../models'));
const getRedisService = () => require('./redisService');

const SESSION_COOKIE = '__Host-home_session';
const CSRF_COOKIE = '__Host-home_csrf';
const CLAIM_COOKIE = '__Host-home_oidc_claim';
const STATE_COOKIE = '__Host-home_oidc_state';
// 本仓是个人主页，只认自己产品的两项能力。
const MANAGEMENT_CAPABILITY = 'home.blog.manage';
const PUBLIC_CAPABILITY = 'home.blog.use';
const SUBJECT_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const runtime = () => {
  const issuer = String(process.env.OIDC_ISSUER_URL || '').replace(/\/$/, '');
  const origin = String(process.env.BLOG_PUBLIC_ORIGIN || process.env.PUBLIC_ORIGIN || '').replace(/\/$/, '');
  const clientId = String(process.env.OIDC_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.OIDC_CLIENT_SECRET || '').trim();
  if (!issuer || !clientId || !clientSecret || !origin) {
    throw new Error('中央 OIDC 客户端未完整配置');
  }
  if (!/^https:\/\//i.test(issuer) && process.env.NODE_ENV === 'pro' && process.env.OIDC_ALLOW_INSECURE_LOCAL !== '1') {
    throw new Error('生产环境中央 OIDC issuer 必须使用 HTTPS');
  }
  return {
    issuer,
    clientId,
    clientSecret,
    redirectUri: process.env.OIDC_REDIRECT_URI || `${origin}/api/auth/oidc/callback`,
    scope: process.env.OIDC_SCOPE || 'openid profile email offline_access',
    idleSeconds: Number(process.env.PRODUCT_SESSION_IDLE_SECONDS || 12 * 60 * 60),
    absoluteSeconds: Number(process.env.PRODUCT_SESSION_ABSOLUTE_SECONDS || 30 * 24 * 60 * 60),
  };
};

let discoveryPromise;
let jwks = null;

const base64url = (value) => Buffer.from(value).toString('base64url');
const random = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');
const hash = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
const sameHash = (a, b) => crypto.timingSafeEqual(Buffer.from(hash(a)), Buffer.from(hash(b)));

// Historical mail values were not normalized. Query by folded value on both
// MySQL and SQLite so a differently cased legacy row always enters claim.
const findByMail = (Model, email) => {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return Promise.resolve(null);
  return Model.findOne({ where: where(fn('lower', col('mail')), normalized) });
};

const claimRateLimit = async (req, row, action) => {
  const ip = String(req.ip || req.socket?.remoteAddress || 'unknown');
  const keys = action === 'code'
    ? [
      { key: `oidc:claim:code:cooldown:${hash(row.id)}`, limit: 1, seconds: 60 },
      { key: `oidc:claim:code:state:${hash(row.id)}`, limit: 3, seconds: 600 },
      { key: `oidc:claim:code:email:${hash(String(row.identityEmail).toLowerCase())}`, limit: 3, seconds: 600 },
      { key: `oidc:claim:code:ip:${hash(ip)}`, limit: 10, seconds: 600 },
    ]
    : [
      { key: `oidc:claim:attempt:state:${hash(row.id)}`, limit: 5, seconds: 600 },
      { key: `oidc:claim:attempt:subject:${hash(row.identitySubject)}`, limit: 10, seconds: 600 },
      { key: `oidc:claim:attempt:email:${hash(String(row.identityEmail).toLowerCase())}`, limit: 10, seconds: 600 },
      { key: `oidc:claim:attempt:ip:${hash(ip)}`, limit: 20, seconds: 600 },
    ];
  if (!await getRedisService().consumeRateLimits(keys)) throw new Error('操作过于频繁');
};

const secretKey = () => {
  const value = process.env.OIDC_STATE_ENCRYPTION_KEY || process.env.JWT_SECRET || '';
  if (!value && process.env.NODE_ENV === 'pro') throw new Error('中央 OIDC 状态加密密钥未配置');
  return crypto.createHash('sha256').update(value || 'home-development-only').digest();
};

const seal = (value) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', secretKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${ciphertext.toString('base64url')}`;
};

const unseal = (value) => {
  const [ivText, tagText, cipherText] = String(value || '').split('.');
  if (!ivText || !tagText || !cipherText) throw new Error('中央 OIDC 密文格式错误');
  const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey(), Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(cipherText, 'base64url')), decipher.final()]).toString('utf8');
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, { redirect: 'error', ...options });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = {}; }
  if (!response.ok) {
    const error = new Error(`中央 OIDC 请求失败: ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
};

const discovery = async () => {
  const config = runtime();
  if (!discoveryPromise) {
    discoveryPromise = requestJson(`${config.issuer}/.well-known/openid-configuration`)
      .catch((error) => { discoveryPromise = null; throw error; });
  }
  const metadata = await discoveryPromise;
  if (metadata.issuer !== config.issuer || !metadata.authorization_endpoint || !metadata.token_endpoint || !metadata.introspection_endpoint || !metadata.jwks_uri) {
    throw new Error('中央 OIDC discovery 不满足产品契约');
  }
  return metadata;
};

const normalizedReturnTo = (value) => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/';
  return value.length > 512 ? '/' : value;
};

const scopeFor = () => runtime().scope;

async function beginLogin(mode, returnTo) {
  const { CentralOidcState } = getModels();
  const config = runtime();
  const metadata = await discovery();
  const state = random();
  const nonce = random();
  const verifier = random(48);
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
  const now = new Date();
  await CentralOidcState.destroy({ where: { expiresAt: { [Op.lt]: now } } });
  await CentralOidcState.create({
    id: uuid(),
    stateHash: hash(state),
    nonceHash: hash(nonce),
    codeVerifierCiphertext: seal(verifier),
    returnTo: normalizedReturnTo(returnTo),
    requestedScope: scopeFor(mode),
    requestedMode: mode === 'management' ? 'management' : 'public',
    expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
    consumedAt: null,
    createdAt: now,
    updatedAt: now,
  });
  const url = new URL(metadata.authorization_endpoint);
  url.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: scopeFor(mode),
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }).toString();
  return url.toString();
}

const decodePart = (token, position) => {
  const part = String(token || '').split('.')[position];
  if (!part) throw new Error('中央 ID token 格式错误');
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
};

const verifyIdToken = async (token, nonce) => {
  const config = runtime();
  const header = decodePart(token, 0);
  const payload = decodePart(token, 1);
  if (header.alg !== 'ES256' || typeof header.kid !== 'string' || (nonce && payload.nonce !== nonce) || payload.iss !== config.issuer || payload.aud !== config.clientId || !SUBJECT_RE.test(payload.sub || '')) {
    throw new Error('中央 ID token 声明不符合契约');
  }
  const metadata = await discovery();
  if (!jwks) jwks = await requestJson(metadata.jwks_uri);
  const key = (jwks.keys || []).find((item) => item.kid === header.kid && item.alg === 'ES256');
  if (!key) {
    jwks = await requestJson(metadata.jwks_uri);
  }
  const current = (jwks.keys || []).find((item) => item.kid === header.kid && item.alg === 'ES256');
  if (!current) throw new Error('中央 JWKS 缺少 ID token 签名密钥');
  const publicKey = crypto.createPublicKey({ key: current, format: 'jwk' });
  return jwt.verify(token, publicKey, { algorithms: ['ES256'], issuer: config.issuer, audience: config.clientId });
};

const clientAuthorization = (config) => `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`;

const exchangeCode = async (code, verifier) => {
  const config = runtime();
  const metadata = await discovery();
  return requestJson(metadata.token_endpoint, {
    method: 'POST',
    headers: { authorization: clientAuthorization(config), 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: config.redirectUri, client_id: config.clientId, code_verifier: verifier }).toString(),
  });
};

const introspect = async (accessToken) => {
  const config = runtime();
  const metadata = await discovery();
  const result = await requestJson(metadata.introspection_endpoint, {
    method: 'POST',
    headers: { authorization: clientAuthorization(config), 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token: accessToken, token_type_hint: 'access_token' }).toString(),
  });
  if (result.active !== true || result.client_id !== config.clientId || (result.token_type && String(result.token_type).toLowerCase() !== 'bearer') || !SUBJECT_RE.test(result.sub || '')) return null;
  return result;
};

// 中央可能在同一 token 上返回其他产品的能力；本站仅保留明确登记的两项。
const ownCapabilities = (list) => list
  .filter((item) => item === MANAGEMENT_CAPABILITY || item === PUBLIC_CAPABILITY);

// 管理权限属于中央能力协议，不由 OIDC scope 或本地留档推导。
// 该请求始终带产品 client Basic 认证和中央 access token，便于中央同时校验
// token、client 绑定及能力撤销状态。
const capabilities = async (accessToken) => {
  if (!accessToken) return null;
  const config = runtime();
  const result = await requestJson(`${config.issuer}/capabilities`, {
    method: 'POST',
    headers: {
      authorization: clientAuthorization(config),
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ token: accessToken }).toString(),
  });
  if (result.active !== true || result.client_id !== config.clientId || !SUBJECT_RE.test(result.sub || '') || !Array.isArray(result.capabilities)) return null;
  return { sub: result.sub, capabilities: ownCapabilities(result.capabilities) };
};

const refresh = async (refreshToken) => {
  const config = runtime();
  const metadata = await discovery();
  return requestJson(metadata.token_endpoint, {
    method: 'POST',
    headers: { authorization: clientAuthorization(config), 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: config.clientId }).toString(),
  });
};

const revoke = async (token, hint) => {
  if (!token) return;
  const config = runtime();
  const metadata = await discovery();
  await requestJson(metadata.revocation_endpoint, {
    method: 'POST',
    headers: { authorization: clientAuthorization(config), 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token, token_type_hint: hint || 'access_token' }).toString(),
  });
};

const cookieOptions = (httpOnly = true) => ({ httpOnly, secure: process.env.NODE_ENV === 'pro', sameSite: 'lax', path: '/', maxAge: 30 * 24 * 60 * 60 * 1000 });

const setSessionCookies = (res, handle, csrf) => {
  res.cookie(SESSION_COOKIE, handle, cookieOptions(true));
  res.cookie(CSRF_COOKIE, csrf, cookieOptions(false));
};

const clearSessionCookies = (res) => {
  for (const name of [SESSION_COOKIE, CSRF_COOKIE, CLAIM_COOKIE, STATE_COOKIE]) res.clearCookie(name, { path: '/' });
};

const mappedIdentity = async (subject, email, displayName, mode, grantedCapabilities) => {
  const { User, Admin } = getModels();
  const admin = await Admin.findOne({ where: { identitySubject: subject } });
  const user = await User.findOne({ where: { identitySubject: subject } });
  if (mode === 'management') {
    if (!grantedCapabilities.includes(MANAGEMENT_CAPABILITY)) return null;
    return admin ? { kind: 'admin', id: admin.id, mail: admin.mail, row: admin } : null;
  }
  if (!grantedCapabilities.includes(PUBLIC_CAPABILITY)) return null;
  if (user) return { kind: 'user', id: user.id, mail: user.mail, row: user };

  // 保留旧邮箱登录的语义：只有中央身份已经通过公开博客能力检查，且本地没有
  // 同邮箱记录时才 JIT 建立新 User。已有旧记录必须走双证明认领，不能按邮箱合并。
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return null;
  const existingByMail = await findByMail(User, normalizedEmail);
  if (existingByMail) return null;
  const safeName = String(displayName || normalizedEmail.split('@')[0] || '博客用户').trim().slice(0, 255) || '博客用户';
  let created;
  try {
    [created] = await User.findOrCreate({
      where: { mail: normalizedEmail },
      defaults: { mail: normalizedEmail, name: safeName, identitySubject: subject },
    });
  } catch {
    // 并发首次登录可能先命中 subject 唯一约束；只接受同一 subject 的并发结果，
    // 绝不覆盖邮箱或把其他 subject 的行认领过来。
    created = await User.findOne({ where: { identitySubject: subject } });
  }
  if (!created || created.identitySubject !== subject) return null;
  return { kind: 'user', id: created.id, mail: created.mail, row: created };
};

const createProductSession = async ({ subject, email, displayName, token, refreshToken, tokenExpiresAt, scope, mode, grantedCapabilities, returnTo, res }) => {
  const { CentralAuthSession } = getModels();
  const identity = await mappedIdentity(subject, email, displayName, mode, grantedCapabilities);
  if (!identity) return { identityBindingRequired: true, subject, email, returnTo };
  const config = runtime();
  const now = new Date();
  const handle = random(32);
  const csrf = random(32);
  const idleExpiresAt = new Date(now.getTime() + config.idleSeconds * 1000);
  const absoluteExpiresAt = new Date(now.getTime() + config.absoluteSeconds * 1000);
  await CentralAuthSession.create({
    id: uuid(),
    handleHash: hash(handle),
    csrfHash: hash(csrf),
    issuer: config.issuer,
    clientId: config.clientId,
    identitySubject: subject,
    localUserId: identity.kind === 'user' ? identity.id : null,
    localAdminId: identity.kind === 'admin' ? identity.id : null,
    mode,
    scope,
    accessTokenCiphertext: seal(token),
    refreshTokenCiphertext: refreshToken ? seal(refreshToken) : null,
    tokenExpiresAt: tokenExpiresAt || null,
    idleExpiresAt,
    absoluteExpiresAt,
    revokedAt: null,
    lastCheckedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  setSessionCookies(res, handle, csrf);
  return { identity, returnTo };
};

async function finishLogin({ code, state, req, res }) {
  const { CentralOidcState } = getModels();
  const config = runtime();
  const browserState = req.cookies?.[STATE_COOKIE];
  if (typeof browserState !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(browserState) ||
    typeof state !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(state) || !sameHash(browserState, state)) {
    throw new Error('OIDC state 未绑定当前浏览器');
  }
  const stateRow = await CentralOidcState.findOne({ where: { stateHash: hash(state), consumedAt: null } });
  if (!stateRow || stateRow.expiresAt <= new Date()) throw new Error('OIDC state 无效或已过期');
  const nowConsumed = new Date();
  const [consumed] = await CentralOidcState.update({ consumedAt: nowConsumed, updatedAt: nowConsumed }, {
    where: { id: stateRow.id, consumedAt: null, expiresAt: { [Op.gt]: nowConsumed } },
  });
  if (consumed !== 1) throw new Error('OIDC state 已使用');
  res.clearCookie(STATE_COOKIE, { path: '/' });
  const verifier = unseal(stateRow.codeVerifierCiphertext);
  const tokens = await exchangeCode(code, verifier);
  const idClaims = await verifyIdToken(tokens.id_token, null);
  const nonceFromToken = idClaims.nonce;
  if (!nonceFromToken || !crypto.timingSafeEqual(Buffer.from(hash(nonceFromToken)), Buffer.from(stateRow.nonceHash))) throw new Error('OIDC nonce 不匹配');
  const active = await introspect(tokens.access_token);
  if (!active || active.sub !== idClaims.sub) throw new Error('中央 access token 内省失败');
  const scope = String(active.scope || '').trim();
  if (!scope.split(/\s+/).includes('openid')) throw new Error('中央 OIDC scope 不完整');
  const granted = await capabilities(tokens.access_token);
  if (!granted || granted.sub !== idClaims.sub) throw new Error('中央能力校验失败');
  const now = new Date();
  await stateRow.update({ identitySubject: idClaims.sub, identityEmail: idClaims.email || null, accessTokenCiphertext: seal(tokens.access_token), refreshTokenCiphertext: tokens.refresh_token ? seal(tokens.refresh_token) : null, tokenExpiresAt: tokens.expires_in ? new Date(now.getTime() + Number(tokens.expires_in) * 1000) : null, updatedAt: now });
  const session = await createProductSession({ subject: idClaims.sub, email: idClaims.email || '', displayName: idClaims.name || idClaims.preferred_username || '', token: tokens.access_token, refreshToken: tokens.refresh_token, tokenExpiresAt: tokens.expires_in ? new Date(now.getTime() + Number(tokens.expires_in) * 1000) : null, scope, mode: stateRow.requestedMode || 'public', grantedCapabilities: granted.capabilities, returnTo: stateRow.returnTo, res });
  if (session.identityBindingRequired) {
    // 认领页尚未建立产品会话，仍需先发一枚同源 CSRF cookie，保护双证明 POST。
    res.cookie(CLAIM_COOKIE, stateRow.id, cookieOptions(true));
    res.cookie(CSRF_COOKIE, random(32), cookieOptions(false));
  }
  return session;
}

const sessionFromRequest = async (req) => {
  const { CentralAuthSession } = getModels();
  const handle = req.cookies?.[SESSION_COOKIE];
  if (!handle) return null;
  const session = await CentralAuthSession.findOne({ where: { handleHash: hash(handle), revokedAt: null } });
  if (!session) return null;
  const now = new Date();
  if (session.idleExpiresAt <= now || session.absoluteExpiresAt <= now) return null;
  let accessToken = unseal(session.accessTokenCiphertext);
  let refreshToken = session.refreshTokenCiphertext ? unseal(session.refreshTokenCiphertext) : null;
  let introspected = await introspect(accessToken);
  if (!introspected && refreshToken && session.tokenExpiresAt && session.tokenExpiresAt <= new Date(now.getTime() + 30 * 1000)) {
    try {
      const tokens = await refresh(refreshToken);
      introspected = await introspect(tokens.access_token);
      if (introspected) {
        accessToken = tokens.access_token;
        refreshToken = tokens.refresh_token || refreshToken;
        await session.update({ accessTokenCiphertext: seal(accessToken), refreshTokenCiphertext: seal(refreshToken), tokenExpiresAt: tokens.expires_in ? new Date(now.getTime() + Number(tokens.expires_in) * 1000) : null, updatedAt: now });
      }
    } catch {
      introspected = null;
    }
  }
  if (!introspected || introspected.sub !== session.identitySubject) return null;
  const granted = await capabilities(accessToken).catch(() => null);
  if (!granted || granted.sub !== session.identitySubject) return null;
  const idleExpiresAt = new Date(Math.min(session.absoluteExpiresAt.getTime(), now.getTime() + runtime().idleSeconds * 1000));
  await session.update({ idleExpiresAt, lastCheckedAt: now, updatedAt: now });
  const scope = String(introspected.scope || session.scope || '').split(/\s+/).filter(Boolean);
  return { id: session.id, subject: session.identitySubject, localUserId: session.localUserId, localAdminId: session.localAdminId, mode: session.mode || 'public', scope, capabilities: granted.capabilities, csrfHash: session.csrfHash, handleHash: session.handleHash };
};

const csrfValid = (req, auth = req.auth) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;
  const supplied = req.get('x-csrf-token');
  const cookie = req.cookies?.[CSRF_COOKIE];
  if (!supplied || !cookie) return false;
  if (!crypto.timingSafeEqual(Buffer.from(hash(cookie)), Buffer.from(hash(supplied)))) return false;
  // 已有产品会话还必须匹配数据库中的 CSRF 绑定；未绑定认领流程使用
  // 同源、非 HttpOnly cookie + 自定义 header 这组双提交校验。
  return !auth || auth.csrfHash === hash(cookie);
};

const revokeSession = async (req, res) => {
  const { CentralAuthSession } = getModels();
  const handle = req.cookies?.[SESSION_COOKIE];
  if (handle) {
    const session = await CentralAuthSession.findOne({ where: { handleHash: hash(handle), revokedAt: null } });
    if (session) {
      await revoke(unseal(session.accessTokenCiphertext), 'access_token');
      if (session.refreshTokenCiphertext) await revoke(unseal(session.refreshTokenCiphertext), 'refresh_token');
      await session.update({ revokedAt: new Date(), updatedAt: new Date() });
    }
  }
  clearSessionCookies(res);
};

const claimPendingIdentity = async (req, res, input) => {
  const { CentralOidcState, User, Admin, sequelize } = getModels();
  const stateId = req.cookies?.[CLAIM_COOKIE];
  if (!stateId || !input || !['user', 'admin'].includes(input.kind)) throw new Error('没有待绑定的中央身份');
  const row = await CentralOidcState.findOne({ where: { id: stateId, consumedAt: { [Op.not]: null } } });
  if (!row || !row.identitySubject || !row.identityEmail || row.expiresAt <= new Date()) throw new Error('绑定挑战已过期');
  await claimRateLimit(req, row, 'attempt');
  if ((row.requestedMode === 'management' ? 'admin' : 'user') !== input.kind) throw new Error('旧账号证明与中央身份不匹配');
  const Model = input.kind === 'admin' ? Admin : User;
  const requestedMail = String(input.mail || '').trim();
  let local = input.localId
    ? await Model.findByPk(input.localId)
    : await findByMail(Model, requestedMail);
  if (!local && requestedMail.toLowerCase() === row.identityEmail.toLowerCase()) {
    local = await findByMail(Model, row.identityEmail);
  }
  if (!local || String(local.mail).toLowerCase() !== String(row.identityEmail).toLowerCase() || local.identitySubject) throw new Error('旧账号证明与中央身份不匹配');
  let proven = false;
  if (input.proofType === 'password' && input.proof && local.passwordHash) proven = await bcrypt.compare(input.proof, local.passwordHash);
  if (input.proofType === 'code' && typeof input.proof === 'string') proven = await getRedisService().consumeLoginCode(row.identityEmail, input.proof);
  if (!proven) throw new Error('旧账号证明失败');
  const accessToken = unseal(row.accessTokenCiphertext);
  const refreshToken = row.refreshTokenCiphertext ? unseal(row.refreshTokenCiphertext) : null;
  const active = await introspect(accessToken);
  const granted = await capabilities(accessToken);
  if (!active || active.sub !== row.identitySubject || !granted || !granted.capabilities.includes(row.requestedMode === 'management' ? MANAGEMENT_CAPABILITY : PUBLIC_CAPABILITY)) throw new Error('中央身份已失效');
  await sequelize.transaction(async (transaction) => {
    const current = await Model.findByPk(local.id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!current || current.identitySubject) throw new Error('旧账号已被其他中央身份绑定');
    await current.update({ identitySubject: row.identitySubject }, { transaction });
  });
  const result = await createProductSession({ subject: row.identitySubject, email: row.identityEmail, token: accessToken, refreshToken, tokenExpiresAt: row.tokenExpiresAt, scope: String(active.scope || ''), mode: row.requestedMode || 'public', grantedCapabilities: granted.capabilities, returnTo: row.returnTo, res });
  res.clearCookie(CLAIM_COOKIE, { path: '/' });
  return result;
};

const sendPendingClaimCode = async (req, input = {}) => {
  const { CentralOidcState, User, Admin } = getModels();
  const stateId = req.cookies?.[CLAIM_COOKIE];
  if (!stateId) throw new Error('没有待绑定的中央身份');
  const row = await CentralOidcState.findOne({ where: { id: stateId, consumedAt: { [Op.not]: null } } });
  if (!row || !row.identitySubject || !row.identityEmail || row.expiresAt <= new Date()) throw new Error('绑定挑战已过期');
  await claimRateLimit(req, row, 'code');
  const mail = String(input.mail || '').trim();
  // 对不匹配的邮箱统一返回“已处理”，避免借认领挑战枚举本地账号是否存在。
  if (!mail || mail.length > 254 || mail.toLowerCase() !== row.identityEmail.toLowerCase()) return { sent: true };
  const Model = row.requestedMode === 'management' ? Admin : User;
  const local = await findByMail(Model, mail);
  if (!local || local.identitySubject) return { sent: true };
  await require('./mailService').sendCodeMail(row.identityEmail);
  return { sent: true };
};

module.exports = {
  SESSION_COOKIE,
  CSRF_COOKIE,
  CLAIM_COOKIE,
  STATE_COOKIE,
  MANAGEMENT_CAPABILITY,
  PUBLIC_CAPABILITY,
  beginLogin,
  finishLogin,
  sessionFromRequest,
  csrfValid,
  revokeSession,
  claimPendingIdentity,
  sendPendingClaimCode,
  capabilities,
  createProductSession,
};
