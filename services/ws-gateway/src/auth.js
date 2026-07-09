const jwt = require('jsonwebtoken');
const config = require('./config');

const parseBearerToken = (token) => {
  if (!token || typeof token !== 'string') return '';
  const parts = token.trim().split(/\s+/);
  return parts[0] === 'Bearer' && parts[1] ? parts[1] : parts[0];
};

const verifyAdminToken = (rawToken) => {
  const token = parseBearerToken(rawToken);
  if (!token) {
    return { ok: false, code: 'MISSING_TOKEN', message: '缺少认证信息' };
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.power !== 'admin') {
      return { ok: false, code: 'FORBIDDEN', message: '权限不足' };
    }
    return { ok: true, token, user: payload };
  } catch {
    return { ok: false, code: 'INVALID_TOKEN', message: '认证失败或已过期' };
  }
};

module.exports = {
  verifyAdminToken,
};
