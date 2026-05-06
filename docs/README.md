# 项目文档中心

## 快速导航

- [开发指南](./guides/development.md)
- [部署指南](./guides/deployment.md)
- [环境变量说明](./guides/env-variables.md)
- [架构决策记录](./adr/)
- [历史文档归档](./archive/)

## 项目结构

```
home/
├── apps/
│   ├── homepage/        # 个人主页（Vue 3 + Vite）
│   ├── blog-admin/      # 博客管理后台（Vue 3 + Vite）
│   ├── blog-frontend/   # 博客前台（Nuxt 3 SSR）
│   └── blog-api/        # 博客 API（Express.js）
├── packages/
│   ├── shared-utils/    # 共享工具函数
│   ├── shared-config/   # 共享配置
│   └── shared-types/    # 共享类型定义
├── services/
│   └── music-api/       # 音乐 API 服务（Meting）
└── docs/                # 项目文档（本目录）
```

## 子项目说明

| 子项目 | 技术栈 | 端口 | 说明 |
|--------|--------|------|------|
| homepage | Vue 3 + Vite | 3015 | 个人主页 |
| blog-admin | Vue 3 + Vite | 8083 | 博客管理后台 |
| blog-frontend | Nuxt 3 SSR | 3004 | 博客前台 |
| blog-api | Express.js | 8086 | 博客 REST API |
| music-api | Node.js | 3005 | Meting 音乐 API |
