const crypto = require('crypto');

jest.mock('../models', () => ({
  CentralOidcState: {
    destroy: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
  CentralAuthSession: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  User: { findOne: jest.fn(), findOrCreate: jest.fn() },
  Admin: { findOne: jest.fn() },
}));
jest.mock('../services/mailService', () => ({ sendCodeMail: jest.fn() }));
jest.mock('../services/redisService', () => ({
  consumeRateLimits: jest.fn().mockResolvedValue(true),
  consumeLoginCode: jest.fn(),
}));

const { CentralOidcState, CentralAuthSession, User, Admin } = require('../models');
const mailService = require('../services/mailService');
const redisService = require('../services/redisService');
const {
  beginLogin,
  finishLogin,
  csrfValid,
  capabilities,
  sessionFromRequest,
  sendPendingClaimCode,
  createProductSession,
  MANAGEMENT_CAPABILITY,
  PUBLIC_CAPABILITY,
} = require('../services/centralOidcService');

const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const sealed = (value, secret = 'test-state-secret') => {
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash('sha256').update(secret).digest();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${ciphertext.toString('base64url')}`;
};
const configureClient = () => {
  process.env.OIDC_ISSUER_URL = 'https://identity.example.test/api/oidc';
  process.env.OIDC_CLIENT_ID = 'home';
  process.env.OIDC_CLIENT_SECRET = 'secret';
  process.env.OIDC_STATE_ENCRYPTION_KEY = 'test-state-secret';
  process.env.BLOG_PUBLIC_ORIGIN = 'https://blog.example.test';
};

describe('中央 OIDC 安全边界', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('管理能力必须来自中央实时能力端点，并携带产品客户端认证', async () => {
    const subject = '11111111-1111-4111-8111-111111111111';
    process.env.OIDC_ISSUER_URL = 'https://identity.example.test/api/oidc';
    process.env.OIDC_CLIENT_ID = 'home';
    process.env.OIDC_CLIENT_SECRET = 'secret';
    process.env.BLOG_PUBLIC_ORIGIN = 'https://blog.example.test';
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ active: true, sub: subject, client_id: 'home', capabilities: ['home.blog.manage'] }) });

    const received = await capabilities('opaque-access-token');
    await expect(Promise.resolve(received)).resolves.toEqual({
      sub: subject,
      capabilities: [MANAGEMENT_CAPABILITY],
    });
    const capabilityRequest = global.fetch.mock.calls[0];
    expect(capabilityRequest[0]).toBe('https://identity.example.test/api/oidc/capabilities');
    expect(capabilityRequest[1].headers.authorization).toMatch(/^Basic /);
    expect(capabilityRequest[1].method).toBe('POST');
    expect(capabilityRequest[1].headers['content-type']).toBe('application/x-www-form-urlencoded');
    expect(capabilityRequest[1].body).toBe('token=opaque-access-token');

    global.fetch.mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ active: true, sub: subject, client_id: 'another-product', capabilities: ['home.blog.manage'] }) });
    await expect(capabilities('opaque-access-token')).resolves.toBeNull();
  });

  test('公司站 xcreative.blog.* 能力不进入本站会话，不能换取本站权限', async () => {
    const subject = '11111111-1111-4111-8111-111111111112';
    process.env.OIDC_ISSUER_URL = 'https://identity.example.test/api/oidc';
    process.env.OIDC_CLIENT_ID = 'home';
    process.env.OIDC_CLIENT_SECRET = 'secret';
    process.env.BLOG_PUBLIC_ORIGIN = 'https://blog.example.test';
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({
        active: true,
        sub: subject,
        client_id: 'home',
        capabilities: ['xcreative.blog.manage', 'xcreative.blog.use', 'platform.manage', 'litopia.use'],
      }),
    });

    const received = await capabilities('opaque-access-token');
    expect(received).toEqual({ sub: subject, capabilities: [] });
    expect(received.capabilities).not.toContain('xcreative.blog.manage');
    expect(received.capabilities).not.toContain('xcreative.blog.use');
    expect(received.capabilities).not.toContain('platform.manage');
    expect(received.capabilities).not.toContain('litopia.use');
  });

  test('只有公司站管理能力时管理登录被拒，不映射成本站管理员', async () => {
    configureClient();
    const subject = '11111111-1111-4111-8111-111111111113';
    const admin = { id: 9, mail: 'admin@example.test', identitySubject: subject };
    Admin.findOne.mockResolvedValue(admin);
    User.findOne.mockResolvedValue(null);
    const result = await createProductSession({
      subject, email: 'admin@example.test', displayName: 'Admin', token: 'opaque',
      scope: 'openid profile email offline_access', mode: 'management',
      grantedCapabilities: ['xcreative.blog.manage'], returnTo: '/admin/',
      res: { cookie: jest.fn() },
    });
    expect(result.identityBindingRequired).toBe(true);
    expect(CentralAuthSession.create).not.toHaveBeenCalled();
  });

  test('只有公司站公开能力时公开登录被拒，不 JIT 建立本站用户', async () => {
    configureClient();
    const subject = '11111111-1111-4111-8111-111111111114';
    Admin.findOne.mockResolvedValue(null);
    User.findOne.mockResolvedValue(null);
    const result = await createProductSession({
      subject, email: 'person@example.test', displayName: 'Person', token: 'opaque',
      scope: 'openid profile email offline_access', mode: 'public',
      grantedCapabilities: ['xcreative.blog.use'], returnTo: '/blog/',
      res: { cookie: jest.fn() },
    });
    expect(result.identityBindingRequired).toBe(true);
    expect(User.findOrCreate).not.toHaveBeenCalled();
  });

  test('公开能力通过且本地没有 User 时按中央 subject JIT 创建，不按邮箱自动合并', async () => {
    configureClient();
    const subject = '44444444-4444-4444-8444-444444444444';
    const created = { id: 42, mail: 'person@example.test', name: 'Person', identitySubject: subject };
    Admin.findOne.mockResolvedValue(null);
    User.findOne.mockResolvedValue(null);
    User.findOrCreate.mockResolvedValue([created, true]);
    CentralAuthSession.create.mockResolvedValue({});
    const result = await createProductSession({
      subject, email: 'Person@Example.Test', displayName: 'Person', token: 'opaque',
      scope: 'openid profile email offline_access', mode: 'public',
      grantedCapabilities: [PUBLIC_CAPABILITY], returnTo: '/blog/',
      res: { cookie: jest.fn() },
    });
    expect(result.identity.kind).toBe('user');
    expect(User.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
      where: { mail: 'person@example.test' },
      defaults: expect.objectContaining({ mail: 'person@example.test', identitySubject: subject }),
    }));
  });

  test('同邮箱已有未绑定旧 User 时进入双证明认领，不 JIT 覆盖', async () => {
    configureClient();
    const subject = '55555555-5555-4555-8555-555555555555';
    const oldUser = { id: 43, mail: 'person@example.test', identitySubject: null };
    Admin.findOne.mockResolvedValue(null);
    User.findOne.mockImplementation(async ({ where }) => where.identitySubject ? null : oldUser);
    const result = await createProductSession({
      subject, email: 'person@example.test', displayName: 'Person', token: 'opaque',
      scope: 'openid profile email offline_access', mode: 'public',
      grantedCapabilities: [PUBLIC_CAPABILITY], returnTo: '/blog/',
      res: { cookie: jest.fn() },
    });
    expect(result.identityBindingRequired).toBe(true);
    expect(User.findOrCreate).not.toHaveBeenCalled();
  });

  test('历史邮箱大小写不同也进入双证明认领', async () => {
    configureClient();
    const subject = '55555555-5555-4555-8555-555555555556';
    const oldUser = { id: 45, mail: 'Person@Example.Test', identitySubject: null };
    Admin.findOne.mockResolvedValue(null);
    User.findOne.mockImplementation(async ({ where }) => where.identitySubject ? null : oldUser);
    const result = await createProductSession({
      subject, email: 'person@example.test', displayName: 'Person', token: 'opaque',
      scope: 'openid profile email offline_access', mode: 'public',
      grantedCapabilities: [PUBLIC_CAPABILITY], returnTo: '/blog/',
      res: { cookie: jest.fn() },
    });
    expect(result.identityBindingRequired).toBe(true);
    expect(User.findOrCreate).not.toHaveBeenCalled();
    const foldedLookup = User.findOne.mock.calls[1][0].where;
    expect(foldedLookup.attribute.fn).toBe('lower');
    expect(foldedLookup.attribute.args[0].col).toBe('mail');
    expect(foldedLookup.logic).toBe('person@example.test');
  });

  test('OIDC callback 拒绝没有同浏览器 state cookie 的会话置换', async () => {
    configureClient();
    const state = 's'.repeat(43);
    const invalidResponse = { clearCookie: jest.fn() };
    await expect(finishLogin({ code: 'code', state, req: { cookies: {} }, res: invalidResponse }))
      .rejects.toThrow('OIDC state 未绑定当前浏览器');
    expect(invalidResponse.clearCookie).not.toHaveBeenCalled();
    expect(CentralOidcState.findOne).not.toHaveBeenCalled();
    CentralOidcState.findOne.mockResolvedValue(null);
    await expect(finishLogin({ code: 'code', state, req: { cookies: { '__Host-home_oidc_state': state } }, res: { clearCookie: jest.fn() } }))
      .rejects.toThrow('OIDC state 无效或已过期');
    expect(CentralOidcState.findOne).toHaveBeenCalledTimes(1);
  });

  test('并发 callback 中只有原子消费 state 的请求能继续换码', async () => {
    configureClient();
    const state = 's'.repeat(43);
    CentralOidcState.findOne.mockResolvedValue({ id: 'state-id', expiresAt: new Date(Date.now() + 60_000) });
    CentralOidcState.update.mockResolvedValue([0]);
    await expect(finishLogin({ code: 'code', state, req: { cookies: { '__Host-home_oidc_state': state } }, res: { clearCookie: jest.fn() } }))
      .rejects.toThrow('OIDC state 已使用');
    expect(CentralOidcState.update).toHaveBeenCalledWith(expect.objectContaining({ consumedAt: expect.any(Date) }),
      expect.objectContaining({ where: expect.objectContaining({ id: 'state-id', consumedAt: null }) }));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('没有中央公开能力时 fail closed，即使中央身份有效也不创建 User', async () => {
    configureClient();
    const subject = '66666666-6666-4666-8666-666666666666';
    Admin.findOne.mockResolvedValue(null);
    User.findOne.mockResolvedValue(null);
    const result = await createProductSession({
      subject, email: 'person@example.test', displayName: 'Person', token: 'opaque',
      scope: 'openid profile email offline_access', mode: 'public',
      grantedCapabilities: [], returnTo: '/blog/',
      res: { cookie: jest.fn() },
    });
    expect(result.identityBindingRequired).toBe(true);
    expect(User.findOrCreate).not.toHaveBeenCalled();
  });

  test('并发首次登录遇到唯一约束时只接受同一 subject 的已创建结果', async () => {
    configureClient();
    const subject = '77777777-7777-4777-8777-777777777777';
    const concurrent = { id: 44, mail: 'person@example.test', identitySubject: subject };
    Admin.findOne.mockResolvedValue(null);
    User.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(concurrent);
    User.findOrCreate.mockRejectedValue(new Error('unique constraint'));
    CentralAuthSession.create.mockResolvedValue({});
    const result = await createProductSession({
      subject, email: 'person@example.test', displayName: 'Person', token: 'opaque',
      scope: 'openid profile email offline_access', mode: 'public',
      grantedCapabilities: [PUBLIC_CAPABILITY], returnTo: '/blog/',
      res: { cookie: jest.fn() },
    });
    expect(result.identity.id).toBe(44);
  });

  test('每次产品请求重新读取中央能力，撤销管理能力后立即失效', async () => {
    const subject = '22222222-2222-4222-8222-222222222222';
    process.env.OIDC_ISSUER_URL = 'https://identity.example.test/api/oidc';
    process.env.OIDC_CLIENT_ID = 'home';
    process.env.OIDC_CLIENT_SECRET = 'secret';
    process.env.OIDC_STATE_ENCRYPTION_KEY = 'test-state-secret';
    process.env.BLOG_PUBLIC_ORIGIN = 'https://blog.example.test';
    const row = {
      identitySubject: subject,
      accessTokenCiphertext: sealed('access-token'),
      refreshTokenCiphertext: null,
      tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
      idleExpiresAt: new Date(Date.now() + 3600 * 1000),
      absoluteExpiresAt: new Date(Date.now() + 3600 * 1000),
      revokedAt: null,
      scope: 'openid profile email offline_access',
      mode: 'management',
      localUserId: null,
      localAdminId: 7,
      csrfHash: 'csrf-hash',
      handleHash: 'handle-hash',
      update: jest.fn().mockResolvedValue(undefined),
    };
    CentralAuthSession.findOne.mockResolvedValue(row);
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({
        issuer: process.env.OIDC_ISSUER_URL,
        authorization_endpoint: 'https://identity.example.test/api/oidc/authorize',
        token_endpoint: 'https://identity.example.test/api/oidc/token',
        introspection_endpoint: 'https://identity.example.test/api/oidc/introspect',
        jwks_uri: 'https://identity.example.test/api/oidc/jwks',
      }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ active: true, client_id: 'home', token_type: 'Bearer', sub: subject, scope: row.scope }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ active: true, sub: subject, client_id: 'home', capabilities: [MANAGEMENT_CAPABILITY] }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ active: true, client_id: 'home', token_type: 'Bearer', sub: subject, scope: row.scope }) })
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ active: true, sub: subject, client_id: 'home', capabilities: [] }) });

    const req = { cookies: { '__Host-home_session': 'handle' } };
    await expect(sessionFromRequest(req)).resolves.toEqual(expect.objectContaining({ capabilities: [MANAGEMENT_CAPABILITY] }));
    await expect(sessionFromRequest(req)).resolves.toEqual(expect.objectContaining({ capabilities: [] }));
    expect(global.fetch).toHaveBeenCalledTimes(5);
  });

  test('中央只保留公司站管理能力时，本站在下一次请求即视为已撤销', async () => {
    const subject = '22222222-2222-4222-8222-222222222223';
    process.env.OIDC_ISSUER_URL = 'https://identity.example.test/api/oidc';
    process.env.OIDC_CLIENT_ID = 'home';
    process.env.OIDC_CLIENT_SECRET = 'secret';
    process.env.OIDC_STATE_ENCRYPTION_KEY = 'test-state-secret';
    process.env.BLOG_PUBLIC_ORIGIN = 'https://blog.example.test';
    const row = {
      identitySubject: subject,
      accessTokenCiphertext: sealed('access-token'),
      refreshTokenCiphertext: null,
      tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
      idleExpiresAt: new Date(Date.now() + 3600 * 1000),
      absoluteExpiresAt: new Date(Date.now() + 3600 * 1000),
      revokedAt: null,
      scope: 'openid profile email offline_access',
      mode: 'management',
      localUserId: null,
      localAdminId: 7,
      csrfHash: 'csrf-hash',
      handleHash: 'handle-hash',
      update: jest.fn().mockResolvedValue(undefined),
    };
    CentralAuthSession.findOne.mockResolvedValue(row);
    global.fetch = jest.fn(async (url) => {
      let body;
      if (url.endsWith('/.well-known/openid-configuration')) body = {
        issuer: process.env.OIDC_ISSUER_URL,
        authorization_endpoint: 'https://identity.example.test/api/oidc/authorize',
        token_endpoint: 'https://identity.example.test/api/oidc/token',
        introspection_endpoint: 'https://identity.example.test/api/oidc/introspect',
        jwks_uri: 'https://identity.example.test/api/oidc/jwks',
      };
      else if (url.endsWith('/introspect')) body = {
        active: true, client_id: 'home', token_type: 'Bearer', sub: subject, scope: row.scope,
      };
      else if (url.endsWith('/capabilities')) body = {
        active: true, sub: subject, client_id: 'home', capabilities: ['xcreative.blog.manage'],
      };
      else throw new Error(`unexpected request: ${url}`);
      return { ok: true, text: async () => JSON.stringify(body) };
    });

    const session = await sessionFromRequest({ cookies: { '__Host-home_session': 'handle' } });
    expect(session.capabilities).toEqual([]);
    expect(session.capabilities).not.toContain('xcreative.blog.manage');
  });

  test('普通博客认领验证码只发给待认领中央邮箱，错误邮箱不泄露本地账号存在性', async () => {
    CentralOidcState.findOne.mockResolvedValue({
      identitySubject: '33333333-3333-4333-8333-333333333333',
      identityEmail: 'person@example.test',
      requestedMode: 'public',
      consumedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    });
    User.findOne.mockResolvedValue({ mail: 'person@example.test', identitySubject: null });
    const req = { cookies: { '__Host-home_oidc_claim': 'state-id' } };

    await expect(sendPendingClaimCode(req, { mail: 'other@example.test' })).resolves.toEqual({ sent: true });
    expect(mailService.sendCodeMail).not.toHaveBeenCalled();
    await expect(sendPendingClaimCode(req, { mail: 'person@example.test' })).resolves.toEqual({ sent: true });
    expect(mailService.sendCodeMail).toHaveBeenCalledWith('person@example.test');
  });

  test('旧账号验证码发送受限流约束，超限后不发送邮件', async () => {
    CentralOidcState.findOne.mockResolvedValue({
      id: 'state-id', identitySubject: '33333333-3333-4333-8333-333333333333',
      identityEmail: 'person@example.test', requestedMode: 'public',
      consumedAt: new Date(), expiresAt: new Date(Date.now() + 60_000),
    });
    redisService.consumeRateLimits.mockResolvedValue(false);
    await expect(sendPendingClaimCode({ cookies: { '__Host-home_oidc_claim': 'state-id' }, ip: '127.0.0.1' }, { mail: 'person@example.test' }))
      .rejects.toThrow('操作过于频繁');
    expect(mailService.sendCodeMail).not.toHaveBeenCalled();
  });

  test('管理登录仍使用标准 OIDC scope，管理模式只保存在本地状态', async () => {
    process.env.OIDC_ISSUER_URL = 'https://identity.example.test/api/oidc';
    process.env.OIDC_CLIENT_ID = 'home';
    process.env.OIDC_CLIENT_SECRET = 'secret';
    process.env.BLOG_PUBLIC_ORIGIN = 'https://blog.example.test';
    global.fetch = jest.fn().mockResolvedValue({ ok: true, text: async () => JSON.stringify({
      issuer: process.env.OIDC_ISSUER_URL,
      authorization_endpoint: 'https://identity.example.test/api/oidc/authorize',
      token_endpoint: 'https://identity.example.test/api/oidc/token',
      introspection_endpoint: 'https://identity.example.test/api/oidc/introspect',
      jwks_uri: 'https://identity.example.test/api/oidc/jwks',
    }) });

    const url = await beginLogin('management', '/admin/');
    expect(new URL(url).searchParams.get('scope')).toBe('openid profile email offline_access');
    expect(CentralOidcState.create.mock.calls[0][0].requestedMode).toBe('management');
  });

  test('缺少客户端配置时拒绝启动登录，不触发发现请求', async () => {
    delete process.env.OIDC_ISSUER_URL;
    delete process.env.OIDC_CLIENT_ID;
    delete process.env.OIDC_CLIENT_SECRET;
    delete process.env.BLOG_PUBLIC_ORIGIN;

    await expect(beginLogin('public', '/blog/')).rejects.toThrow('中央 OIDC 客户端未完整配置');
    expect(CentralOidcState.create).not.toHaveBeenCalled();
  });

  test('生产环境拒绝非 HTTPS issuer', async () => {
    process.env.NODE_ENV = 'pro';
    process.env.OIDC_ISSUER_URL = 'http://identity.example.test/api/oidc';
    process.env.OIDC_CLIENT_ID = 'home';
    process.env.OIDC_CLIENT_SECRET = 'secret';
    process.env.BLOG_PUBLIC_ORIGIN = 'https://blog.example.test';

    await expect(beginLogin('public', '/blog/')).rejects.toThrow('生产环境中央 OIDC issuer 必须使用 HTTPS');
    expect(CentralOidcState.create).not.toHaveBeenCalled();
  });

  test('已有产品会话要求 CSRF 令牌同时匹配 cookie 与数据库绑定', () => {
    const cookie = 'csrf-cookie';
    const req = {
      method: 'POST',
      cookies: { '__Host-home_csrf': cookie },
      get: jest.fn(() => cookie),
    };

    expect(csrfValid(req, { csrfHash: digest(cookie) })).toBe(true);
    expect(csrfValid(req, { csrfHash: digest('another-cookie') })).toBe(false);
    expect(csrfValid({ ...req, get: jest.fn(() => 'attacker-value') }, { csrfHash: digest(cookie) })).toBe(false);
  });

  test('待认领流程没有产品会话时仍要求双提交 CSRF', () => {
    const cookie = 'claim-csrf-cookie';
    const base = {
      method: 'POST',
      cookies: { '__Host-home_csrf': cookie },
    };

    expect(csrfValid({ ...base, get: jest.fn(() => cookie) }, null)).toBe(true);
    expect(csrfValid({ ...base, get: jest.fn(() => 'wrong') }, null)).toBe(false);
    expect(csrfValid({ ...base, get: jest.fn(() => cookie) }, null)).toBe(true);
    expect(csrfValid({ method: 'POST', get: jest.fn(() => cookie), cookies: {} }, null)).toBe(false);
  });
});
