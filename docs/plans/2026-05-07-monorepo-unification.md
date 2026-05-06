# Monorepo 统一重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将现有由多个独立项目拼凑的 monorepo 重构为一个结构清晰、统一管理的单一项目，消除技术债务，统一工具链，建立 docs 文档管理体系。

**Architecture:** 保留 pnpm workspace monorepo 结构，但统一所有子项目的构建工具（homepage/blog-admin 统一迁移到 Vite，blog-frontend 保持 Nuxt3，blog-api 保持 Express），清理根目录的历史文档垃圾，建立 `docs/` 目录作为唯一文档中心，统一 ESLint/Prettier 配置，统一环境变量管理。

**Tech Stack:** pnpm workspace, Vite 5, Vue 3, Nuxt 3, Express.js, Node.js 18+

---

## 当前状态分析

### 项目结构（现状）
```
home/
├── apps/
│   ├── homepage/        # Vue 3 + Vite（正常）
│   ├── blog-admin/      # Vue 3 + vue-cli-service（老旧，需迁移到 Vite）
│   ├── blog-frontend/   # Nuxt 3（正常，但 nuxt.config.ts 有硬编码 Bokey 信息）
│   └── blog-api/        # Express.js（正常）
├── packages/
│   ├── shared-utils/    # 共享工具（正常）
│   ├── shared-config/   # 共享配置（基本空）
│   └── shared-types/    # 共享类型（基本空）
├── services/
│   └── music-api/       # Meting API（正常）
├── docs/                # 新建，文档中心
└── [大量历史 .md 文件]   # 需要清理到 docs/
```

### 主要问题
1. **blog-admin 使用 vue-cli-service**（已废弃工具），需迁移到 Vite
2. **根目录有 15+ 个历史 .md 文件**（MIGRATION_*.md, STATUS_*.md 等），需整理到 docs/
3. **blog-frontend nuxt.config.ts 有硬编码的 "Bokey" 信息**，需替换为项目配置
4. **缺少统一的 docs 文档管理**
5. **blog-admin 使用 vuex**（Vue 2 时代），应迁移到 pinia（但这是大工程，本计划暂不做）

---

## Task 1: 建立 docs 目录结构

**目标：** 创建统一的文档管理目录，将根目录历史文档归档

**Files:**
- Create: `docs/README.md`
- Create: `docs/archive/` (目录)
- Create: `docs/guides/` (目录)
- Move: 根目录所有历史 .md 文件 → `docs/archive/`

**Step 1: 创建 docs 目录结构**

```bash
mkdir -p docs/archive docs/guides docs/plans docs/adr
```

**Step 2: 创建 docs/README.md 索引**

内容见下方代码块。

**Step 3: 将根目录历史文档移入 archive**

```bash
# 移动所有历史迁移/状态文档
git mv MIGRATION_COMPLETE.md docs/archive/
git mv MIGRATION_FINAL.md docs/archive/
git mv MIGRATION_PLAN.json docs/archive/
git mv MIGRATION_PROGRESS.md docs/archive/
git mv PROJECT_RESTRUCTURE_PLAN.md docs/archive/
git mv FINAL_SUMMARY.md docs/archive/
git mv STATUS_REPORT.md docs/archive/
git mv CURRENT_STATUS.md docs/archive/
git mv SUCCESS.md docs/archive/
git mv TROUBLESHOOTING.md docs/archive/
git mv USAGE_GUIDE.md docs/archive/
git mv DEV_COMMANDS.md docs/guides/
git mv QUICK_START.md docs/guides/
git mv README_MONOREPO.md docs/guides/
git mv PWA_UPDATE_GUIDE.md docs/guides/
```

**Step 4: 提交**

```bash
git add docs/
git commit -m "[Phase 1.1] 建立 docs 目录结构，归档历史文档"
git push origin dev
```

---

## Task 2: 清理根目录，统一 .md 文件

**目标：** 根目录只保留必要文件（README.md, CLAUDE.md, LICENSE, AGENTS.md）

**Files:**
- Keep: `README.md`, `CLAUDE.md`, `LICENSE`, `AGENTS.md`
- Move: 其余 .md 文件到 `docs/`

**Step 1: 检查根目录剩余 .md 文件**

```bash
ls *.md
```

**Step 2: 更新根目录 README.md**

更新 README.md，添加指向 `docs/` 的链接，说明文档已迁移。

**Step 3: 提交**

```bash
git add -A
git commit -m "[Phase 1.2] 清理根目录，统一文档到 docs/"
git push origin dev
```

---

## Task 3: 迁移 blog-admin 从 vue-cli 到 Vite

**目标：** 将 `apps/blog-admin` 从废弃的 `@vue/cli-service` 迁移到 Vite 5

**背景：** vue-cli-service 已停止维护，且与 monorepo 的 pnpm workspace 集成差。Vite 是 Vue 3 官方推荐工具链。

**Files:**
- Modify: `apps/blog-admin/package.json`
- Create: `apps/blog-admin/vite.config.js`
- Create: `apps/blog-admin/index.html`（Vite 需要根目录 index.html）
- Delete: `apps/blog-admin/vue.config.js`（如存在）
- Delete: `apps/blog-admin/babel.config.js`（如存在）

**Step 1: 检查 blog-admin 现有配置文件**

```bash
ls apps/blog-admin/
cat apps/blog-admin/vue.config.js 2>/dev/null || echo "no vue.config.js"
cat apps/blog-admin/babel.config.js 2>/dev/null || echo "no babel.config.js"
cat apps/blog-admin/src/main.js | head -20
```

**Step 2: 更新 package.json，替换 vue-cli 为 Vite**

新的 `apps/blog-admin/package.json` scripts 部分：
```json
{
  "scripts": {
    "dev": "vite --port 8083 --host",
    "build": "vite build",
    "build:pro": "vite build --mode pro",
    "preview": "vite preview",
    "lint": "eslint src --ext .js,.vue --fix",
    "clean": "rm -rf dist"
  }
}
```

新的 devDependencies（移除 vue-cli 相关，添加 Vite）：
```json
{
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "unplugin-auto-import": "^0.18.0",
    "unplugin-vue-components": "^0.27.0",
    "sass": "^1.77.6",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15"
  }
}
```

**Step 3: 创建 `apps/blog-admin/vite.config.js`**

```javascript
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  
  return defineConfig({
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router'],
        resolvers: [AntDesignVueResolver()],
      }),
      Components({
        resolvers: [
          AntDesignVueResolver({ importStyle: false }),
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
        },
      },
    },
    server: {
      port: 8083,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8086',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      minify: 'terser',
    },
    define: {
      'process.env': env,
    },
  })
}
```

**Step 4: 创建 `apps/blog-admin/index.html`**

Vite 需要根目录的 index.html（不在 public/ 里）：
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>博客管理后台</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

**Step 5: 检查 src/main.js 是否需要调整**

vue-cli 项目的 main.js 通常不需要大改，但需要确认没有 `process.env.VUE_APP_*` 变量（Vite 用 `import.meta.env.VITE_*`）。

```bash
grep -r "process.env.VUE_APP" apps/blog-admin/src/ | head -20
grep -r "VUE_APP" apps/blog-admin/src/ | head -20
```

**Step 6: 处理环境变量命名**

如果有 `VUE_APP_*` 变量，需要：
1. 将 `.env.*` 文件中的 `VUE_APP_` 前缀改为 `VITE_`
2. 将代码中的 `process.env.VUE_APP_*` 改为 `import.meta.env.VITE_*`

**Step 7: 安装新依赖并测试**

```bash
cd apps/blog-admin
pnpm install
pnpm dev
```

预期：Vite 开发服务器在 8083 端口启动，无报错。

**Step 8: 提交**

```bash
git add apps/blog-admin/
git commit -m "[Phase 3.1] 迁移 blog-admin 从 vue-cli 到 Vite 5"
git push origin dev
```

---

## Task 4: 修复 blog-frontend 硬编码信息

**目标：** 将 `apps/blog-frontend/nuxt.config.ts` 中硬编码的 "Bokey" 信息替换为环境变量

**Files:**
- Modify: `apps/blog-frontend/nuxt.config.ts`
- Modify: `apps/blog-frontend/.env.dev`（如存在）或创建

**Step 1: 检查硬编码内容**

```bash
grep -n "Bokey\|bokey" apps/blog-frontend/nuxt.config.ts
grep -n "bokey.space" apps/blog-frontend/nuxt.config.ts
```

**Step 2: 更新 nuxt.config.ts**

将以下硬编码内容替换为环境变量：
- `title: "Bokey Space"` → `title: process.env.NUXT_PUBLIC_SITE_NAME || "邓湘雷の博客"`
- `siteUrl: "https://bokey.space"` → `siteUrl: process.env.NUXT_PUBLIC_BASE_URL || ""`
- description 中的 Bokey 信息 → 使用环境变量

**Step 3: 创建/更新 `.env.dev`**

```bash
NUXT_PUBLIC_ENV=dev
NUXT_PUBLIC_API_URL=http://localhost:8086/api
NUXT_PUBLIC_BASE_URL=http://localhost:3015
NUXT_PUBLIC_SITE_NAME=邓湘雷の博客
NUXT_PUBLIC_OSS_URL=
```

**Step 4: 提交**

```bash
git add apps/blog-frontend/
git commit -m "[Phase 4.1] 修复 blog-frontend 硬编码 Bokey 信息，改用环境变量"
git push origin dev
```

---

## Task 5: 统一根目录 ESLint/Prettier 配置

**目标：** 清理根目录重复的 lint 配置文件，统一为一套

**背景：** 根目录有 `.eslintrc.js`、`.eslintrc.json`、`.prettierrc`、`.prettierrc.json` 等重复文件。

**Files:**
- Keep: `.eslintrc.js`（主配置）
- Delete: `.eslintrc.json`（重复）
- Keep: `.prettierrc`（主配置）
- Delete: `.prettierrc.json`（重复）

**Step 1: 对比两个 eslint 配置**

```bash
cat .eslintrc.js
cat .eslintrc.json
```

**Step 2: 合并配置，删除重复文件**

```bash
git rm .eslintrc.json
git rm .prettierrc.json
```

**Step 3: 提交**

```bash
git add -A
git commit -m "[Phase 5.1] 清理重复的 ESLint/Prettier 配置文件"
git push origin dev
```

---

## Task 6: 统一环境变量管理

**目标：** 建立清晰的环境变量文档，确保各子项目的 .env 文件有对应的 .env.example

**Files:**
- Create: `docs/guides/env-variables.md`
- Verify: 各子项目的 `.env.example` 存在

**Step 1: 检查各子项目的 .env 文件状态**

```bash
find apps/ services/ -name ".env*" -not -path "*/node_modules/*" | sort
```

**Step 2: 创建 `docs/guides/env-variables.md`**

文档内容：列出所有子项目的环境变量说明，包括：
- 根目录 `.env`（homepage 用）
- `apps/blog-api/config/dev.json`（blog-api 用）
- `apps/blog-frontend/.env.dev`（blog-frontend 用）
- `apps/blog-admin/.env.dev`（blog-admin 用）

**Step 3: 提交**

```bash
git add docs/
git commit -m "[Phase 6.1] 添加环境变量统一文档"
git push origin dev
```

---

## Task 7: 更新根目录 package.json 脚本

**目标：** 确保根目录的 dev/build 脚本在 blog-admin 迁移到 Vite 后仍然正确

**Files:**
- Modify: `package.json`

**Step 1: 验证所有 dev 脚本正常工作**

```bash
# 测试各子项目能否独立启动
pnpm --filter homepage dev &
sleep 3 && kill %1

pnpm --filter blog-admin dev &
sleep 3 && kill %1
```

**Step 2: 更新 package.json 中的端口注释**

确保 `dev:blog-admin` 脚本不再需要 `cross-env VUE_APP_PORT=8083`（Vite 在 vite.config.js 中配置端口）：

```json
"dev:blog-admin": "pnpm --filter blog-admin dev"
```

**Step 3: 提交**

```bash
git add package.json
git commit -m "[Phase 7.1] 更新根目录 dev 脚本，适配 blog-admin Vite 迁移"
git push origin dev
```

---

## Task 8: 创建 docs 完整文档体系

**目标：** 建立项目文档中心，包含架构说明、开发指南、部署指南

**Files:**
- Create: `docs/README.md`（文档索引）
- Create: `docs/guides/development.md`（开发指南）
- Create: `docs/guides/deployment.md`（部署指南）
- Create: `docs/adr/001-monorepo-structure.md`（架构决策记录）

**Step 1: 创建 `docs/README.md`**

```markdown
# 项目文档中心

## 快速导航

- [开发指南](./guides/development.md)
- [部署指南](./guides/deployment.md)
- [环境变量说明](./guides/env-variables.md)
- [架构决策记录](./adr/)
- [历史文档归档](./archive/)

## 项目结构

- `apps/homepage` - 个人主页（Vue 3 + Vite）
- `apps/blog-admin` - 博客管理后台（Vue 3 + Vite）
- `apps/blog-frontend` - 博客前台（Nuxt 3 SSR）
- `apps/blog-api` - 博客 API（Express.js）
- `packages/shared-utils` - 共享工具函数
- `services/music-api` - 音乐 API 服务
```

**Step 2: 提交**

```bash
git add docs/
git commit -m "[Phase 8.1] 完善 docs 文档体系"
git push origin dev
```

---

## 执行顺序建议

| 优先级 | Task | 风险 | 工作量 |
|--------|------|------|--------|
| 🔴 高  | Task 1: 建立 docs 目录 | 低 | 小 |
| 🔴 高  | Task 2: 清理根目录 .md | 低 | 小 |
| 🟡 中  | Task 3: blog-admin → Vite | 中 | 大 |
| 🟡 中  | Task 4: 修复硬编码信息 | 低 | 小 |
| 🟢 低  | Task 5: 统一 lint 配置 | 低 | 小 |
| 🟢 低  | Task 6: 环境变量文档 | 低 | 小 |
| 🟢 低  | Task 7: 更新根目录脚本 | 低 | 小 |
| 🟢 低  | Task 8: 完善文档体系 | 低 | 中 |

**Task 3（blog-admin 迁移到 Vite）是最高风险任务**，建议先完成 Task 1/2/4/5/6/7/8，最后处理 Task 3。

---

## 不在本计划范围内

以下工作量大、风险高，不在本次重构范围：
- blog-admin 从 Vuex 迁移到 Pinia（需要重写所有 store）
- blog-frontend 的 Bokey 原始内容替换（需要内容决策）
- 添加测试框架（项目目前无测试）
- TypeScript 全面迁移
