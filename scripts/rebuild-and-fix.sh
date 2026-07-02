#!/bin/bash

# 项目构建和错误修复脚本
# 用途：清理、安装依赖、修复错误、测试启动

set -e  # 遇到错误立即退出

PROJECT_DIR="/Users/rocalight/Desktop/All in one Data/01_PROJECTS/home"
cd "$PROJECT_DIR"

echo "================================================"
echo "项目构建和错误修复脚本"
echo "================================================"

# 步骤 1: 清理
echo ""
echo "[1/6] 清理构建产物..."
pnpm clean || echo "清理失败，继续..."

# 步骤 2: 安装依赖
echo ""
echo "[2/6] 重新安装依赖..."
rm -rf node_modules
pnpm install

# 步骤 3: 检查依赖
echo ""
echo "[3/6] 检查依赖安装..."
if [ ! -d "node_modules" ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi
echo "✅ 依赖安装成功"

# 步骤 4: 检查环境变量配置
echo ""
echo "[4/6] 检查环境变量配置..."
if [ ! -f ".env.dev" ]; then
    echo "⚠️  .env.dev 不存在，从 .env.example 复制"
    cp .env.example .env.dev
fi
echo "✅ 环境变量配置正常"

# 步骤 5: 类型检查（如果有）
echo ""
echo "[5/6] 运行类型检查..."
pnpm typecheck || echo "⚠️  类型检查跳过或失败"

# 步骤 6: 测试启动（标准开发环境，不需要 sudo）
echo ""
echo "[6/6] 测试启动开发环境..."
echo "将在 5 秒后启动 pnpm dev（标准开发环境）"
echo "按 Ctrl+C 可以取消"
echo ""
echo "如果启动成功，你可以访问："
echo "  - 主页: http://localhost:3015"
echo "  - 博客: http://localhost:3015/blog"
echo ""
sleep 5

# 启动开发环境
pnpm dev

echo ""
echo "================================================"
echo "构建完成！"
echo "================================================"
