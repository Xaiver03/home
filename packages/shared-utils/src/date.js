// @xld/shared-utils - 日期时间工具函数
// Date and time utility functions

import dayjs from 'dayjs';

/**
 * 获取当前时间
 * Get current time
 * @returns {Object} 当前时间对象
 */
export function getCurrentTime() {
  const time = new Date();
  const year = time.getFullYear();
  const month = time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1;
  const day = time.getDate() < 10 ? '0' + time.getDate() : time.getDate();
  const hour = time.getHours() < 10 ? '0' + time.getHours() : time.getHours();
  const minute = time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes();
  const second = time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds();
  const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    weekday: weekday[time.getDay()],
  };
}

/**
 * 获取时光胶囊数据（今日、本周、本月、本年进度）
 * Get time capsule data (day, week, month, year progress)
 * @returns {Object} 时光胶囊数据
 */
export function getTimeCapsule() {
  const now = dayjs();
  const dayText = {
    day: '今日',
    week: '本周',
    month: '本月',
    year: '本年',
  };

  /**
   * 计算时间差的函数
   * @param {String} unit 时间单位，可以是 'day', 'week', 'month', 'year'
   */
  const getDifference = (unit) => {
    const start = now.startOf(unit);
    const end = now.endOf(unit);
    const total = end.diff(start, unit === 'day' ? 'hour' : 'day') + 1;
    let passed = now.diff(start, unit === 'day' ? 'hour' : 'day');

    if (unit === 'week') {
      passed = (passed + 6) % 7;
    }

    const remaining = total - passed;
    const percentage = (passed / total) * 100;

    return {
      name: dayText[unit],
      total: total,
      passed: passed,
      remaining: remaining,
      percentage: percentage.toFixed(2),
    };
  };

  return {
    day: getDifference('day'),
    week: getDifference('week'),
    month: getDifference('month'),
    year: getDifference('year'),
  };
}

/**
 * 获取问候语
 * Get greeting message based on time
 * @returns {String} 问候语
 */
export function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 6) return '凌晨好';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 17) return '下午好';
  if (hour < 19) return '傍晚好';
  if (hour < 22) return '晚上好';
  return '夜深了';
}

/**
 * 建站日期统计
 * Calculate site age
 * @param {Date} startDate - 建站日期
 * @returns {String} 建站时长描述
 */
export function siteDateStatistics(startDate) {
  const currentDate = new Date();
  let years = currentDate.getFullYear() - startDate.getFullYear();
  let months = currentDate.getMonth() - startDate.getMonth();
  let days = currentDate.getDate() - startDate.getDate();

  // 如果天数或月份为负数，则调整天数和月份
  if (days < 0) {
    months--;
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    days += lastMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return `本站已经苟活了 ${years} 年 ${months} 月 ${days} 天`;
}

/**
 * 格式化日期
 * Format date
 * @param {Date|String|Number} date - 日期
 * @param {String} format - 格式化模板
 * @returns {String} 格式化后的日期
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(date).format(format);
}

/**
 * 获取相对时间
 * Get relative time (e.g., "2 hours ago")
 * @param {Date|String|Number} date - 日期
 * @returns {String} 相对时间描述
 */
export function getRelativeTime(date) {
  const now = dayjs();
  const target = dayjs(date);
  const diff = now.diff(target, 'second');

  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} 天前`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} 个月前`;
  return `${Math.floor(diff / 31536000)} 年前`;
}

/**
 * 检查是否为特殊纪念日
 * Check if today is a memorial day
 * @returns {Object|null} 纪念日信息或 null
 */
export function checkMemorialDay() {
  const anniversaries = {
    '4.4': '清明节',
    '5.12': '汶川大地震纪念日',
    '7.7': '中国人民抗日战争纪念日',
    '9.18': '九·一八事变纪念日',
    '12.13': '南京大屠杀死难者国家公祭日',
  };

  const myDate = new Date();
  const mon = myDate.getMonth() + 1;
  const date = myDate.getDate();
  const key = `${mon}.${date}`;

  if (Object.prototype.hasOwnProperty.call(anniversaries, key)) {
    return {
      date: key,
      name: anniversaries[key],
    };
  }

  return null;
}
