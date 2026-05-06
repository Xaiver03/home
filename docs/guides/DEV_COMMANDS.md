# 开发命令指南

## 🚀 一键启动所有服务

```bash
# 启动所有服务（主页 + 博客前后台 + 音乐 API）
pnpm dev

# 或者使用别名
pnpm dev:all
```

这个命令会同时启动：
- ✅ **主页** (homepage) - http://localhost:3016 - 青色标签
- ✅ **博客管理后台** (blog-admin) - http://localhost:8080 - 洋红色标签
- ✅ **博客前台** (blog-frontend) - http://localhost:3001 - 绿色标签
- ✅ **博客 API** (blog-api) - http://localhost:8085 - 黄色标签
- ✅ **音乐 API** (music-api) - http://localhost:3000 - 蓝色标签

---

## 📦 分组启动

### 只启动前端服务
```bash
pnpm dev:frontend
```
启动：主页 + 博客管理后台 + 博客前台

### 只启动后端服务
```bash
pnpm dev:backend
```
启动：博客 API + 音乐 API

---

## 🎯 单独启动服务

```bash
# 主页
pnpm dev:homepage

# 博客管理后台
pnpm dev:blog-admin

# 博客前台
pnpm dev:blog-frontend

# 博客 API
pnpm dev:blog-api

# 音乐 API
pnpm dev:music
```

---

## 🏗️ 构建命令

```bash
# 构建所有项目
pnpm build

# 单独构建
pnpm build:homepage
pnpm build:blog-admin
pnpm build:blog-frontend
```

---

## 🔧 其他命令

```bash
# 代码检查和修复
pnpm lint

# 代码格式化
pnpm format

# 清理所有构建产物
pnpm clean

# 部署到生产环境
pnpm deploy
```

---

## 📊 服务端口映射

| 服务 | 端口 | 访问地址 |
|------|------|----------|
| 主页 | 3016 | http://localhost:3016 |
| 博客前台 | 3001 | http://localhost:3001 |
| 博客管理后台 | 8080 | http://localhost:8080 |
| 博客 API | 8085 | http://localhost:8085 |
| 音乐 API | 3000 | http://localhost:3000 |

---

## 💡 使用技巧

### 1. 彩色日志输出
使用 `concurrently` 工具，每个服务都有不同颜色的日志标签，方便区分：
- 🔵 青色 (cyan) - 主页
- 🟣 洋红色 (magenta) - 博客管理后台
- 🟢 绿色 (green) - 博客前台
- 🟡 黄色 (yellow) - 博客 API
- 🔵 蓝色 (blue) - 音乐 API

### 2. 停止所有服务
按 `Ctrl + C` 一次即可停止所有服务

### 3. 查看特定服务日志
日志会带有服务名称前缀，例如：
```
[homepage] VITE v5.0.0 ready in 500 ms
[blog-api] Server running on port 8085
[music-api] Meting API started on port 3000
```

### 4. 开发建议
- **首次启动**：使用 `pnpm dev` 启动所有服务，确保整个系统正常工作
- **前端开发**：使用 `pnpm dev:frontend` 只启动前端服务，节省资源
- **后端开发**：使用 `pnpm dev:backend` 只启动后端服务
- **单一服务调试**：使用 `pnpm dev:xxx` 启动特定服务

---

## ⚠️ 常见问题

### 端口被占用
如果某个端口被占用，可以：
1. 停止占用端口的进程
2. 或修改对应服务的端口配置

### 服务启动失败
1. 检查依赖是否安装：`pnpm install`
2. 检查环境变量配置：`.env` 文件
3. 查看具体服务的错误日志

### 数据库连接失败
确保 MySQL 和 Redis 服务正在运行：
```bash
# 检查 MySQL
sudo systemctl status mysql

# 检查 Redis
sudo systemctl status redis
```

---

## 🎉 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 3. 启动所有服务
pnpm dev

# 4. 访问服务
# 主页: http://localhost:3016
# 博客: http://localhost:3001
# 管理后台: http://localhost:8080
```

---

**享受开发！** 🚀
