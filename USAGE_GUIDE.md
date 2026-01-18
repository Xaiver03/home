# 🎉 Monorepo 使用指南
# Monorepo Usage Guide

**版本 / Version**: 1.0.0
**更新时间 / Last Updated**: 2026-01-18
**状态 / Status**: ✅ 迁移完成，可以使用

---

## 📦 快速开始 / Quick Start

### 1. 安装依赖 / Install Dependencies

```bash
# 进入项目目录
cd /Users/rocalight/Desktop/All\ in\ one\ Data/01_PROJECTS/home

# 安装所有依赖（首次运行可能需要 5-10 分钟）
pnpm install
```

### 2. 启动开发服务器 / Start Development Server

```bash
# 启动主页
pnpm dev:homepage

# 启动博客管理后台
pnpm dev:blog-admin

# 启动博客后端 API
pnpm dev:blog-api

# 启动博客前台
pnpm dev:blog-frontend

# 启动音乐 API
pnpm dev:music

# 同时启动所有项目（并行）
pnpm dev
```

### 3. 构建生产版本 / Build for Production

```bash
# 构建所有项目
pnpm build

# 构建单个项目
pnpm build:homepage
pnpm build:blog-admin
pnpm build:blog-frontend
```

---

## 📁 项目结构 / Project Structure

```
home/                           # Monorepo 根目录
├── apps/                       # 应用层（可独立部署）
│   ├── homepage/              # 主页 (Vue 3 + Vite)
│   │   ├── src/              # 源代码
│   │   ├── public/           # 静态资源
│   │   ├── package.json      # 依赖配置
│   │   └── vite.config.js    # Vite 配置
│   │
│   ├── blog-frontend/         # 博客前台 (Nuxt 3)
│   │   ├── pages/            # 页面
│   │   ├── components/       # 组件
│   │   └── nuxt.config.ts    # Nuxt 配置
│   │
│   ├── blog-admin/            # 博客管理后台 (Vue 3)
│   │   ├── src/              # 源代码
│   │   └── vue.config.js     # Vue CLI 配置
│   │
│   └── blog-api/              # 博客后端 (Express)
│       ├── routes/           # 路由
│       ├── controllers/      # 控制器
│       ├── models/           # 数据模型
│       └── services/         # 业务逻辑
│
├── services/                  # 服务层（独立服务）
│   └── music-api/            # 音乐 API (Hono)
│       └── src/              # 源代码
│
├── packages/                  # 共享包（内部依赖）
│   ├── shared-utils/         # 工具函数库
│   │   ├── src/
│   │   │   ├── common.js    # 通用工具
│   │   │   ├── date.js      # 日期处理
│   │   │   └── validators.js # 验证器
│   │   └── package.json
│   │
│   ├── shared-types/         # TypeScript 类型
│   │   └── src/index.ts
│   │
│   └── shared-config/        # 共享配置
│       └── package.json
│
├── pnpm-workspace.yaml        # Workspace 配置
├── package.json               # 根配置
├── .eslintrc.js              # ESLint 配置
├── .prettierrc               # Prettier 配置
└── .editorconfig             # EditorConfig 配置
```

---

## 🔧 常用命令 / Common Commands

### 开发命令 / Development

```bash
# 启动单个项目
pnpm dev:homepage        # 主页 (http://localhost:3000)
pnpm dev:blog-admin      # 博客管理后台 (http://localhost:8080)
pnpm dev:blog-api        # 博客 API (http://localhost:8085)
pnpm dev:blog-frontend   # 博客前台 (http://localhost:3001)
pnpm dev:music           # 音乐 API (http://localhost:3000)

# 启动所有项目（并行）
pnpm dev
```

### 构建命令 / Build

```bash
# 构建所有项目
pnpm build

# 构建单个项目
pnpm build:homepage
pnpm build:blog-admin
pnpm build:blog-frontend
pnpm build:blog-api      # 不需要构建，会输出提示
```

### 代码质量 / Code Quality

```bash
# 格式化所有代码
pnpm format

# 检查并修复代码问题
pnpm lint

# 清理构建产物
pnpm clean
```

### 部署命令 / Deployment

```bash
# 一键部署所有项目
pnpm deploy

# 预览生产构建
pnpm preview
```

---

## 📦 使用共享包 / Using Shared Packages

### 在项目中引用 shared-utils

```javascript
// 导入工具函数
import { debounce, throttle, formatFileSize } from '@xld/shared-utils';

// 导入日期函数
import { getCurrentTime, getTimeCapsule, formatDate } from '@xld/shared-utils';

// 导入验证器
import { isValidEmail, isValidPhone, validatePasswordStrength } from '@xld/shared-utils';

// 使用示例
const handleSearch = debounce((query) => {
  console.log('搜索:', query);
}, 300);

const currentTime = getCurrentTime();
console.log(currentTime); // { year, month, day, hour, minute, second, weekday }

const isValid = isValidEmail('test@example.com');
console.log(isValid); // true
```

### 在项目中引用 shared-types

```typescript
// 导入类型定义
import type { ApiResponse, PaginationParams, UserInfo } from '@xld/shared-types';

// 使用示例
const response: ApiResponse<UserInfo> = {
  code: 200,
  message: 'success',
  data: {
    id: 1,
    email: 'user@example.com',
    username: 'testuser'
  }
};
```

---

## 🔄 工作流程 / Workflow

### 1. 开发新功能

```bash
# 1. 创建新分支
git checkout -b feature/new-feature

# 2. 安装依赖（如果是首次）
pnpm install

# 3. 启动开发服务器
pnpm dev:homepage  # 或其他项目

# 4. 开发并测试

# 5. 提交代码
git add .
git commit -m "[Feature] 添加新功能"
git push origin feature/new-feature
```

### 2. 修复 Bug

```bash
# 1. 创建修复分支
git checkout -b fix/bug-description

# 2. 修复问题

# 3. 测试验证
pnpm dev:homepage

# 4. 提交代码
git add .
git commit -m "[Fix] 修复 XXX 问题"
git push origin fix/bug-description
```

### 3. 添加新的共享工具函数

```bash
# 1. 编辑 packages/shared-utils/src/common.js
# 添加新函数

# 2. 在 packages/shared-utils/src/index.js 中导出
export * from './common.js';

# 3. 在项目中使用
import { newFunction } from '@xld/shared-utils';

# 4. 提交代码
git add packages/shared-utils/
git commit -m "[Shared] 添加新的工具函数"
```

---

## 🚀 部署指南 / Deployment Guide

### 生产环境部署

```bash
# 1. 构建所有项目
pnpm build

# 2. 主页部署
# 构建产物在 apps/homepage/dist/
# 部署到 /var/www/xiangleideng.site (通过符号链接)

# 3. 博客系统部署
# 使用现有的部署脚本
bash deploy.sh

# 4. 验证部署
curl https://xiangleideng.site/
curl https://xiangleideng.site/blog
curl https://xiangleideng.site/mgmt
curl https://xiangleideng.site/api/
```

### 环境变量配置

```bash
# 主页环境变量
# 编辑根目录的 .env 文件

# 博客后端环境变量
# 编辑 apps/blog-api/config/pro.json

# 博客前台环境变量
# 编辑 apps/blog-frontend/.env.pro
```

---

## 🐛 故障排除 / Troubleshooting

### 问题 1: pnpm install 失败

```bash
# 解决方案 1: 清理缓存
pnpm store prune
rm -rf node_modules
pnpm install

# 解决方案 2: 使用国内镜像
pnpm config set registry https://registry.npmmirror.com

# 解决方案 3: 升级 pnpm
npm install -g pnpm@latest
```

### 问题 2: workspace 依赖无法解析

```bash
# 确认 pnpm-workspace.yaml 配置正确
cat pnpm-workspace.yaml

# 重新安装依赖
rm -rf node_modules
pnpm install
```

### 问题 3: 开发服务器启动失败

```bash
# 检查端口是否被占用
lsof -i :3000  # 主页端口
lsof -i :8080  # 博客管理后台端口
lsof -i :8085  # 博客 API 端口

# 杀死占用端口的进程
kill -9 <PID>

# 重新启动
pnpm dev:homepage
```

### 问题 4: 构建失败

```bash
# 清理构建产物
pnpm clean

# 重新构建
pnpm build:homepage

# 查看详细错误信息
cd apps/homepage
pnpm build
```

---

## 📚 可用的工具函数 / Available Utilities

### 通用工具 (common.js)

```javascript
import {
  debounce,           // 防抖函数
  throttle,           // 节流函数
  deepClone,          // 深拷贝
  randomString,       // 生成随机字符串
  formatFileSize,     // 格式化文件大小
  sleep,              // 延迟执行
  isMobile,           // 检测移动设备
  getUrlParam,        // 获取 URL 参数
} from '@xld/shared-utils';
```

### 日期工具 (date.js)

```javascript
import {
  getCurrentTime,     // 获取当前时间
  getTimeCapsule,     // 时光胶囊（进度条）
  getGreeting,        // 获取问候语
  siteDateStatistics, // 建站日期统计
  formatDate,         // 格式化日期
  getRelativeTime,    // 相对时间
  checkMemorialDay,   // 检查纪念日
} from '@xld/shared-utils';
```

### 验证器 (validators.js)

```javascript
import {
  isValidEmail,              // 邮箱验证
  isValidPhone,              // 手机号验证
  isValidUrl,                // URL 验证
  isValidIdCard,             // 身份证验证
  validatePasswordStrength,  // 密码强度
  isEmpty,                   // 检查是否为空
  isNumber,                  // 检查是否为数字
  isInteger,                 // 检查是否为整数
  isLengthInRange,          // 长度范围验证
} from '@xld/shared-utils';
```

---

## 🎯 最佳实践 / Best Practices

### 1. 代码组织

- ✅ 将可复用的工具函数放在 `packages/shared-utils`
- ✅ 将类型定义放在 `packages/shared-types`
- ✅ 每个应用保持独立，避免直接引用其他应用的代码

### 2. 依赖管理

- ✅ 使用 `workspace:*` 引用内部包
- ✅ 在根 package.json 中管理共享的 devDependencies
- ✅ 定期运行 `pnpm update` 更新依赖

### 3. 代码规范

- ✅ 提交前运行 `pnpm lint` 检查代码
- ✅ 使用 `pnpm format` 格式化代码
- ✅ 遵循 "Easy Commit, Easy Push" 原则

### 4. Git 提交

```bash
# 好的提交信息示例
git commit -m "[Feature] 添加用户登录功能"
git commit -m "[Fix] 修复主页加载缓慢问题"
git commit -m "[Refactor] 重构博客列表组件"
git commit -m "[Docs] 更新 README 文档"
git commit -m "[Style] 调整按钮样式"
```

---

## 📞 获取帮助 / Getting Help

### 文档资源

- **MIGRATION_COMPLETE.md** - 迁移完成报告
- **MIGRATION_PROGRESS.md** - 详细进度报告
- **PROJECT_RESTRUCTURE_PLAN.md** - 完整重构方案
- **CLAUDE.md** - 开发规范
- **apps/README.md** - 应用层说明
- **packages/README.md** - 共享包说明

### 常见问题

1. **如何添加新的应用？**
   - 在 `apps/` 目录创建新文件夹
   - 添加 package.json 并配置 name
   - 在根 package.json 添加对应的脚本

2. **如何添加新的共享包？**
   - 在 `packages/` 目录创建新文件夹
   - 添加 package.json，name 使用 `@xld/` 前缀
   - 在其他项目中使用 `workspace:*` 引用

3. **如何更新某个项目的依赖？**
   ```bash
   cd apps/homepage
   pnpm add <package-name>
   ```

---

## 🎊 总结 / Summary

你现在拥有一个完整的 Monorepo 架构：

✅ **5 个应用** - 统一管理，独立部署
✅ **3 个共享包** - 代码复用，提高效率
✅ **统一规范** - ESLint + Prettier + EditorConfig
✅ **清晰架构** - apps/services/packages 三层结构
✅ **完整文档** - 详细的使用指南和最佳实践

**开始使用：**
```bash
pnpm install
pnpm dev:homepage
```

**祝你开发愉快！** 🚀

---

**文档版本**: 1.0.0
**生成时间**: 2026-01-18
**维护者**: 灯下灯/Xaiver
