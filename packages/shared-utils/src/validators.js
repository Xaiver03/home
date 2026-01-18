// @xld/shared-utils - 数据验证工具函数
// Data validation utility functions

/**
 * 验证邮箱格式
 * Validate email format
 * @param {String} email - 邮箱地址
 * @returns {Boolean} 是否有效
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * 验证手机号格式（中国大陆）
 * Validate phone number (China mainland)
 * @param {String} phone - 手机号
 * @returns {Boolean} 是否有效
 */
export function isValidPhone(phone) {
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
}

/**
 * 验证 URL 格式
 * Validate URL format
 * @param {String} url - URL 地址
 * @returns {Boolean} 是否有效
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 验证身份证号（中国大陆）
 * Validate ID card number (China mainland)
 * @param {String} idCard - 身份证号
 * @returns {Boolean} 是否有效
 */
export function isValidIdCard(idCard) {
  const re = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return re.test(idCard);
}

/**
 * 验证密码强度
 * Validate password strength
 * @param {String} password - 密码
 * @returns {Object} 强度信息 { level: 0-3, message: String }
 */
export function validatePasswordStrength(password) {
  if (!password) {
    return { level: 0, message: '密码不能为空' };
  }

  if (password.length < 6) {
    return { level: 0, message: '密码长度至少6位' };
  }

  let level = 0;

  // 包含数字
  if (/\d/.test(password)) level++;
  // 包含小写字母
  if (/[a-z]/.test(password)) level++;
  // 包含大写字母
  if (/[A-Z]/.test(password)) level++;
  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) level++;

  const messages = ['弱', '中', '强', '非常强'];

  return {
    level: Math.min(level, 3),
    message: messages[Math.min(level - 1, 3)],
  };
}

/**
 * 验证是否为空
 * Check if value is empty
 * @param {*} value - 要检查的值
 * @returns {Boolean} 是否为空
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * 验证是否为数字
 * Check if value is a number
 * @param {*} value - 要检查的值
 * @returns {Boolean} 是否为数字
 */
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 验证是否为整数
 * Check if value is an integer
 * @param {*} value - 要检查的值
 * @returns {Boolean} 是否为整数
 */
export function isInteger(value) {
  return Number.isInteger(value);
}

/**
 * 验证字符串长度范围
 * Validate string length range
 * @param {String} str - 字符串
 * @param {Number} min - 最小长度
 * @param {Number} max - 最大长度
 * @returns {Boolean} 是否在范围内
 */
export function isLengthInRange(str, min, max) {
  const len = str ? str.length : 0;
  return len >= min && len <= max;
}
