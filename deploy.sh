#!/bin/bash
set -e

# ============================================================
# CD 部署脚本 - xiangleideng.site
# 由 GitHub Actions 通过 SSH 触发执行
# 服务器路径: /opt/home/deploy.sh
# 用法: bash deploy.sh [--skip-build]
# ============================================================

REPO_DIR="/opt/home"
LOG_FILE="$REPO_DIR/deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()    { echo -e "${GREEN}[$TIMESTAMP] $1${NC}" | tee -a "$LOG_FILE"; }
warn()   { echo -e "${YELLOW}[WARN] $1${NC}" | tee -a "$LOG_FILE"; }
error()  { echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"; exit 1; }
step()   { echo -e "${BLUE}===> $1${NC}" | tee -a "$LOG_FILE"; }

# 解析参数
SKIP_BUILD=false
for arg in "$@"; do
  case $arg in
    --skip-build) SKIP_BUILD=true ;;
  esac
done

echo "" | tee -a "$LOG_FILE"
log "========== CI/CD 自动部署开始 =========="

if [ "$SKIP_BUILD" = true ]; then
  log "跳过 Git 同步和构建步骤 (--skip-build，使用本地上传的文件)"
  if [ -d "$REPO_DIR/apps/blog-admin/dist" ]; then
    mkdir -p "$REPO_DIR/apps/blog-api/public/admin"
    rm -rf "$REPO_DIR/apps/blog-api/public/admin/"*
    cp -r "$REPO_DIR/apps/blog-admin/dist/"* "$REPO_DIR/apps/blog-api/public/admin/"
    log "已同步本地 blog-admin 构建产物"
  fi
else
  # ---- Step 1: 拉取最新代码 ----
  step "Step 1/6: 拉取最新代码"
  cd "$REPO_DIR"
  git fetch origin --quiet
  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/dev)

  if [ "$LOCAL" = "$REMOTE" ]; then
    warn "代码无变化 ($(git rev-parse --short HEAD))，跳过部署"
    log "========== 无需部署 =========="
    exit 0
  fi

  # 强制对齐远程（丢弃本地修改，确保部署一致性）
  git reset --hard origin/dev 2>&1 | tail -3
  log "代码已更新: $(git rev-parse --short HEAD) — $(git log -1 --pretty='%s')"

  # ---- Step 2: 安装依赖 ----
  step "Step 2/6: 安装依赖"
  export npm_config_registry=https://registry.npmmirror.com
  pnpm install --frozen-lockfile 2>&1 | tail -10
  log "依赖安装完成"

  # ---- Step 3: 构建应用 ----
  step "Step 3/6: 构建所有应用"

  # 3a. homepage
  log "构建 homepage..."
  cd "$REPO_DIR"
  pnpm --filter homepage build 2>&1 | tail -5
  log "homepage 构建完成"

  # 3b. blog-admin (生产模式)
  log "构建 blog-admin (生产模式)..."
  cd "$REPO_DIR"
  pnpm --filter blog-admin build:pro 2>&1 | tail -5
  # 复制到 blog-api public 目录，让 Express 托管静态文件
  mkdir -p "$REPO_DIR/apps/blog-api/public/admin"
  rm -rf "$REPO_DIR/apps/blog-api/public/admin/"*
  cp -r "$REPO_DIR/apps/blog-admin/dist/"* "$REPO_DIR/apps/blog-api/public/admin/"
  log "blog-admin 构建完成，已复制到 blog-api/public/admin/"

  # 3c. blog-frontend (Nuxt3 SSR)
  log "构建 blog-frontend (Nuxt3 SSR)..."
  cd "$REPO_DIR"
  pnpm --filter blog-frontend build 2>&1 | tail -10
  log "blog-frontend 构建完成"

  # ---- Step 3.5: 数据库迁移 ----
  step "Step 3.5/6: 数据库迁移"
  cd "$REPO_DIR"
  if pnpm --filter blog-api db:migrate 2>&1 | tail -5; then
    log "数据库迁移完成"
  else
    warn "数据库迁移失败 (可能无新迁移或数据库未就绪)"
  fi
fi

# ---- Step 4: 重启后端服务 ----
step "Step 4/6: 重启后端服务"

# blog-api (spaceP_pro)
if pm2 list | grep -q "spaceP_pro"; then
  pm2 restart spaceP_pro 2>&1 | tail -3
else
  cd "$REPO_DIR/apps/blog-api"
  pm2 start ecosystem.config.js --env pro 2>&1 | tail -5
fi

# music-api (Meting 代理)
if pm2 list | grep -q "music-api"; then
  pm2 restart music-api 2>&1 | tail -3
else
  cd "$REPO_DIR/services/music-api"
  pm2 start ecosystem.config.js --env pro 2>&1 | tail -5 2>/dev/null || {
    pm2 start "node dist/index.js" \
      --name music-api \
      --cwd "$REPO_DIR/services/music-api" \
      2>&1 | tail -5
  }
fi

# ws-gateway (通用 WebSocket 网关)
export PORT=4010
export NODE_ENV=pro
export BLOG_API_BASE_URL=http://127.0.0.1:8086/api
export WS_PATH=/ws
if [ -z "$JWT_SECRET" ]; then
  JWT_SECRET=$(cd "$REPO_DIR/apps/blog-api" && NODE_ENV=pro node -e "const config=require('config'); process.stdout.write(config.get('tokenSecretKey') || '')")
  export JWT_SECRET
fi
if [ -z "$JWT_SECRET" ]; then
  warn "JWT_SECRET 未设置，ws-gateway 将无法启动"
fi
if pm2 list | grep -q "ws-gateway"; then
  pm2 restart ws-gateway --update-env 2>&1 | tail -3
else
  cd "$REPO_DIR/services/ws-gateway"
  pm2 start "node index.js" \
    --name ws-gateway \
    --cwd "$REPO_DIR/services/ws-gateway" \
    2>&1 | tail -5
fi

sleep 2

# blog-frontend Nuxt3 SSR
if pm2 list | grep -q "blog-frontend"; then
  pm2 restart blog-frontend 2>&1 | tail -3
else
  cd "$REPO_DIR/apps/blog-frontend"
  pm2 start ecosystem.config.cjs --env pro 2>&1 | tail -5 2>/dev/null || {
    pm2 start "PORT=3004 node .output/server/index.mjs" \
      --name blog-frontend \
      --cwd "$REPO_DIR/apps/blog-frontend" \
      2>&1 | tail -5
  }
fi

sleep 2

# ---- Step 5: 重载 Nginx ----
step "Step 5/6: 重载 Nginx"
if sudo /usr/sbin/nginx -t 2>&1 && sudo /usr/sbin/nginx -s reload 2>&1; then
  log "Nginx 重载成功"
else
  warn "Nginx 重载失败，请检查配置"
fi

# ---- Step 6: 健康检查 ----
step "Step 6/6: 健康检查"

check_service() {
  local name=$1 url=$2
  local code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url" 2>/dev/null || echo "000")
  if [[ "$code" =~ ^[23] ]]; then
    log "  ✓ $name: HTTP $code"
  else
    warn "  ✗ $name: HTTP $code (可能正在启动)"
  fi
}

check_service "blog-api"       "http://127.0.0.1:8086/api/article/reception/getArticleByTypeId/0/1/5"
check_service "blog-frontend"  "http://127.0.0.1:3004/blog/"
check_service "homepage"       "http://127.0.0.1:8086/admin/"  # /admin 走 blog-api 静态托管
check_service "music-api"      "http://127.0.0.1:4000"
check_service "ws-gateway"     "http://127.0.0.1:4010/health"
warn "若公网 WebSocket 不可用，请检查 Nginx /ws 是否已配置 Upgrade 反向代理"

log "========== 部署完成 =========="
log "提交: $(git -C "$REPO_DIR" log -1 --pretty='%h %s')"
echo ""
