const client = require("../db/redis");

module.exports = {
  /**
   * 设置redis键值
   * @param {*} key redis键
   * @param {*} value 值
   * @param {Number} timeout 过期时间，单位s，默认五分钟
   */
  set: async (key, value, timeout=300) => {
    await client.set(key, value);
    if(timeout) {
        await client.expire(key,timeout)
    }
  },
  // 获取普通键值
  get: async (key) => {
    return await client.get(key);
  },
  // Compare and consume in one Redis command: concurrent requests cannot reuse
  // a successful proof, and a wrong guess must not delete the actual code.
  consumeLoginCode: async (mail, code) => {
    if (typeof mail !== 'string' || mail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)
      || typeof code !== 'string' || !/^[A-Za-z0-9]{5}$/.test(code)) return false;
    const result = await client.eval(`
      local expected = redis.call('GET', KEYS[1])
      if not expected or expected ~= ARGV[1] then return 0 end
      redis.call('DEL', KEYS[1])
      return 1
    `, { keys: [mail], arguments: [code] });
    return result === 1;
  },
  // All windows are checked and incremented in one Redis script. If Redis is
  // unavailable, callers fail closed rather than allowing unlimited guesses.
  consumeRateLimits: async (windows) => {
    if (!Array.isArray(windows) || windows.length === 0 || windows.length > 8 ||
      windows.some(({ key, limit, seconds }) => !/^(oidc:claim|local:login):[a-z:0-9]+$/.test(key) ||
        !Number.isInteger(limit) || limit < 1 || !Number.isInteger(seconds) || seconds < 1)) {
      throw new Error('限流配置无效');
    }
    const result = await client.eval(`
      for i = 1, #KEYS do
        if tonumber(redis.call('GET', KEYS[i]) or '0') >= tonumber(ARGV[i * 2 - 1]) then return 0 end
      end
      for i = 1, #KEYS do
        local count = redis.call('INCR', KEYS[i])
        if count == 1 then redis.call('EXPIRE', KEYS[i], tonumber(ARGV[i * 2])) end
      end
      return 1
    `, {
      keys: windows.map(({ key }) => key),
      arguments: windows.flatMap(({ limit, seconds }) => [String(limit), String(seconds)]),
    });
    return result === 1;
  },
  // 删除键值
  del: async (key) => {
    return await client.del(key);
  },
  /**
   * redis原子性+1,若key不存在会创建并设置为0，若存在会将其值+1
   * @param {String} key 键
   * @returns {Function} 创建方法
   */
  incr: async(key) => {
    return await client.incr(key)
  },
  /**
   * 设置redis哈希(相当于对象{})键值
   * @param {*} key redis键
   * @param {*} value 值
   * @param {Number} timeout 过期时间，单位s，默认5分钟
   */
  hSet: async (key, hash,timeout=300) => {
    await client.hSet(key, hash)
    if(timeout) {
        await client.expire(key,timeout)
    }
  },
  // 获取哈希
  hGetAll: async (key) => {
    return await client.hGetAll(key);
  },
  // 关闭redis连接
  quit: async () => {
    console.log("redis连接已关闭");
    return await client.quit();
  },
};
