const nodemailer = require('nodemailer');
const config = require("config");
const mailConfig = config.get('mail')

let transporter = nodemailer.createTransport({
    host: mailConfig.smtp_host, // 腾讯云SMTP服务器
	port: mailConfig.smtp_port,
	secure: true, // 使用SSL
	auth: {
		user: mailConfig.smtp_user, //SMTP用户名
        pass: mailConfig.smtp_password, // SMTP密码
	}
})

module.exports = transporter;