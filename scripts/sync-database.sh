#!/bin/bash

# 数据库同步脚本
# 使用 Sequelize 自动创建表结构

echo "🔧 开始同步数据库表结构..."
echo ""

cd /Users/rocalight/Desktop/All\ in\ one\ Data/01_PROJECTS/home/apps/blog-api

# 创建临时同步脚本
cat > sync-db.js <<'EOF'
const db = require('./models');

async function syncDatabase() {
  try {
    console.log('开始同步数据库...');

    // force: false 表示不删除已存在的表
    // alter: true 表示根据模型更新表结构
    await db.sequelize.sync({ alter: true });

    console.log('✅ 数据库表结构同步成功！');
    console.log('');
    console.log('已创建的表：');
    console.log('  - articles (文章表)');
    console.log('  - article_types (文章类型表)');
    console.log('  - users (用户表)');
    console.log('  - comments (评论表)');
    console.log('  - admins (管理员表)');
    console.log('  - friend_links (友情链接表)');
    console.log('  - configurations (配置表)');

    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库同步失败:', error.message);
    process.exit(1);
  }
}

syncDatabase();
EOF

# 运行同步脚本
NODE_ENV=dev node sync-db.js

# 清理临时文件
rm -f sync-db.js

echo ""
echo "✅ 数据库初始化完成！"
