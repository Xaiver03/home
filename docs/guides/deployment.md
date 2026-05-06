# 部署指南

## 生产环境架构

```
https://xiangleideng.site/
├── /              → Nginx 静态文件 (/opt/home/dist)
├── /blog          → Nginx 代理 → Express:8085 (Nuxt3 博客前台)
├── /mgmt          → Nginx 代理 → Express:8085 (Vue3 管理后台)
├── /api/*         → Nginx 代理 → Express:8085 (博客 API)
├── /music         → Nginx 代理 → Node:3000 (音乐 API)
└── /static/*      → Nginx 代理 → Express:8085 (静态资源)
```

## 构建命令

```bash
# 构建所有子项目
pnpm build

# 单独构建
pnpm build:homepage
pnpm build:blog-admin
pnpm build:blog-frontend
```

## 一键部署

```bash
bash scripts/deploy.sh
```

## 服务管理

```bash
# 检查服务状态
ps aux | grep -E "node|npm" | grep -v grep
netstat -tulpn | grep -E ":(8085|3000|80|443)"

# 查看博客 API 日志
tail -f apps/blog-api/logs/app.log
```

## 符号链接说明

主页构建输出到 `/opt/home/dist`，通过符号链接 `/var/www/xiangleideng.site → /opt/home/dist` 自动生效，无需手动复制文件。

> 详细部署配置见 CLAUDE.md。
