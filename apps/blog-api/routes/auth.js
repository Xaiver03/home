const express = require('express');
const {
  beginLogin,
  finishLogin,
  claimPendingIdentity,
  sendPendingClaimCode,
  STATE_COOKIE,
  MANAGEMENT_CAPABILITY,
} = require('../services/centralOidcService');
const { sessionFromRequest, csrfValid, revokeSession } = require('../services/sessionService');
const { loginWithPassword } = require('../services/localSessionService');
const utils = require('../utils');

const router = express.Router();

const safeError = (error) => {
  if (error?.message === '没有待绑定的中央身份' || error?.message === '绑定挑战已过期') return 'identity_binding_required';
  if (error?.message === '旧账号证明失败' || error?.message === '旧账号证明与中央身份不匹配' || error?.message === '旧账号已被其他中央身份绑定') return 'identity_claim_failed';
  if (error?.message === '操作过于频繁') return 'rate_limited';
  return 'authentication_unavailable';
};

const redirectWith = (res, returnTo, key, value) => {
  const destination = new URL(returnTo || '/', 'http://home.invalid');
  destination.searchParams.set(key, value);
  res.redirect(`${destination.pathname}${destination.search}${destination.hash}`);
};

router.get('/oidc/start', async (req, res) => {
  try {
    const mode = req.query.mode === 'management' ? 'management' : 'public';
    const returnTo = typeof req.query.return_to === 'string' ? req.query.return_to : mode === 'management' ? '/admin/' : '/blog/';
    const destination = await beginLogin(mode, returnTo);
    const state = new URL(destination).searchParams.get('state');
    if (!state) throw new Error('OIDC state 未生成');
    res.cookie(STATE_COOKIE, state, {
      httpOnly: true, secure: process.env.NODE_ENV === 'pro', sameSite: 'lax',
      path: '/', maxAge: 10 * 60 * 1000,
    });
    res.redirect(destination);
  } catch (error) {
    res.status(503).json(utils.postMessage(-1, '统一登录暂时不可用', { code: safeError(error) }));
  }
});

router.get('/oidc/callback', async (req, res) => {
  const fallback = '/';
  try {
    if (typeof req.query.code !== 'string' || typeof req.query.state !== 'string') throw new Error('OIDC callback 参数缺失');
    const result = await finishLogin({ code: req.query.code, state: req.query.state, req, res });
    if (result.identityBindingRequired) return redirectWith(res, result.returnTo, 'auth_error', 'identity_binding_required');
    res.redirect(result.returnTo || fallback);
  } catch (error) {
    redirectWith(res, fallback, 'auth_error', safeError(error));
  }
});

// 本地管理员账号密码登录：校验通过后签发与中央会话同一套 cookie。
router.post('/password', async (req, res) => {
  try {
    const admin = await loginWithPassword(req, res, req.body || {});
    res.json(utils.postMessage(undefined, '登录成功', admin));
  } catch (error) {
    if (error?.message === '操作过于频繁') {
      return res.status(429).json(utils.postMessage(-1, '操作过于频繁，请稍后再试', { code: 'rate_limited' }));
    }
    if (error?.message === '邮箱或密码错误') {
      return res.status(401).json(utils.postMessage(-1, '邮箱或密码错误', { code: 'invalid_credentials' }));
    }
    res.status(503).json(utils.postMessage(-1, '登录服务暂时不可用', { code: 'authentication_unavailable' }));
  }
});

router.get('/session', async (req, res) => {
  const session = await sessionFromRequest(req).catch(() => null);
  if (!session) return res.status(401).json(utils.postMessage(-1, '请先完成统一登录', {}));
  if (req.query.mode === 'management' && !session.capabilities?.includes(MANAGEMENT_CAPABILITY)) {
    return res.status(403).json(utils.postMessage(-1, '管理能力未授予', {}));
  }
  res.json(utils.postMessage(undefined, '统一会话有效', {
    subject: session.subject,
    localUserId: session.localUserId,
    localAdminId: session.localAdminId,
    capabilities: session.capabilities,
    scope: session.scope,
  }));
});

router.post('/logout', async (req, res) => {
  req.auth = await sessionFromRequest(req).catch(() => null);
  if (!req.auth || !csrfValid(req, req.auth)) return res.status(403).json(utils.postMessage(-1, '请求校验失败', {}));
  try {
    await revokeSession(req, res);
  } catch (error) {
    return res.status(503).json(utils.postMessage(-1, '中央退出暂时不可用，请重试', { code: 'central_logout_failed' }));
  }
  res.json(utils.postMessage(undefined, '已退出统一会话', {}));
});

router.post('/claim', async (req, res) => {
  try {
    if (!csrfValid(req, null)) return res.status(403).json(utils.postMessage(-1, '请求校验失败', {}));
    const result = await claimPendingIdentity(req, res, req.body || {});
    res.json(utils.postMessage(undefined, '旧账号已完成双证明绑定', result));
  } catch (error) {
    const code = safeError(error);
    res.status(code === 'rate_limited' ? 429 : 409).json(utils.postMessage(-1, '旧账号绑定失败', { code }));
  }
});

router.post('/claim-code', async (req, res) => {
  try {
    if (!csrfValid(req, null)) return res.status(403).json(utils.postMessage(-1, '请求校验失败', {}));
    await sendPendingClaimCode(req, req.body || {});
    res.json(utils.postMessage(undefined, '验证码已发送', { sent: true }));
  } catch (error) {
    const code = safeError(error);
    res.status(code === 'rate_limited' ? 429 : 409).json(utils.postMessage(-1, '验证码发送失败', { code }));
  }
});

module.exports = router;
