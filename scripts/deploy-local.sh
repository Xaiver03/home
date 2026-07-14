#!/usr/bin/env bash
set -euo pipefail

# 本地构建并上传部署。
# 使用前设置：DEPLOY_SSH_HOST、DEPLOY_SSH_USER、DEPLOY_SSH_PORT（可选）、
# DEPLOY_SSH_KEY（可选）、DEPLOY_REMOTE_DIR（可选，默认 /opt/home）。

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-/opt/home}"
SSH_PORT="${DEPLOY_SSH_PORT:-22}"
SSH_ARGS=(-p "$SSH_PORT" -o ConnectTimeout=15 -o ServerAliveInterval=15)

if [[ -z "${DEPLOY_SSH_HOST:-}" || -z "${DEPLOY_SSH_USER:-}" ]]; then
  echo "缺少 DEPLOY_SSH_HOST 或 DEPLOY_SSH_USER。" >&2
  exit 1
fi

if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
  SSH_ARGS+=(-i "$DEPLOY_SSH_KEY")
fi

cd "$ROOT_DIR"

echo "==> 构建 homepage"
pnpm --filter homepage build
echo "==> 构建 blog-admin"
pnpm --filter blog-admin build:pro
echo "==> 构建 blog-frontend"
pnpm --filter blog-frontend build:pro
echo "==> 检查后端测试"
pnpm --filter blog-api test

echo "==> 上传源码和本地构建产物"
rsync -az --delete \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.nuxt/' \
  --exclude='.output/' \
  --exclude='dist/' \
  --exclude='logs/' \
  --exclude='database*.db' \
  -e "ssh ${SSH_ARGS[*]}" \
  "$ROOT_DIR/" "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}:${REMOTE_DIR}/"

echo "==> 单独上传压缩后的构建产物"
tar czf - \
  -C "$ROOT_DIR/apps/homepage" dist \
  -C "$ROOT_DIR/apps/blog-admin" dist \
  -C "$ROOT_DIR/apps/blog-frontend" .output \
  | ssh "${SSH_ARGS[@]}" "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}" \
    "tar xzf - -C '$REMOTE_DIR'"

echo "==> 在服务器重启服务（跳过服务器构建）"
ssh "${SSH_ARGS[@]}" "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}" \
  "cd '$REMOTE_DIR' && bash deploy.sh --skip-build"

echo "本地上传部署完成。"
