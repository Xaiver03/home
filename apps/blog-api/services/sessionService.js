const central = require('./centralOidcService');
const local = require('./localSessionService');

// 本地管理员密码会话与中央会话共用同一组 cookie / CSRF 契约，这里只负责选路。
const sessionFromRequest = async (req) => {
  const localSession = await local.localSessionFromRequest(req);
  if (localSession) return localSession;
  return central.sessionFromRequest(req);
};

const revokeSession = async (req, res) => {
  if (await local.revokeLocalSession(req, res)) return;
  await central.revokeSession(req, res);
};

const { csrfValid } = central;

module.exports = { sessionFromRequest, csrfValid, revokeSession };
