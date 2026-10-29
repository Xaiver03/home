const { sessionFromRequest, csrfValid } = require('../services/sessionService');
const { MANAGEMENT_CAPABILITY, PUBLIC_CAPABILITY } = require('../services/centralOidcService');

const publicPaths = [
  /\/.*\/reception\//,
  /^\/blog\/_nuxt\//,
  /^\/static\//,
  /^\/weather\//,
  /^\/api\/auth\//,
  /^\/uploads\//,
];

const isPublicPath = (path) => publicPaths.some((pattern) => pattern.test(path));

const deny = (res, status, payload) => {
  if (typeof res.status === 'function') return res.status(status).json(payload);
  return res.json(payload);
};

// 仅供旧的 middleware 单测保留，不在任何运行环境接受旧 JWT。
const testOnlyAuth = (req) => {
  if (process.env.NODE_ENV !== 'test' || req.auth || !req.headers?.authorization) return null;
  try {
    const tokenService = require('../services/tokenService');
    const token = tokenService.checkToken(req.headers.authorization)?.data;
    if (!token) return null;
    return { capabilities: token.power === 'admin' ? [MANAGEMENT_CAPABILITY] : [PUBLIC_CAPABILITY] };
  } catch {
    return null;
  }
};

// 只读取中央 BFF 的 host-only 会话；旧 JWT 无论是否仍然有效都不会进入 req.auth。
const checkToken = async (req, res, next) => {
  try {
    req.auth = await sessionFromRequest(req);
    if (req.auth && !csrfValid(req)) {
      return res.status(403).json({ code: -1, msg: '请求校验失败', data: {} });
    }
    next();
  } catch (error) {
    req.auth = null;
    if (!isPublicPath(req.path)) {
      return res.status(401).json({ code: -1, msg: '统一会话无效或已过期', data: {} });
    }
    next();
  }
};

const checkPermissions = (requiredPower = MANAGEMENT_CAPABILITY) => (req, res, next) => {
  const auth = req.auth || testOnlyAuth(req);
  if (!auth) return deny(res, 401, { code: -1, msg: '请先完成统一登录', data: {} });
  const capability = requiredPower === 'admin' ? MANAGEMENT_CAPABILITY : requiredPower === 'user' ? PUBLIC_CAPABILITY : requiredPower;
  if (!auth.capabilities?.includes(capability)) return deny(res, 403, { code: -1, msg: '权限不足' });
  next();
};

const JwtErrorCatch = (err, req, res, next) => {
  if (err?.name === 'UnauthorizedError') {
    const msg = req.path === '/comment/addComment'
      ? { message: '评论失败，未登录⭕️', description: '请登录后再发送评论叭~邮箱登录很快的🙂‍' }
      : '统一会话无效或已过期';
    return deny(res, 401, { code: -1, msg, data: {} });
  }
  next(err);
};

module.exports = { checkToken, checkPermissions, JwtErrorCatch };
