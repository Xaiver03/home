// 初始化Client
let OSS = require('ali-oss');
const config = require("config");

let client = null;

try {
  const ossConfig = config.get('oss');
  client = new OSS({
    region: ossConfig.region,
    accessKeyId: ossConfig.accessKeyId,
    accessKeySecret: ossConfig.accessKeySecret,
    bucket: ossConfig.bucket,
  });
  console.log('阿里云OSS配置成功');
} catch (error) {
  console.log('阿里云OSS配置未找到或配置错误，OSS功能将被禁用:', error.message);
}

module.exports = {
    client
};