#!/bin/bash
set -e

# ============================================================
# CD 部署脚本 - xiangleideng.site
# 用法: bash /opt/home/deploy.sh [--skip-build] [--only=app]
# ============================================================

REPO_DIR="/opt/home"
LOG_FILE="/var/log/deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$TIMESTAMP] $1${NC}" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[WARN] $1${NC}" | tee -a "$LOG_FILE"; }
error() { echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"; exit 1; }
step() { echo -e "${BLUE}===> $1${NC}" | tee -a "$LOG_FILE"; }

# 解析参数
SKIP_BUILD=false
ONLY_APP=""
for arg in "$@"; do
  case $arg in
    --skip-build) SKIP_BUILD=true ;;
    --only=*) ONLY_APP="${arg#*=}" ;;
  esac
done

echo "" | tee -a "$LOG_FILE"
log "========== 开始部署 =========="

# ---- Step 1: 拉取最新代码 ----
step "Step 1: 拉取最新代码"
cd "$REPO_DIR"
git fetch origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/dev)
if [ "$LOCAL" = "$REMOTE" ] && [ "$SKIP_BUILD" = false ]; then
  warn "代码无变化，跳过构建（使用 --skip-build=false 强制构建）"
  SKIP_BUILD=true
fi
git pull origin dev
log "代码已更新到: $(git rev-parse --short HEAD)"

if [ "$SKIP_BUILD" = true ]; then
  log "跳过构建步骤"
else
  # ---- Step 2: 安装依赖 ----
  step "Step 2: 安装依赖"
  export npm_config_registry=https://registry.npmmirror.com
  pnpm install --frozen-lockfile 2>&1 | tail -5

  # ---- Step 3: 构建各应用 ----
  step "Step 3: 构建应用"

  build_homepage() {
    log "构建 homepage..."
    cd "$REPO_DIR"
    pnpm --filter homepage build 2>&1 | tail -10
    log "homepage 构建完成"
  }

  build_blog_frontend() {
    log "构建 blog-frontend (Nuxt3)..."
    cd "$REPO_DIR"
    pnpm --filter blog-frontend build 2>&1 | tail -10
    log "blog-frontend 构建完成"
  }

  build_blog_admin() {
    log "构建 blog-admin..."
    cd "$REPO_DIR"
    pnpm --filter blog-admin build 2>&1 | tail -10
    # 复制到 blog-api public 目录
    mkdir -p "$REPO_DIR/apps/blog-api/public/mgmt"
    cp -r "$REPO_DIR/apps/blog-admin/dist/"* "$REPO_DIR/apps/blog-api/public/mgmt/"
    log "blog-admin 构建并复制完成"
  }

  case "$ONLY_APP" in
    homepage) build_homepage ;;
    blog-frontend) build_blog_frontend ;;
    blog-admin) build_blog_admin ;;
    blog-api) log "blog-api 无需构建" ;;
    "")
      build_homepage
      build_blog_frontend
      build_blog_admin
      ;;
    *) error "未知应用: $ONLY_APP" ;;
  esac
fi

# ---- Step 4: 重启服务 ----
step "Step 4: 重启后端服务"
pm2 restart spaceP_pro 2>&1 | tail -3
pm2 restart music-api 2>&1 | tail -3
sleep 2

# ---- Step 5: 健康检查 ----
step "Step 5: 健康检查"
check_service() {
  local name=$1 url=$2
  local code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$url" 2>/dev/null)
  if [[ "$code" =~ ^[23] ]]; then
    log "✓ $name: HTTP $code"
  else
    warn "✗ $name: HTTP $code (可能需要等待启动)"
  fi
}

check_service "blog-api"    "http://127.0.0.1:8086/api/article/reception/getArticleByTypeId/0/1/5"
check_service "music-api"   "http://127.0.0.1:3000"
check_service "homepage"    "http://127.0.0.1" || true

log "========== 部署完成 =========="
log "提交: $(git log -1 --pretty='%h %s')"
echo ""
