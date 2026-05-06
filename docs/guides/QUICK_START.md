# 🚀 快速开始指南

## 一键启动所有服务

```bash
pnpm dev
```

就这么简单！这个命令会启动：

| 服务 | 端口 | 颜色标签 | 访问地址 |
|------|------|----------|----------|
| 主页 | 3016 | 🔵 青色 | http://localhost:3016 |
| 博客前台 | 3001 | 🟢 绿色 | http://localhost:3001 |
| 博客管理后台 | 8080 | 🟣 洋红 | http://localhost:8080 |
| 博客 API | 8085 | 🟡 黄色 | http://localhost:8085 |
| 音乐 API | 3000 | 🔵 蓝色 | http://localhost:3000 |

---

## 其他常用命令

```bash
# 只启动前端（主页 + 博客前后台界面）
pnpm dev:frontend

# 只启动后端（博客 API + 音乐 API）
pnpm dev:backend

# 单独启动某个服务
pnpm dev:homepage        # 只启动主页
pnpm dev:blog-admin      # 只启动博客管理后台
pnpm dev:blog-frontend   # 只启动博客前台
pnpm dev:blog-api        # 只启动博客 API
pnpm dev:music           # 只启动音乐 API
```

---

## 停止服务

按 `Ctrl + C` 一次即可停止所有服务

---

## 构建生产版本

```bash
pnpm build
```

---

## 💡 提示

- 首次使用前确保已运行 `pnpm install`
- 确保已配置 `.env` 文件
- 确保 MySQL 和 Redis 服务正在运行
- 详细文档请查看 `DEV_COMMANDS.md`

---

**开始开发吧！** 🎉
