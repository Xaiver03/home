#!/bin/bash

# 数据库初始化脚本
# 用于创建 blog 系统所需的数据库和用户

MYSQL_BIN="/usr/local/mysql-8.2.0-macos13-arm64/bin/mysql"
DB_NAME="space_log_blog"
DB_USER="${DB_USER:-blog_user_r2}"
# 口令不落仓库：现取 ~/.config/tfa-credentials/spacep-mysql.password（0600，len=32）
DB_PASS="${DB_PASS:-$(cat "$HOME/.config/tfa-credentials/spacep-mysql.password" 2>/dev/null || true)}"
[ -n "$DB_PASS" ] || { echo "拿不到 DB_PASS：设 DB_PASS 或放好 ~/.config/tfa-credentials/spacep-mysql.password" >&2; exit 1; }

echo "🔧 开始初始化数据库..."
echo ""
echo "请输入 MySQL root 密码："

$MYSQL_BIN -u root -p <<EOF
-- 创建数据库
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';

-- 授权
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 显示结果
SELECT 'Database created successfully!' AS Status;
SHOW DATABASES LIKE '${DB_NAME}';
SELECT User, Host FROM mysql.user WHERE User='${DB_USER}';
EOF

echo ""
echo "✅ 数据库初始化完成！"
echo ""
echo "数据库信息："
echo "  - 数据库名: ${DB_NAME}"
echo "  - 用户名: ${DB_USER}"
echo "  - 主机: localhost"
echo ""
echo "⚠️  注意：你还需要导入数据库表结构（SQL 文件）"
