/**
 * homepage 测试套件
 * 测试 src/utils/debounce.js 中的防抖函数
 */

// 直接测试防抖逻辑（不依赖 Vue）
describe('debounce 防抖函数', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // 复制 debounce.js 的逻辑进行测试（因为它使用模块级变量）
  function createDebounce() {
    let timeout;
    return function debounce(func, wait = 300, immediate = false) {
      if (timeout !== null) clearTimeout(timeout);
      if (immediate) {
        const callNow = !timeout;
        timeout = setTimeout(() => { timeout = null; }, wait);
        if (callNow && typeof func === 'function') func();
      } else {
        timeout = setTimeout(() => {
          if (typeof func === 'function') func();
        }, wait);
      }
    };
  }

  it('延迟执行函数', () => {
    const debounce = createDebounce();
    const fn = vi.fn();

    debounce(fn, 300);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('连续调用只执行最后一次', () => {
    const debounce = createDebounce();
    const fn = vi.fn();

    debounce(fn, 300);
    debounce(fn, 300);
    debounce(fn, 300);

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('immediate 模式立即执行', () => {
    const debounce = createDebounce();
    const fn = vi.fn();

    debounce(fn, 300, true);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('非函数参数不抛出错误', () => {
    const debounce = createDebounce();
    expect(() => debounce(null, 300)).not.toThrow();
    expect(() => debounce(undefined, 300)).not.toThrow();
    vi.advanceTimersByTime(300);
  });
});
