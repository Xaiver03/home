// 本地文件存储配置（替代七牛云）
const config = require("config");

const storageConfig = config.has('storage') ? config.get('storage') : {
  baseDir: '/opt/home/apps/blog-api/public/uploads',
  publicUrl: '/uploads',
};

console.log('本地文件存储已就绪:', storageConfig.baseDir);

module.exports = {
  client: {
    storageConfig,
    baseDir: storageConfig.baseDir,
    publicUrl: storageConfig.publicUrl,
  }
};
