# 环境变量说明

本文档列出所有子项目的环境变量配置说明。

> **安全提示：** 所有包含密码、密钥的配置文件（`*.json` 中的 password/secret 字段、`.env.*` 文件）均已加入 `.gitignore`，不会被提交到版本库。

---

## 根目录（开发环境统一配置）

配置文件：`.env.dev`（开发环境，已 gitignore）

此文件集中管理各服务的端口号，供根目录 `dev` 脚本读取。

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT_MUSIC_API` | music-api 服务端口 | `3005` |
| `PORT_BLOG_API` | blog-api 服务端口 | `8086` |
| `PORT_BLOG_FRONTEND` | blog-frontend 服务端口 | `3004` |
| `PORT_BLOG_ADMIN` | blog-admin 开发服务端口 | `8083` |
| `NUXT_PUBLIC_ENV` | Nuxt 环境标识（透传给 blog-frontend） | `dev` |
| `NUXT_PUBLIC_API_URL` | blog-frontend 使用的 API 地址 | `http://localhost:8086/api` |
| `NUXT_PUBLIC_OSS_URL` | OSS 地址（可选，留空则禁用） | 空 |
| `NUXT_PUBLIC_BASE_URL` | blog-frontend 站点基础地址 | `http://localhost:3004` |

---

## apps/homepage

配置文件：`apps/homepage/.env`（从根目录 `.env.example` 复制，已 gitignore）

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_SITE_NAME` | 站点名称（显示在浏览器标签和 PWA） | `邓湘雷の主页` |
| `VITE_SITE_AUTHOR` | 作者名称 | `Xaiver/灯下灯` |
| `VITE_SITE_KEYWORDS` | SEO 关键词 | `邓湘雷,个人主页` |
| `VITE_SITE_DES` | 站点描述 | `一点浩然气，千里快哉风` |
| `VITE_SITE_URL` | 站点域名（不含 `https://`） | `xiangleideng.site` |
| `VITE_BASE_URL` | 基础 URL（开发留空，生产填完整域名） | 空 |
| `VITE_SITE_LOGO` | favicon 路径 | `/images/icon/favicon.ico` |
| `VITE_SITE_MAIN_LOGO` | 主 Logo 路径 | `/images/icon/logo.png` |
| `VITE_SITE_APPLE_LOGO` | Apple Touch Icon 路径 | `/images/icon/apple-touch-icon.png` |
| `VITE_WEATHER_KEY` | 高德地图 API Key（用于天气服务） | — |
| `VITE_SITE_START` | 建站日期（用于时光胶囊功能） | `2025-10-18` |
| `VITE_SITE_ICP` | ICP 备案号（非中国大陆可留空） | `京ICP备xxxxxxxx号` |
| `VITE_SONG_API` | Meting API 地址 | `/music` |
| `VITE_SONG_SERVER` | 音乐平台（`netease` / `tencent`） | `tencent` |
| `VITE_SONG_TYPE` | 播放类型（`song` / `playlist` / `album`） | `playlist` |
| `VITE_SONG_ID` | 播放列表或歌曲 ID（留空则禁用音乐播放器） | `9597130897` |

> 获取高德天气 API Key：访问 [高德开放平台](https://console.amap.com/dev/index)，创建 **Web 服务** 类型的 Key。

---

## apps/blog-api

配置文件：`apps/blog-api/config/dev.json`（开发）、`apps/blog-api/config/pro.json`（生产，已 gitignore）

配置以 JSON 格式存储，通过 `NODE_ENV` 环境变量选择加载哪个文件。

| 字段 | 说明 | 开发示例值 |
|------|------|-----------|
| `port` | 服务监听端口 | `8086` |
| `mysql.host` | MySQL 主机地址 | `localhost` |
| `mysql.user` | MySQL 用户名 | `root` |
| `mysql.password` | MySQL 密码 | 空（开发环境） |
| `mysql.database` | 数据库名 | `space_log_blog` |
| `redis.host` | Redis 主机地址 | `127.0.0.1` |
| `redis.port` | Redis 端口 | `6379` |
| `redis.password` | Redis 密码（无密码则留空） | 空（开发环境） |
| `mail.smtp_host` | SMTP 服务器地址 | `gz-smtp.qcloudmail.com` |
| `mail.smtp_port` | SMTP 端口 | `465` |
| `mail.smtp_user` | SMTP 用户名（发件邮箱） | — |
| `mail.smtp_password` | SMTP 密码 | — |
| `mail.from_email` | 发件人邮箱地址 | — |
| `mail.from_name` | 发件人显示名称 | `邓湘雷の博客` |
| `comment.entityType` | 允许评论的实体类型 | `["Article", "Message"]` |
| `comment.adminCustomerEmail` | 管理员邮箱列表（接收评论通知） | — |
| `qiniu.accessKey` | 七牛云 AccessKey（可选，用于文件上传） | 空 |
| `qiniu.secretKey` | 七牛云 SecretKey（可选） | 空 |
| `qiniu.bucket` | 七牛云存储空间名（可选） | 空 |
| `qiniu.domain` | 七牛云访问域名（可选） | 空 |
| `tokenSecretKey` | JWT 签名密钥（生产环境务必修改） | `xld_blog_jwt_secret_2025_dev` |
| `vipCustomerEmail` | 管理员邮箱列表（可登录后台） | — |
| `author.name` | 博客作者名称 | `邓湘雷` |
| `author.website` | 博客作者网站 | `https://xiangleideng.site` |

> **注意：** 开发环境使用 SQLite（通过 Sequelize），`mysql` 字段在开发环境下可忽略。详见 `apps/blog-api/config/database.js`。

---

## apps/blog-frontend

配置文件：`apps/blog-frontend/.env.dev`（开发，已 gitignore）

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NUXT_PUBLIC_ENV` | 环境标识 | `dev` |
| `NUXT_PUBLIC_API_URL` | blog-api 接口地址 | `http://localhost:8086/api` |
| `NUXT_PUBLIC_BASE_URL` | 博客前台站点地址（用于 SEO） | `http://localhost:3015` |
| `NUXT_PUBLIC_SITE_NAME` | 博客站点名称 | `邓湘雷の博客` |
| `NUXT_PUBLIC_SITE_DESC` | 博客站点描述 | `邓湘雷的个人博客，分享技术、生活与思考` |
| `NUXT_PUBLIC_OSS_URL` | OSS 资源基础地址（可选，留空则禁用） | 空 |

---

## apps/blog-admin

配置文件：`apps/blog-admin/.env.dev`（开发，已 gitignore）

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_BASE_URL` | blog-api 接口基础地址 | `http://localhost:8086/api` |

---

## services/music-api

配置通过环境变量直接传入，无配置文件。

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务监听端口 | `3000`（开发脚本中覆盖为 `3005`） |
| `OVERSEAS` | 是否为海外部署（影响 QQ 音乐资源获取策略） | `0`（国内） |

> `OVERSEAS=1` 时需同步替换 homepage 中的 MetingJS 插件为 `@xizeyoupan/meting` 版本，详见 [QQ 音乐故障排查](../guides/DEV_COMMANDS.md)。

---

## 快速初始化

```bash
# 1. 复制根目录环境变量模板
cp .env.example apps/homepage/.env

# 2. 创建开发环境统一配置（参考下方模板）
cat > .env.dev << 'EOF'
PORT_MUSIC_API=3005
PORT_BLOG_API=8086
PORT_BLOG_FRONTEND=3004
PORT_BLOG_ADMIN=8083
NUXT_PUBLIC_ENV=dev
NUXT_PUBLIC_API_URL=http://localhost:8086/api
NUXT_PUBLIC_OSS_URL=
NUXT_PUBLIC_BASE_URL=http://localhost:3004
EOF

# 3. 创建 blog-admin 开发配置
echo "VITE_BASE_URL=http://localhost:8086/api" > apps/blog-admin/.env.dev

# 4. 创建 blog-frontend 开发配置
cat > apps/blog-frontend/.env.dev << 'EOF'
NUXT_PUBLIC_ENV=dev
NUXT_PUBLIC_API_URL=http://localhost:8086/api
NUXT_PUBLIC_BASE_URL=http://localhost:3004
NUXT_PUBLIC_SITE_NAME=邓湘雷の博客
NUXT_PUBLIC_SITE_DESC=邓湘雷的个人博客，分享技术、生活与思考
NUXT_PUBLIC_OSS_URL=
EOF

# 5. 复制 blog-api 开发配置（已有默认值，按需修改）
# apps/blog-api/config/dev.json 已存在，开发环境使用 SQLite 无需配置 MySQL
```
