#!/usr/bin/env node

/**
 * 将旧的 public/uploads 文件树迁移到 MinIO，保留原有对象路径。
 * 运行前必须提供 MINIO_* 环境变量，并使用 NODE_ENV=pro/local 等正确配置。
 */
const fs = require('fs');
const path = require('path');
const storageService = require('../services/storageService');

const sourceDir = path.resolve(process.argv[2] || path.join(__dirname, '../public/uploads'));

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const absolutePath = path.join(directory, entry.name);
  if (entry.isDirectory()) return walk(absolutePath);
  return [absolutePath];
});

if (!fs.existsSync(sourceDir)) {
  console.error(`源目录不存在：${sourceDir}`);
  process.exit(1);
}

(async () => {
  const files = walk(sourceDir);
  for (const file of files) {
    const key = path.relative(sourceDir, file).split(path.sep).join('/');
    await storageService.uploadBuffer(key, fs.readFileSync(file), '');
    console.log(`已迁移：${key}`);
  }
  console.log(`迁移完成，共 ${files.length} 个对象`);
})().catch((error) => {
  console.error('MinIO 迁移失败：', error);
  process.exitCode = 1;
});
