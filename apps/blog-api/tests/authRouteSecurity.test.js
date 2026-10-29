jest.mock('../services/centralOidcService', () => ({
  beginLogin: jest.fn(),
  finishLogin: jest.fn(),
  sessionFromRequest: jest.fn(),
  csrfValid: jest.fn(() => true),
  revokeSession: jest.fn(),
  claimPendingIdentity: jest.fn(),
  sendPendingClaimCode: jest.fn(),
  STATE_COOKIE: '__Host-home_oidc_state',
  MANAGEMENT_CAPABILITY: 'home.blog.manage',
  PUBLIC_CAPABILITY: 'home.blog.use',
}));

jest.mock('../services/localSessionService', () => ({
  loginWithPassword: jest.fn(),
  localSessionFromRequest: jest.fn().mockResolvedValue(null),
  revokeLocalSession: jest.fn().mockResolvedValue(false),
}));

const service = require('../services/centralOidcService');
const localService = require('../services/localSessionService');
const router = require('../routes/auth');

const handlerFor = (path, method) => router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method]).route.stack[0].handle;

const response = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  redirect: jest.fn(),
  cookie: jest.fn(),
});

describe('统一认证路由的能力边界', () => {
  beforeEach(() => jest.clearAllMocks());

  test('登录开始将 OIDC state 绑定到当前浏览器的 HttpOnly cookie', async () => {
    service.beginLogin.mockResolvedValue('https://identity.example.test/authorize?state=browser-state');
    const res = response();
    await handlerFor('/oidc/start', 'get')({ query: { mode: 'public' } }, res);
    expect(res.cookie).toHaveBeenCalledWith('__Host-home_oidc_state', 'browser-state', expect.objectContaining({
      httpOnly: true, sameSite: 'lax', path: '/',
    }));
    expect(res.redirect).toHaveBeenCalledWith('https://identity.example.test/authorize?state=browser-state');
  });

  test('管理端 session 查询拒绝只有普通博客能力的产品会话', async () => {
    service.sessionFromRequest.mockResolvedValue({ capabilities: [service.PUBLIC_CAPABILITY] });
    const res = response();
    await handlerFor('/session', 'get')({ query: { mode: 'management' } }, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalled();
  });

  test('管理端 session 查询拒绝只持有公司站管理能力的产品会话', async () => {
    service.sessionFromRequest.mockResolvedValue({ capabilities: ['xcreative.blog.manage'] });
    const res = response();
    await handlerFor('/session', 'get')({ query: { mode: 'management' } }, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalled();
  });

  test('管理端 session 查询接受中央实时管理能力', async () => {
    service.sessionFromRequest.mockResolvedValue({
      subject: 'subject', localUserId: null, localAdminId: 1,
      capabilities: [service.MANAGEMENT_CAPABILITY], scope: ['openid'],
    });
    const res = response();
    await handlerFor('/session', 'get')({ query: { mode: 'management' } }, res);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: expect.anything(), data: expect.objectContaining({ capabilities: [service.MANAGEMENT_CAPABILITY] }) }));
  });

  test('本地密码登录成功后只返回公开管理员字段', async () => {
    localService.loginWithPassword.mockResolvedValue({ id: 2, mail: 'admin@example.test', username: 'allen' });
    const res = response();
    await handlerFor('/password', 'post')({ body: { mail: 'admin@example.test', password: 'secret' }, ip: '203.0.113.9' }, res);
    expect(localService.loginWithPassword).toHaveBeenCalledWith(expect.anything(), res, { mail: 'admin@example.test', password: 'secret' });
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { id: 2, mail: 'admin@example.test', username: 'allen' } }));
  });

  test.each([
    ['邮箱或密码错误', 401, 'invalid_credentials'],
    ['操作过于频繁', 429, 'rate_limited'],
    [new Error('database down').message, 503, 'authentication_unavailable'],
  ])('本地密码登录失败 %p 返回 %p', async (reason, status, code) => {
    localService.loginWithPassword.mockRejectedValue(new Error(reason));
    const res = response();
    await handlerFor('/password', 'post')({ body: { mail: 'admin@example.test', password: 'x' }, ip: '203.0.113.9' }, res);
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: -1, data: { code } }));
  });

  test('中央退出失败时返回 503，不向客户端报告成功', async () => {
    service.sessionFromRequest.mockResolvedValue({ csrfHash: 'hash' });
    service.revokeSession.mockRejectedValue(new Error('中央不可用'));
    const res = response();
    await handlerFor('/logout', 'post')({ auth: null, cookies: {}, get: jest.fn(), method: 'POST' }, res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json.mock.calls[0][0].msg).toContain('中央退出');
  });
});
