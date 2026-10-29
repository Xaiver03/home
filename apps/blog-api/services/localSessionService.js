const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { fn, col, where } = require('sequelize');
const {
  SESSION_COOKIE,
  MANAGEMENT_CAPABILITY,
  setSessionCookies,
  clearSessionCookies,
} = require('./centralOidcService');

let modelCache;
const getModels = () => modelCache || (modelCache = require('../models'));
const getRedisService = () => require('./redisService');

const hash = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
const random = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');
const idleSeconds = () => Number(process.env.PRODUCT_SESSION_IDLE_SECONDS || 12 * 60 * 60);
const absoluteSeconds = () => Number(process.env.PRODUCT_SESSION_ABSOLUTE_SECONDS || 30 * 24 * 60 * 60);

// 账号不存在时也走一次 bcrypt，避免用响应耗时区分「邮箱未注册」与「密码错误」。
const DUMMY_HASH = bcrypt.hashSync(random(24), 10);

const validMail = (value) => typeof value === 'string'
  && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const findByMail = (Admin, email) => Admin.findOne({
  where: where(fn('lower', col('mail')), String(email).trim().toLowerCase()),
});

const loginRateLimit = async (req, mail) => {
  const ip = String(req.ip || req.socket?.remoteAddress || 'unknown');
  const keys = [
    { key: `local:login:attempt:mail:${hash(String(mail).trim().toLowerCase())}`, limit: 10, seconds: 600 },
    { key: `local:login:attempt:ip:${hash(ip)}`, limit: 20, seconds: 600 },
  ];
  if (!await getRedisService().consumeRateLimits(keys)) throw new Error('操作过于频繁');
};

const loginWithPassword = async (req, res, input = {}) => {
  const { Admin, LocalAdminSession } = getModels();
  const { password } = input;
  const mail = typeof input.mail === 'string' ? input.mail.trim() : input.mail;
  if (!validMail(mail) || typeof password !== 'string' || !password || password.length > 1024) {
    throw new Error('邮箱或密码错误');
  }

  await loginRateLimit(req, mail);

  const admin = await findByMail(Admin, mail);
  const matches = await bcrypt.compare(password, admin?.passwordHash || DUMMY_HASH);
  if (!admin || !admin.passwordHash || !matches) throw new Error('邮箱或密码错误');

  const now = new Date();
  const handle = random(32);
  const csrf = random(32);
  await LocalAdminSession.create({
    id: uuid(),
    handleHash: hash(handle),
    csrfHash: hash(csrf),
    adminId: admin.id,
    idleExpiresAt: new Date(now.getTime() + idleSeconds() * 1000),
    absoluteExpiresAt: new Date(now.getTime() + absoluteSeconds() * 1000),
    revokedAt: null,
    lastCheckedAt: now,
    createdAt: now,
    updatedAt: now,
  });
  setSessionCookies(res, handle, csrf);
  return { id: admin.id, mail: admin.mail, username: admin.username };
};

const localSessionFromRequest = async (req) => {
  const { Admin, LocalAdminSession } = getModels();
  const handle = req.cookies?.[SESSION_COOKIE];
  if (!handle) return null;
  const session = await LocalAdminSession.findOne({ where: { handleHash: hash(handle), revokedAt: null } });
  if (!session) return null;
  const now = new Date();
  if (session.idleExpiresAt <= now || session.absoluteExpiresAt <= now) return null;
  const admin = await Admin.findByPk(session.adminId);
  if (!admin) return null;
  const idleExpiresAt = new Date(Math.min(session.absoluteExpiresAt.getTime(), now.getTime() + idleSeconds() * 1000));
  await session.update({ idleExpiresAt, lastCheckedAt: now, updatedAt: now });
  return {
    id: session.id,
    kind: 'local',
    subject: null,
    localUserId: null,
    localAdminId: session.adminId,
    mode: 'management',
    scope: ['local'],
    capabilities: [MANAGEMENT_CAPABILITY],
    csrfHash: session.csrfHash,
    handleHash: session.handleHash,
  };
};

const revokeLocalSession = async (req, res) => {
  const { LocalAdminSession } = getModels();
  const handle = req.cookies?.[SESSION_COOKIE];
  if (!handle) return false;
  const session = await LocalAdminSession.findOne({ where: { handleHash: hash(handle), revokedAt: null } });
  if (!session) return false;
  await session.update({ revokedAt: new Date(), updatedAt: new Date() });
  clearSessionCookies(res);
  return true;
};

module.exports = { loginWithPassword, localSessionFromRequest, revokeLocalSession };
