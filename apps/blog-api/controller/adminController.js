const adminService = require("../services/adminService");
const mailService = require('../services/mailService')
const utils = require("../utils/index");
const redisService = require("../services/redisService");
const tokenService = require("../services/tokenService");
const bcrypt = require("bcryptjs");

const validLoginMail = (mail) => typeof mail === 'string'
  && mail.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

// Database credential columns must never become response fields or JWT claims.
const adminLoginResponse = (row) => {
  const { id, mail, username, createTime, updatedTime } = row.dataValues;
  return {
    id, mail, username, createTime, updatedTime,
    token: tokenService.getToken({ id, mail, username, power: 'admin' }),
  };
};

module.exports = {
  // --获取--
  // 分页获取管理员
  getAllAdmin: async (req, res) => {
    res.json(
      await adminService.getAllAdmin(
        req.params.currentPage,
        req.params.pageSize
      )
    );
  },
  // 分页 筛选搜索管理员
  searchAdmin: async (req, res) => {
    res.json(
      await adminService.searchAdmin(
        req.body.data,
        req.body.currentPage,
        req.body.pageSize
      )
    );
  },

  // --登录--
  // 发送登录验证码
  sendLoginMail: async (req, res) => {
    let adminData = await adminService.getAdminByMail(req.body.mail)
    if (!adminData) {
      res.json(utils.postMessage(-1, "暂无该管理员❗️请联系站长", {}));
      return
    }
    if ((await mailService.sendCodeMail(req.body.mail)) != -1) {
      res.json(utils.postMessage(undefined, "请留意邮箱验证码✅", {}));
      return;
    }
    res.json(utils.postMessage(-1, "验证码发送失败❗️请联系管理员", {}));
  },
  // 管理员登录认证
  adminLogin: async (req, res) => {
    const { mail, code } = req.body ?? {};
    if (!validLoginMail(mail) || typeof code !== 'string' || !/^[A-Za-z0-9]{5}$/.test(code)) {
      res.json(utils.postMessage(-1, "验证码错误❗️请检查重试", {}));
      return;
    }
    if (await redisService.consumeLoginCode(mail, code)) {
      const adminData = await adminService.getAdminByMail(mail); // 获取用户信息
      if (!adminData) {
        res.json(utils.postMessage(-1, "暂无该管理员❗️请联系站长", {}));
        return
      }
      res.json(utils.postMessage(undefined, "登录成功✅欢迎您", adminLoginResponse(adminData)));
      return;
    }
    res.json(utils.postMessage(-1, "验证码错误❗️请检查重试", {}));
  },

  // 邮箱密码登录
  loginByPassword: async (req, res) => {
    const { mail, password } = req.body;
    if (!mail || !password) {
      res.json(utils.postMessage(-1, "邮箱和密码不能为空❗️", {}));
      return;
    }
    let adminData = await adminService.getAdminByMail(mail);
    if (!adminData || !adminData.passwordHash) {
      res.json(utils.postMessage(-1, "邮箱或密码错误❗️", {}));
      return;
    }
    const isValid = await bcrypt.compare(password, adminData.passwordHash);
    if (!isValid) {
      res.json(utils.postMessage(-1, "邮箱或密码错误❗️", {}));
      return;
    }
    res.json(utils.postMessage(undefined, "登录成功✅欢迎您", adminLoginResponse(adminData)));
  },

  // --修改--
  // 创建管理员
  createAdmin: async (req, res) => {
    res.json(await adminService.createAdmin(req.body));
  },
  // 更新管理员
  updateAdmin: async (req, res) => {
    res.json(await adminService.updateAdmin(req.body));
  },

  //--删除--
  // 删除管理员
  deleteAdminById: async (req, res) => {
    res.json(await adminService.deleteAdminById(req.query.id));
  },
};
