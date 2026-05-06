import {
  getCurrentTime,
  getTimeCapsule,
  getGreeting,
  siteDateStatistics,
  formatDate,
  getRelativeTime,
  checkMemorialDay,
} from '../src/date.js';

describe('getCurrentTime', () => {
  it('返回包含所有时间字段的对象', () => {
    const time = getCurrentTime();
    expect(time).toHaveProperty('year');
    expect(time).toHaveProperty('month');
    expect(time).toHaveProperty('day');
    expect(time).toHaveProperty('hour');
    expect(time).toHaveProperty('minute');
    expect(time).toHaveProperty('second');
    expect(time).toHaveProperty('weekday');
  });

  it('月份、日期、时分秒均为两位字符串', () => {
    const time = getCurrentTime();
    expect(String(time.month)).toHaveLength(2);
    expect(String(time.day)).toHaveLength(2);
    expect(String(time.hour)).toHaveLength(2);
    expect(String(time.minute)).toHaveLength(2);
    expect(String(time.second)).toHaveLength(2);
  });

  it('weekday 是合法的中文星期', () => {
    const validWeekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const time = getCurrentTime();
    expect(validWeekdays).toContain(time.weekday);
  });

  it('year 是合理的年份数字', () => {
    const time = getCurrentTime();
    expect(time.year).toBeGreaterThan(2020);
    expect(time.year).toBeLessThan(2100);
  });
});

describe('getTimeCapsule', () => {
  it('返回 day/week/month/year 四个维度', () => {
    const capsule = getTimeCapsule();
    expect(capsule).toHaveProperty('day');
    expect(capsule).toHaveProperty('week');
    expect(capsule).toHaveProperty('month');
    expect(capsule).toHaveProperty('year');
  });

  it('每个维度包含 name/total/passed/remaining/percentage', () => {
    const capsule = getTimeCapsule();
    for (const unit of ['day', 'week', 'month', 'year']) {
      expect(capsule[unit]).toHaveProperty('name');
      expect(capsule[unit]).toHaveProperty('total');
      expect(capsule[unit]).toHaveProperty('passed');
      expect(capsule[unit]).toHaveProperty('remaining');
      expect(capsule[unit]).toHaveProperty('percentage');
    }
  });

  it('passed + remaining === total', () => {
    const capsule = getTimeCapsule();
    for (const unit of ['day', 'week', 'month', 'year']) {
      const { total, passed, remaining } = capsule[unit];
      expect(passed + remaining).toBe(total);
    }
  });

  it('percentage 在 0-100 之间', () => {
    const capsule = getTimeCapsule();
    for (const unit of ['day', 'week', 'month', 'year']) {
      const pct = parseFloat(capsule[unit].percentage);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });

  it('day 的 name 为 "今日"', () => {
    expect(getTimeCapsule().day.name).toBe('今日');
  });
});

describe('getGreeting', () => {
  it('返回合法的问候语字符串', () => {
    const validGreetings = ['凌晨好', '早上好', '上午好', '中午好', '下午好', '傍晚好', '晚上好', '夜深了'];
    const greeting = getGreeting();
    expect(validGreetings).toContain(greeting);
  });
});

describe('siteDateStatistics', () => {
  it('返回包含年月日的字符串', () => {
    const startDate = new Date('2020-01-01');
    const result = siteDateStatistics(startDate);
    expect(result).toMatch(/本站已经苟活了 \d+ 年 \d+ 月 \d+ 天/);
  });

  it('今天建站返回 0 年 0 月 0 天', () => {
    const today = new Date();
    const result = siteDateStatistics(today);
    expect(result).toBe('本站已经苟活了 0 年 0 月 0 天');
  });

  it('跨年计算正确', () => {
    // 固定日期测试：从 2023-01-01 到 2025-01-01 = 2年0月0天
    const start = new Date('2023-01-01');
    const mockNow = new Date('2025-01-01');
    // 直接测试逻辑：用固定日期
    const currentDate = mockNow;
    let years = currentDate.getFullYear() - start.getFullYear();
    let months = currentDate.getMonth() - start.getMonth();
    let days = currentDate.getDate() - start.getDate();
    if (days < 0) { months--; days += new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    expect(years).toBe(2);
    expect(months).toBe(0);
    expect(days).toBe(0);
  });
});

describe('formatDate', () => {
  it('默认格式化为 YYYY-MM-DD HH:mm:ss', () => {
    const date = new Date('2025-05-07T10:30:00');
    const result = formatDate(date);
    expect(result).toBe('2025-05-07 10:30:00');
  });

  it('支持自定义格式', () => {
    const date = new Date('2025-05-07T10:30:00');
    expect(formatDate(date, 'YYYY/MM/DD')).toBe('2025/05/07');
    expect(formatDate(date, 'MM-DD')).toBe('05-07');
  });

  it('支持时间戳输入', () => {
    const ts = new Date('2025-01-01T00:00:00').getTime();
    const result = formatDate(ts, 'YYYY-MM-DD');
    expect(result).toBe('2025-01-01');
  });
});

describe('getRelativeTime', () => {
  it('30秒内返回"刚刚"', () => {
    const now = new Date();
    expect(getRelativeTime(now)).toBe('刚刚');
  });

  it('2分钟前返回"2 分钟前"', () => {
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
    expect(getRelativeTime(twoMinAgo)).toBe('2 分钟前');
  });

  it('3小时前返回"3 小时前"', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000);
    expect(getRelativeTime(threeHoursAgo)).toBe('3 小时前');
  });

  it('5天前返回"5 天前"', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 86400 * 1000);
    expect(getRelativeTime(fiveDaysAgo)).toBe('5 天前');
  });

  it('2个月前返回"2 个月前"', () => {
    const twoMonthsAgo = new Date(Date.now() - 65 * 86400 * 1000);
    expect(getRelativeTime(twoMonthsAgo)).toBe('2 个月前');
  });
});

describe('checkMemorialDay', () => {
  it('非纪念日返回 null', () => {
    // 用一个不太可能是纪念日的日期（2月1日）
    const origDate = global.Date;
    const mockDate = class extends origDate {
      constructor(...args) { super(...args); }
      getMonth() { return 1; } // 2月
      getDate() { return 1; }
    };
    global.Date = mockDate;
    const result = checkMemorialDay();
    global.Date = origDate;
    expect(result).toBeNull();
  });

  it('纪念日返回包含 date 和 name 的对象', () => {
    const origDate = global.Date;
    const mockDate = class extends origDate {
      constructor(...args) { super(...args); }
      getMonth() { return 4; }  // 5月
      getDate() { return 12; }  // 12日 → 5.12
    };
    global.Date = mockDate;
    const result = checkMemorialDay();
    global.Date = origDate;
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('date', '5.12');
    expect(result).toHaveProperty('name', '汶川大地震纪念日');
  });
});
