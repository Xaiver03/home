const redisService = require("../services/redisService");
const utils = require("../utils/index");

module.exports = {
  /**
   * 限制用户的文件上传频率中间件 seconds(s)内最多上传limit次
   * @param {Number} limit 限制次数，默认5次
   * @param {Number} seconds 限制秒数，默认300s（5分钟）
   * @param {String} limitKey 限制key（redis的key前缀），默认：'upload_limit'
   * @param {String,Object} msg 限制的返回信息，默认：限流拦截，请稍后重试
   */
  limitCustomerFileUpload: (
    limit,
    seconds,
    limitKey = "upload_limit",
    msg = "限流拦截，请稍后重试"
  ) => {
    return async (req, res, next) => {
      // 认证链现在只接受中央产品会话；匿名上传按 IP 限流，避免旧 JWT
      // 成为隐式认证入口，同时保留公开留言的图片上传能力。
      const principal = req.auth?.localUserId
        ? `user:${req.auth.localUserId}`
        : req.auth?.subject
          ? `subject:${req.auth.subject}`
          : `ip:${req.ip || req.connection?.remoteAddress || 'unknown'}`;
      const uploadLimitKey = `${limitKey}:${principal}`;
      let current = await redisService.get(uploadLimitKey);
      if (current === null) {
        await redisService.set(uploadLimitKey, 1, seconds);
        return next();
      }
      current = parseInt(current);
      if (current > limit) {
        utils.throwError(msg, 429);
      }
      await redisService.incr(uploadLimitKey);
      return next();
    };
  },
  /**
   * 限制用户的操作中间件 seconds(s)内最多上传limit次
   * @param {Number} limit 限制次数，默认5次
   * @param {Number} seconds 限制秒数，默认300s（5分钟）
   * @param {String} limitKey 限制key（redis的key前缀），默认：'upload_limit'
   * @param {String,Object} msg 限制的返回信息，默认：限流拦截，请稍后重试
   */
  limitCustomerAction: (
    limit,
    seconds,
    limitKey = "upload_limit",
    msg = "限流拦截，请稍后重试"
  ) => {
    return async (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress;
      console.log(ip);
      const uploadLimitKey = `${limitKey}:${ip}`;
      let current = await redisService.get(uploadLimitKey);
      if (current === null) {
        await redisService.set(uploadLimitKey, 1, seconds);
        return next();
      }
      current = parseInt(current);
      if (current > limit) {
        utils.throwError(msg, 429);
      }
      await redisService.incr(uploadLimitKey);
      return next();
    };
  },
};
