#!/bin/bash

# ================================================================
# 新博客系统数据库初始化脚本
# 用于创建MySQL数据库和用户
# ================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 数据库配置
DB_NAME="space_blog"
DB_USER="blog_user"
DB_PASSWORD="blog_pass_2025"

# MySQL连接测试
test_mysql_connection() {
    log_info "测试MySQL连接..."

    if ! command -v mysql &> /dev/null; then
        log_error "MySQL客户端未安装，请先安装MySQL"
        exit 1
    fi

    if ! mysqladmin ping &> /dev/null; then
        log_error "无法连接到MySQL服务器，请确保MySQL服务正在运行"
        exit 1
    fi

    log_success "MySQL连接正常"
}

# 创建数据库和用户
create_database() {
    log_info "创建数据库和用户..."

    # 提示输入root密码
    echo "请输入MySQL root密码："
    read -s MYSQL_ROOT_PASSWORD

    # 创建数据库
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" << EOF
-- 创建数据库
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';

-- 授权
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;

-- 显示创建结果
SHOW DATABASES LIKE '$DB_NAME';
SELECT User, Host FROM mysql.user WHERE User = '$DB_USER';
EOF

    if [[ $? -eq 0 ]]; then
        log_success "数据库和用户创建成功"
        log_info "数据库名: $DB_NAME"
        log_info "用户名: $DB_USER"
        log_info "密码: $DB_PASSWORD"
    else
        log_error "数据库创建失败"
        exit 1
    fi
}

# 更新配置文件
update_config() {
    log_info "更新后端配置文件..."

    CONFIG_FILE="/opt/home/blog/space-log-express/config/pro.json"

    if [[ -f "$CONFIG_FILE" ]]; then
        # 使用sed替换数据库密码
        sed -i "s/\"password\": \"your_mysql_password_here\"/\"password\": \"$DB_PASSWORD\"/" "$CONFIG_FILE"
        log_success "配置文件已更新: $CONFIG_FILE"
    else
        log_warning "配置文件不存在: $CONFIG_FILE"
    fi
}

# 创建数据库表结构
create_tables() {
    log_info "创建数据库表结构..."

    # 这里应该包含实际的表结构SQL
    # 由于没有schema文件，我们创建一些基本表
    mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOF'
-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL UNIQUE,
    `email` varchar(100) NOT NULL UNIQUE,
    `password` varchar(255) NOT NULL,
    `role` enum('admin','user') DEFAULT 'user',
    `avatar` varchar(255) DEFAULT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 分类表
CREATE TABLE IF NOT EXISTS `categories` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(50) NOT NULL,
    `slug` varchar(50) NOT NULL UNIQUE,
    `description` text,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 标签表
CREATE TABLE IF NOT EXISTS `tags` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(50) NOT NULL UNIQUE,
    `color` varchar(7) DEFAULT '#409EFF',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章表
CREATE TABLE IF NOT EXISTS `articles` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `title` varchar(200) NOT NULL,
    `slug` varchar(200) NOT NULL UNIQUE,
    `content` longtext NOT NULL,
    `excerpt` text,
    `cover_image` varchar(255),
    `category_id` int(11),
    `author_id` int(11) NOT NULL,
    `status` enum('draft','published','private') DEFAULT 'draft',
    `views` int(11) DEFAULT 0,
    `likes` int(11) DEFAULT 0,
    `is_top` tinyint(1) DEFAULT 0,
    `published_at` timestamp NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `category_id` (`category_id`),
    KEY `author_id` (`author_id`),
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
    FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 文章标签关联表
CREATE TABLE IF NOT EXISTS `article_tags` (
    `article_id` int(11) NOT NULL,
    `tag_id` int(11) NOT NULL,
    PRIMARY KEY (`article_id`, `tag_id`),
    FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 评论表
CREATE TABLE IF NOT EXISTS `comments` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `article_id` int(11) NOT NULL,
    `parent_id` int(11) DEFAULT NULL,
    `author_name` varchar(50) NOT NULL,
    `author_email` varchar(100) NOT NULL,
    `author_url` varchar(255),
    `content` text NOT NULL,
    `status` enum('pending','approved','rejected') DEFAULT 'pending',
    `ip_address` varchar(45),
    `user_agent` text,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `article_id` (`article_id`),
    KEY `parent_id` (`parent_id`),
    FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 友情链接表
CREATE TABLE IF NOT EXISTS `friend_links` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `url` varchar(255) NOT NULL,
    `description` text,
    `avatar` varchar(255),
    `status` enum('pending','approved','rejected') DEFAULT 'pending',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 系统配置表
CREATE TABLE IF NOT EXISTS `configurations` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `key` varchar(100) NOT NULL UNIQUE,
    `value` text,
    `description` varchar(255),
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认管理员用户
INSERT IGNORE INTO `users` (`username`, `email`, `password`, `role`) VALUES
('admin', 'light@xiangleideng.site', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- 插入默认分类
INSERT IGNORE INTO `categories` (`name`, `slug`, `description`) VALUES
('默认分类', 'default', '默认文章分类'),
('技术分享', 'tech', '技术相关文章'),
('生活随笔', 'life', '生活感悟文章');

-- 插入默认标签
INSERT IGNORE INTO `tags` (`name`, `color`) VALUES
('JavaScript', '#f7df1e'),
('Vue.js', '#4fc08d'),
('Node.js', '#339933'),
('生活', '#409EFF');

-- 插入系统配置
INSERT IGNORE INTO `configurations` (`key`, `value`, `description`) VALUES
('site_title', '邓湘雷の博客', '网站标题'),
('site_description', '一点浩然气，千里快哉风', '网站描述'),
('site_keywords', '邓湘雷,个人博客,技术分享', '网站关键词'),
('site_author', '邓湘雷', '网站作者'),
('site_url', 'https://xiangleideng.site', '网站地址');

EOF

    if [[ $? -eq 0 ]]; then
        log_success "数据库表结构创建成功"
    else
        log_warning "表结构创建可能有问题，请检查"
    fi
}

# 显示结果
show_result() {
    log_success "🎉 数据库初始化完成！"
    echo ""
    echo "📊 数据库信息："
    echo "   数据库名: $DB_NAME"
    echo "   用户名: $DB_USER"
    echo "   密码: $DB_PASSWORD"
    echo ""
    echo "👤 默认管理员账号："
    echo "   用户名: admin"
    echo "   邮箱: light@xiangleideng.site"
    echo "   密码: password (请登录后修改)"
    echo ""
    echo "🔧 后续步骤："
    echo "   1. 配置文件已自动更新"
    echo "   2. 运行部署脚本: bash /opt/home/deploy-new-blog.sh"
    echo "   3. 访问管理后台修改默认密码"
}

# 主函数
main() {
    log_info "开始初始化博客数据库..."

    test_mysql_connection
    create_database
    update_config
    create_tables
    show_result
}

# 运行主函数
main "$@"