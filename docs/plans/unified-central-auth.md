# 个人站统一认证接入

本仓是个人主页与博客，中央账号不自动获得本站管理权限。迁移须保留用户/管理员本地整数
主键、评论与文件归属；中央 `(issuer, subject)` 通过独立映射绑定，旧账户采用双证明认领，
不按邮箱自动合并。本站准入不得复用公司站的管理能力或把公司站管理员自动提升到本站。

## 旧入口前置修补

2026-10-19 在隔离夹具中复现旧管理员验证码登录的空值比较问题：Redis 没有码时返回
`null`，请求缺少码或传 `null` 会通过宽松相等比较。旧登录还把数据库全部字段放进 JWT
和响应，包含 `passwordHash`。复取旧实现可用 `git show 4708ab82:apps/blog-api/controller/adminController.js`；
反例与最终约束在 `apps/blog-api/tests/adminAuthentication.test.js`，全部使用合成账号。

当前修补校验邮箱与现有五位字母数字码，Redis 在同一 Lua 命令中比较并消费正确码；
错误码不删除真实码，不存在/已消费的码不签发身份。管理员仍必须存在于本站记录中。
两种登录响应只投影公开字段，签名载荷仅保留本地 id、邮箱、用户名及原 admin 权限。
这只是迁移前的旧入口修补，尚未部署，不构成统一认证完成。

复验：`pnpm --filter blog-api exec jest --runInBand tests/adminAuthentication.test.js`，
并运行该包完整测试。`node apps/blog-api/scripts/verify-admin-login-proof.cjs` 新建随机命名
的本地 Redis 容器，核验错误码保留、并发只消费一次、重放、过期和断连拒绝，结束后仅清理
该容器。不得拿真实账号或生产 Redis 演练登录绕过。

## 完整接入范围

后续一次覆盖 API、博客普通用户、管理后台和 WebSocket。中央统一凭据与撤销；
个人站保留品牌界面和本地业务权限。采用服务端协议交换及加密持久会话，浏览器仅持有
host-only、Secure、HttpOnly Cookie，所有写请求有 CSRF 防护；WebSocket 在握手、
消息及空闲期间复核中央状态。不能只改登录按钮而留下旧 JWT、邮箱码或共享 WS 密钥旁路。

验收包含真实持久化与协议、账号认领冲突、普通用户/管理员和双用户隔离、撤销后已有
WS 断连、Cookie/CSRF、桌面/移动明暗界面及受影响生产构建。最终切换前保留明确的
代码候选与线上状态区分；新生产写入和发布按该任务已确认的授权范围执行。

## 个人站能力命名空间

本站只认自己命名空间下的能力：公开能力 `home.blog.use`，管理能力 `home.blog.manage`。
公司站（x-c）的 `xcreative.blog.*` 等其他产品能力，中央能力端点即使对同一 token 一并
返回，也会在进入本站会话前被剥离，既不写入本地会话也不参与授权判定；WebSocket 网关
同样只接受 `home.blog.manage`。

中央侧仍需为本站客户端 `home` 登记 `home.blog.use` 与 `home.blog.manage` 两个能力，
并在能力端点按产品返回；未登记或未授予时本站 fail closed（不建立会话、不 JIT 建号）。
跨产品 token 的拒绝与撤销行为在 `apps/blog-api/tests/centralOidcSecurity.test.js`、
`apps/blog-api/tests/authRouteSecurity.test.js`、`apps/blog-api/tests/articleRouteSecurity.test.js`
与 `services/ws-gateway/test/auth.test.js` 中有对应断言。
