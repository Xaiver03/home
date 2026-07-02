# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 架构概览

这是一个 pnpm monorepo，包含多个应用：

- `apps/homepage` — Vue3 + Vite 个人主页（静态站）
- `apps/blog-admin` — Vue3 + Vite 博客管理后台
- `apps/blog-frontend` — Nuxt3 SSR 博客前台，挂载于 `/blog/` 子路径
- `apps/blog-api` — Express 博客后端 API，端口 8086（开发）/ 8085（生产）
- `services/music-api` — Hono 音乐代理 API（Meting），端口 3005

共享包位于 `packages/`（shared-utils、shared-config、shared-types），通过 workspace 协议引用：`@xld/shared-utils`。

### 关键设计点

**数据库策略**：blog-api 在开发环境（`NODE_ENV=dev`）使用 SQLite（`database.db`），生产环境使用 MySQL。切换逻辑在 `apps/blog-api/models/index.js`。

**API 响应格式**：所有接口统一返回 `{ code, msg, data }`，`code < 0` 表示失败。`utils.postMessage()` 是构造响应的标准方式（`apps/blog-api/utils/index.js`）。

**认证**：JWT，密钥来自 config `tokenSecretKey`。公开接口（无需 token）匹配 `/.*\/reception\/.*/` 正则，认证逻辑在 `apps/blog-api/middlewares/auth.js`。

**blog-frontend 环境变量**：通过 `NUXT_PUBLIC_ENV` 指定环境名称，nuxt.config.ts 据此加载 `../.env.{env}` 文件（相对于 monorepo 根目录）。

**blog-api 配置**：使用 `config` 包，读取 `apps/blog-api/config/{NODE_ENV}.json`，环境变量覆盖由 `custom-environment-variables.json` 映射。

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动全部服务（开发）
pnpm dev

# 仅前端 / 仅后端
pnpm dev:frontend
pnpm dev:backend

# 单独启动某服务
pnpm dev:homepage
pnpm dev:blog-admin
pnpm dev:blog-frontend
pnpm dev:blog-api
pnpm dev:music

# 构建
pnpm build                  # 所有 apps + services
pnpm build:blog-frontend    # 仅博客前台

# 测试
pnpm test                   # 全部（homepage + shared-utils + blog-api）
pnpm test:blog-api          # blog-api Jest 测试（tests/*.test.js）
pnpm test:homepage          # homepage Vitest 测试
pnpm test:shared-utils      # shared-utils Vitest 测试

# 代码格式化 / lint
pnpm format
pnpm lint

# 数据库迁移（blog-api）
pnpm --filter blog-api db:migrate
pnpm --filter blog-api db:migrate:undo
pnpm --filter blog-api migration:generate --name <migration-name>
```

## 端口分配

| 服务 | 开发 | 本地测试 | 生产 |
|------|------|---------|------|
| homepage | 3015 | 80 | — |
| blog-frontend | 3004 | 3008 | 3001 |
| blog-admin | 8083 | — | — |
| blog-api | 8086 | 8086 | 8085 |
| music-api | 3005 | 3005 | 3000 |

## 环境变量与配置

敏感信息集中在 `CREDENTIALS.md`（.gitignore 忽略）。

- **blog-api**：修改 `apps/blog-api/config/dev.json`（密码字段留空），或通过 `.env.dev` 设置环境变量（见 `custom-environment-variables.json` 的映射关系）
- **blog-frontend**：修改 `.env.dev` / `.env.local`（monorepo 根目录）
- 环境变量模板：`.env.example`

## 生产服务器

- **SSH**: `ssh finlaw`（124.223.13.226，ubuntu）
- **部署路径**: `/opt/home`
- **Web 服务器**: Nginx（`/etc/nginx/sites-enabled/xiangleideng.site`），修改后需 `systemctl reload nginx`
- **域名**: https://xiangleideng.site

## 注意事项

- 禁止使用 `sed` 命令修改文件，使用 Edit 工具代替
- blog-api 路由分为两类：`/api/*`（需 JWT）和 `/.*\/reception\/.*`（公开）
- blog-frontend 的 `baseURL` 配置为 `/blog/`，部署时需确保反向代理正确处理该子路径
- 修改 blog-api 的模型关系后，通过 Sequelize migration 而非直接修改数据库

## 知识图谱

```
/graphify query "认证如何实现的？"
open graphify-out/graph.html
```
