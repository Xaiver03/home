/**
 * blog-api 测试套件
 * 测试 services/tokenService.js 中的 JWT 工具函数
 */

jest.mock('config', () => ({
  get: jest.fn((key) => {
    if (key === 'tokenSecretKey') return 'test_secret_key_for_testing_only_32chars';
    return null;
  }),
}));

const tokenService = require('../services/tokenService');

describe('tokenService.getToken', () => {
  it('生成有效的 JWT 字符串', () => {
    const token = tokenService.getToken({ id: 1, power: 'admin' });
    expect(typeof token).toBe('string');
    // JWT 格式：三段 base64 用 . 分隔
    expect(token.split('.')).toHaveLength(3);
  });

  it('不同数据生成不同 token', () => {
    const t1 = tokenService.getToken({ id: 1 });
    const t2 = tokenService.getToken({ id: 2 });
    expect(t1).not.toBe(t2);
  });
});

describe('tokenService.checkToken', () => {
  it('验证合法 token 返回 code 200 和数据', () => {
    const payload = { id: 1, power: 'admin' };
    const token = tokenService.getToken(payload);
    const result = tokenService.checkToken(token);
    expect(result.code).toBe(200);
    expect(result.data.id).toBe(1);
    expect(result.data.power).toBe('admin');
  });

  it('支持 Bearer 前缀', () => {
    const payload = { id: 2, power: 'user' };
    const token = tokenService.getToken(payload);
    const result = tokenService.checkToken(`Bearer ${token}`);
    expect(result.code).toBe(200);
    expect(result.data.id).toBe(2);
  });

  it('非法 token 抛出错误', () => {
    expect(() => tokenService.checkToken('invalid.token.here')).toThrow();
  });

  it('篡改的 token 抛出错误', () => {
    const token = tokenService.getToken({ id: 1 });
    const tampered = token.slice(0, -5) + 'XXXXX';
    expect(() => tokenService.checkToken(tampered)).toThrow();
  });
});

describe('tokenService.checkUserByToken', () => {
  it('token 中的 id 与传入 userId 匹配时返回 true', () => {
    const token = tokenService.getToken({ id: 42, power: 'user' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    expect(tokenService.checkUserByToken(req, 42)).toBe(true);
    expect(tokenService.checkUserByToken(req, '42')).toBe(true); // 宽松比较
  });

  it('id 不匹配时返回 false', () => {
    const token = tokenService.getToken({ id: 42, power: 'user' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    expect(tokenService.checkUserByToken(req, 99)).toBe(false);
  });
});
