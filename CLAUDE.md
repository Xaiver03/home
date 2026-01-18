# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview / 项目概述

This is a Vue 3-based personal homepage/portfolio website (originally "無名の主页" / The Unknown's Homepage, now customized as "邓湘雷の主页"). It's a responsive single-page application featuring music playback, weather information, social links, and customizable settings with PWA capabilities.

一个基于 Vue 3 的个人主页/作品集网站，具有响应式设计、音乐播放、天气信息、社交链接和可自定义设置的 PWA 功能。

**Tech Stack / 技术栈:**
- **Homepage:** Vue 3 + Vite + Pinia + Element Plus + SCSS
- **Blog System:** Express.js + Node.js + MySQL + Redis + Nuxt3 + Vue 3 + Ant Design Vue

**Full Technology Stack:**

**Homepage / 主页:**
- [Vue 3](https://cn.vuejs.org/) - Progressive JavaScript framework
- [Vite](https://vitejs.cn/vite3-cn/) - Next generation frontend tooling
- [Pinia](https://pinia.vuejs.org/zh/) - Vue Store
- [Element Plus](https://element-plus.org/) - Vue 3 component library
- [IconPark](https://iconpark.oceanengine.com/official) - Icon library
- [xicons](https://xicons.org/) - SVG icon integrations
- [Aplayer](https://aplayer.js.org/) - Music player

**Blog System / 博客系统:**
- [Express.js](https://expressjs.com/) - Node.js web framework / Node.js Web 框架
- [Node.js](https://nodejs.org/) - JavaScript runtime / JavaScript 运行环境
- [MySQL](https://www.mysql.com/) - Relational database / 关系数据库
- [Redis](https://redis.io/) - In-memory cache and session store / 内存缓存和会话存储
- [Nuxt 3](https://nuxt.com/) - Vue.js SSR framework for frontend / 前台 SSR 框架
- [Vue 3](https://cn.vuejs.org/) - Admin interface framework / 管理界面框架
- [Ant Design Vue](https://antdv.com/) - Vue component library / Vue 组件库
- [Nodemailer](https://nodemailer.com/) - Email sending service / 邮件发送服务

### Features / 功能列表

- [x] 载入动画 (Loading animation)
- [x] 站点简介 (Site introduction)
- [x] Hitokoto 一言 (Japanese quotes)
- [x] 日期及时间 (Date and time)
- [x] 实时天气 (Real-time weather)
- [x] 时光进度条 (Time progress bar)
- [x] 音乐播放器 (Music player)
- [x] 完整博客系统 (Complete blog system with admin interface)
- [x] 移动端适配 (Mobile responsive)
- [x] PWA 支持 (PWA support)

## Deployment Architecture / 部署架构

### Symbolic Links / 符号链接配置

**IMPORTANT:** The project uses symbolic links for deployment:
**重要：** 项目使用符号链接进行部署：

```bash
# Main website deployment link / 主站点部署链接
/var/www/xiangleideng.site -> /opt/home/dist

# This means when you run `pnpm build`, files go to /opt/home/dist
# and are automatically served via the symbolic link
# 这意味着运行 `pnpm build` 时，文件会输出到 /opt/home/dist
# 并通过符号链接自动提供服务
```

**Deployment Workflow / 部署工作流：**
```bash
# Step 1: Build the project / 步骤1：构建项目
cd /opt/home
pnpm build  # Outputs to /opt/home/dist

# Step 2: Files are automatically served / 步骤2：文件自动生效
# No need to copy files! The symbolic link handles everything.
# 无需复制文件！符号链接会处理一切。

# Step 3: Verify deployment / 步骤3：验证部署
ls -la /var/www/xiangleideng.site  # Should show symlink
ls -la /opt/home/dist              # Should show built files
```

**DO NOT:**
- ❌ Do not run `cp -r dist/* /var/www/xiangleideng.site/` - This will fail because they are the same location!
  - ❌ 不要运行 `cp -r dist/* /var/www/xiangleideng.site/` - 这会失败，因为它们是同一个位置！
- ❌ Do not delete `/var/www/xiangleideng.site` - It's a symbolic link, not a directory!
  - ❌ 不要删除 `/var/www/xiangleideng.site` - 它是符号链接，不是目录！


## Essential Development Commands / 基本开发命令

### Initial Setup / 初始化设置
```bash
# Install pnpm globally (required package manager)
# 全局安装 pnpm（必需的包管理器）
npm install -g pnpm

# Install dependencies / 安装依赖
pnpm install

# Copy environment template and configure
# 复制环境变量模板并配置
cp .env.example .env
# Edit .env file with your API keys and site information
# 编辑 .env 文件，填入你的 API 密钥和站点信息
```

### Development / 开发
```bash
# Start development server (runs on port 3000)
# 启动开发服务器（运行在 3000 端口）
pnpm dev

# Preview production build locally
# 本地预览生产构建
pnpm preview
```

### Build & Production / 构建与生产
```bash
# Build for production (outputs to /dist)
# 生产构建（输出到 /dist 目录）
pnpm build

# Format code with Prettier
# 使用 Prettier 格式化代码
pnpm format

# Lint and fix Vue/JS files
# 检查并修复 Vue/JS 文件
pnpm lint
```

### Docker Deployment / Docker 部署
```bash
# Build Docker image / 构建 Docker 镜像
docker build -t home .

# Run container on port 12445 / 在 12445 端口运行容器
docker run -p 12445:12445 -d home
```

## Architecture & Code Structure / 架构与代码结构

### Component Organization / 组件组织
- **`src/main.js`** - Application entry point with Vue 3 setup, Pinia store, PWA configuration
  - 应用程序入口，包含 Vue 3 设置、Pinia 状态管理、PWA 配置
- **`src/App.vue`** - Root component managing layout, responsive design, and component orchestration
  - 根组件，管理布局、响应式设计和组件编排
- **`src/store/index.js`** - Centralized Pinia store with 20+ reactive state properties and localStorage persistence
  - 集中式 Pinia 状态管理，包含 20+ 个响应式状态属性和 localStorage 持久化

### Key Directories / 关键目录
```
src/
├── api/           # External API integrations (music, weather, hitokoto)
│                 # 外部 API 集成（音乐、天气、一言）
├── assets/        # JSON configuration files (siteLinks.json, socialLinks.json)
│                 # JSON 配置文件（网站链接、社交链接）
├── components/    # Reusable Vue components / 可复用的 Vue 组件
├── views/         # Layout containers (Main/Left.vue, Main/Right.vue, etc.)
│                 # 布局容器
├── store/         # Pinia state management / Pinia 状态管理
├── style/         # Global SCSS variables and mixins / 全局 SCSS 变量和混合
└── utils/         # Utility functions (cursor effects, debounce, time helpers)
                  # 工具函数（光标效果、防抖、时间助手）
```

### State Management (Pinia) / 状态管理
The main store (`src/store/index.js`) manages:
主状态存储管理以下内容：

- UI state: loading, mobile layout, background visibility, modal states
  - UI 状态：加载、移动端布局、背景可见性、模态框状态
- Music player: volume, state, track info, lyrics, playback settings
  - 音乐播放器：音量、状态、曲目信息、歌词、播放设置
- User preferences: persisted to localStorage automatically
  - 用户偏好：自动持久化到 localStorage
- Window/responsive data: screen width, breakpoint handling
  - 窗口/响应式数据：屏幕宽度、断点处理

### Responsive Design / 响应式设计
- **Desktop (721px+):** Two-column layout with left sidebar and main content
  - 桌面端：左侧边栏和主内容的两栏布局
- **Mobile (<721px):** Single column with collapsible menu
  - 移动端：单栏布局，带有可折叠菜单
- **Breakpoints:** 1380px, 1280px, 992px, 720px, 391px
  - 断点：1380px, 1280px, 992px, 720px, 391px
- **SCSS Mixins:** Use global mixins from `src/style/global.scss` for consistent responsive patterns
  - SCSS 混合：使用 `src/style/global.scss` 中的全局混合以获得一致的响应式模式

## Configuration & Customization / 配置与自定义

### Environment Variables (.env) / 环境变量配置

**Important:** All configuration is managed through the `/opt/home/.env` file. Copy from `.env.example` and customize.

**重要：** 所有配置都通过 `/opt/home/.env` 文件管理。从 `.env.example` 复制并自定义。

#### Site Metadata / 站点元数据
```bash
# Site name displayed in browser and PWA
# 浏览器和 PWA 中显示的站点名称
VITE_SITE_NAME="邓湘雷の主页"

# Author name / 作者名称
VITE_SITE_AUTHOR="Xaiver/灯下灯"

# SEO keywords / SEO 关键词
VITE_SITE_KEYWORDS="邓湘雷,个人主页"

# Site description / 站点描述
VITE_SITE_DES="一点浩然气，千里快哉风"

# Site URL (without https://) / 站点 URL（不含 https://）
VITE_SITE_URL="xiangleideng.site"

# Site logos / 站点图标
VITE_SITE_LOGO="/images/icon/favicon.ico"
VITE_SITE_MAIN_LOGO="/images/icon/logo.png"
VITE_SITE_APPLE_LOGO="/images/logo/apple-touch-icon.png"
```

#### Description Text / 简介文本
```bash
# Main greeting / 主问候语
VITE_DESC_HELLO="Hello World !"

# Personal introduction / 个人简介
VITE_DESC_TEXT="一个零零后，爱读点闲书写点小破文，喜欢读书、旅行，做点创业"

# Alternative greeting (Easter egg) / 备用问候语（彩蛋）
VITE_DESC_HELLO_OTHER="Oops !"

# Alternative text / 备用文本
VITE_DESC_TEXT_OTHER="哎呀，这都被你发现了（ 再点击一次可关闭 ）"
```

#### Weather API / 天气 API
```bash
# Amap (Gaode Maps) API key for weather service
# 高德地图 API 密钥（用于天气服务）
# Get your key from: https://console.amap.com/dev/index
# Free tier: 5000 requests/day
# 免费额度：每天 5000 次请求
VITE_WEATHER_KEY="cd5b9380bb4544201fb884a67418a7b8"

# Note: If empty, will fallback to backup API
# 注意：如果为空，将使用备用 API（教书先生 API）
# Backup: https://api.oioweb.cn/doc/weather/GetWeather
```

**To get Weather API key / 获取天气 API 密钥:**
1. Visit [Amap Developer Console](https://console.amap.com/dev/index)
   - 访问高德开放平台控制台
2. Create a **Web Service** type Key (NOT Web JS API)
   - 创建"Web 服务"类型的 Key（不是"Web 端 JS API"）
3. Copy the key to `VITE_WEATHER_KEY`
   - 复制密钥到 `VITE_WEATHER_KEY`

#### Site Timing / 建站时间
```bash
# Site start date for time capsule feature
# 建站日期（用于时光胶囊功能）
# Format: YYYY-MM-DD or just YYYY
# 格式：YYYY-MM-DD 或仅 YYYY
# Leave empty to disable / 留空则禁用
VITE_SITE_START="2025-10-18"
```

#### ICP Filing / ICP 备案
```bash
# ICP filing number (China only)
# ICP 备案号（仅中国大陆）
# Leave empty if not applicable / 如不需要则留空
VITE_SITE_ICP="京ICP备2022018134号-1"
```

#### Music Player Configuration / 音乐播放器配置

**Current Configuration (QQ Music / Tencent) / 当前配置（QQ 音乐）:**
```bash
# Self-hosted Meting API endpoint
# 自建的 Meting API 端点
# Deployed at: /opt/home/music/Meting-API
# 部署位置：/opt/home/music/Meting-API
VITE_SONG_API="https://xiangleideng.site/music"

# Music platform: netease (NetEase Cloud) or tencent (QQ Music)
# 音乐平台：netease（网易云音乐）或 tencent（QQ 音乐）
VITE_SONG_SERVER="tencent"

# Playback type / 播放类型
# Options: song, playlist, album, search, artist
# 选项：song（歌曲）、playlist（播放列表）、album（专辑）、search（搜索）、artist（艺术家）
VITE_SONG_TYPE="playlist"

# Playlist/Song ID / 播放列表/歌曲 ID
# For QQ Music playlists, recommend ≤50 songs for performance
# QQ 音乐播放列表建议不超过 50 首歌曲以保证性能
# Leave empty to disable music player / 留空则禁用音乐播放器
VITE_SONG_ID="9597130897"
```

**Music Player Setup / 音乐播放器设置:**

**Option 1: Self-hosted Meting API (Recommended) / 选项 1：自建 Meting API（推荐）**
```bash
# Deploy your own Meting API service
# 部署自己的 Meting API 服务
# See: https://github.com/xizeyoupan/Meting-API

# Example deployment location:
# 部署示例位置：
# /opt/home/music/Meting-API

# Start service:
# 启动服务：
cd /opt/home/music/Meting-API
npm run start:node  # Runs on localhost:3000

# Configure nginx reverse proxy:
# 配置 nginx 反向代理：
# /music -> http://localhost:3000 (Music API)
# /api -> http://localhost:8085 (Blog API)
```

**Option 2: Public API (May have rate limits) / 选项 2：公共 API（可能有速率限制）**
```bash
VITE_SONG_API="https://api.wuenci.com/meting/api/"
# or / 或
VITE_SONG_API="https://api-meting.imsyy.top"
```

**Music Player Architecture / 音乐播放器架构:**
- **Frontend Components:**
  - `src/components/Music.vue` - Main music player UI
  - `src/components/Player.vue` - Playback controls
  - `src/components/Hitokoto.vue` - Music panel trigger (hover to show)
- **API Integration:** `src/api/index.js`
- **State Control:** `store.musicIsOk` must be `true` for music button to appear
  - 状态控制：`store.musicIsOk` 必须为 `true` 才会显示音乐按钮
- **Conditional Rendering:** `<Music v-if="playerHasId" />` requires `VITE_SONG_ID` to have a value
  - 条件渲染：需要 `VITE_SONG_ID` 有值

### Blog Integration / 博客集成

This project includes a fully integrated blog system powered by Express.js + Nuxt3 + Vue, providing both a public blog frontend and an admin management interface.

本项目包含一个由 Express.js + Nuxt3 + Vue 驱动的完整博客系统，提供公共博客前台和管理后台界面。

**Blog System Architecture / 博客系统架构:**

```
Blog System Components / 博客系统组件:
┌─────────────────────────────────────────────────────────────┐
│                   Integrated Blog System                    │
│                      集成博客系统                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 Blog Frontend    ⚙️ Admin Interface    🔌 REST API     │
│     博客前台              管理后台              API接口      │
│                                                             │
│  Nuxt 3 SSR          Vue 3 + Ant Design    Express.js      │
│  Nuxt 3 服务端渲染     Vue 3 + Ant Design    Express.js     │
│                                                             │
│  📍 /blog            📍 /mgmt               📍 /api/*       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           🗄️ MySQL Database + 📦 Redis Cache              │
│               MySQL 数据库 + Redis 缓存                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Current System Status / 当前系统状态:**

**✅ Working Features / 正常工作的功能:**
- Blog Frontend (Nuxt3): ✅ 运行在端口3001，SSR正常
- Blog API (Express): ✅ 运行在端口8085，API响应正常
- Admin Login: ✅ 邮箱验证码登录正常
- Content Management: ✅ 文章、用户管理基本功能正常
- Database: ✅ MySQL连接正常，Redis缓存正常

**❌ Known Issues / 已知问题:**
- Homepage Management: ❌ 主页管理功能前后端未完全打通
  - 前端有完整的主页管理界面(HomeManagePage.vue)
  - 但API调用无法正确保存/读取配置到数据库
  - ICP备案号等主页配置无法生效
- Comment System: ❌ 评论功能已禁用(代码中已注释)

**🔧 Service Status / 服务状态:**
- Port 3000: ✅ Meting Music API (音乐API)
- Port 3001: ✅ Nuxt3 Blog Frontend (博客前台)
- Port 8085: ✅ Express Blog Backend (博客后端API)
- Nginx: ✅ 反向代理配置正常，所有路由工作正常

**Blog Configuration / 博客配置:**
- **Express Backend:** `/opt/home/blog/space-log-express/` (Node.js API server)
  - Express 后端：`/opt/home/blog/space-log-express/`（Node.js API 服务器）
- **Nuxt3 Frontend:** `/opt/home/blog/space-log-nuxt3/app/` (SSR blog frontend)
  - Nuxt3 前台：`/opt/home/blog/space-log-nuxt3/app/`（SSR 博客前台）
- **Admin Frontend:** `/opt/home/blog/admin/` (Vue 3 management interface)
  - 管理前台：`/opt/home/blog/admin/`（Vue 3 管理界面）
- **Database:** MySQL (`space_log_blog`)
  - 数据库：MySQL（`space_log_blog`）
- **Cache:** Redis (port 6379 with password authentication)
  - 缓存：Redis（端口 6379，密码认证）
- **Server Port:** 8085 (Express API service)
  - 服务端口：8085（Express API 服务）
- **Web Access:**
  - Blog Frontend: `https://xiangleideng.site/blog`
  - Admin Interface: `https://xiangleideng.site/mgmt`
  - API Endpoints: `https://xiangleideng.site/api/*`
  - 网页访问：博客前台、管理界面、API 接口

**Blog Management / 博客管理:**

```bash
# Complete blog system deployment / 完整博客系统部署
bash /opt/home/deploy.sh

# Manual Express backend management / 手动管理 Express 后端
cd /opt/home/blog/space-log-express
npm install
NODE_ENV=pro npm run serve:pro  # 启动 Express API 服务（端口 8085）

# Manual Nuxt3 frontend build / 手动构建 Nuxt3 前台
cd /opt/home/blog/space-log-nuxt3/app
pnpm install
NUXT_PUBLIC_ENV=pro pnpm run build:pro  # 构建 → 生成 .nuxt/dist/

# Manual admin frontend build / 手动构建管理前台
cd /opt/home/blog/admin
npm install
npm run build:pro  # 构建 → 生成 admin/dist/

# Service management / 服务管理
cd /opt/home/blog/space-log-express
npm run serve:pro  # 启动 Express 服务（端口 8085）
pkill -f "npm.*serve:pro"  # 停止 Express 服务

# Check service status / 检查服务状态
ps aux | grep -E "npm.*serve:pro|node.*express"
netstat -tulpn | grep 8085
tail -f /opt/home/blog/space-log-express/logs/app.log  # 查看日志
```

**Nginx Configuration for Blog / 博客的 Nginx 配置:**
```nginx
# Blog frontend / 博客前台
location /blog {
    proxy_pass http://localhost:8085/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Blog admin interface / 博客管理界面
location /mgmt {
    proxy_pass http://localhost:8085/mgmt;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Blog API / 博客 API
location /api/ {
    proxy_pass http://localhost:8085/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Blog static resources / 博客静态资源
location /static/ {
    proxy_pass http://localhost:8085/static/;
    proxy_set_header Host $host;
}
```

**Blog Environment Configuration / 博客环境配置:**

The blog system configuration is managed in multiple files:
博客系统配置在多个文件中管理：

**Express Backend Configuration / Express 后端配置:**
`/opt/home/blog/space-log-express/config/pro.json`:

```json
{
  "port": 8085,
  "mysql": {
    "host": "localhost",
    "user": "blog_user",
    "password": "C3AnRPL8HHGNbd33reAV",
    "database": "space_log_blog"
  },
  "redis": {
    "host": "127.0.0.1",
    "port": 6379,
    "password": "MrpBLxNrWvQPCkz3kznltO9CwdyCiP5S"
  },
  "mail": {
    "smtp_host": "gz-smtp.qcloudmail.com",
    "smtp_port": 465,
    "smtp_user": "light@xiangleideng.site",
    "smtp_password": "Aiaih768aUShsinxSAu",
    "from_email": "light@xiangleideng.site",
    "from_name": "邓湘雷の博客"
  },
  "tokenSecretKey": "xld_blog_jwt_secret_2025_please_change_this",
  "vipCustomerEmail": ["light@xiangleideng.site"],
  "author": {
    "name": "邓湘雷",
    "website": "https://xiangleideng.site"
  }
}
```

**Nuxt3 Frontend Configuration / Nuxt3 前台配置:**
Environment variables in `/opt/home/blog/space-log-nuxt3/app/.env.pro`:

```bash
NUXT_PUBLIC_ENV=pro
NUXT_PUBLIC_API_URL=https://xiangleideng.site/api
```

**Important Features / 重要功能状态:**
- ❌ **Comment System DISABLED** / 评论系统已禁用
  - Comment routes commented out in Express app.js
  - 评论路由在 Express app.js 中已注释
- ✅ **Email Verification** / 邮件验证
  - Tencent Cloud SMTP configured for login codes
  - 腾讯云 SMTP 配置用于登录验证码
- ✅ **Redis Session Management** / Redis 会话管理
  - Password-authenticated Redis for session storage
  - 密码认证的 Redis 用于会话存储

**Homepage Integration / 首页集成:**
- Blog link configured in `src/assets/siteLinks.json`
  - 博客链接配置在 `src/assets/siteLinks.json`
- Clicking "博客" on homepage redirects to `/blog`
  - 点击首页"博客"链接跳转到 `/blog`

**Blog Admin Access / 博客管理访问:**
- **URL:** `https://xiangleideng.site/mgmt`
- **Authentication Method:** Email verification code login / 邮箱验证码登录
- **Admin Users / 管理员用户:**
  - Email: `allen030703@163.com` (Active admin account / 活跃管理员账户)
  - Email: `light@xiangleideng.site` (Primary admin / 主管理员)
- **Login Process / 登录流程:**
  1. Enter email address / 输入邮箱地址
  2. Request verification code / 请求验证码
  3. Check email for 6-digit code / 检查邮箱获取6位验证码
  4. Enter code to access admin panel / 输入验证码访问管理后台

**Blog Features / 博客功能:**
- ✅ Article management with Markdown editor / Markdown 编辑器文章管理
- ✅ Category and tag system / 分类和标签系统
- ❌ Comment system **DISABLED** / 评论系统**已禁用**
- ✅ User role management / 用户角色管理
- ✅ File upload integration (Qiniu Cloud) / 文件上传集成（七牛云）
- ✅ Email notifications for login verification / 登录验证邮件通知
- ✅ SEO optimization / SEO 优化
- ✅ Mobile responsive design / 移动端响应式设计
- ✅ Redis session management / Redis 会话管理
- ✅ MySQL database with connection pooling / MySQL 数据库连接池

**Blog System Dependencies / 博客系统依赖:**
- **Backend:** Node.js 16+, Express.js framework, MySQL, Redis
  - 后端：Node.js 16+、Express.js 框架、MySQL、Redis
- **Frontend:** Nuxt 3, Vue 3, Ant Design Vue, Tailwind CSS
  - 前端：Nuxt 3、Vue 3、Ant Design Vue、Tailwind CSS
- **External Services:** Tencent Cloud SMTP (email), Qiniu Cloud (optional file storage)
  - 外部服务：腾讯云 SMTP（邮件）、七牛云（可选文件存储）

### Social & Website Links / 社交和网站链接

#### Website Links / 网站链接
Configure in `src/assets/siteLinks.json`:
在 `src/assets/siteLinks.json` 中配置：

```json
{
  "icon": "Blog",
  "name": "博客",
  "link": "https://blog.imsyy.top/"
}
```

**Adding custom icons / 添加自定义图标:**
1. Browse icons at [xicons.org](https://www.xicons.org)
   - 在 xicons.org 浏览图标
2. Import in `src/components/Links/index.vue`:
   - 在 `src/components/Links/index.vue` 中导入：

```js
// Example: FA icons
import {
  Link,
  Blog,
  CompactDisc,
  Cloud,
  Compass,
  Book,
  Fire,
  LaptopCode,
} from "@vicons/fa";

// Add to icon mapping
const siteIcon = {
  Blog,
  Cloud,
  CompactDisc,
  Compass,
  Book,
  Fire,
  LaptopCode,
};
```

#### Social Links / 社交链接
Configure in `src/assets/socialLinks.json`:
在 `src/assets/socialLinks.json` 中配置

### Background Images / 网站背景

**Location:** `/public/images/`
**位置：** `/public/images/`

**Adding more backgrounds / 添加更多背景:**
1. Add images to `public/images/` as `background{number}.webp`
   - 添加图片到 `public/images/`，命名为 `background{数字}.webp`
2. Update count in `src/components/Background/index.vue:219`:
   - 更新 `src/components/Background/index.vue:219` 中的数量：

```js
if (type == 0) {
  // Update the number after Math.random() to match your image count
  // 更新 Math.random() 后面的数字以匹配图片数量
  bgUrl.value = `/images/background${Math.floor(Math.random() * 10 + 1)}.webp`;
}
```

**Recommended format / 推荐格式:** WebP for optimal performance
**推荐格式：** WebP 以获得最佳性能

### Fonts / 字体配置

**Current font / 当前字体:** HarmonyOS Sans (open source Chinese font with subsetting for faster loading)
**当前字体：** HarmonyOS Sans（开源中文字体，已进行字体拆分以提升加载速度）

**Important / 重要：** Due to CDN anti-hotlinking, replace font URLs if deploying on your own domain:
如果在自己的域名上部署，需要替换字体 URL：

Replace with / 替换为:
```
https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css
```

<details>
<summary>Advanced: Custom font compression / 高级：自定义字体压缩</summary>

#### Removing Traditional Chinese Characters / 去除繁体字
```bash
# Install dependencies / 安装依赖
pip install fonttools

# Download Unicode list / 下载 Unicode 列表
# https://gist.githubusercontent.com/imaegoo/d64e5088b723c2e02c40985f55ff12db/raw/5ebd2ce49418c73459a9dfe050483409306a6c1d/sc_unicode.txt

# Subset font / 子集化字体
pyftsubset 字体名称.ttf --unicodes-file=sc_unicode.txt
```

#### Further compression with woff2 / 使用 woff2 进一步压缩
```bash
# Install Google woff2 / 安装 Google woff2
sudo apt-get install -y git g++ make
git clone --recursive https://github.com/google/woff2.git
cd woff2
make clean all

# Compress font / 压缩字体
./woff2_compress ./字体名称.ttf
```

See detailed guide at: [虹墨空间站](https://www.imaegoo.com/2020/chinese-font-compress/)
详细指南参见：虹墨空间站
</details>

## Deployment Options / 部署选项

### 🚀 Complete System Deployment (Recommended) / 完整系统部署（推荐）

**This deployment includes both the homepage and the integrated blog system:**
**此部署包含主页和集成的博客系统：**

```bash
# One-command deployment for the complete system
# 一键部署完整系统
bash /opt/home/deploy.sh
```

**What the deployment script does / 部署脚本的功能:**

1. ✅ **Homepage Build** / 主页构建
   - Installs dependencies with `pnpm install`
   - Builds Vue 3 homepage with `pnpm build`
   - Automatically available via symbolic link `/var/www/xiangleideng.site` → `/opt/home/dist`

2. ✅ **Blog Admin Frontend Build** / 博客管理前台构建
   - Builds Vue 3 admin interface with `npm run build:pro`
   - Copies built files to Go backend directory

3. ✅ **Go Backend Compilation** / Go 后端编译
   - Compiles Go blog server with production settings
   - Generates optimized binary `blog-server`

4. ✅ **Service Management** / 服务管理
   - Stops old blog service if running
   - Starts new blog service on port 8085
   - Verifies API connectivity

5. ✅ **Nginx Configuration** / Nginx 配置
   - Tests and reloads Nginx configuration
   - Ensures proper routing for all services

**System Architecture After Deployment / 部署后系统架构:**

```
https://xiangleideng.site/
├── / (Homepage)         → Nginx static files (/opt/home/dist)
├── /blog               → Nginx proxy → Express:8085 (Nuxt3 blog frontend)
├── /mgmt               → Nginx proxy → Express:8085 (Vue3 admin interface)
├── /api/*              → Nginx proxy → Express:8085 (Blog API)
├── /music              → Nginx proxy → Node:3000 (Music API)
└── /static/*           → Nginx proxy → Express:8085 (Blog assets)
```

**Service Status Verification / 服务状态验证:**

```bash
# Check all services
# 检查所有服务
ps aux | grep -E "npm.*serve:pro|node.*express|node.*3000" | grep -v grep
netstat -tulpn | grep -E ":(8085|3000|80|443)" | grep LISTEN

# Test endpoints
# 测试端点
curl -s -o /dev/null -w "Homepage: %{http_code}\n" https://xiangleideng.site/
curl -s -o /dev/null -w "Blog: %{http_code}\n" https://xiangleideng.site/blog
curl -s -o /dev/null -w "Admin: %{http_code}\n" https://xiangleideng.site/mgmt
curl -s -o /dev/null -w "Blog API: %{http_code}\n" https://xiangleideng.site/api/article/reception/getArticleByTypeId/0/1/10
curl -s -o /dev/null -w "Music API: %{http_code}\n" https://xiangleideng.site/music
```

### 1. Vercel Deployment (Homepage Only) / Vercel 部署（仅主页）

**⚠️ Note:** Vercel deployment only includes the Vue 3 homepage. The Express.js blog system requires a VPS or dedicated server.
**注意：** Vercel 部署仅包含 Vue 3 主页。Express.js 博客系统需要 VPS 或专用服务器。

**Steps / 步骤:**
1. Fork this repository to your GitHub account
   - Fork 本仓库到你的 GitHub 账号
2. Copy `/.env.example` to `/.env` and configure (IMPORTANT)
   - 复制 `/.env.example` 为 `/.env` 并配置（重要）
3. Connect repository to Vercel
   - 连接仓库到 Vercel
4. Click Deploy - automatic deployment on push
   - 点击部署 - 推送时自动部署

**Demo sites / 演示站点:**
- Main: https://www.imsyy.top
- Dev: https://home-imsyy.vercel.app
- Backup: https://home-5iw.pages.dev

### 2. GitHub Actions Auto-build / GitHub Actions 自动构建

If you encounter build errors locally, use GitHub Actions for automatic builds:
如果本地构建遇到错误，可使用 GitHub Actions 自动构建：

**Steps / 步骤:**
1. After forking, go to **Actions** tab
   - Fork 后，前往 **Actions** 标签
2. Enable workflows (first-time prompt)
   - 启用工作流（首次会有提示）
3. Make any commit to trigger build
   - 进行任意提交以触发构建
4. Download build artifact (static files) from workflow run
   - 从工作流运行中下载构建产物（静态文件）
5. Upload to your server
   - 上传到你的服务器

### 3. Manual Deployment / 手动部署

**Requirements / 要求:**
- Node.js > 16.16.0
- npm > 8.15.0

**Steps / 步骤:**
```bash
# Install pnpm globally / 全局安装 pnpm
npm install -g pnpm

# Install dependencies / 安装依赖
pnpm install

# Development server / 开发服务器
pnpm dev

# Production build / 生产构建
pnpm build

# Files will be in /dist directory
# 文件将在 /dist 目录中
# Upload dist/ contents to your server
# 上传 dist/ 内容到你的服务器
```

### 4. Docker Deployment / Docker 部署

```bash
# Build image / 构建镜像
docker build -t home .

# Run container / 运行容器
docker run -p 12445:12445 -d home

# Access at / 访问地址
# http://localhost:12445
```

**Docker configuration:**
- Multi-stage build with Alpine Linux
  - Alpine Linux 多阶段构建
- Uses http-server for static file serving
  - 使用 http-server 提供静态文件服务
- Port 12445 exposed
  - 暴露 12445 端口

## Development Patterns / 开发模式

### Vue 3 Composition API
- All components use `<script setup>` syntax
  - 所有组件使用 `<script setup>` 语法
- Auto-imports enabled for Vue composables via `unplugin-auto-import`
  - 通过 `unplugin-auto-import` 启用 Vue 组合式 API 自动导入
- Element Plus components auto-imported via `unplugin-vue-components`
  - Element Plus 组件通过 `unplugin-vue-components` 自动导入

### SCSS Structure / SCSS 结构
- Global variables and mixins in `src/style/global.scss`
  - 全局变量和混合在 `src/style/global.scss`
- Component-scoped styles with SCSS preprocessing
  - 组件作用域样式，使用 SCSS 预处理
- Mobile-first responsive design approach
  - 移动优先的响应式设计方法

### API Integration / API 集成
- Centralized API functions in `src/api/index.js`
  - 集中式 API 函数在 `src/api/index.js`
- Supports JSONP for cross-origin music API requests
  - 支持 JSONP 跨域音乐 API 请求
- Error handling for external service failures (weather, music, quotes)
  - 外部服务失败的错误处理（天气、音乐、语录）

**External APIs Used / 使用的外部 API:**
- [韩小韩 WebAPI](https://api.vvhan.com/)
- [搏天 API](https://api.btstu.cn/doc/sjbz.php)
- [教书先生 API](https://api.oioweb.cn/doc/weather/GetWeather)
- [高德开放平台](https://lbs.amap.com/)
- [Hitokoto 一言](https://hitokoto.cn/)

### PWA Configuration / PWA 配置
- Auto-update service worker via Vite PWA plugin
  - 通过 Vite PWA 插件自动更新服务工作线程
- Runtime caching for static assets (JS/CSS/images)
  - 静态资源的运行时缓存（JS/CSS/图片）
- Manifest generation from environment variables
  - 从环境变量生成清单文件
- Offline-first caching strategy
  - 离线优先的缓存策略

## Build & Deployment / 构建与部署

### Build Configuration (vite.config.js)
- Terser minification with console.log removal in production
  - Terser 压缩，生产环境移除 console.log
- SCSS preprocessing with global imports
  - SCSS 预处理，全局导入
- Compression plugin for gzip/brotli output
  - 压缩插件，gzip/brotli 输出
- Path alias: `@` → `src/`
  - 路径别名：`@` → `src/`

### Performance Optimization / 性能优化
- PWA caching strategies for assets
  - PWA 资源缓存策略
- Image optimization (WebP format recommended)
  - 图片优化（推荐 WebP 格式）
- Font subsetting (HarmonyOS Sans with Chinese character optimization)
  - 字体子集化（HarmonyOS Sans 中文字符优化）
- Lazy loading and code splitting via Vite
  - 通过 Vite 实现懒加载和代码分割

## Common Development Tasks / 常见开发任务

### Adding New Website Links / 添加新网站链接
1. Add entry to `src/assets/siteLinks.json` with icon name
   - 在 `src/assets/siteLinks.json` 中添加条目，包含图标名称
2. Import corresponding icon in `src/components/Links/index.vue`
   - 在 `src/components/Links/index.vue` 中导入相应图标
3. Add icon to `siteIcon` object mapping
   - 将图标添加到 `siteIcon` 对象映射

### Customizing Background Images / 自定义背景图片
1. Add images to `public/images/` as `background{number}.webp`
   - 添加图片到 `public/images/`，命名为 `background{数字}.webp`
2. Update random count in `src/components/Background/index.vue:219`
   - 更新 `src/components/Background/index.vue:219` 中的随机数

### Updating API Endpoints / 更新 API 端点
- External APIs may hit rate limits; consider self-hosting alternatives
  - 外部 API 可能会达到速率限制；考虑自建替代方案
- Weather: Gaode Maps API (5000 requests/day free tier)
  - 天气：高德地图 API（免费额度每天 5000 次）
- Music: Self-deploy Meting API for reliability
  - 音乐：自建 Meting API 以提高可靠性
- Quotes: Hitokoto API (generally stable)
  - 语录：Hitokoto API（通常稳定）

## Browser Support / 浏览器支持

- **Modern browsers:** Full support (Chrome, Firefox, Safari, Edge)
  - 现代浏览器：完全支持（Chrome、Firefox、Safari、Edge）
- **IE:** Automatic redirect to upgrade notice
  - IE：自动重定向到升级提示
- **Mobile:** Full responsive support with touch-optimized interactions
  - 移动端：完全响应式支持，触摸优化交互
- **PWA:** Installable as standalone app on supported platforms
  - PWA：可在支持的平台上作为独立应用安装

## Troubleshooting / 故障排除

### Music Player Issues / 音乐播放器问题

#### Problem: API calls fail with `ERR_CONNECTION_CLOSED` or `502 Bad Gateway`
#### 问题：API 调用失败，显示 `ERR_CONNECTION_CLOSED` 或 `502 Bad Gateway`

```bash
# 1. Check if Meting-API service is running
# 检查 Meting-API 服务是否运行
netstat -tulpn | grep :3000

# 2. Start/restart Meting-API service
# 启动/重启 Meting-API 服务
cd /opt/home/music/Meting-API
npm run start:node

# 3. Verify nginx proxy configuration
# 验证 nginx 代理配置
sudo nginx -t
sudo systemctl reload nginx

# 4. Test API endpoints
# 测试 API 端点
curl "https://xiangleideng.site/music?server=tencent&type=playlist&id=9597130897"
```

#### Problem: Music button doesn't appear on hover over Hitokoto component
#### 问题：鼠标悬停在 Hitokoto 组件上时音乐按钮不出现

**Check in browser dev tools / 在浏览器开发工具中检查:**
```javascript
store.musicIsOk       // Must be true (set in Player.vue:93)
                      // 必须为 true（在 Player.vue:93 中设置）
playerHasId           // Must have value from VITE_SONG_ID
                      // 必须有来自 VITE_SONG_ID 的值
store.musicOpenState  // Should be false when showing Hitokoto
                      // 显示 Hitokoto 时应为 false
```

#### Problem: After environment changes, music still doesn't work
#### 问题：环境变量更改后，音乐仍然无法工作

```bash
# Rebuild frontend to apply new environment variables
# 重新构建前端以应用新的环境变量
npm run build

# Force refresh browser (clear cache)
# 强制刷新浏览器（清除缓存）
# Ctrl+Shift+R or F12 → Network → Disable cache → Refresh
```

**Services & Dependencies / 服务和依赖项:**
- **Meting-API:** Must run on `localhost:3000`
  - 必须运行在 `localhost:3000`
- **Nginx:** Reverse proxy `/music` → `localhost:3000`
  - 反向代理 `/music` → `localhost:3000`
- **Environment:** `VITE_SONG_ID` must have value for Music component to render
  - 环境变量：`VITE_SONG_ID` 必须有值才能渲染 Music 组件
- **State:** `store.musicIsOk` set to `true` after successful API initialization
  - 状态：API 初始化成功后 `store.musicIsOk` 设置为 `true`

### QQ Music Issues & Solutions / QQ 音乐问题与解决方案

#### Problem: QQ Music returns `403 Forbidden` or `aqqmusic.tc.qq.com` access denied
#### 问题：QQ 音乐返回 `403 Forbidden` 或 `aqqmusic.tc.qq.com` 访问被拒绝

**Root Causes / 根本原因:**
1. **Geographic Restrictions:** QQ Music blocks overseas access to audio resources
   - 地理限制：QQ 音乐封锁海外访问音频资源
2. **Copyright Protection:** Direct audio URL access is restricted
   - 版权保护：直接访问音频 URL 受限
3. **Proxy Issues:** System proxy settings may interfere with API requests
   - 代理问题：系统代理设置可能干扰 API 请求

**Solutions / 解决方案:**
```bash
# 1. Set OVERSEAS environment variable for proper QQ Music handling
# 设置 OVERSEAS 环境变量以正确处理 QQ 音乐
OVERSEAS=0  # For domestic deployment / 国内部署
OVERSEAS=1  # For overseas deployment (requires frontend plugin replacement)
            # 海外部署（需要替换前端插件）

# 2. Start Meting-API with correct settings
# 使用正确设置启动 Meting-API
cd /opt/home/music/Meting-API
OVERSEAS=0 npm run start:node

# 3. Bypass proxy for testing
# 绕过代理进行测试
NO_PROXY="*" curl "https://xiangleideng.site/music?server=tencent&type=playlist&id=9597130897"

# 4. Check API response format
# 检查 API 响应格式
curl -v "https://xiangleideng.site/music?server=tencent&type=url&id=SONG_ID"
```

**Frontend Plugin Replacement (for overseas deployment) / 前端插件替换（海外部署）:**

Replace MetingJS plugin URLs:
替换 MetingJS 插件 URL：

```
FROM: https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js
TO:   https://cdn.jsdelivr.net/npm/@xizeyoupan/meting@latest/dist/Meting.min.js
```

**QQ Music Compatibility Chart / QQ 音乐兼容性表:**

| Deployment<br/>部署位置 | Domestic Users<br/>国内用户 | Overseas Users<br/>海外用户 |
|-------------------------|------------------------------|------------------------------|
| Domestic<br/>国内       | ✅ Works<br/>可用             | ❌ Blocked<br/>封锁           |
| Overseas<br/>海外       | ✅ Works¹<br/>可用¹           | ❌ Blocked<br/>封锁           |

¹ Requires `OVERSEAS=1` + frontend plugin replacement
¹ 需要 `OVERSEAS=1` + 前端插件替换

**Alternative Solution / 替代方案:** Switch to NetEase Cloud Music (`server=netease`) which has better international support.
切换到网易云音乐（`server=netease`），国际支持更好。

### Cache Issues / 缓存问题

If you don't see latest changes after deployment:
如果部署后看不到最新更改：

```bash
# Force refresh browser cache
# 强制刷新浏览器缓存
# Windows/Linux: Ctrl + Shift + R
# Mac: Cmd + Shift + R

# Or disable cache in DevTools
# 或在开发工具中禁用缓存
# F12 → Network tab → Disable cache checkbox
```

## Logo Font Notice / Logo 字体说明

The homepage Logo uses compressed Pacifico font. If you use characters outside the original logo text, they will fall back to the default font.
主页 Logo 使用压缩后的 Pacifico 字体。如果使用原 Logo 文本以外的字符，将回退到默认字体。

**Full font download / 完整字体下载:**
- [Pacifico-Regular.ttf](https://file.imsyy.top/font/Other/Pacifico-Regular.ttf)
- Or replace with `font/Pacifico-Regular-all.ttf` in project
  - 或使用项目中的 `font/Pacifico-Regular-all.ttf` 替换

## Project Status / 项目状态

**Note from original author / 原作者说明:**

> 此项目最初只是一个简单的主页。然而，随着越来越多的小伙伴发现了这个项目，它受到了大量本不应有的关注。而且，此项目作为初学前端的作品，其代码相当杂乱且质量低下。此外，该项目还遭到众多不明资源站或下载站的倒卖，致使许多不明真相的购买者从源代码中找到本人的联系方式进行问题咨询或提出功能需求。由于目前个人原因，该仓库进行存档，敬请谅解！

---

**For more help / 获取更多帮助:**
- Original homepage project: https://github.com/imsyy/home
- Blog system project: https://github.com/zxysilent/blog
- Issues: Use GitHub Issues for bug reports
  - 使用 GitHub Issues 报告问题
- Documentation: Check README.md for Chinese documentation
  - 中文文档请查看 README.md

---

**Documentation Update History / 文档更新历史:**
- **2025-10-21**: Updated blog system architecture from Go to Express.js + Nuxt3
  - 将博客系统架构从 Go 更新为 Express.js + Nuxt3
- **2025-10-21**: Added Redis configuration and SMTP email setup for blog system
  - 为博客系统添加 Redis 配置和 SMTP 邮件设置
- **2025-10-21**: Disabled comment system and updated admin authentication to email verification
  - 禁用评论系统并将管理员认证更新为邮箱验证
- **2025-10-21**: Added comprehensive Express backend and Nuxt3 frontend configuration
  - 添加完整的 Express 后端和 Nuxt3 前端配置
- **2025-10-18**: Updated for integrated Go blog system with Vue admin interface
  - 为集成的 Go 博客系统和 Vue 管理界面更新文档
- **2025-10-18**: Updated music API path from `/api` to `/music` to avoid conflicts
  - 更新音乐 API 路径从 `/api` 改为 `/music` 以避免冲突
- **2025-10-18**: Added complete deployment guide for homepage + blog system
  - 添加主页 + 博客系统的完整部署指南
