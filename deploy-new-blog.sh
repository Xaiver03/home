#!/bin/bash

# ================================================================
# 新博客系统部署脚本 (三层架构)
# 包含：Nuxt3前台 + Vue3管理后台 + Express后端
# 作者：Claude Code
# 创建时间：2025-10-20
# ================================================================

set -e  # 出错立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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

# 项目路径定义
PROJECT_ROOT="/opt/home"
BLOG_ROOT="$PROJECT_ROOT/blog"
FRONTEND_PATH="$BLOG_ROOT/space-log-nuxt3/app"
ADMIN_PATH="$BLOG_ROOT/admin"
BACKEND_PATH="$BLOG_ROOT/space-log-express"

# 检查目录是否存在
check_directories() {
    log_info "检查项目目录结构..."

    local dirs=("$FRONTEND_PATH" "$ADMIN_PATH" "$BACKEND_PATH")
    local dir_names=("前台(Nuxt3)" "管理后台(Vue3)" "后端(Express)")

    for i in "${!dirs[@]}"; do
        if [[ -d "${dirs[$i]}" ]]; then
            log_success "${dir_names[$i]} 目录存在: ${dirs[$i]}"
        else
            log_error "${dir_names[$i]} 目录不存在: ${dirs[$i]}"
            exit 1
        fi
    done
}

# 安装依赖
install_dependencies() {
    log_info "开始安装各组件依赖..."

    # 安装前台依赖 (Nuxt3)
    log_info "安装前台依赖 (Nuxt3)..."
    cd "$FRONTEND_PATH"
    if [[ -f "package.json" ]]; then
        if command -v pnpm &> /dev/null; then
            pnpm install
        else
            npm install
        fi
        log_success "前台依赖安装完成"
    else
        log_error "前台目录中未找到package.json"
        exit 1
    fi

    # 安装管理后台依赖 (Vue3)
    log_info "安装管理后台依赖 (Vue3)..."
    cd "$ADMIN_PATH"
    if [[ -f "package.json" ]]; then
        if command -v yarn &> /dev/null; then
            yarn install
        else
            npm install
        fi
        log_success "管理后台依赖安装完成"
    else
        log_error "管理后台目录中未找到package.json"
        exit 1
    fi

    # 安装后端依赖 (Express)
    log_info "安装后端依赖 (Express)..."
    cd "$BACKEND_PATH"
    if [[ -f "package.json" ]]; then
        npm install
        log_success "后端依赖安装完成"
    else
        log_error "后端目录中未找到package.json"
        exit 1
    fi
}

# 构建前台 (Nuxt3)
build_frontend() {
    log_info "构建前台应用 (Nuxt3)..."
    cd "$FRONTEND_PATH"

    # 检查环境配置
    if [[ ! -f ".env.pro" ]]; then
        log_warning "未找到 .env.pro 文件，将创建示例配置"
        create_frontend_env
    fi

    # 构建
    export NUXT_PUBLIC_ENV=pro
    if command -v pnpm &> /dev/null; then
        pnpm run build
    else
        npm run build
    fi

    log_success "前台构建完成"
}

# 构建管理后台 (Vue3)
build_admin() {
    log_info "构建管理后台 (Vue3)..."
    cd "$ADMIN_PATH"

    # 检查环境配置
    if [[ ! -f ".env.pro" ]]; then
        log_warning "未找到 .env.pro 文件，将创建示例配置"
        create_admin_env
    fi

    # 构建
    if command -v yarn &> /dev/null; then
        yarn build
    else
        npm run build
    fi

    log_success "管理后台构建完成"
}

# 创建前台环境配置
create_frontend_env() {
    log_info "创建前台环境配置..."
    cd "$FRONTEND_PATH"

    cat > .env.pro << EOF
# Nuxt3 前台生产环境配置
NUXT_PUBLIC_API_URL=https://xiangleideng.site/api
NUXT_PUBLIC_OSS_URL=https://kodo.openpenpal.com
NUXT_PUBLIC_BASE_URL=https://xiangleideng.site
NUXT_PUBLIC_ENV=pro
NUXT_PORT=3000
EOF

    # 复制到其他环境
    cp .env.pro .env.dev
    cp .env.pro .env.beta

    log_success "前台环境配置创建完成"
}

# 创建管理后台环境配置
create_admin_env() {
    log_info "创建管理后台环境配置..."
    cd "$ADMIN_PATH"

    cat > .env.pro << EOF
# Vue3 管理后台生产环境配置
NODE_ENV=pro
VUE_APP_PORT=8080
VUE_APP_BASE_URL=https://xiangleideng.site/api
VUE_APP_OSS_IMAGE_BASE_URL=https://kodo.openpenpal.com
VUE_APP_OSS_BASE_DIR=/blog
EOF

    # 复制到其他环境
    cp .env.pro .env.dev
    cp .env.pro .env.beta

    log_success "管理后台环境配置创建完成"
}

# 创建后端配置
create_backend_config() {
    log_info "创建后端配置..."
    cd "$BACKEND_PATH/config"

    cat > pro.json << EOF
{
  "port": 8085,
  "db": {
    "type": "sqlite",
    "mysql": "blog_user:C3AnRPL8HHGNbd33reAV@tcp(127.0.0.1:3306)/space_blog?charset=utf8mb4&parseTime=true&loc=Local",
    "sqlite": "file:blog.db"
  },
  "qiniu": {
    "access_key": "P8w00uvjzM1hFjXa6inOG52T_7IVYolhMfy3dVst",
    "secret_key": "LluHUa84A_MF-P6-BAwlOGOgAtMInk-K-vcgDwM8",
    "bucket": "xiangleideng",
    "domain": "kodo.openpenpal.com",
    "zone": "Zone_z2",
    "baseDir": "/blog"
  },
  "mail": {
    "smtp_host": "gz-smtp.qcloudmail.com",
    "smtp_port": 465,
    "smtp_user": "light@xiangleideng.site",
    "smtp_password": "Aiaih768aUShsinxSAu",
    "from_email": "light@xiangleideng.site",
    "from_name": "邓湘雷の博客"
  },
  "comment": {
    "entityType": ["Article", "Message"],
    "adminCustomerEmail": ["light@xiangleideng.site"]
  },
  "tokenSecretKey": "xld_blog_jwt_secret_2025_please_change_this",
  "vipCustomerEmail": ["light@xiangleideng.site"],
  "author": {
    "name": "邓湘雷",
    "website": "https://xiangleideng.site"
  }
}
EOF

    # 复制到其他环境
    cp pro.json dev.json
    cp pro.json beta.json
    cp pro.json default.json

    log_success "后端配置创建完成"
}

# 停止现有服务
stop_services() {
    log_info "停止现有服务..."

    # 停止 Express 后端服务
    pkill -f "node.*space-log-express" || true
    pkill -f "blog-server" || true

    # 停止 Nuxt 前台服务 (如果在开发模式运行)
    pkill -f "nuxt.*3000" || true

    log_success "现有服务已停止"
}

# 启动后端服务
start_backend() {
    log_info "启动后端服务 (Express)..."
    cd "$BACKEND_PATH"

    # 检查配置文件
    if [[ ! -f "config/pro.json" ]]; then
        log_warning "未找到后端配置文件，将创建示例配置"
        create_backend_config
        log_warning "请编辑 $BACKEND_PATH/config/pro.json 配置文件后重新运行"
        return 1
    fi

    # 设置环境变量
    export NODE_ENV=pro

    # 启动服务 (使用PM2管理进程，如果可用)
    if command -v pm2 &> /dev/null; then
        # 停止现有PM2进程
        pm2 stop space-blog-api || true
        pm2 delete space-blog-api || true

        # 启动新进程
        pm2 start ecosystem.config.js --name space-blog-api
        log_success "后端服务已通过PM2启动"
    else
        # 使用nohup启动
        nohup npm start > ../space-blog-api.log 2>&1 &
        log_success "后端服务已启动 (PID: $!)"
    fi
}

# 启动前台服务 (生产模式)
start_frontend() {
    log_info "启动前台服务 (Nuxt3)..."
    cd "$FRONTEND_PATH"

    # 设置环境变量
    export NUXT_PUBLIC_ENV=pro
    export NODE_ENV=production

    # 启动服务
    if command -v pm2 &> /dev/null; then
        # 停止现有PM2进程
        pm2 stop space-blog-frontend || true
        pm2 delete space-blog-frontend || true

        # 启动新进程
        pm2 start ecosystem.config.cjs --name space-blog-frontend
        log_success "前台服务已通过PM2启动"
    else
        # 使用nohup启动
        nohup npm run preview > ../space-blog-frontend.log 2>&1 &
        log_success "前台服务已启动 (PID: $!)"
    fi
}

# 配置Nginx
configure_nginx() {
    log_info "配置Nginx路由..."

    # 检查是否已存在配置
    if grep -q "space-log" /etc/nginx/sites-available/default 2>/dev/null; then
        log_warning "Nginx配置中已存在博客相关配置，跳过"
        return 0
    fi

    log_info "创建Nginx配置备份..."
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S) || true

    cat >> /etc/nginx/sites-available/default << 'EOF'

        # 新博客系统路由配置
        # 前台 - Nuxt3 (SSR)
        location /blog {
            proxy_pass http://localhost:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;
        }

        # 管理后台 - Vue3 SPA
        location /mgmt {
            proxy_pass http://localhost:8085/mgmt;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API接口 - Express
        location /api/ {
            proxy_pass http://localhost:8085/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 静态资源
        location /static/ {
            proxy_pass http://localhost:8085/static/;
            proxy_set_header Host $host;
        }
EOF

    # 测试并重新加载Nginx
    nginx -t && systemctl reload nginx
    log_success "Nginx配置完成"
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."

    # 检查端口占用
    local ports=(3000 8085)
    local services=("前台(Nuxt3)" "后端(Express)")

    for i in "${!ports[@]}"; do
        if netstat -tulpn | grep -q ":${ports[$i]} "; then
            log_success "${services[$i]} 服务运行中 (端口: ${ports[$i]})"
        else
            log_warning "${services[$i]} 服务可能未启动 (端口: ${ports[$i]})"
        fi
    done

    # 测试API端点
    sleep 3
    log_info "测试API端点..."

    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8085/ | grep -q "200\|404"; then
        log_success "后端API服务响应正常"
    else
        log_warning "后端API服务可能未正常启动"
    fi
}

# 显示部署结果
show_result() {
    log_success "🎉 新博客系统部署完成！"
    echo ""
    echo "📍 访问地址："
    echo "   前台博客: https://xiangleideng.site/blog"
    echo "   管理后台: https://xiangleideng.site/mgmt"
    echo "   API接口:  https://xiangleideng.site/api/"
    echo ""
    echo "🔧 服务管理："
    echo "   查看PM2进程: pm2 list"
    echo "   查看日志: pm2 logs space-blog-api"
    echo "   重启服务: pm2 restart space-blog-api"
    echo ""
    echo "⚠️  重要提醒："
    echo "   1. 请编辑后端配置文件: $BACKEND_PATH/config/pro.json"
    echo "   2. 使用MySQL数据库，确保数据库连接信息正确"
    echo "   3. 七牛云存储已配置，如需修改请更新qiniu部分"
    echo "   4. 腾讯云邮件服务已配置，如需修改请更新mail部分"
    echo "   5. 建议修改JWT密钥以提高安全性"
    echo ""
}

# 主函数
main() {
    log_info "开始部署新博客系统 (三层架构)..."
    echo ""

    # 检查是否为root用户
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        exit 1
    fi

    # 执行部署步骤
    check_directories
    install_dependencies

    # 创建配置文件
    create_frontend_env
    create_admin_env
    create_backend_config

    # 构建应用
    build_frontend
    build_admin

    # 停止现有服务
    stop_services

    # 启动新服务
    start_backend
    start_frontend

    # 配置Nginx
    configure_nginx

    # 检查服务状态
    check_services

    # 显示结果
    show_result
}

# 运行主函数
main "$@"