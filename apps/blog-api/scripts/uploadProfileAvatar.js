#!/usr/bin/env node

/** 上传站长头像到 MinIO，并同步 configuration.my-avatar。 */
const fs = require('fs');
const path = require('path');
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
  const configuration = await Configuration.findOne({ where: { label: 'my-avatar' } });
  if (configuration) {
    await configuration.update({ content: result.url, type: 'STRING' });
  } else {
    await Configuration.create({ label: 'my-avatar', content: result.url, type: 'STRING' });
  }
  console.log(`头像已上传：${result.url}`);
})().catch((error) => {
  console.error('头像上传失败：', error);
  process.exitCode = 1;
}).finally(async () => {
  await sequelize.close();
});
