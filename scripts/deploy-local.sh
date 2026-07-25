#!/usr/bin/env bash
set -euo pipefail

# 本地构建并上传部署。
# 使用前设置：DEPLOY_SSH_HOST、DEPLOY_SSH_USER、DEPLOY_SSH_PORT（可选）、
# DEPLOY_SSH_KEY（可选）。个人站部署目录固定为 /opt/home，不允许覆盖。

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_SITE_ID="personal-home"
EXPECTED_REMOTE_DIR="/opt/home"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-$EXPECTED_REMOTE_DIR}"
SSH_PORT="${DEPLOY_SSH_PORT:-22}"
SSH_ARGS=(
  -p "$SSH_PORT"
  -o ConnectTimeout=15
  -o ServerAliveInterval=15
  -o ServerAliveCountMax=10
)

if [[ -z "${DEPLOY_SSH_HOST:-}" || -z "${DEPLOY_SSH_USER:-}" ]]; then
  echo "缺少 DEPLOY_SSH_HOST 或 DEPLOY_SSH_USER。" >&2
  exit 1
fi

if [[ "$REMOTE_DIR" != "$EXPECTED_REMOTE_DIR" ]]; then
  echo "拒绝部署：个人站只能部署到 ${EXPECTED_REMOTE_DIR}，当前目标为 ${REMOTE_DIR}。" >&2
  exit 1
fi

if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then
  SSH_ARGS+=(-i "$DEPLOY_SSH_KEY")
fi

verify_remote_target() {
  ssh "${SSH_ARGS[@]}" "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}" \
    bash -s -- "$REMOTE_DIR" "$DEPLOY_SITE_ID" <<'REMOTE_CHECK'
set -euo pipefail

remote_dir="$1"
site_id="$2"

if [[ ! -d "${remote_dir}" ]]; then
  echo "拒绝部署：目标目录不存在：${remote_dir}" >&2
  exit 1
fi

resolved_dir="$(readlink -f "${remote_dir}")"
if [[ "$resolved_dir" != "/opt/home" ]]; then
  echo "拒绝部署：个人站目标解析为 ${resolved_dir}，而不是 /opt/home。" >&2
  exit 1
fi

marker="$remote_dir/.deploy-site-id"
if [[ -f "$marker" ]] && [[ "$(cat "$marker")" != "$site_id" ]]; then
  echo "拒绝部署：目标目录属于另一个站点（$(cat "$marker")）。" >&2
  exit 1
fi

printf '%s\n' "$site_id" > "$marker"
REMOTE_CHECK
}

cd "$ROOT_DIR"

echo "==> 校验个人站部署目标"
verify_remote_target

echo "==> 构建 homepage"
pnpm --filter homepage build
echo "==> 构建 blog-admin"
pnpm --filter blog-admin build:pro
echo "==> 构建 blog-frontend"
pnpm --filter blog-frontend build:pro
echo "==> 检查后端测试"
pnpm --filter blog-api test

echo "==> 单连接上传源码、构建产物并重启服务"
tar czf - \
  --exclude='./.git' \
  --exclude='./.env' \
  --exclude='./.env.*' \
  --exclude='*/.env' \
  --exclude='*/.env.*' \
  --exclude='._*' \
  --exclude='*/._*' \
  --exclude='./node_modules' \
  --exclude='*/node_modules' \
  --exclude='*/.nuxt' \
  --exclude='*/logs' \
  --exclude='database*.db' \
  --exclude='*/database*.db' \
  -C "$ROOT_DIR" . \
  | ssh "${SSH_ARGS[@]}" "${DEPLOY_SSH_USER}@${DEPLOY_SSH_HOST}" \
    "mkdir -p '$REMOTE_DIR' && tar xzf - -C '$REMOTE_DIR' && cd '$REMOTE_DIR' && bash deploy.sh --skip-build"

echo "本地上传部署完成。"
