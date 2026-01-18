// 七牛云存储配置
const qiniu = require('qiniu');
const config = require("config");

let qiniuClient = null;

try {
  const qiniuConfig = config.get('qiniu');

  // 配置七牛云
  const accessKey = qiniuConfig.access_key;
  const secretKey = qiniuConfig.secret_key;
  const bucket = qiniuConfig.bucket;
  const domain = qiniuConfig.domain;

  // 创建认证对象
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

  // 配置上传策略
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: bucket,
    returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
  });

  // 生成上传token
  const uploadToken = putPolicy.uploadToken(mac);

  // 配置上传管理器
  const formUploader = new qiniu.form_up.FormUploader(new qiniu.conf.Config({
    zone: qiniu.zone[qiniuConfig.zone] || qiniu.zone.Zone_z2
  }));

  // 配置存储管理器
  const bucketManager = new qiniu.rs.BucketManager(mac, new qiniu.conf.Config({
    zone: qiniu.zone[qiniuConfig.zone] || qiniu.zone.Zone_z2
  }));

  qiniuClient = {
    mac,
    putPolicy,
    uploadToken,
    formUploader,
    bucketManager,
    bucket,
    domain,
    config: qiniuConfig
  };

  console.log('七牛云存储配置成功');
} catch (error) {
  console.log('七牛云存储配置未找到或配置错误，存储功能将被禁用:', error.message);
}

module.exports = {
    client: qiniuClient
};