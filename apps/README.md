# Apps Directory / 应用目录

这个目录包含所有可独立部署的应用程序。

This directory contains all independently deployable applications.

## 应用列表 / Application List

### 📱 homepage
**个人主页应用 / Personal Homepage Application**

- **技术栈**: Vue 3 + Vite + Pinia + Element Plus
- **端口**: 3000 (dev)
- **构建输出**: `dist/`
- **部署**: 静态文件部署到 `/var/www/xiangleideng.site`

**开发命令**:
```bash
# 从根目录运行
pnpm dev:homepage

# 或进入目录运行
cd apps/homepage
pnpm dev
```

---

### 📝 blog-frontend
**博客前台应用 / Blog Frontend Application**

- **技术栈**: Nuxt 3 + Vue 3 + SSR
- **端口**: 3001 (dev)
- **路由**: `/blog`
- **状态**: 待迁移

---

### ⚙️ blog-admin
**博客管理后台 / Blog Admin Interface**

- **技术栈**: Vue 3 + Ant Design Vue + Vite
- **端口**: 8080 (dev)
- **路由**: `/mgmt`
- **状态**: 待迁移

---

### 🔌 blog-api
**博客后端 API / Blog Backend API**

- **技术栈**: Express.js + Node.js + MySQL + Redis
- **端口**: 8085
- **路由**: `/api/*`
- **状态**: 待迁移

---

## 开发规范 / Development Guidelines

### 1. 命名规范
- 应用名称使用小写字母和连字符
- package.json 中的 name 字段与目录名一致

### 2. 依赖管理
- 使用 `workspace:*` 引用内部共享包
- 示例: `"@xld/shared-utils": "workspace:*"`

### 3. 脚本规范
每个应用必须包含以下脚本：
- `dev`: 启动开发服务器
- `build`: 生产构建
- `preview`: 预览生产构建（可选）
- `clean`: 清理构建产物

### 4. 目录结构
```
apps/[app-name]/
├── src/              # 源代码
├── public/           # 静态资源
├── package.json      # 应用配置
├── vite.config.js    # 构建配置（如适用）
└── README.md         # 应用文档（可选）
```

### 5. 环境变量
- 使用根目录的 `.env` 文件
- 应用特定配置可在应用目录创建 `.env.local`

---

## 迁移状态 / Migration Status

- ✅ **homepage**: 已迁移并配置完成
- ⏳ **blog-frontend**: 待迁移
- ⏳ **blog-admin**: 待迁移
- ⏳ **blog-api**: 待迁移

---

## 相关文档 / Related Documentation

- [Monorepo 重构计划](../../PROJECT_RESTRUCTURE_PLAN.md)
- [迁移任务清单](../../MIGRATION_PLAN.json)
- [共享包文档](../../packages/README.md)
