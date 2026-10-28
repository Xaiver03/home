# 部署指南

## 生产环境架构（45.207.214.159 / xaiverdeng.site）

反向代理是 **Caddy**（`/etc/caddy/Caddyfile`），不是 Nginx。

```text
https://xaiverdeng.site/
├── /              → 静态文件 /opt/home/apps/homepage/dist（SPA fallback）
├── /blog/*        → Nuxt3 SSR  :3004
├── /admin/*       → Express    :8085（管理后台 SPA，产物同时铺到 /mgmt）
├── /api/*         → Express    :8085（博客 API）
├── /music         → Hono       :4000（Meting 代理，内部 rewrite 成 /api）
├── /uploads/*     → Express    :8085（MinIO 流式读取，对外保持兼容路径）
├── /ws*           → WS 网关     :4010
└── /static/*      → Express    :8085
```

数据面：MySQL 库 `space_log_blog`；MinIO bucket `home`，容器 `home-minio` 只监听 `127.0.0.1:9000/9001`。
PM2 进程名为 `spaceP_pro`、`music-api`、`ws-gateway`、`blog-frontend`，已 `pm2 save` 并由 `pm2-root` 开机自启。

## 构建命令

```bash
# 构建所有子项目
pnpm build

# 单独构建
pnpm build:homepage
pnpm build:blog-admin
pnpm build:blog-frontend
```

## 一键部署

```bash
bash scripts/deploy.sh            # 拉代码 → 安装 → 构建 → 迁移 → 重启 → 健康检查
bash scripts/deploy.sh --skip-build   # 跳过 git 同步与构建，只重启
```

> 该服务器无法访问 github.com，不带 `--skip-build` 时第 1 步 `git fetch origin` 会失败。
> 当前实际流程：本地推送 `origin/dev` → `git bundle create x.bundle <旧sha>..dev` 把增量带到服务器 → `pnpm install && pnpm build` → `bash /opt/home/deploy.sh --skip-build`。

`deploy.sh` 第 1 步执行 `git reset --hard origin/dev`，会丢弃服务器上的本地改动。

## 环境变量

生产变量在 `/opt/home/.env.pro`，由 `deploy.sh` 注入 PM2 进程。其中：

- `NUXT_PUBLIC_API_URL` **必须以 `/api` 结尾**。它在运行时会原样覆盖 `nuxt.config.ts` 里经 `normalizeApiUrl` 处理过的值，缺前缀时 SSR 会把接口当页面抓，文章详情页报「文章不存在」。部署脚本已对该值做硬校验。
- `MINIO_*`、`MYSQL_*`、`tokenSecretKey` 等敏感值只在服务器上，不入库。

## 服务管理

```bash
pm2 list                      # 四个进程应均为 online
pm2 logs blog-frontend        # SSR 日志
tail -f apps/blog-api/logs/app.log
caddy validate --config /etc/caddy/Caddyfile   # 改完反向代理配置先校验
```

> 修改 Caddyfile 后执行 `systemctl reload caddy`；该机与 wunoai.com、knowledge.wunoai.com 共用 Caddy，改动前备份。
