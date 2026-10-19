const config = require('./config');

const verifySessionCookie = async (cookie) => {
  if (!cookie || typeof cookie !== 'string') return null;
  try {
    const response = await fetch(config.blogApiSessionUrl, {
      headers: { cookie },
      redirect: 'error',
    });
    if (!response.ok) return null;
    const body = await response.json();
    if (body?.code < 0 || !body?.data?.capabilities?.includes('xcreative.blog.manage')) return null;
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
