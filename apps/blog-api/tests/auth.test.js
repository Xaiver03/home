/**
 * blog-api 测试套件
 * 测试 middlewares/auth.js 中的权限中间件
 */

jest.mock('config', () => ({
  get: jest.fn((key) => {
    if (key === 'tokenSecretKey') return 'test_secret_key_for_testing_only_32chars';
    return null;
  }),
}));

// 模拟 express-jwt
jest.mock('express-jwt', () => ({
  expressjwt: jest.fn(() => {
    const middleware = jest.fn((req, res, next) => next());
    middleware.unless = jest.fn(() => middleware);
    return middleware;
  }),
}));

const tokenService = require('../services/tokenService');

describe('auth.checkPermissions', () => {
  // 直接测试 checkPermissions 逻辑，不依赖 express-jwt
  const { checkPermissions, JwtErrorCatch } = require('../middlewares/auth');

  const makeReq = (payload) => {
    const token = tokenService.getToken(payload);
    return { headers: { authorization: `Bearer ${token}` } };
  };

  it('admin 权限通过 admin 检查', () => {
    const req = makeReq({ id: 1, power: 'admin' });
    const res = { json: jest.fn() };
    const next = jest.fn();

    checkPermissions('admin')(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('user 权限无法通过 admin 检查', () => {
    const req = makeReq({ id: 2, power: 'user' });
    const res = { json: jest.fn() };
    const next = jest.fn();

    checkPermissions('admin')(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ code: -1, message: '权限不足' });
  });

  it('user 权限通过 user 检查', () => {
    const req = makeReq({ id: 3, power: 'user' });
    const res = { json: jest.fn() };
    const next = jest.fn();

    checkPermissions('user')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('默认检查 admin 权限', () => {
    const req = makeReq({ id: 4, power: 'user' });
    const res = { json: jest.fn() };
    const next = jest.fn();

    checkPermissions()(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ code: -1, message: '权限不足' });
  });
});

describe('auth.JwtErrorCatch', () => {
  const { JwtErrorCatch } = require('../middlewares/auth');

  it('UnauthorizedError 返回 -1 code', () => {
    const err = { name: 'UnauthorizedError' };
    const req = { path: '/some/path' };
    const res = { json: jest.fn() };
    const next = jest.fn();

    JwtErrorCatch(err, req, res, next);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: -1 })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('非 JWT 错误传递给下一个中间件', () => {
    const err = { name: 'SomeOtherError', message: 'other error' };
    const req = { path: '/some/path' };
    const res = { json: jest.fn() };
    const next = jest.fn();

    JwtErrorCatch(err, req, res, next);
    expect(next).toHaveBeenCalledWith(err);
    expect(res.json).not.toHaveBeenCalled();
  });

  it('评论路径返回特定错误信息', () => {
    const err = { name: 'UnauthorizedError' };
    const req = { path: '/comment/addComment' };
    const res = { json: jest.fn() };
    const next = jest.fn();

    JwtErrorCatch(err, req, res, next);
    const callArg = res.json.mock.calls[0][0];
    expect(callArg.code).toBe(-1);
    expect(callArg.msg).toHaveProperty('message');
    expect(callArg.msg.message).toContain('评论失败');
  });
});
