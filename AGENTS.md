# Repository Guidelines

## Project Structure & Module Organization
- Root app: Vue 3 + Vite. Source lives in `src/` (components, views, store, utils, assets, style). Entry is `index.html`; static assets in `public/`; build output in `dist/`.
- Configuration: `vite.config.js`, `.eslintrc.json`, `.prettierrc.json`, `.env.example` (copy to `.env`). GitHub Actions live in `.github/workflows/`.
- Subprojects: `blog/` (Nuxt 3 site, Express API, admin) and `music/Meting-API/` (server). Each has its own `README.md` and `package.json`; build/run them per their docs.

## Build, Test, and Development Commands
- Install deps: `pnpm i` (or `npm i`).
- Start dev server: `npm run dev` (Vite on `http://localhost:3000`).
- Build for production: `npm run build` → emits to `dist/`.
- Preview built app: `npm run preview`.
- Lint/format: `npm run lint` (ESLint) and `npm run format` (Prettier).
- Docker: `docker build -t home .` then `docker run -p 12445:12445 -d home`.
- CI: pushes to `dev`/`master` trigger a build (see `.github/workflows/build.yml`).

## Coding Style & Naming Conventions
- Language: ES2021 modules. Vue SFCs in PascalCase (e.g., `src/components/Message.vue`).
- Formatting: 2‑space indent, semicolons required, double quotes, `printWidth: 100` (see `.prettierrc.json`).
- Linting: `eslint:recommended` + `plugin:vue/vue3-essential`. Single‑word component names are allowed.
- SCSS with global includes via `src/style/global.scss`.

## Testing Guidelines
- No root test runner configured. If adding tests, prefer Vitest. Name files `*.spec.ts|js` next to the unit under test.
- Minimum checks for all PRs: `npm run lint`, `npm run build`, and manual verification via `npm run preview` (PWA and routes).

## Commit & Pull Request Guidelines
- Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `perf:`, `chore:` (mirrors existing history).
- PRs must include: clear description, linked issues, and screenshots for UI changes. Update docs when changing behavior or env vars (`.env.example`).
- Keep scope tight: avoid mixing root app changes with `blog/` or `music/` in the same PR.

## Security & Configuration Tips
- Copy `.env.example` to `.env`; never commit secrets. Configure keys like `VITE_WEATHER_KEY` and music settings locally.
- PWA: APIs are excluded from SW caching in `vite.config.js`; avoid re‑adding API caching.
- Do not edit generated artifacts in `dist/`.

