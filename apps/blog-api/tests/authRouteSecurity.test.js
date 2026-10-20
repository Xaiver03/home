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

const service = require('../services/centralOidcService');
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

  test('中央退出失败时返回 503，不向客户端报告成功', async () => {
    service.sessionFromRequest.mockResolvedValue({ csrfHash: 'hash' });
    service.revokeSession.mockRejectedValue(new Error('中央不可用'));
    const res = response();
    await handlerFor('/logout', 'post')({ auth: null, cookies: {}, get: jest.fn(), method: 'POST' }, res);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json.mock.calls[0][0].msg).toContain('中央退出');
  });
});
