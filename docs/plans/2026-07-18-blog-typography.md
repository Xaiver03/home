# Blog Typography and Reading Layout Plan

**Goal:** Replace the blog's overly heavy custom type treatment with a readable Chinese-first typography system and consistent spacing across public pages.

**Approach:** Use Noto Sans SC for interface and body text, Noto Serif SC for long-form article headings, and a local/system fallback stack so the site remains usable when Google Fonts is unavailable. Keep existing content and visual identity intact while normalizing weights, measures, line-height, and paragraph rhythm.

**Scope:** `apps/blog-frontend` global styles and public reading surfaces; no content, routes, assets, or API behavior changes.

**Verification:** Run blog frontend tests/build plus homepage regression tests/build, then smoke-test the local public routes and API proxy.
