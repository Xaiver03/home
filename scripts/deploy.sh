#!/bin/bash
set -e

# ============================================================
# CD 部署脚本 - xiangleideng.site
# 由 GitHub Actions 通过 SSH 触发执行
# 服务器路径: /opt/home/scripts/deploy.sh
# ============================================================

REPO_DIR="/opt/home"
LOG_FILE="/var/log/deploy.log"
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

echo "" | tee -a "$LOG_FILE"
log "========== CI/CD 自动部署开始 =========="

# ---- Step 1: 拉取最新代码 ----
step "Step 1/6: 拉取最新代码"
cd "$REPO_DIR"
git fetch origin --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/dev)

if [ "$LOCAL" = "$REMOTE" ]; then
  warn "代码无变化 ($(git rev-parse --short HEAD))，跳过构建"
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
mkdir -p "$REPO_DIR/apps/blog-api/public/mgmt"
rm -rf "$REPO_DIR/apps/blog-api/public/mgmt/"*
cp -r "$REPO_DIR/apps/blog-admin/dist/"* "$REPO_DIR/apps/blog-api/public/mgmt/"
log "blog-admin 构建完成，已复制到 blog-api/public/mgmt/"

# 3c. blog-frontend (Nuxt3 SSR)
log "构建 blog-frontend (Nuxt3 SSR)..."
cd "$REPO_DIR"
pnpm --filter blog-frontend build 2>&1 | tail -10
log "blog-frontend 构建完成"

# ---- Step 4: 重启后端服务 ----
step "Step 4/6: 重启后端服务"

# 确保 PM2 进程存在，不存在则创建
if pm2 list | grep -q "spaceP_pro"; then
  pm2 restart spaceP_pro 2>&1 | tail -3
else
  cd "$REPO_DIR/apps/blog-api"
  pm2 start ecosystem.config.js --env pro 2>&1 | tail -5
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

# ---- Step 5: 重载 Caddy ----
step "Step 5/6: 重载 Caddy"
if /usr/bin/caddy reload --config /etc/caddy/Caddyfile --force 2>&1; then
  log "Caddy 重载成功"
else
  warn "Caddy 重载失败，请检查配置"
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
check_service "blog-frontend"  "http://127.0.0.1:3004"
check_service "homepage"       "http://127.0.0.1:8086/mgmt/"  # /mgmt 走 blog-api 静态托管

log "========== 部署完成 =========="
log "提交: $(git -C "$REPO_DIR" log -1 --pretty='%h %s')"
echo ""
