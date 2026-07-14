# Repository Guidelines

## 项目范围

这是一个 pnpm monorepo：

- `apps/homepage`：Vue 3 + Vite 首页
- `apps/blog-frontend`：Nuxt 3 博客前台，部署在 `/blog/`
- `apps/blog-admin`：博客管理后台
- `apps/blog-api`：Express API、数据库和静态资源服务
- `services/music-api`：音乐代理服务

## 验证要求

前端修改至少运行对应应用的生产构建；后端修改至少运行：

```bash
pnpm --filter blog-api test
```

涉及博客前台时运行：

```bash
pnpm --filter blog-frontend build
```

## 部署约定

- GitHub Actions 负责 CI 测试和构建检查。
- 默认部署方式是本地构建后上传：

  ```bash
  DEPLOY_SSH_HOST=... \
  DEPLOY_SSH_USER=... \
  DEPLOY_SSH_PORT=... \
  DEPLOY_SSH_KEY=... \
  ./scripts/deploy-local.sh
  ```

- `scripts/deploy-local.sh` 会本地构建 homepage、blog-admin、blog-frontend，运行 blog-api 测试，然后通过 rsync 上传并在服务器执行 `deploy.sh --skip-build`。
- Nginx 检查与重载必须使用 `sudo nginx -t`、`sudo nginx -s reload`；Let's Encrypt 证书位于 `/etc/letsencrypt`，普通用户直接检查会产生权限误报。
- GitHub 的手动 CD 仍可作为备用方案，但服务器 SSH 必须先通过握手检查；不要把部署成功建立在服务器 `git pull` 上。
- 不提交密钥、SMTP 密码、数据库密码或构建产物中的敏感配置。

## 提交规范

使用 Conventional Commits（`feat:`、`fix:`、`refactor:`、`docs:`、`chore:` 等）。每完成一个逻辑变更就验证、提交并推送到 `origin/dev`，不要把完成的修改留在未提交状态。
