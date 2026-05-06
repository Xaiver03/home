# 项目文档中心

## 快速导航

### 开发参考
- [开发命令速查](./guides/DEV_COMMANDS.md)
- [快速开始](./guides/QUICK_START.md)
- [Monorepo 说明](./guides/README_MONOREPO.md)
- [PWA 更新指南](./guides/PWA_UPDATE_GUIDE.md)

### 开发与部署
- [开发指南](./guides/development.md)
- [部署指南](./guides/deployment.md)
- `docs/guides/env-variables.md` — 环境变量说明（Task 6 创建）

### 架构决策记录
- [ADR 001: 采用 pnpm Workspace Monorepo 结构](./adr/001-monorepo-structure.md)

### 历史文档归档
- [历史文档](./archive/)

---

## 项目结构

```
home/
├── apps/
│   ├── homepage/        # 个人主页（Vue 3 + Vite，端口 3015）
│   ├── blog-admin/      # 博客管理后台（Vue 3 + vue-cli，端口 8083）
│   ├── blog-frontend/   # 博客前台（Nuxt 3 SSR，端口 3004）
│   └── blog-api/        # 博客 API（Express.js，端口 8086）
├── packages/
│   ├── shared-utils/    # 共享工具函数
│   ├── shared-config/   # 共享配置
│   └── shared-types/    # 共享类型定义
├── services/
│   └── music-api/       # 音乐 API 服务（Meting，端口 3005）
└── docs/                # 项目文档（本目录）
    ├── guides/          # 开发/部署指南
    ├── adr/             # 架构决策记录
    ├── plans/           # 实施计划
    └── archive/         # 历史文档归档
```

## 子项目说明

| 子项目 | 技术栈 | 开发端口 | 说明 |
|--------|--------|----------|------|
| homepage | Vue 3 + Vite | 3015 | 个人主页 |
| blog-admin | Vue 3 + vue-cli | 8083 | 博客管理后台 |
| blog-frontend | Nuxt 3 SSR | 3004 | 博客前台 |
| blog-api | Express.js | 8086 | 博客 REST API |
| music-api | Node.js (Meting) | 3005 | 音乐 API 代理 |

> 注：生产环境端口见 CLAUDE.md 中的部署架构说明。
