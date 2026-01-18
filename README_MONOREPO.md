# 🎉 邓湘雷の主页 + 博客系统 Monorepo

**版本**: 5.0.0 (Monorepo)
**状态**: ✅ 生产就绪
**架构**: Monorepo (pnpm workspaces)

---

## 📦 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/Xaiver03/home.git
cd home

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev:homepage        # 主页
pnpm dev:blog-admin      # 博客管理后台
pnpm dev:blog-api        # 博客后端
pnpm dev:blog-frontend   # 博客前台
pnpm dev:music           # 音乐 API

# 4. 构建生产版本
pnpm build
```

---

## 🏗️ 项目结构

```
home/                    # Monorepo 根目录
├── apps/               # 应用层（5个应用）
│   ├── homepage/       # 主页 (Vue 3 + Vite)
│   ├── blog-frontend/  # 博客前台 (Nuxt 3)
│   ├── blog-admin/     # 博客管理后台 (Vue 3)
│   └── blog-api/       # 博客后端 (Express)
├── services/           # 服务层（1个服务）
│   └── music-api/      # 音乐 API (Hono)
└── packages/           # 共享包（3个包）
    ├── shared-utils/   # 工具函数库 (26+ 函数)
    ├── shared-types/   # TypeScript 类型
    └── shared-config/  # 共享配置
```

---

## 📚 完整文档

- **[USAGE_GUIDE.md](./USAGE_GUIDE.md)** - 使用指南
- **[FINAL_SUMMARY.md](./FINAL_SUMMARY.md)** - 最终总结
- **[MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)** - 迁移完成报告
- **[PROJECT_RESTRUCTURE_PLAN.md](./PROJECT_RESTRUCTURE_PLAN.md)** - 重构方案
- **[CLAUDE.md](./CLAUDE.md)** - 开发规范

---

## 🎁 核心特性

- ✅ **统一依赖管理** - pnpm workspaces
- ✅ **代码复用** - 26+ 个共享工具函数
- ✅ **规范统一** - ESLint + Prettier + EditorConfig
- ✅ **清晰架构** - apps/services/packages 三层结构
- ✅ **完整文档** - 8 个详细文档

---

## 🚀 技术栈

### 主页
- Vue 3 + Vite + Pinia + Element Plus

### 博客系统
- **前台**: Nuxt 3 + SSR
- **后台**: Vue 3 + Ant Design Vue
- **API**: Express + MySQL + Redis

### 音乐 API
- Hono + Node.js

---

## 📞 联系方式

- **作者**: 灯下灯/Xaiver
- **主页**: https://xiangleideng.site
- **GitHub**: https://github.com/Xaiver03

---

**🎊 Monorepo 迁移于 2026-01-18 完成**
