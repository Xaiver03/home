jest.mock('../models', () => ({
  Admin: { findOne: jest.fn(), findByPk: jest.fn() },
  LocalAdminSession: { create: jest.fn(), findOne: jest.fn() },
}));
jest.mock('../services/centralOidcService', () => ({
  SESSION_COOKIE: '__Host-home_session',
  MANAGEMENT_CAPABILITY: 'home.blog.manage',
  setSessionCookies: jest.fn(),
  clearSessionCookies: jest.fn(),
}));
jest.mock('../services/redisService', () => ({ consumeRateLimits: jest.fn().mockResolvedValue(true) }));
jest.mock('bcryptjs', () => ({ compare: jest.fn(), hashSync: jest.fn(() => 'dummy-hash') }));

const { Admin, LocalAdminSession } = require('../models');
const central = require('../services/centralOidcService');
const redis = require('../services/redisService');
const bcrypt = require('bcryptjs');
const { loginWithPassword, localSessionFromRequest, revokeLocalSession } = require('../services/localSessionService');

const mail = 'allen030703@163.com';
const response = () => ({ cookie: jest.fn() });
const adminRow = { id: 2, mail, username: 'allen', passwordHash: 'real-hash' };
const request = (body, cookies = {}) => ({ body, cookies, ip: '203.0.113.9', socket: { remoteAddress: '203.0.113.9' } });
const run = (body, res = response(), cookies = {}) => loginWithPassword(request(body, cookies), res, body);

beforeEach(() => {
  jest.clearAllMocks();
  redis.consumeRateLimits.mockResolvedValue(true);
  bcrypt.compare.mockResolvedValue(true);
  Admin.findOne.mockResolvedValue(adminRow);
  LocalAdminSession.create.mockResolvedValue({});
  LocalAdminSession.findOne.mockResolvedValue(null);
});

describe('本地管理员密码登录', () => {
  test.each([
    [undefined, 'secret'],
    ['not-an-email', 'secret'],
    ['a'.repeat(255) + '@example.test', 'secret'],
    [mail, ''],
    [mail, 123],
    [mail, 'x'.repeat(1025)],
  ])('输入形态非法 %p/%p 时不查库、不限流', async (inputMail, password) => {
    await expect(run({ mail: inputMail, password }))
      .rejects.toThrow('邮箱或密码错误');
    expect(redis.consumeRateLimits).not.toHaveBeenCalled();
    expect(Admin.findOne).not.toHaveBeenCalled();
    expect(LocalAdminSession.create).not.toHaveBeenCalled();
  });

  test('账号不存在时仍执行一次 bcrypt，避免用耗时区分账号是否存在', async () => {
    Admin.findOne.mockResolvedValue(null);
    await expect(run({ mail, password: 'secret' }))
      .rejects.toThrow('邮箱或密码错误');
    expect(bcrypt.compare).toHaveBeenCalledWith('secret', 'dummy-hash');
    expect(LocalAdminSession.create).not.toHaveBeenCalled();
  });

  test('没有密码哈希的管理员记录不能登录', async () => {
    Admin.findOne.mockResolvedValue({ ...adminRow, passwordHash: null });
    await expect(run({ mail, password: 'secret' }))
      .rejects.toThrow('邮箱或密码错误');
    expect(LocalAdminSession.create).not.toHaveBeenCalled();
  });

  test('密码不匹配时不建会话、不发 cookie', async () => {
    bcrypt.compare.mockResolvedValue(false);
    const res = response();
    await expect(run({ mail, password: 'wrong' }, res)).rejects.toThrow('邮箱或密码错误');
    expect(LocalAdminSession.create).not.toHaveBeenCalled();
    expect(central.setSessionCookies).not.toHaveBeenCalled();
  });

  test('触发限流时不再比对密码', async () => {
    redis.consumeRateLimits.mockResolvedValue(false);
    await expect(run({ mail, password: 'secret' }))
      .rejects.toThrow('操作过于频繁');
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  test('登录成功时写入会话并只返回公开字段', async () => {
    const res = response();
    const result = await run({ mail: ' Allen030703@163.com ', password: 'secret' }, res);
    expect(redis.consumeRateLimits).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ key: expect.stringMatching(/^local:login:attempt:mail:[0-9a-f]{64}$/), limit: 10, seconds: 600 }),
      expect.objectContaining({ key: expect.stringMatching(/^local:login:attempt:ip:[0-9a-f]{64}$/), limit: 20, seconds: 600 }),
    ]));
    const created = LocalAdminSession.create.mock.calls[0][0];
    expect(created.handleHash).toMatch(/^[0-9a-f]{64}$/);
    expect(created.csrfHash).toMatch(/^[0-9a-f]{64}$/);
    expect(created.adminId).toBe(2);
    expect(created.revokedAt).toBeNull();
    expect(central.setSessionCookies).toHaveBeenCalledWith(res, expect.any(String), expect.any(String));
    expect(result).toEqual({ id: 2, mail, username: 'allen' });
    expect(JSON.stringify(result)).not.toContain('Hash');
  });
});

describe('本地会话解析', () => {
  const activeRow = () => ({
    id: 'session-id',
    adminId: 2,
    csrfHash: 'csrf-hash',
    handleHash: 'handle-hash',
    idleExpiresAt: new Date(Date.now() + 3600 * 1000),
    absoluteExpiresAt: new Date(Date.now() + 7200 * 1000),
    update: jest.fn().mockResolvedValue(undefined),
  });

  test('没有会话 cookie 时不查库', async () => {
    await expect(localSessionFromRequest({ cookies: {} })).resolves.toBeNull();
    expect(LocalAdminSession.findOne).not.toHaveBeenCalled();
  });

  test('已过期会话视为未登录', async () => {
    LocalAdminSession.findOne.mockResolvedValue({
      ...activeRow(),
      idleExpiresAt: new Date(Date.now() - 1000),
    });
    await expect(localSessionFromRequest({ cookies: { '__Host-home_session': 'handle' } })).resolves.toBeNull();
    expect(Admin.findByPk).not.toHaveBeenCalled();
  });

  test('管理员记录已删除时会话立即失效', async () => {
    LocalAdminSession.findOne.mockResolvedValue(activeRow());
    Admin.findByPk.mockResolvedValue(null);
    await expect(localSessionFromRequest({ cookies: { '__Host-home_session': 'handle' } })).resolves.toBeNull();
  });

  test('有效会话只授予本站管理能力', async () => {
    const row = activeRow();
    LocalAdminSession.findOne.mockResolvedValue(row);
    Admin.findByPk.mockResolvedValue(adminRow);
    const session = await localSessionFromRequest({ cookies: { '__Host-home_session': 'handle' } });
    expect(session).toEqual(expect.objectContaining({
      kind: 'local',
      localAdminId: 2,
      capabilities: ['home.blog.manage'],
      csrfHash: 'csrf-hash',
    }));
    expect(session.capabilities).not.toContain('home.blog.use');
    expect(row.update).toHaveBeenCalled();
  });

  test('登出只撤销本地会话并清 cookie', async () => {
    LocalAdminSession.findOne.mockResolvedValue(activeRow());
    const res = response();
    await expect(revokeLocalSession({ cookies: { '__Host-home_session': 'handle' } }, res)).resolves.toBe(true);
    expect(LocalAdminSession.findOne.mock.calls[0][0].where.revokedAt).toBeNull();
    expect(central.clearSessionCookies).toHaveBeenCalledWith(res);
  });
});
