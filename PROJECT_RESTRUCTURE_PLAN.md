# 项目重构方案 - Monorepo 统一架构

## 📊 当前项目结构分析

### 现状问题

你的项目确实是**多个独立项目拼凑**而成，存在以下问题：

```
当前结构（混乱）:
home/
├── package.json              # 主页项目 (Vue3 + Vite)
├── src/                      # 主页源码
├── blog/
│   ├── admin/               # 博客管理后台 (Vue3 + Vue CLI)
│   │   └── package.json     # 独立依赖
│   ├── space-log-express/   # 博客后端 (Express)
│   │   └── package.json     # 独立依赖
│   └── space-log-nuxt3/     # 博客前台 (Nuxt3)
│       └── package.json     # 独立依赖
└── music/
    └── Meting-API/          # 音乐 API (Hono)
        └── package.json     # 独立依赖
```

**核心问题：**
1. ❌ **5 个独立的 package.json**，依赖管理混乱
2. ❌ **3 个不同的构建工具**：Vite、Vue CLI、Nuxt
3. ❌ **重复依赖**：axios、dayjs 等在多个项目中重复安装
4. ❌ **不同的代码规范**：ESLint 配置不统一
5. ❌ **部署脚本分散**：每个子项目独立部署
6. ❌ **无法共享代码**：工具函数、类型定义无法复用
7. ❌ **开发体验差**：需要在多个目录间切换

---

## 🎯 推荐方案：Monorepo 架构

基于你的技术栈（Vue3 + Express + Nuxt3），推荐使用 **pnpm workspaces** 实现 Monorepo。

### 为什么选择 Monorepo？

✅ **统一依赖管理**：一个 `pnpm install` 安装所有依赖
✅ **代码共享**：共享工具函数、类型定义、配置
✅ **统一构建**：一键构建所有子项目
✅ **版本一致性**：确保所有项目使用相同版本的共享依赖
✅ **更好的 TypeScript 支持**：跨项目类型推导
✅ **简化 CI/CD**：统一的部署流程

---

## 📁 推荐的新项目结构

```
home/                                    # Monorepo 根目录
├── package.json                         # 根 package.json (workspaces 配置)
├── pnpm-workspace.yaml                  # pnpm workspaces 配置
├── .env.example                         # 环境变量模板
├── .gitignore                           # 统一的 Git 忽略规则
├── tsconfig.base.json                   # 共享的 TypeScript 配置
├── .eslintrc.js                         # 统一的 ESLint 配置
├── .prettierrc                          # 统一的代码格式化配置
│
├── apps/                                # 应用层（可独立部署的应用）
│   ├── homepage/                        # 主页应用
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── index.html
│   │   ├── public/
│   │   └── src/
│   │       ├── App.vue
│   │       ├── main.js
│   │       ├── components/
│   │       ├── views/
│   │       ├── store/
│   │       └── api/
│   │
│   ├── blog-frontend/                   # 博客前台 (Nuxt3)
│   │   ├── package.json
│   │   ├── nuxt.config.ts
│   │   ├── app.vue
│   │   ├── pages/
│   │   ├── components/
│   │   └── composables/
│   │
│   ├── blog-admin/                      # 博客管理后台
│   │   ├── package.json
│   │   ├── vite.config.js               # 迁移到 Vite
│   │   ├── index.html
│   │   └── src/
│   │       ├── App.vue
│   │       ├── main.js
│   │       ├── views/
│   │       ├── components/
│   │       └── router/
│   │
│   └── blog-api/                        # 博客后端 API
│       ├── package.json
│       ├── src/
│       │   ├── app.js
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── models/
│       │   ├── routes/
│       │   ├── middlewares/
│       │   └── services/
│       └── bin/
│           └── www
│
├── services/                            # 独立服务
│   └── music-api/                       # 音乐 API 服务
│       ├── package.json
│       ├── node.js
│       └── src/
│
├── packages/                            # 共享包（内部依赖）
│   ├── shared-utils/                    # 共享工具函数
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── date.js
│   │   │   ├── request.js
│   │   │   └── validators.js
│   │   └── dist/
│   │
│   ├── shared-types/                    # 共享 TypeScript 类型
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── api.ts
│   │   │   └── models.ts
│   │   └── dist/
│   │
│   └── shared-config/                   # 共享配置
│       ├── package.json
│       ├── eslint.js
│       ├── prettier.js
│       └── vite.js
│
├── scripts/                             # 统一的脚本
│   ├── deploy.sh                        # 统一部署脚本
│   ├── build-all.sh                     # 构建所有项目
│   └── dev.sh                           # 启动所有开发服务器
│
├── docs/                                # 文档
│   ├── CLAUDE.md
│   ├── README.md
│   └── API.md
│
└── public/                              # 共享静态资源
    ├── images/
    └── fonts/
```

---

## 🔧 核心配置文件

### 1. 根目录 `package.json`

```json
{
  "name": "xiangleideng-monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "邓湘雷的个人主页 + 博客系统 Monorepo",
  "author": "灯下灯/Xaiver",
  "license": "MIT",
  "scripts": {
    "dev": "pnpm --filter \"./apps/**\" --parallel dev",
    "dev:homepage": "pnpm --filter homepage dev",
    "dev:blog-admin": "pnpm --filter blog-admin dev",
    "dev:blog-api": "pnpm --filter blog-api serve:dev",
    "dev:music": "pnpm --filter music-api start:node",

    "build": "pnpm --filter \"./apps/**\" --filter \"./services/**\" build",
    "build:homepage": "pnpm --filter homepage build",
    "build:blog-admin": "pnpm --filter blog-admin build",
    "build:blog-frontend": "pnpm --filter blog-frontend build",

    "lint": "eslint . --ext .js,.jsx,.ts,.tsx,.vue --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,vue,json,md}\"",
    "clean": "pnpm --filter \"./apps/**\" --filter \"./packages/**\" clean",
    "deploy": "bash scripts/deploy.sh"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "eslint": "^8.57.0",
    "eslint-plugin-vue": "^9.25.0",
    "prettier": "^3.2.5",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### 2. `pnpm-workspace.yaml`

```yaml
packages:
  # 应用层
  - 'apps/*'
  # 服务层
  - 'services/*'
  # 共享包
  - 'packages/*'
```

### 3. 各子项目的 `package.json` 示例

#### `apps/homepage/package.json`

```json
{
  "name": "homepage",
  "version": "4.2.0",
  "private": true,
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@worstone/vue-aplayer": "^1.0.6",
    "element-plus": "^2.7.1",
    "pinia": "^2.1.7",
    "vue": "^3.4.24",
    "@xld/shared-utils": "workspace:*"  // 引用共享包
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.6.2",
    "vite": "^4.5.3"
  }
}
```

#### `apps/blog-api/package.json`

```json
{
  "name": "blog-api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "serve:dev": "cross-env NODE_ENV=dev nodemon ./bin/www",
    "serve:pro": "cross-env NODE_ENV=pro node ./bin/www"
  },
  "dependencies": {
    "express": "^4.18.0",
    "mysql2": "^3.10.1",
    "redis": "^4.7.0",
    "@xld/shared-utils": "workspace:*",  // 引用共享包
    "@xld/shared-types": "workspace:*"
  }
}
```

#### `packages/shared-utils/package.json`

```json
{
  "name": "@xld/shared-utils",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "axios": "^1.6.8",
    "dayjs": "^1.11.10"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

---

## 🚀 迁移步骤（分阶段实施）

### 阶段 1：准备工作（1-2 小时）

```bash
# 1. 创建新的目录结构
mkdir -p apps/{homepage,blog-frontend,blog-admin,blog-api}
mkdir -p services/music-api
mkdir -p packages/{shared-utils,shared-types,shared-config}
mkdir -p scripts docs

# 2. 创建 pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'services/*'
  - 'packages/*'
EOF

# 3. 备份当前项目
cp -r . ../home-backup
```

### 阶段 2：迁移主页项目（30 分钟）

```bash
# 移动主页文件
mv src apps/homepage/
mv public apps/homepage/
mv index.html apps/homepage/
mv vite.config.js apps/homepage/

# 更新 package.json
mv package.json apps/homepage/
# 手动编辑 apps/homepage/package.json，添加 "name": "homepage"
```

### 阶段 3：迁移博客系统（1 小时）

```bash
# 移动博客后端
mv blog/space-log-express/* apps/blog-api/

# 移动博客管理后台
mv blog/admin/* apps/blog-admin/

# 移动博客前台
mv blog/space-log-nuxt3/* apps/blog-frontend/
```

### 阶段 4：迁移音乐 API（15 分钟）

```bash
# 移动音乐 API
mv music/Meting-API/* services/music-api/
```

### 阶段 5：创建共享包（1 小时）

```bash
# 创建共享工具包
cd packages/shared-utils
pnpm init
# 提取公共工具函数（axios 封装、日期处理等）

# 创建共享类型包
cd ../shared-types
pnpm init
# 定义共享的 TypeScript 类型
```

### 阶段 6：统一配置（30 分钟）

```bash
# 创建根 package.json
# 创建统一的 ESLint、Prettier 配置
# 更新所有子项目的依赖引用
```

### 阶段 7：测试与验证（1 小时）

```bash
# 安装所有依赖
pnpm install

# 测试各个项目
pnpm dev:homepage
pnpm dev:blog-admin
pnpm dev:blog-api

# 测试构建
pnpm build
```

---

## 📦 依赖优化建议

### 可以提取到共享包的依赖

```json
{
  "共享依赖": {
    "axios": "^1.7.2",        // HTTP 客户端
    "dayjs": "^1.11.13",      // 日期处理
    "lodash-es": "^4.17.21"   // 工具函数
  },
  "前端共享": {
    "vue": "^3.4.30",         // 统一 Vue 版本
    "pinia": "^2.1.7"         // 状态管理
  }
}
```

### 可以移除的重复依赖

- ❌ `axios` 在 4 个项目中重复
- ❌ `dayjs` 在 3 个项目中重复
- ❌ `eslint` 配置分散在各个项目

---

## 🎨 统一开发体验

### 统一的命令

```bash
# 开发
pnpm dev                    # 启动所有项目
pnpm dev:homepage           # 只启动主页
pnpm dev:blog-admin         # 只启动博客管理后台

# 构建
pnpm build                  # 构建所有项目
pnpm build:homepage         # 只构建主页

# 代码质量
pnpm lint                   # 检查所有代码
pnpm format                 # 格式化所有代码

# 部署
pnpm deploy                 # 一键部署所有项目
```

### 统一的开发工具

- **构建工具**：统一使用 Vite（将 blog-admin 从 Vue CLI 迁移到 Vite）
- **包管理器**：统一使用 pnpm
- **代码规范**：统一的 ESLint + Prettier 配置
- **TypeScript**：逐步引入 TypeScript

---

## 🔄 迁移到 Vite（blog-admin）

### 为什么要迁移？

- ✅ Vue CLI 已停止维护
- ✅ Vite 构建速度更快（10x+）
- ✅ 更好的 HMR（热模块替换）
- ✅ 与主页项目保持一致

### 迁移步骤

```bash
# 1. 安装 Vite 依赖
cd apps/blog-admin
pnpm add -D vite @vitejs/plugin-vue

# 2. 创建 vite.config.js
# 3. 创建 index.html
# 4. 更新 package.json scripts
# 5. 移除 Vue CLI 依赖
pnpm remove @vue/cli-service @vue/cli-plugin-*
```

---

## 📊 预期收益

### 开发效率提升

- ⚡ **安装速度**：5 个项目独立安装 → 1 次安装（节省 70% 时间）
- ⚡ **构建速度**：Vite 比 Vue CLI 快 10 倍以上
- ⚡ **代码共享**：工具函数、类型定义可复用

### 维护成本降低

- 📉 **依赖管理**：统一版本，减少冲突
- 📉 **配置文件**：从 15+ 个配置文件减少到 5 个
- 📉 **部署复杂度**：一个脚本部署所有项目

### 代码质量提升

- ✅ 统一的代码规范
- ✅ 更好的 TypeScript 支持
- ✅ 跨项目类型检查

---

## 🛠️ 工具推荐

### Monorepo 管理工具对比

| 工具 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **pnpm workspaces** | 简单、快速、节省磁盘空间 | 功能相对基础 | ⭐⭐⭐⭐⭐ |
| Turborepo | 智能缓存、并行构建 | 配置复杂 | ⭐⭐⭐⭐ |
| Nx | 功能强大、可视化工具 | 学习曲线陡峭 | ⭐⭐⭐ |
| Lerna | 老牌工具 | 已停止维护 | ⭐⭐ |

**推荐：pnpm workspaces**（你已经在使用 pnpm，迁移成本最低）

---

## 📝 下一步行动

### 立即可做（低风险）

1. ✅ 创建 `pnpm-workspace.yaml`
2. ✅ 创建 `packages/shared-utils` 提取公共函数
3. ✅ 统一 ESLint 和 Prettier 配置

### 短期计划（1-2 周）

1. 🔄 将 blog-admin 从 Vue CLI 迁移到 Vite
2. 🔄 重组目录结构（apps/services/packages）
3. 🔄 创建统一的部署脚本

### 长期计划（1-2 月）

1. 📈 引入 TypeScript
2. 📈 添加单元测试
3. 📈 优化 CI/CD 流程

---

## 🎯 总结

你的项目确实是多个独立项目拼凑而成，存在明显的架构问题。通过迁移到 **Monorepo 架构**，可以：

✅ **统一管理**：一个仓库管理所有代码
✅ **代码复用**：共享工具函数和类型定义
✅ **提升效率**：统一的开发和部署流程
✅ **降低成本**：减少重复依赖和配置

**推荐方案：pnpm workspaces + Vite + 分层架构（apps/services/packages）**

---

## 📚 参考资源

- [pnpm Workspaces 官方文档](https://pnpm.io/workspaces)
- [Monorepo 最佳实践](https://monorepo.tools/)
- [Vite 官方文档](https://vitejs.dev/)
- [Vue 3 + TypeScript 指南](https://vuejs.org/guide/typescript/overview.html)

---

**需要我帮你开始迁移吗？我可以：**

1. 生成完整的配置文件
2. 创建迁移脚本
3. 逐步指导迁移过程
4. 解决迁移中的问题

请告诉我你想从哪一步开始！🚀
