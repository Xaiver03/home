# ==========================================
# 本地测试环境启动指南
# ==========================================

## 快速启动

### 启动本地测试环境（推荐）
使用固定端口 80 和 3008 进行本地测试：

```bash
# 启动所有服务（本地测试端口配置）
pnpm dev:local
```

**本地测试端口分配：**
- 主页：http://localhost （80 端口）
- 博客前台：http://localhost:3008
- 博客 API：http://localhost:8086
- 音乐 API：http://localhost:3005

### 启动开发环境（默认）
使用标准开发端口：

```bash
# 启动所有服务（开发环境端口）
pnpm dev
```

**开发环境端口分配：**
- 主页：http://localhost:3015
- 博客前台：http://localhost:3004
- 博客管理后台：http://localhost:8083
- 博客 API：http://localhost:8086
- 音乐 API：http://localhost:3005

## 单独启动服务

### 本地测试环境
```bash
# 主页（80 端口）
pnpm dev:homepage:local

# 博客前台（3008 端口）
pnpm dev:blog-frontend:local

# 博客 API（8086 端口）
pnpm dev:blog-api:local

# 音乐 API（3005 端口）
pnpm dev:music:local
```

### 开发环境
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

## 环境配置文件

- **本地测试**：`.env.local` + `apps/blog-api/config/local.json`
- **开发环境**：`.env.dev` + `apps/blog-api/config/dev.json`
- **生产环境**：`.env` + `apps/blog-api/config/pro.json`

## 注意事项

1. **80 端口权限**：
   - macOS/Linux 可能需要 sudo 权限启动 80 端口
   - 如遇权限问题，可以修改 `.env.local` 中的 `VITE_HOMEPAGE_PORT` 为 3015 或其他端口

2. **端口冲突**：
   - 确保目标端口未被占用
   - 使用 `lsof -i :端口号` 检查端口占用情况

3. **代理配置**：
   - homepage 的 Vite 配置会自动代理 `/blog`、`/api`、`/music`、`/mgmt` 路径
   - 代理目标端口会根据环境变量自动调整

4. **数据库配置**：
   - 本地测试使用空密码的 MySQL
   - 确保本地 MySQL 服务已启动
   - 数据库名：`space_log_blog`

## 测试流程

1. 启动本地测试环境：
   ```bash
   pnpm dev:local
   ```

2. 访问测试地址：
   - 主页：http://localhost
   - 博客：http://localhost:3008

3. 检查功能：
   - 主页导航链接
   - 音乐播放器
   - 博客文章列表
   - API 接口调用
