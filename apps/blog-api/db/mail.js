const nodemailer = require('nodemailer');
const config = require("config");
const mailConfig = config.get('mail')

// 缺 SMTP 凭据时导出 null，调用方据此跳过发信，避免启动即崩或静默失败。
const transporter = mailConfig.smtp_host && mailConfig.smtp_user && mailConfig.smtp_password
  ? nodemailer.createTransport({
      host: mailConfig.smtp_host, // 腾讯云SMTP服务器
      port: mailConfig.smtp_port,
      secure: true, // 使用SSL
      auth: {
        user: mailConfig.smtp_user, //SMTP用户名
        pass: mailConfig.smtp_password, // SMTP密码
      },
    })
  : null

module.exports = transporter;
