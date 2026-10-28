# 浮层与反馈规范适配层（home monorepo）

> **真源**：全局 Skill `~/.skill-catalog/personal/overlay-feedback-patterns/`（SKILL.md + `references/taxonomy.md`、
> `dismissal-and-timing.md`、`destructive-actions.md`、`mobile-sheets.md`、`audit-checklist.md`）。
> 通用判据（18 类定义、关闭矩阵、时长规则、危险三档、T1–T8 定义）**只住真源，本文不复述**。
> 本文只回答：本仓对着那些判据，现在有什么、缺什么、按什么顺序改。冲突时以真源为准并回改本文。

本仓有三个 UI 根，面不小：**不是**「只有主页 Alert 的静态站」，适配层成立。
- `apps/homepage/`：Vue3 + Vite + element-plus（经 unplugin-auto-import）+ vite-plugin-pwa，单文件 `src/App.vue`（约 2250 行）；
- `apps/blog-admin/`：Vue3 + **ant-design-vue 4** 后台（含 `pages/log/phone/`、`pages/message/phone/` 移动版页面）；
- `apps/blog-frontend/`：Nuxt3 + **@ant-design-vue/nuxt** + Tailwind，桌面/移动共用响应式页面。
- `apps/blog-api/public/mgmt/` 是旧后台**编译产物**（非源码），一切探针必须 `--glob '!public/**'` 排除，否则污染读数。

## §1 现状基线（现量：2026-10-23，命令可复现）

```sh
cd apps   # 排除构建产物与 vendor
rg -o "<(a-modal|a-drawer|a-tooltip|a-popconfirm|a-spin)[\s>]" -g'*.vue' --glob '!public/**' blog-admin blog-frontend homepage | wc -l
rg -o "notification\.(open|success|error|warning|info)\(" -g'*.{vue,js}' --glob '!public/**' blog-admin blog-frontend homepage | wc -l
rg -n "(^|[^.\w])(window\.)?(confirm|alert)\s*\(" -g'*.{vue,js}' --glob '!public/**' apps   # 在仓库根跑
rg -n "mask-closable|maskClosable" -g'*.vue' --glob '!public/**' blog-admin blog-frontend
rg -o "duration:\s*3\b" -g'*.{vue,js}' --glob '!public/**' blog-admin blog-frontend homepage | wc -l
rg -n "Modal\.(confirm|warning|error)\(" -g'*.vue' --glob '!public/**' blog-admin blog-frontend
rg -n "paranoid|deletedAt" blog-api/models ; rg -n "\.destroy\(" blog-api/services blog-api/controller
```

| 探针 | 读数 | 判定 |
|---|---|---|
| 浮层底座 | ant-design-vue 4（admin+frontend）+ element-plus（homepage） | 按 app 各一系统，可接受；app 内混用见下 |
| 模态类规模（源码） | `<a-modal` 17、`<a-drawer` 8、`<a-tooltip` 13、`<a-popconfirm` 1、`<a-spin` 9、`<a-skeleton` 0；`Modal.confirm` 13、`Modal.warning` 4、`Modal.error` 2 | 决策面集中在 admin CRUD + frontend 留言/登录 |
| 轻反馈套数 | `notification.*` 32 处 + `message.*` 23 处 + ElMessage（homepage） | ≥2 套，**债务** |
| 原生 `confirm()` | 1 处：`apps/homepage/src/main.js:88`。且守卫 `if (window.ElMessageBox)`（main.js:65）恒假——全仓无任何 `window.ElMessage*` 赋值（rg 0 命中；auto-import 只注入 SFC），PWA 更新提示**实际总走原生 confirm**，ElMessageBox 分支与 main.js:113 的成功提示均为死代码 | >0 必须清 |
| 关闭策略显式约定 | 仅 2 处 `:mask-closable="false"`（`blog-frontend/components/common/NaviHeader.vue:296`、`blog-admin/src/components/layout/CloseTabDialog.vue:5`） | 其余 15 个多含表单的 a-modal 全在吃 antd 默认「点背景即关」= 脏表单静默丢弃 |
| `duration` 覆盖 | `duration: 3` **26 处**散在调用点（含全局封装 `blog-admin/src/api/http.js:39`、`blog-admin/src/utils/index.js:18,26,109,130`、`blog-frontend/composables/utils.js:17`）；另有 4（NaviHeader.vue:175）、2（message/index.vue:280）、1000ms（main.js:115） | 完全无集中配置 |
| 撤销链路 | blog-api `models/` 无 `paranoid`/`deletedAt`；`services/*` + `controller/` 共 **9 处 Sequelize `.destroy()` 硬删除**（如 `blog-api/services/articleService.js:166`、`commentService.js:237`） | **无软删除，撤销不成立**（见 §3） |
| 行内报错统一封装 | `aria-invalid` 0、`role="alert"` 0、`v-if` 无；`:rules=` 仅 `blog-admin/src/pages/log/LogEditPage.vue` 3 处 | 字段校验错误一律走 toast：`blog-admin/src/utils/index.js:97-116 objHasNullOrEmpty`、`:122-134 isValidEmail`、`blog-frontend/pages/message/index.vue:222-230,246-253`（提交前空值用 `notification.open duration:3` 提示后自动消失）——即真源误用 #2 的普遍化 |
| 危险操作统一入口 | 无；13 处 `Modal.confirm` 各页自写（删文章 `LogListPage.vue:206,245`、删评论 `LogCommentPage.vue:222`、删类目 `LogTypePage.vue:147,162`、删配置 `ConfigListPage.vue:125`、删友链 `friendLinkListPage.vue:154`、删用户 `UserListPage.vue:148`、删管理员 `AdminListPage.vue:137`、删留言 `MessageListPage.vue:231`、退出编辑 `LogEditPage.vue:266`、公开问答 `QaListPage.vue:296`、登出 `NaviHeader.vue:153`） | 无档位判定，无 destructive 样式约定 |
| 移动端形态 | 右置抽屉 8 处即移动形态：`blog-admin/src/pages/log/phone/LogListPage.vue:36,77`、`pages/message/phone/MessageEditPage.vue:8`、`MessageListPage.vue:76`（width 80vw）、`blog-frontend/pages/message/index.vue:863`、`message/[page].vue:602`（70vw）、`NaviHeader.vue:283`、`FlexedTool.vue:102`；Bottom Sheet 0、分档 0 | 真源误用 #5：窄屏拿侧抽屉冒充 sheet |
| 自绘全屏覆盖层 | 1 处：`blog-frontend/components/common/InitialLoader.vue:4` `fixed inset-0 z-[9999]`；`blog-admin/src` 层级仅 2 处。homepage `src/App.vue` 18 处 position:fixed/z-index 均为 sticky 头图装饰层，非模态 | 面小，但 loader 绕过焦点/Esc |
| Tooltip 承载唯一信息 | 评论时间：正文只显示相对时间，完整时间**只在 hover tooltip 里**——`blog-frontend/pages/log/article/detail/[id].vue:642,693`、`pages/index.vue:245`、`message/index.vue:588`、`message/[page].vue:432,534`；共 13 处 a-tooltip 抽样 6 处如此 | 触屏/截图/读屏均拿不到 = 真源误用 #7 |
| 用 5 级承载 3/4 级信息 | `Modal.warning` 4 处全是「不能公开」前置校验（`QaListPage.vue:259,263,285,289`）、`Modal.error` 2 处报错（`LogTypePage.vue:185`、`LogEditPage.vue:203`） | 打断强度超配，应降级就地提示 |

## §2 18 类 → 本仓落点

| 真源类 | 本仓现状 | 落点 |
|---|---|---|
| 1 Tooltip | 13 处 a-tooltip | 保留；时间类必须补触屏替代（§1 末行） |
| 2 Hover Card / 4 Menu / 19 Command | 0 | 不适用（无对应场景） |
| 3 Popover | 1 处且被注释（`blog-frontend/pages/log/article/detail/[id].vue:585`） | 视为 0 |
| 5 Modal | 17 处 a-modal（admin 表单 CRUD + frontend 绑定/留言回复） | 关闭策略按矩阵逐层设（§4 T5） |
| 6 AlertDialog | **缺**；现由 `Modal.confirm/warning/error` 19 处非正式承担 | §4 T2 建统一危险入口 |
| 7 Popconfirm | 1 处（`blog-admin/src/pages/music/MusicCookiePage.vue:21`） | 单条硬删除的正确归宿（§3） |
| 8 Drawer | 8 处右置（桌面详情/筛选可用） | 手机页迁 sheet（T7） |
| 9 Bottom Sheet / 10 全屏浮层 | 0 / 1（InitialLoader 自绘） | T7；loader 收敛 |
| 11 Toast / 12 Snackbar | notification+message 55 处，**0 处带动作** | Snackbar 档暂不成立（无撤销，§3），只做 T3 归一 |
| 13 Notification | `notification.*` 被当 toast 用（placement top、3s） | T3 里重新分配语义 |
| 14 Alert / 16 Banner | 0（区域状态用 console.warn 静默，如 `message/index.vue:215`） | 失败原因改区域 Alert 承接（T4 副产品） |
| 15 Inline Alert | **最缺**：0 处字段级常驻报错 | T4 主目标 |
| 17 Progress / 18 Skeleton+Spinner | a-spin 9 / a-skeleton 0 | 够用；列表加载补 Skeleton 非必须项 |

## §3 危险档位与撤销档在 home 成不成立

- **撤销档（轻档 Snackbar+撤销）不成立**：真源 destructive-actions.md §2 前提 #1（软删除）即失败——blog-api 全部硬删（9 处 `.destroy()`，无 `paranoid`）。这是数据模型级改造，**不属于浮层适配层范围**；在其落地前，任何「删除后给撤销按钮」的 UI 都是欺骗。产品决策记录：删除类维持确认形态。
- 档位映射（在「不可撤销」前提下）：单条删除（文章/评论/类目/配置/友链/用户/留言）= **中档 Popconfirm**；`AdminListPage` 删管理员、`UserListPage` 删用户改变他人可见状态 = **重档**；`QaListPage.vue:296` 公开、文章发布是**对外可见**动作，按 destructive-actions §4 即使将来可撤销也必须保留确认 = 重档。
- 现状 13 处 `Modal.confirm` 一档通吃、且 antd confirm 默认焦点在「确定」，违反真源「初始焦点在取消」；`Modal.warning/error` 共 6 处是拿模态报校验失败，应降 3/4 级。
- 登出（`NaviHeader.vue:153`）无需决策，降为直接执行 + 轻反馈回执。

## §4 整改分档（对应真源 audit-checklist.md §3 的 T1–T8）

建议顺序 **T1 → T3 → T2 → T4 → T5 → T8；T7 按需；T6 不做（记 §3 决策）**。

- **T1 清原生对话框**：1 处（`homepage/src/main.js:88`）。改法：main.js 直接 `import { ElMessageBox, ElMessage } from 'element-plus'`（element-plus 已在 `apps/homepage/package.json` dependencies），删除恒假的 `window.*` 守卫。低风险一个纵切。
- **T3 轻反馈归一**：notification(32)+message(23) 收敛到每 app 一个出口（扩展 `blog-admin/src/utils/index.js analysisData` 与 `blog-frontend/composables/utils.js`），时长集中配置、禁调用点写 `duration`（现 26 处 3s 起步值全删）。
- **T2 统一危险入口**：在 blog-admin 建单一 `dangerConfirm()` 封装（okButtonProps danger、focus 在 cancel、禁点背景），13 处 `Modal.confirm` 迁入并按 §3 档位换成 Popconfirm/AlertDialog 形态；同时替换 6 处 `Modal.warning/error` 为就地提示。
- **T4 行内报错归位**：`objHasNullOrEmpty`/`isValidEmail` 及 blog-frontend 各提交前空值校验改为字段下方常驻（a-form `help`/rules）；改动面广（约 55 个调用点涉及表单预检），按页分批，先留言/友链/问答等前台页。
- **T5 关闭策略显式化**：15 个默认吃 scrim 的 a-modal 逐个含表单者设 `:mask-closable="false"`，对齐现仅存的 2 处约定。
- **T8 层级收敛**：`InitialLoader.vue` 的 `z-[9999]` 与 homepage 18 处层级写入 `packages/design-tokens/src/index.js` 档位（该包已被 admin+frontend 引用），自绘 loader 保留但登记为「无焦点管理的全屏层」。
- **T6 撤销链路**：前提 #1 失败，**本适配层内不做**，转为后端议题（paranoid/回收站）另立任务。
- **T7 移动端形态**：`phone/` 页与前台 70–80vw 右抽屉迁 `a-drawer placement="bottom"` 或自绘 sheet；分档（真源 mobile-sheets.md）antd-vue 原生不支持，做之前先确认可接受形态。

## §5 多端

端矩阵只有两列：**Web 桌面 / Web 移动（浏览器 + homepage PWA 壳）**。无小程序、无原生壳，真源 §4 对应列标「不适用」。
- hover-only（Tooltip 13 处）在移动/PWA 上无替代通道 = §1 末行缺陷，T4 之后补。
- Esc/焦点陷阱：admin 为桌面端必须成立（antd 自带，未逐处验证，见未量项）。
- 系统返回接管：antd Drawer/Modal 默认 `keyboardClosable`，返回键接管未实测、未量。

## §6 已有资产（改造时复用，不新建第二套）

- `packages/design-tokens/src/index.js`：admin+frontend 共用 token 包，T8 层级档位落点。
- `blog-admin/src/utils/index.js analysisData()`：统一回执雏形，T3 的宿主。
- `docs/guides/PWA_UPDATE_GUIDE.md`：homepage 更新流文档，T1 完成后同步其提示形态描述。
- `blog-admin/src/pages/music/MusicCookiePage.vue:21`：全仓唯一 Popconfirm，T2 的样式参照。

*未量格子（诚实登记）：Modal 打开时背景滚动锁/inert/焦点归还行为未验证；`Modal.confirm` 各处是否设过 `okType: 'danger'` 未逐一读；blog-admin 登录表单（`LoginPage.vue`）错误是否全走 notification 未抽样；homepage App.vue 内是否藏有内联弹层逻辑（纯 CSS overlay）未逐行读。*
