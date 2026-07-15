# Xiaoli Company Content Platform Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reuse the existing blog stack as an independently configured Xiaoli Team company content platform while keeping the CEO site only as a friend link.

**Architecture:** Keep the current Nuxt, Express, Sequelize, and admin applications, but run them against a new company development database and company environment defaults. Rebrand public/admin content and share the original blog capsule navigation language across the homepage and blog without touching production data.

**Tech Stack:** Vue 3 + Vite, Nuxt 3, Express, Sequelize, SQLite/MySQL, Vitest, Node test runner, Jest, pnpm.

---

### Task 1: Company database profile and defaults

**Files:**
- Create: `apps/blog-api/config/companyContent.js`
- Create: `apps/blog-api/tests/companyContent.test.js`
- Modify: `apps/blog-api/models/index.js`
- Modify: `.gitignore`

**Step 1: Write the failing tests**

Test that development resolves to `database.company.dev.db`, company defaults identify 晓黎团队, and the default friend link points to the CEO site without being used as company content.

**Step 2: Verify RED**

Run: `pnpm --filter blog-api test -- companyContent.test.js`
Expected: FAIL because `config/companyContent.js` does not exist.

**Step 3: Implement the profile**

Export pure helpers `resolveCompanyDatabasePath`, `getCompanyConfigurationDefaults`, and `getCompanyFriendLinks`. Update Sequelize development initialization to use the helper and ignore the generated company SQLite file.

**Step 4: Verify GREEN**

Run: `pnpm --filter blog-api test -- companyContent.test.js`
Expected: PASS.

### Task 2: Idempotent company database bootstrap

**Files:**
- Create: `apps/blog-api/scripts/bootstrapCompanyContent.js`
- Create: `apps/blog-api/tests/bootstrapCompanyContent.test.js`
- Modify: `apps/blog-api/package.json`
- Modify: `.env.example`

**Step 1: Write the failing test**

Use an in-memory Sequelize database to prove that bootstrap inserts missing configuration/friend links and does not overwrite edited records on a second run.

**Step 2: Verify RED**

Run: `pnpm --filter blog-api test -- bootstrapCompanyContent.test.js`
Expected: FAIL because the bootstrap module does not exist.

**Step 3: Implement bootstrap**

Export a dependency-injected `bootstrapCompanyContent({ sequelize, Configuration, FriendLink })` and keep CLI execution behind `require.main === module`. Add `db:bootstrap:company` and document company DB/storage/site variables in `.env.example`.

**Step 4: Verify GREEN**

Run: `pnpm --filter blog-api test -- bootstrapCompanyContent.test.js`
Expected: PASS.

### Task 3: Company navigation and homepage content channel

**Files:**
- Modify: `apps/homepage/src/lib/companyContent.js`
- Modify: `apps/homepage/tests/companyContent.test.js`
- Modify: `apps/homepage/src/App.vue`
- Modify: `apps/homepage/package.json`
- Modify: `apps/homepage/index.html`

**Step 1: Write the failing tests**

Require the company navigation to include 官网、博客、文章、关于我们、友链、合作; require article labels to be company-neutral; reject CEO/个人 GitHub as first-party links.

**Step 2: Verify RED**

Run: `pnpm --filter homepage test -- companyContent.test.js`
Expected: FAIL because blog/company navigation entries are missing.

**Step 3: Implement homepage changes**

Restyle the header as the original blog glass capsule, add real `/blog/` company routes, restore latest company article loading with an honest empty/error state, and keep contact behavior independent from article API availability.

**Step 4: Verify GREEN**

Run: `pnpm --filter homepage test`
Expected: all homepage tests pass.

### Task 4: Rebrand the Nuxt blog as Xiaoli Team

**Files:**
- Create: `apps/blog-frontend/composables/companyBrand.js`
- Create: `apps/blog-frontend/tests/company-brand.test.mjs`
- Modify: `apps/blog-frontend/package.json`
- Modify: `apps/blog-frontend/nuxt.config.ts`
- Modify: `apps/blog-frontend/app.vue`
- Modify: `apps/blog-frontend/components/common/NaviHeader.vue`
- Modify: `apps/blog-frontend/components/common/BottomContent.vue`
- Modify: `apps/blog-frontend/pages/index.vue`
- Modify: `apps/blog-frontend/pages/about.vue`
- Modify: `apps/blog-frontend/pages/link.vue`
- Modify: `apps/blog-frontend/pages/log/article/detail/[id].vue`

**Step 1: Write the failing tests**

Test company brand defaults, routes, SEO labels, CEO friend-link classification, and scan public sources to reject personal-site hardcoding.

**Step 2: Verify RED**

Run: `pnpm --filter blog-frontend test`
Expected: FAIL on current personal defaults.

**Step 3: Implement the rebrand**

Make company defaults the only fallback; update navigation to 晓黎团队 and 关于我们; update homepage, About, link copy, article title/author, favicon fallback and footer. Preserve all article/category/message/friend-link functions.

**Step 4: Verify GREEN**

Run: `pnpm --filter blog-frontend test`
Expected: PASS.

### Task 5: Company-oriented admin wording

**Files:**
- Create: `apps/blog-admin/tests/company-brand.test.mjs`
- Modify: `apps/blog-admin/package.json`
- Modify: `apps/blog-admin/src/pages/about/AboutManagePage.vue`
- Modify: `apps/blog-admin/src/pages/LoginPage.vue`
- Modify: `apps/blog-admin/src/components/layout/AdminSidebar.vue`

**Step 1: Write the failing source-contract test**

Require “公司介绍/团队信息/公司内容管理” labels and reject personal preview URLs/default social links.

**Step 2: Verify RED**

Run: `pnpm --filter blog-admin test`
Expected: FAIL on personal wording.

**Step 3: Update admin wording and preview behavior**

Use environment-relative `/blog/about` preview, company/team labels, and no personal GitHub defaults.

**Step 4: Verify GREEN**

Run: `pnpm --filter blog-admin test`
Expected: PASS.

### Task 6: Full verification, review, and integration

**Files:**
- Review all files changed above.

**Step 1: Run tests**

Run: `pnpm --filter homepage test && pnpm --filter blog-frontend test && pnpm --filter blog-admin test && pnpm --filter blog-api test`

**Step 2: Run production builds**

Run: `pnpm --filter homepage build && pnpm --filter blog-frontend build && pnpm --filter blog-admin build:pro`

**Step 3: Run focused lint and repository checks**

Run focused ESLint for changed Vue/JS files, `git diff --check`, source scans, and confirm generated databases/build output are ignored.

**Step 4: Request code review**

Review requirements: independent company data, preserved functionality, capsule navigation, company content/SEO, CEO only in friend links, no production mutation.

**Step 5: Integrate**

Resolve review findings, re-run verification, merge the feature branch into `dev`, push `origin/dev`, and do not deploy.

