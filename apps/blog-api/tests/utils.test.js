/**
 * blog-api 测试套件
 * 测试 utils/index.js 中的工具函数
 * 使用 Jest 框架，CommonJS 模块
 */

// 模拟 config 模块
jest.mock('config', () => ({
  get: jest.fn((key) => {
    const configs = {
      tokenSecretKey: 'test_secret_key_for_testing_only',
      vipCustomerEmail: ['vip@test.com', 'admin@test.com'],
      comment: {
        adminCustomerEmail: ['admin@test.com'],
      },
    };
    return configs[key];
  }),
}));

const utils = require('../utils/index');

describe('utils.postMessage', () => {
  it('默认参数返回标准结构', () => {
    const result = utils.postMessage();
    expect(result).toEqual({ code: 200, msg: '', data: {} });
  });

  it('自定义 code 和 message', () => {
    const result = utils.postMessage(-1, '操作失败', { id: 1 });
    expect(result).toEqual({ code: -1, msg: '操作失败', data: { id: 1 } });
  });

  it('data 可以是任意类型', () => {
    expect(utils.postMessage(200, 'ok', [1, 2, 3]).data).toEqual([1, 2, 3]);
    expect(utils.postMessage(200, 'ok', 'string').data).toBe('string');
    expect(utils.postMessage(200, 'ok', null).data).toBeNull();
  });
});

describe('utils.isNullOrEmpty', () => {
  it('null 和 undefined 返回 true', () => {
    expect(utils.isNullOrEmpty(null)).toBe(true);
    expect(utils.isNullOrEmpty(undefined)).toBe(true);
  });

  it('空对象返回 true', () => {
    expect(utils.isNullOrEmpty({})).toBe(true);
  });

  it('空字符串和空白字符串返回 true', () => {
    expect(utils.isNullOrEmpty('')).toBe(true);
    expect(utils.isNullOrEmpty('   ')).toBe(true);
  });

  it('非空值返回 false', () => {
    expect(utils.isNullOrEmpty({ a: 1 })).toBe(false);
    expect(utils.isNullOrEmpty('hello')).toBe(false);
    expect(utils.isNullOrEmpty(0)).toBe(false);
    expect(utils.isNullOrEmpty(false)).toBe(false);
    expect(utils.isNullOrEmpty([1])).toBe(false);
  });
});

describe('utils.getRandomChar', () => {
  it('默认生成 5 位字符串', () => {
    const str = utils.getRandomChar();
    expect(str).toHaveLength(5);
  });

  it('生成指定长度', () => {
    expect(utils.getRandomChar(6)).toHaveLength(6);
    expect(utils.getRandomChar(10)).toHaveLength(10);
  });

  it('只包含字母和数字', () => {
    const str = utils.getRandomChar(100);
    expect(str).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('多次调用结果不同（概率性）', () => {
    const results = new Set(Array.from({ length: 10 }, () => utils.getRandomChar(10)));
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('utils.isVipCustomer', () => {
  it('VIP 邮箱返回 true', () => {
    expect(utils.isVipCustomer('vip@test.com')).toBe(true);
    expect(utils.isVipCustomer('admin@test.com')).toBe(true);
  });

  it('非 VIP 邮箱返回 false', () => {
    expect(utils.isVipCustomer('user@test.com')).toBe(false);
    expect(utils.isVipCustomer('')).toBe(false);
  });
});

describe('utils.isAdminCustomer', () => {
  it('管理员邮箱返回 true', () => {
    expect(utils.isAdminCustomer('admin@test.com')).toBe(true);
  });

  it('非管理员邮箱返回 false', () => {
    expect(utils.isAdminCustomer('user@test.com')).toBe(false);
    expect(utils.isAdminCustomer('vip@test.com')).toBe(false);
  });
});

describe('utils.throwError', () => {
  it('抛出包含 status 和 msg 的错误', () => {
    expect(() => utils.throwError('测试错误', 400)).toThrow();
  });

  it('错误对象包含正确的 status', () => {
    try {
      utils.throwError('测试错误', 400);
    } catch (e) {
      expect(e.status).toBe(400);
      expect(e.msg).toBe('测试错误');
    }
  });

  it('默认 status 为 500', () => {
    try {
      utils.throwError('默认错误');
    } catch (e) {
      expect(e.status).toBe(500);
    }
  });

  it('默认 msg 为 "出现未知错误❌"', () => {
    try {
      utils.throwError();
    } catch (e) {
      expect(e.msg).toBe('出现未知错误❌');
    }
  });
});
