# 开发指南

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动所有服务（开发模式）
pnpm dev

# 只启动前端服务
pnpm dev:frontend

# 只启动后端服务
pnpm dev:backend
```

## 各子项目独立启动

| 命令 | 服务 | 端口 |
|------|------|------|
| `pnpm dev:homepage` | 个人主页 | 3015 |
| `pnpm dev:blog-admin` | 博客管理后台 | 8083 |
| `pnpm dev:blog-frontend` | 博客前台 | 3004 |
| `pnpm dev:blog-api` | 博客 API | 8086 |
| `pnpm dev:music` | 音乐 API | 3005 |

## 环境变量配置

各子项目需要配置环境变量才能正常运行，详见 [环境变量说明](./env-variables.md)。

## 代码规范

- ESLint 配置：根目录 `.eslintrc.js`
- Prettier 配置：根目录 `.prettierrc`
- 格式化：`pnpm format`
- Lint 检查：`pnpm lint`

## 提交规范

遵循 "Easy Commit, Easy Push" 原则：

```bash
git commit -m "[Phase X.Y] 任务描述"
git push origin dev
```

## 项目结构说明

```
home/
├── apps/           # 可部署的应用
├── packages/       # 共享包（内部依赖）
├── services/       # 独立服务
├── docs/           # 项目文档
└── scripts/        # 部署脚本
```
