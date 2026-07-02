# 启动指南

## 🚀 一键启动所有服务

### 标准开发环境
```bash
pnpm dev
```

**访问地址**：
- 主页：http://localhost:3015
- 博客前台：http://localhost:3015/blog（通过代理）
- 博客管理：http://localhost:8083
- 博客 API：http://localhost:8086
- 音乐 API：http://localhost:3005

---

### 本地测试环境（推荐）
```bash
pnpm dev:local
```

**访问地址**：
- 主页：http://localhost （80 端口，需要 sudo）
- 博客前台：http://localhost/blog（通过代理到 3008）
- 博客 API：http://localhost:8086
- 音乐 API：http://localhost:3005

**注意**：
- 80 端口需要 sudo 权限：`sudo pnpm dev:local`
- 如果不想用 sudo，可以修改为其他端口（见下方）

---

## 📝 服务说明

### 代理配置
homepage（主页）会自动代理以下路径：

| 路径 | 代理目标 | 说明 |
|------|---------|------|
| `/blog` | `http://localhost:3008` (本地测试) 或 `http://localhost:3004` (开发) | 博客前台 |
| `/api` | `http://localhost:8086` | 博客 API |
| `/music` | `http://localhost:3005` | 音乐 API |
| `/mgmt` | `http://localhost:8083` | 博客管理后台 |

这意味着：
- 访问 `http://localhost/blog` = 访问博客前台
- 访问 `http://localhost/api` = 访问博客 API

---

## 🔧 如果不想使用 80 端口

### 方法 1：使用 3000 端口
```bash
# 编辑 .env.local
VITE_HOMEPAGE_PORT=3000  # 改为 3000 或其他端口

# 然后启动
pnpm dev:local

# 访问
http://localhost:3000
http://localhost:3000/blog
```

### 方法 2：使用标准开发环境
```bash
# 使用标准端口（无需 sudo）
pnpm dev

# 访问
http://localhost:3015
http://localhost:3015/blog
```

---

## 🐛 常见问题

### Q1: 启动后 http://localhost/blog 404
**原因**：博客前台服务没有启动，或端口不对

**解决**：
1. 检查 `pnpm dev:local` 是否同时启动了 4 个服务
2. 确认博客前台运行在 3008 端口
3. 查看终端是否有错误信息

### Q2: 80 端口需要 sudo
**解决方案**：
```bash
# 使用 sudo 启动
sudo pnpm dev:local

# 或修改端口（见上方）
```

### Q3: 端口被占用
**解决**：
```bash
# 查看端口占用
lsof -i :80
lsof -i :3008
lsof -i :8086

# 杀死占用进程
kill -9 <PID>
```

---

## 📊 服务启动顺序

`pnpm dev:local` 会并行启动：

1. **homepage** (80 端口) - 主页 + 代理服务器
2. **blog-frontend** (3008 端口) - 博客前台（Nuxt3 SSR）
3. **blog-api** (8086 端口) - 博客 API（Express）
4. **music-api** (3005 端口) - 音乐 API（Hono）

所有服务都启动成功后，访问 `http://localhost/blog` 就能看到博客了。

---

## ✅ 启动检查清单

启动后检查以下内容：

- [ ] 终端显示 4 个服务都启动成功
- [ ] 没有端口冲突错误
- [ ] 访问 http://localhost 能看到主页
- [ ] 访问 http://localhost/blog 能看到博客
- [ ] 浏览器控制台没有 404 错误

---

## 🔗 快速测试

```bash
# 1. 启动所有服务
sudo pnpm dev:local

# 2. 等待所有服务启动完成（约 10-30 秒）

# 3. 测试访问
curl http://localhost              # 主页
curl http://localhost/blog         # 博客（应该返回 HTML）
curl http://localhost/api/configuration/reception/getConfig  # API

# 4. 浏览器访问
open http://localhost
open http://localhost/blog
```

---

**最后更新**：2026-06-21
