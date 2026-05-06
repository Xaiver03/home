import {
  debounce,
  throttle,
  deepClone,
  randomString,
  formatFileSize,
  sleep,
} from '../src/common.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('在等待时间内只执行一次', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('传递正确的参数', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('hello', 42);
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('hello', 42);
  });

  it('immediate 模式立即执行', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300, true);

    debounced();
    expect(fn).toHaveBeenCalledTimes(1);

    debounced();
    debounced();
    expect(fn).toHaveBeenCalledTimes(1); // 仍然只执行一次
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('在限制时间内只执行一次', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 300);

    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('限制时间过后可以再次执行', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 300);

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('deepClone', () => {
  it('克隆基本类型', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(null)).toBeNull();
    expect(deepClone(true)).toBe(true);
  });

  it('克隆数组', () => {
    const arr = [1, 2, [3, 4]];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
    expect(cloned[2]).not.toBe(arr[2]);
  });

  it('克隆对象', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.b).not.toBe(obj.b);
  });

  it('克隆 Date 对象', () => {
    const date = new Date('2025-05-07');
    const cloned = deepClone(date);
    expect(cloned).toEqual(date);
    expect(cloned).not.toBe(date);
    expect(cloned instanceof Date).toBe(true);
  });

  it('修改克隆对象不影响原对象', () => {
    const obj = { a: { b: 1 } };
    const cloned = deepClone(obj);
    cloned.a.b = 999;
    expect(obj.a.b).toBe(1);
  });
});

describe('randomString', () => {
  it('默认生成 8 位字符串', () => {
    const str = randomString();
    expect(str).toHaveLength(8);
  });

  it('生成指定长度的字符串', () => {
    expect(randomString(16)).toHaveLength(16);
    expect(randomString(1)).toHaveLength(1);
    expect(randomString(32)).toHaveLength(32);
  });

  it('只包含字母和数字', () => {
    const str = randomString(100);
    expect(str).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('多次调用结果不同（概率性）', () => {
    const results = new Set(Array.from({ length: 10 }, () => randomString(16)));
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('formatFileSize', () => {
  it('0 字节返回 "0 Bytes"', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('字节级别', () => {
    expect(formatFileSize(512)).toBe('512 Bytes');
  });

  it('KB 级别', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('MB 级别', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
  });

  it('GB 级别', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('支持自定义小数位数', () => {
    expect(formatFileSize(1536, 1)).toBe('1.5 KB');
    expect(formatFileSize(1536, 0)).toBe('2 KB');
  });
});

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('返回 Promise', () => {
    const result = sleep(100);
    expect(result).toBeInstanceOf(Promise);
    vi.advanceTimersByTime(100);
  });

  it('在指定时间后 resolve', async () => {
    const fn = vi.fn();
    sleep(500).then(fn);

    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    await Promise.resolve(); // flush microtasks
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
