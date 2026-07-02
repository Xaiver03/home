# 🚀 快速参考卡片

> 项目：邓湘雷的个人主页 + 博客系统 Monorepo  
> 最后更新：2026-06-21

---

## 📋 常用命令

### 启动开发环境
```bash
# 标准开发环境（推荐）
pnpm dev

# 本地测试环境（80 和 3008 端口）
pnpm dev:local

# 仅前端
pnpm dev:frontend

# 仅后端
pnpm dev:backend
```

### 单独启动服务
```bash
pnpm dev:homepage        # 主页（3015）
pnpm dev:blog-frontend   # 博客前台（3004）
pnpm dev:blog-admin      # 博客管理（8083）
pnpm dev:blog-api        # 博客 API（8086）
pnpm dev:music           # 音乐 API（3005）
```

---

## 🌐 访问地址

### 开发环境
- **主页**: http://localhost:3015
- **博客前台**: http://localhost:3004
- **博客管理**: http://localhost:8083
- **博客 API**: http://localhost:8086
- **音乐 API**: http://localhost:3005

### 本地测试环境
- **主页**: http://localhost （80 端口）
- **博客前台**: http://localhost:3008
- **博客 API**: http://localhost:8086
- **音乐 API**: http://localhost:3005

### 生产环境
- **网站**: https://xiangleideng.site
- **服务器**: 124.223.13.226 (`ssh finlaw`)

---

## 🔐 敏感信息

### 查看密码
```bash
cat CREDENTIALS.md
```

### 重要文件
- `CREDENTIALS.md` - 所有密码（不提交 Git）
- `.env.dev` - 开发环境配置
- `.env.local` - 本地测试配置
- `.env.pro` - 生产环境配置（不提交 Git）

### 配置位置
```bash
# 环境变量
.env.example              # 模板
.env.dev                  # 开发
.env.local                # 测试
.env.pro                  # 生产

# blog-api 配置
apps/blog-api/config/
├── dev.json             # 开发
├── local.json           # 测试
├── pro.json             # 生产
└── custom-environment-variables.json  # 环境变量映射
```

---

## 📁 项目结构

```
home/
├── apps/                 # 前端应用
│   ├── homepage/        # 主页（Vue3）
│   ├── blog-frontend/   # 博客前台（Nuxt3）
│   ├── blog-admin/      # 博客管理（Vue3）
│   └── blog-api/        # 博客 API（Express）
├── services/            # 后端服务
│   └── music-api/       # 音乐 API（Hono）
├── packages/            # 共享包
│   ├── shared-utils/
│   ├── shared-config/
│   └── shared-types/
├── docs/                # 文档
│   ├── LOCAL_TEST.md
│   ├── ENV_CONFIG_GUIDE.md
│   ├── CODE_QUALITY_REPORT.md
│   └── IMPROVEMENTS.md
└── CREDENTIALS.md       # 密码（不提交）
```

---

## 🔧 常见问题

### Q: 如何切换环境？
```bash
# 开发环境
NODE_ENV=dev pnpm dev

# 本地测试
pnpm dev:local

# 生产环境
NODE_ENV=pro pnpm start
```

### Q: 端口被占用怎么办？
```bash
# 修改对应的 .env 文件
nano .env.dev

# 或使用环境变量
PORT=3016 pnpm dev:homepage
```

### Q: 如何查看日志？
```bash
# 本地日志
tail -f apps/blog-api/logs/combined.log

# 服务器日志
ssh finlaw
tail -f /opt/home/logs/*.log
```

### Q: 如何重启生产服务？
```bash
ssh finlaw
cd /opt/home
pm2 restart spaceP_pro    # 博客 API
pm2 restart music-api      # 音乐 API
systemctl reload caddy     # Web 服务器
```

---

## 📚 文档索引

| 文档 | 用途 |
|------|------|
| `CREDENTIALS.md` | 密码管理（本地，不提交） |
| `CLAUDE.md` | 项目配置总览 |
| `README.md` | 项目介绍 |
| `docs/LOCAL_TEST.md` | 本地测试指南 |
| `docs/ENV_CONFIG_GUIDE.md` | 环境变量配置 |
| `docs/CODE_QUALITY_REPORT.md` | 代码质量报告 |
| `docs/IMPROVEMENTS.md` | 改进总结 |
| `docs/QUICK_REFERENCE.md` | 本文档 |

---

## 🛠️ 调试技巧

### 检查服务状态
```bash
# 检查端口占用
lsof -i :3015
lsof -i :8086

# 检查数据库连接
mysql -u root -p space_log_blog

# 检查 Redis
redis-cli ping
```

### 清理和重建
```bash
# 清理构建产物
pnpm clean

# 重新安装依赖
rm -rf node_modules
pnpm install

# 重新构建
pnpm build
```

### Git 操作
```bash
# 查看状态
git status

# 创建提交
pnpm commit

# 查看历史
git log --oneline -10
```

---

## 🔗 快速链接

### 开发工具
- **GitHub**: https://github.com/Xaiver03/home
- **服务器**: `ssh finlaw`
- **域名**: https://xiangleideng.site

### 第三方服务
- **高德天气 API**: 配置在 `.env` 中
- **腾讯云邮箱**: SMTP 配置
- **七牛云 OSS**: 待配置

---

## ⚡ 快捷键（推荐配置）

### VS Code
```json
{
  "terminal.integrated.profiles.osx": {
    "dev": { "path": "pnpm", "args": ["dev"] },
    "dev:local": { "path": "pnpm", "args": ["dev:local"] }
  }
}
```

### 命令别名（~/.zshrc 或 ~/.bashrc）
```bash
alias home-dev="cd ~/Desktop/All\ in\ one\ Data/01_PROJECTS/home && pnpm dev"
alias home-local="cd ~/Desktop/All\ in\ one\ Data/01_PROJECTS/home && pnpm dev:local"
alias home-ssh="ssh finlaw"
```

---

## 📞 联系方式

- **作者**: 邓湘雷 / Xaiver / 灯下灯
- **邮箱**: light@xiangleideng.site
- **网站**: https://xiangleideng.site
- **GitHub**: https://github.com/Xaiver03

---

**最后更新**: 2026-06-21  
**版本**: 5.0.0
