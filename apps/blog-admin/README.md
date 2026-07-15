# 晓黎内容管理后台

晓黎团队官网与博客的内容管理端，基本功能模块：
- 博客模块
- 评论模块
- 留言模块（实际和评论是同一模块）
- 友链模块
- 全局配置模块

项目使用技术说明：

| 技术                                                   | 说明                                        |
| ------------------------------------------------------ | ------------------------------------------- |
| [Vue 3](https://vuejs.org/)                            | 项目主要框架 |
| [Ant Design Vue](https://www.antdv.com/)               | 企业级 UI 组件库 |
| [json-editor-vue3](https://github.com/cloydlau/json-editor-vue3) | 基于 Vue 3 的可视化 JSON 编辑器组件         |
| [md-editor-v3](https://www.npmjs.com/package/json-editor-vue3?ref=pkgstats.com)  | Markdown 编辑与渲染组件，支持实时预览与代码高亮 |
| [ECharts](https://echarts.apache.org/)                 | 可视化图表库，用于数据分析与展示      |


### ⚙️ 环境要求

> Node.js：推荐 v18+（最低支持 v16）
> 可以使用 npm run 启动项目（注意请先根据.env.example 完善配置文件）

### 项目启动 ✅

项目通过 pnpm workspace 命令启动。

#### 常用命令

根据 npm script 来`run`项目：

```shell
pnpm --filter blog-admin dev
pnpm --filter blog-admin test
pnpm --filter blog-admin build
```

### ⚖️ 开源协议

本项目基于 MIT License 开源。
内容默认值和预览链接集中在 `src/config/companyBrand.mjs`。公开站点地址通过
`VITE_PUBLIC_SITE_URL` 注入；未设置时，预览使用当前站点的同源路径。
