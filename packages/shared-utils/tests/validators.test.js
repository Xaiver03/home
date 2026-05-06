import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isValidIdCard,
  validatePasswordStrength,
  isEmpty,
  isNumber,
  isInteger,
  isLengthInRange,
} from '../src/validators.js';

describe('isValidEmail', () => {
  it('应接受合法邮箱', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@sub.domain.org')).toBe(true);
    expect(isValidEmail('light@xiangleideng.site')).toBe(true);
  });

  it('应拒绝非法邮箱', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('应接受合法中国大陆手机号', () => {
    expect(isValidPhone('13800138000')).toBe(true);
    expect(isValidPhone('19912345678')).toBe(true);
    expect(isValidPhone('17600000000')).toBe(true);
  });

  it('应拒绝非法手机号', () => {
    expect(isValidPhone('12345678901')).toBe(false); // 不以1[3-9]开头
    expect(isValidPhone('1380013800')).toBe(false);  // 10位
    expect(isValidPhone('138001380001')).toBe(false); // 12位
    expect(isValidPhone('abcdefghijk')).toBe(false);
    expect(isValidPhone('')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('应接受合法 URL', () => {
    expect(isValidUrl('https://xiangleideng.site')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('https://example.com/path?q=1#hash')).toBe(true);
  });

  it('应拒绝非法 URL', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('ftp://')).toBe(false);
  });
});

describe('isValidIdCard', () => {
  it('应接受合法身份证号', () => {
    expect(isValidIdCard('110101199001011234')).toBe(true); // 18位数字
    expect(isValidIdCard('11010119900101123X')).toBe(true); // 18位含X
    expect(isValidIdCard('11010119900101123x')).toBe(true); // 18位含x
    expect(isValidIdCard('110101990101123')).toBe(true);    // 15位
  });

  it('应拒绝非法身份证号', () => {
    expect(isValidIdCard('1234')).toBe(false);
    expect(isValidIdCard('')).toBe(false);
    expect(isValidIdCard('1101011990010112345')).toBe(false); // 19位
  });
});

describe('validatePasswordStrength', () => {
  it('空密码返回 level 0', () => {
    const result = validatePasswordStrength('');
    expect(result.level).toBe(0);
    expect(result.message).toBe('密码不能为空');
  });

  it('短密码返回 level 0', () => {
    const result = validatePasswordStrength('abc');
    expect(result.level).toBe(0);
    expect(result.message).toBe('密码长度至少6位');
  });

  it('仅数字密码为弱', () => {
    const result = validatePasswordStrength('123456');
    expect(result.level).toBe(1);
  });

  it('数字+小写字母为中', () => {
    const result = validatePasswordStrength('abc123');
    expect(result.level).toBe(2);
  });

  it('数字+大小写字母为强', () => {
    const result = validatePasswordStrength('Abc123');
    expect(result.level).toBe(3);
  });

  it('数字+大小写+特殊字符为非常强', () => {
    const result = validatePasswordStrength('Abc123!@');
    expect(result.level).toBe(3); // Math.min(4, 3) = 3
    expect(result.message).toBe('非常强');
  });
});

describe('isEmpty', () => {
  it('null 和 undefined 为空', () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it('空字符串和空白字符串为空', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
  });

  it('非空字符串不为空', () => {
    expect(isEmpty('hello')).toBe(false);
  });

  it('空数组为空', () => {
    expect(isEmpty([])).toBe(true);
  });

  it('非空数组不为空', () => {
    expect(isEmpty([1, 2])).toBe(false);
  });

  it('空对象为空', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('非空对象不为空', () => {
    expect(isEmpty({ a: 1 })).toBe(false);
  });

  it('数字 0 不为空', () => {
    expect(isEmpty(0)).toBe(false);
  });
});

describe('isNumber', () => {
  it('数字类型返回 true', () => {
    expect(isNumber(42)).toBe(true);
    expect(isNumber(3.14)).toBe(true);
    expect(isNumber(0)).toBe(true);
    expect(isNumber(-1)).toBe(true);
  });

  it('NaN 返回 false', () => {
    expect(isNumber(NaN)).toBe(false);
  });

  it('非数字类型返回 false', () => {
    expect(isNumber('42')).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
  });
});

describe('isInteger', () => {
  it('整数返回 true', () => {
    expect(isInteger(0)).toBe(true);
    expect(isInteger(42)).toBe(true);
    expect(isInteger(-10)).toBe(true);
  });

  it('浮点数返回 false', () => {
    expect(isInteger(3.14)).toBe(false);
  });

  it('非数字返回 false', () => {
    expect(isInteger('42')).toBe(false);
    expect(isInteger(null)).toBe(false);
  });
});

describe('isLengthInRange', () => {
  it('长度在范围内返回 true', () => {
    expect(isLengthInRange('hello', 1, 10)).toBe(true);
    expect(isLengthInRange('hello', 5, 5)).toBe(true);
  });

  it('长度超出范围返回 false', () => {
    expect(isLengthInRange('hello', 6, 10)).toBe(false);
    expect(isLengthInRange('hello', 1, 4)).toBe(false);
  });

  it('null/undefined 字符串长度视为 0', () => {
    expect(isLengthInRange(null, 0, 5)).toBe(true);
    expect(isLengthInRange(undefined, 0, 5)).toBe(true);
    expect(isLengthInRange(null, 1, 5)).toBe(false);
  });
});
