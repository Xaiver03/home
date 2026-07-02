# 环境变量配置说明

## 📁 文件说明

| 文件 | 用途 | 提交到 Git |
|------|------|-----------|
| `.env.example` | 环境变量模板，包含所有可用变量说明 | ✅ 提交 |
| `.env` | 默认环境配置（指向 .env.dev） | ❌ 不提交 |
| `.env.dev` | 开发环境配置 | ❌ 不提交 |
| `.env.local` | 本地测试配置（端口 80 和 3008） | ❌ 不提交 |
| `.env.pro` | 生产环境配置 | ❌ 不提交 |

## 🚀 快速开始

### 1. 初始化环境配置

```bash
# 复制模板文件
cp .env.example .env.dev
cp .env.example .env.pro
cp .env.example .env.local

# 编辑对应环境的配置文件
# 根据 CREDENTIALS.md 填写敏感信息
```

### 2. 使用不同环境

```bash
# 开发环境（默认）
pnpm dev

# 本地测试环境（端口 80 和 3008）
pnpm dev:local

# 生产环境
pnpm build
NODE_ENV=pro pnpm start
```

## 🔧 环境变量分类

### 1. 端口配置
```bash
HOMEPAGE_PORT=3015           # 主页端口
BLOG_FRONTEND_PORT=3004      # 博客前台端口
BLOG_API_PORT=8086           # 博客 API 端口
BLOG_ADMIN_PORT=8083         # 博客管理后台端口
MUSIC_API_PORT=3005          # 音乐 API 端口
```

### 2. 数据库配置
```bash
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=              # 开发环境留空，生产环境填写
MYSQL_DATABASE=space_log_blog
```

### 3. Redis 配置
```bash
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=              # 开发环境留空，生产环境填写
```

### 4. JWT 配置
```bash
JWT_SECRET=xld_blog_jwt_secret_2025_dev
```

### 5. 邮件服务
```bash
SMTP_HOST=gz-smtp.qcloudmail.com
SMTP_PORT=465
SMTP_USER=light@xiangleideng.site
SMTP_PASSWORD=               # 参考 CREDENTIALS.md
MAIL_FROM=light@xiangleideng.site
MAIL_FROM_NAME=邓湘雷の博客
```

### 6. 七牛云 OSS
```bash
QINIU_ACCESS_KEY=
QINIU_SECRET_KEY=
QINIU_BUCKET=
QINIU_DOMAIN=
```

### 7. 站点信息
```bash
SITE_NAME=邓湘雷の主页
SITE_AUTHOR=Xaiver/灯下灯
SITE_URL=xiangleideng.site
```

### 8. Vite 特定配置
前端项目使用 `VITE_` 前缀：
```bash
VITE_SITE_NAME=邓湘雷の主页
VITE_BASE_URL=
VITE_WEATHER_KEY=cd5b9380bb4544201fb884a67418a7b8
```

### 9. Nuxt 特定配置
博客前台使用 `NUXT_PUBLIC_` 前缀：
```bash
NUXT_PUBLIC_ENV=dev
NUXT_PUBLIC_API_URL=http://localhost:8086
NUXT_PUBLIC_BASE_URL=http://localhost:3004
```

## 🔄 环境切换

### blog-api 配置读取

`blog-api` 使用 `config` 包管理配置：

```
apps/blog-api/config/
├── dev.json       # 开发环境（从环境变量读取）
├── local.json     # 本地测试
├── pro.json       # 生产环境（从环境变量读取）
└── database.js    # 数据库配置
```

启动时通过 `NODE_ENV` 环境变量切换：
```bash
NODE_ENV=dev nodemon ./bin/www      # 读取 dev.json
NODE_ENV=local nodemon ./bin/www    # 读取 local.json
NODE_ENV=pro node ./bin/www         # 读取 pro.json
```

### 前端项目配置读取

前端项目在启动时自动读取对应的 `.env` 文件：

```javascript
// vite.config.js
import { loadEnv } from 'vite';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  // env.VITE_SITE_NAME 等
}
```

## 📝 配置最佳实践

### 1. 开发环境
- 使用本地 MySQL 和 Redis（无密码）
- 端口使用标准配置（3015, 3004, 8086 等）
- SMTP 密码可以留空（不测试邮件功能）

### 2. 本地测试环境
- 模拟生产环境的端口配置
- 主页使用 80 端口（需要 sudo）
- 博客前台使用 3008 端口

### 3. 生产环境
- **必须**填写所有密码和敏感信息
- JWT_SECRET 使用强随机字符串
- 定期更换密码（建议 6 个月）

### 4. 安全建议
- ❌ **禁止**将 `.env.pro` 提交到 Git
- ✅ **使用** `CREDENTIALS.md` 备份密码
- ✅ **定期**备份到密码管理器
- ✅ **不同环境**使用不同密码

## 🆘 常见问题

### Q1: 如何查看当前使用的环境？
```bash
# 查看 NODE_ENV
echo $NODE_ENV

# blog-api 启动时会打印
# "Environment: dev" 或 "Environment: pro"
```

### Q2: 如何新增环境变量？
1. 在 `.env.example` 中添加变量说明
2. 在所有环境文件中添加对应的值
3. 更新此文档

### Q3: 端口被占用怎么办？
修改对应环境的 `.env` 文件中的端口配置。

### Q4: 生产环境配置在哪里？
服务器上的配置文件：
```bash
ssh 12kmroot
cd /opt/home
cat .env.pro
```

## 🔗 相关文档

- `CREDENTIALS.md` - 密码和敏感信息管理
- `docs/LOCAL_TEST.md` - 本地测试环境指南
- `docs/CODE_QUALITY_REPORT.md` - 代码质量审查报告
