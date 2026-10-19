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
