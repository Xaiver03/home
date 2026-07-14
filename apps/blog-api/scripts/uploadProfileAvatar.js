#!/usr/bin/env node

/** 上传站长头像到 MinIO，并同步 configuration.my-avatar。 */
const fs = require('fs');
const path = require('path');
process.env.NODE_CONFIG_DIR = process.env.NODE_CONFIG_DIR || path.join(__dirname, '../config');
const { Configuration, sequelize } = require('../models');
const storageService = require('../services/storageService');

const filePath = process.argv[2];
if (!filePath) {
  console.error('用法：NODE_ENV=pro node scripts/uploadProfileAvatar.js /path/to/avatar.jpg');
  process.exit(1);
}

(async () => {
  const buffer = fs.readFileSync(path.resolve(filePath));
  const extension = path.extname(filePath).toLowerCase();
  const contentType = extension === '.png' ? 'image/png' : 'image/jpeg';
  const result = await storageService.uploadBuffer('image/profile/avatar.jpg', buffer, contentType);
  // 兼容历史页面、浏览器缓存和旧数据库记录，保留旧路径的同图别名。
  await storageService.uploadBuffer('avatar.jpg', buffer, contentType);

  const configurations = await Configuration.findAll({ where: { label: 'my-avatar' } });
  if (configurations.length === 0) {
    await Configuration.create({ label: 'my-avatar', content: result.url, type: 'STRING' });
  } else {
    await Promise.all(
      configurations.map((configuration) => configuration.update({ content: result.url, type: 'STRING' })),
    );
  }
  console.log(`头像已上传：${result.url}`);
})().catch((error) => {
  console.error('头像上传失败：', error);
  process.exitCode = 1;
}).finally(async () => {
  await sequelize.close();
});
