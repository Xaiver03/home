const config = require('./config');

// 个人站 WebSocket 只接受本站的管理能力；公司站 xcreative.blog.* 不在此生效。
const MANAGEMENT_CAPABILITY = 'home.blog.manage';

const verifySessionCookie = async (cookie) => {
  if (!cookie || typeof cookie !== 'string') return null;
  try {
    const response = await fetch(config.blogApiSessionUrl, {
      headers: { cookie },
      redirect: 'error',
    });
    if (!response.ok) return null;
    const body = await response.json();
    if (body?.code < 0 || !body?.data?.capabilities?.includes(MANAGEMENT_CAPABILITY)) return null;
    return {
      subject: body.data.subject,
      localAdminId: body.data.localAdminId,
      capabilities: body.data.capabilities,
      cookie,
    };
  } catch {
    return null;
  }
};

const authenticateRequest = (request) => verifySessionCookie(request.headers.cookie || '');

module.exports = {
  authenticateRequest,
  verifySessionCookie,
};
