# AGENTS.md —— 邓湘雷个人主页与博客 Monorepo

> 本文件面向 AI 编码助手。阅读前请假设你对该项目一无所知；本文件总结了项目的真实结构、技术栈、构建/测试/部署流程及安全约定。

## 0. 项目定位与边界

**本仓库为个人主页项目**（`home`，对应 `github.com:Xaiver03/home.git`），不是公司官网。

- 个人主页：`apps/homepage` 已恢复为个人起始页（「灯下灯」品牌、头像、社交链接、一言、天气、音乐等）。
- 公司官网：位于 `../x-c/`（对应 `github.com:Xaiver03/x-creative-team.git`），请勿在本仓库继续提交公司化改造。

## 1. 项目概述

这是一个基于 **pnpm workspace** 的 monorepo，项目名称为 `@xld/monorepo`，版本 `1.0.0`，定位为「邓湘雷的个人主页 + 博客系统」。仓库同时托管个人主页、博客系统、管理后台、后端 API 及音乐/WebSocket 辅助服务。

仓库顶层由三层组成：

- `apps/*`：可部署应用
- `services/*`：独立后台服务
- `packages/*`：内部共享包

```text
home/
├── apps/
│   ├── homepage/          # Vue 3 + Vite 团队主页（静态站点）
│   ├── blog-admin/        # Vue 3 + Vite + Ant Design Vue 博客管理后台
│   ├── blog-frontend/     # Nuxt 3 SSR 博客前台，挂载在 /blog/
│   └── blog-api/          # Express + Sequelize 博客后端 API
├── services/
│   ├── music-api/         # Hono 音乐代理服务（Meting API）
│   └── ws-gateway/        # 通用 WebSocket 实时消息网关
└── packages/
    ├── shared-utils/      # 共享工具函数（@xld/shared-utils）
    ├── shared-types/      # 共享 TypeScript 类型（@xld/shared-types）
    ├── shared-config/     # 共享 ESLint/Prettier 配置（@xld/shared-config）
    └── design-tokens/     # 共享设计 Token/主题（@xld/design-tokens）
```

## 2. 技术栈与运行时架构

### 2.1 各子项目技术栈

| 子项目 | 框架/库 | 构建工具 | 测试框架 | 进程管理 |
|--------|---------|----------|----------|----------|
| `homepage` | Vue 3 + Pinia + Element Plus + Swiper | Vite 4 | Vitest | 静态部署 / Nginx |
| `blog-admin` | Vue 3 + Vue Router + Vuex + Ant Design Vue | Vite 5 | `node --test` | 构建为 SPA，由 Express 托管 |
| `blog-frontend` | Nuxt 3 SSR + Pinia + Tailwind CSS + Ant Design Vue | Nuxt 3 | `node --test` | PM2（`ecosystem.config.cjs`） |
| `blog-api` | Express 4 + Sequelize 6 + MySQL/Redis/MinIO | 无需构建 | Jest | PM2（`ecosystem.config.js`） |
| `music-api` | Hono + Node.js（基于 Meting） | esbuild | Vitest 0.29 | PM2 |
| `ws-gateway` | Node.js + `ws` + jsonwebtoken | 无需构建 | 无 | PM2 |
| `shared-utils` | 原生 JS/ESM | 无需构建 | Vitest | — |
| `shared-types` | TypeScript 类型 | 无需构建 | 无 | — |
| `design-tokens` | ESM 主题变量 | 无需构建 | 无 | — |

### 2.2 运行端口

| 服务 | 开发端口 | 本地测试端口 | 生产端口 |
|------|----------|--------------|----------|
| homepage | 3015 | 80 | 由 Nginx 反向代理 |
| blog-frontend | 3004 | 3008 | 3001 |
| blog-admin | 8083 | — | 构建后托管在 blog-api `/admin` |
| blog-api | 8086 | 8086 | 8085 |
| music-api | 3005 | 3005 | 3000 |
| ws-gateway | 4010 | 4010 | 4010 |

### 2.3 关键运行时关系

- **homepage** 通过 Vite 代理将 `/api`、`/blog`、`/music`、`/mgmt` 转发到对应本地服务；生产环境由 Nginx 统一路由。
- **blog-frontend** 的 `baseURL` 固定为 `/blog/`，SEO、Sitemap、robots 均基于该子路径生成。
- **blog-admin** 构建产物复制到 `apps/blog-api/public/admin/`，由 Express 以 `/admin` 路径托管。
- **blog-api** 同时提供 REST API、静态资源托管（含 uploads 兼容路径）、管理后台 SPA fallback 和博客前台静态 fallback。
- **ws-gateway** 依赖 blog-api 的 `tokenSecretKey` 做 JWT 校验，生产通过 `BLOG_API_BASE_URL` 与 blog-api 通信。

## 3. 代码组织与模块划分

### 3.1 后端 API 分层（`apps/blog-api`）

```text
apps/blog-api/
├── bin/www              # HTTP 服务入口
├── app.js               # Express 应用配置、路由挂载
├── config/              # 按 NODE_ENV 加载的 JSON 配置
├── controller/          # 请求处理器（按业务拆分）
├── service/             # 业务逻辑层
├── models/              # Sequelize 数据模型
├── routes/              # Express 路由定义
├── middlewares/         # 认证、限流等中间件
├── db/                  # Redis / Mail 连接
├── utils/               # 通用工具函数
├── scripts/             # 数据导入、迁移等一次性脚本
├── migrations/          # Sequelize 迁移文件
└── tests/               # Jest 测试文件
```

### 3.2 前端应用分层

- `apps/homepage/src/`：按视图（`views/`）、组件（`components/`）、库（`lib/`）、API（`api/`）、Store（`store/`）组织。
- `apps/blog-admin/src/`：按页面（`views/`）、组件（`components/`）、路由（`router/`）、状态（`store/`）组织。
- `apps/blog-frontend/`：Nuxt 3 约定式目录；`composables/` 提供 `api.js`、`companyBrand.js` 等全局可组合函数；`server/` 存放 Nitro 服务端中间件与 Sitemap 工具。

### 3.3 共享包

- `@xld/shared-utils`：通用工具、日期处理、校验器，ESM 导出。
- `@xld/shared-types`：TypeScript 接口（`ApiResponse`、`PaginationParams`、`UserInfo` 等）。
- `@xld/design-tokens`：亮色/暗色主题 CSS 变量及 Ant Design Token 生成函数。
- `@xld/shared-config`：预留的共享 ESLint/Prettier 配置入口（当前文件可能不存在，以项目实际文件为准）。

## 4. 构建与测试命令

### 4.1 安装依赖

```bash
pnpm install
```

要求：`node >= 18.0.0`，`pnpm >= 8.0.0`（lockfile 版本对应 pnpm 8.15.0）。

### 4.2 开发启动

```bash
# 启动全部服务
pnpm dev

# 仅前端或仅后端
pnpm dev:frontend
pnpm dev:backend

# 单独启动
pnpm dev:homepage
pnpm dev:blog-admin
pnpm dev:blog-frontend
pnpm dev:blog-api
pnpm dev:music
pnpm dev:ws-gateway
```

### 4.3 构建

```bash
# 构建所有 apps + services
pnpm build

# 单独构建
pnpm build:homepage
pnpm build:blog-admin     # 注意：blog-admin 使用 build:pro
pnpm build:blog-frontend
```

`blog-api`、`ws-gateway`、`shared-*`、`design-tokens` 均无需构建。

### 4.4 测试

```bash
# 全部测试（homepage + shared-utils + blog-api）
pnpm test

# 单独测试
pnpm test:homepage
pnpm test:shared-utils
pnpm test:blog-api

# 覆盖率
pnpm test:coverage
```

测试策略：

- `homepage` 与 `shared-utils` 使用 **Vitest**，测试业务工具函数与内容归一化逻辑。
- `blog-api` 使用 **Jest**，对 controller/service 做单元测试，配合 `jest.mock` 隔离依赖。
- `blog-frontend` 与 `blog-admin` 使用 Node.js 原生测试运行器（`node --test tests/*.test.mjs`），当前测试覆盖较少。

### 4.5 代码质量

```bash
pnpm lint        # ESLint 自动修复
pnpm format      # Prettier 格式化
```

- ESLint 配置在根目录 `.eslintrc.js`，使用 Vue 3 recommended + ESLint recommended。
- Prettier 配置在根目录 `.prettierrc`：单引号、尾随逗号 `all`、120 字符行宽。

## 5. 配置与环境变量

### 5.1 环境文件

| 文件 | 用途 | 是否 gitignore |
|------|------|----------------|
| `.env.example` | 根目录模板，含站点信息、数据库、MinIO、音乐配置 | 否 |
| `.env.dev` / `.env.pro` / `.env.beta` | 各环境统一端口与 Nuxt 配置 | 是 |
| `apps/homepage/.env` | homepage 站点配置（从 `.env.example` 复制） | 是 |
| `apps/blog-admin/.env.dev` | 管理后台 API 地址 | 是 |
| `apps/blog-frontend/.env.dev` | Nuxt 公开运行时配置 | 是 |
| `apps/blog-api/config/dev.json` | blog-api 开发配置 | 是 |
| `apps/blog-api/config/pro.json` | blog-api 生产配置 | 是 |
| `apps/blog-api/config/local.js` | 本地自定义配置 | 是 |
| `apps/blog-api/config/default.js` | 默认兜底配置 | 否 |

### 5.2 blog-api 配置机制

blog-api 使用 `config` 包：按 `NODE_ENV` 读取 `config/{NODE_ENV}.json`，环境变量覆盖通过 `custom-environment-variables.json` 映射。开发环境默认使用 SQLite（`apps/blog-api/database.dev.db`），生产环境使用 MySQL。

### 5.3 关键环境变量说明

- `VITE_SITE_NAME` / `VITE_SITE_DES`：homepage 站点名称与描述。
- `NUXT_PUBLIC_API_URL`：blog-frontend 调用 blog-api 的地址。
- `NUXT_PUBLIC_BASE_URL`：博客前台站点地址，用于 SEO/Sitemap。
- `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD`：生产数据库连接。
- `MINIO_ENDPOINT` / `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` / `MINIO_BUCKET`：对象存储配置。
- `tokenSecretKey`（blog-api config）：JWT 签名密钥。
- `VITE_WEATHER_KEY`：高德地图天气 API Key。

更多细节参见 `docs/guides/env-variables.md`。

## 6. 认证与权限

- blog-api 使用 **JWT** 认证，密钥来自 `config.tokenSecretKey`。
- 公开接口匹配正则 `/.*/.*\/reception\/.*/`，无需 token；其余 `/api/*` 路径默认需要有效 JWT。
- 管理后台登录用户需邮箱在 `vipCustomerEmail` 列表中。
- ws-gateway 同样使用 `tokenSecretKey` 校验 WebSocket 连接的 token。

## 7. 数据库与迁移

blog-api 使用 **Sequelize** 作为 ORM，并通过 `sequelize-cli` 管理迁移：

```bash
# 执行迁移
pnpm --filter blog-api db:migrate

# 回滚最近一次迁移
pnpm --filter blog-api db:migrate:undo

# 生成迁移文件
pnpm --filter blog-api migration:generate --name <name>
```

模型变更必须通过迁移完成，禁止直接修改生产数据库结构。开发环境使用 SQLite，生产使用 MySQL（`timezone: +08:00`，连接池 `max: 20`）。

## 8. 部署流程

### 8.1 默认部署：本地构建后上传

```bash
DEPLOY_SSH_HOST=... \
DEPLOY_SSH_USER=... \
DEPLOY_SSH_PORT=... \
DEPLOY_SSH_KEY=... \
./scripts/deploy-local.sh
```

`scripts/deploy-local.sh` 会：

1. 本地构建 homepage、blog-admin、blog-frontend；
2. 运行 `pnpm --filter blog-api test`；
3. 将源码与构建产物打包，通过 SSH + tar 上传到服务器 `/opt/home`；
4. 在服务器执行 `deploy.sh --skip-build` 重启服务。

### 8.2 服务器端部署脚本

`scripts/deploy.sh`（部署于服务器 `/opt/home/deploy.sh`）执行以下步骤：

1. 拉取 `origin/dev` 最新代码（`git reset --hard origin/dev`）；
2. `pnpm install --frozen-lockfile`；
3. 构建 homepage、blog-admin、blog-frontend；
4. 将 blog-admin 产物复制到 `blog-api/public/admin/`；
5. 执行 `db:migrate`；
6. 使用 PM2 重启 blog-api、music-api、ws-gateway、blog-frontend；
7. `sudo nginx -t && sudo nginx -s reload`；
8. 健康检查各服务 HTTP 状态码。

### 8.3 CI/CD

- `.github/workflows/deploy.yml`：仅手动触发（`workflow_dispatch`），先运行 `pnpm test`，再 SSH 到服务器执行 `deploy.sh`。
- GitHub Actions 中的 SSH 部署仅作为备用；默认不依赖服务器 `git pull`。
- 本地默认部署完成后，必须验证线上页面状态码与关键交互。

### 8.4 Nginx 与 SSL

- Nginx 配置文件路径：`/etc/nginx/sites-enabled/xiangleideng.site`。
- 任何 Nginx 配置修改后使用 `sudo nginx -t` 和 `sudo nginx -s reload`。
- Let's Encrypt 证书位于 `/etc/letsencrypt`；普通用户直接读取会因权限不足产生误报，应通过 root 权限或 Nginx 状态判断。

## 9. 开发约定

### 9.1 提交规范

使用 **Conventional Commits**：`feat:`、`fix:`、`refactor:`、`docs:`、`chore:` 等。

- 每完成一个逻辑变更即验证、提交并推送到 `origin/dev`。
- 不要把完成的修改留在未提交状态。

### 9.2 代码风格

- JavaScript / Vue 单引号、2 空格缩进、尾随逗号。
- Vue 组件名可单单词（`vue/multi-word-component-names: off`）。
- 禁止在生产环境保留 `console.log`（构建时由 terser 清除 `console.log`）。
- 优先使用 `const` / `let`，禁止 `var`。

### 9.3 API 响应格式

blog-api 所有接口统一返回：

```json
{
  "code": 200,
  "msg": "",
  "data": {}
}
```

`code < 0` 表示失败。使用 `utils/postMessage()` 构造响应。

### 9.4 文件与路径约定

- blog-frontend 必须保持 `baseURL: '/blog/'`，所有站内链接以 `/blog/` 为前缀。
- homepage 的音乐播放器配置通过 `VITE_SONG_API` / `VITE_SONG_SERVER` / `VITE_SONG_TYPE` / `VITE_SONG_ID` 控制。
- 上传文件通过 MinIO 存储，对外保持 `/uploads/*` 兼容路径，实际由 `storageController.serveObject` 流式读取。

## 10. 安全注意事项

- **禁止**将密钥、SMTP 密码、数据库密码、JWT 密钥或 MinIO 凭证提交到版本库。
- 敏感配置文件（`.env.*`、`config/dev.json`、`config/pro.json`、`CREDENTIALS.md` 等）已加入 `.gitignore`。
- 生产环境必须配置独立的 MySQL 数据库与 MinIO bucket，禁止复用个人站数据库。
- JWT `tokenSecretKey` 在生产环境必须替换为强随机字符串。
- 用户上传的图片统一走 MinIO 或兼容 `/uploads` 路径，禁止直接暴露本地文件系统。
- 部署脚本 `deploy.sh` 使用 `git reset --hard origin/dev`，会丢弃服务器本地未提交修改，部署前确保无重要未提交文件。

## 11. 常见任务速查

```bash
# 本地完整启动
pnpm install
cp .env.example apps/homepage/.env
pnpm dev

# 添加 blog-api 迁移
pnpm --filter blog-api migration:generate --name add-x-to-y
pnpm --filter blog-api db:migrate

# 构建并本地验证
pnpm build
pnpm --filter blog-api test

# 部署到生产
DEPLOY_SSH_HOST=... DEPLOY_SSH_USER=... ./scripts/deploy-local.sh
```

## 12. 补充文档

- `docs/README.md`：文档中心入口。
- `docs/guides/env-variables.md`：完整环境变量说明。
- `docs/guides/DEV_COMMANDS.md`：开发命令速查。
- `docs/guides/deployment.md`：部署指南。
- `CLAUDE.md`：Claude Code 专用操作备忘（含工作流约束）。
