# ADR 001: 采用 pnpm Workspace Monorepo 结构

**日期：** 2025-10-18  
**状态：** 已采纳

## 背景

项目最初由多个独立 git 仓库组成（homepage、blog-express、blog-nuxt3、blog-admin），各自独立管理依赖和配置，导致：
- 跨项目共享代码困难
- 依赖版本不一致
- 本地开发需要启动多个独立项目

## 决策

将所有子项目迁移到单一 pnpm workspace monorepo，结构为：
- `apps/` — 可部署的应用
- `packages/` — 共享内部包
- `services/` — 独立服务

## 理由

- pnpm workspace 原生支持内部包引用（`workspace:*`）
- 统一的依赖管理和版本锁定
- 单一 git 历史，便于追踪跨项目变更
- 根目录统一的 lint/format 配置

## 后果

- 所有子项目共享 `node_modules` 提升（pnpm 硬链接）
- 需要维护 `pnpm-workspace.yaml`
- 子项目构建工具需要兼容 monorepo 路径（已统一到 Vite）
