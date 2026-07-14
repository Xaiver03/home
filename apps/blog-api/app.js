/**
=============================================================================
  Project: space-log-express
  Author: Bokey(github: Bokey76)
  Created: 2025
  License: MIT License
  Description: 
  本项目开源，欢迎参考、学习和改进。。
  请尊重作者版权，保留作者信息及本文件中的 LICENSE 注释。
  欢迎通过 Pull Request 或 Issue 方式提出改进意见，一起让项目更好。
  如果你喜欢本项目，欢迎点个 Star ⭐ 支持，也欢迎分享和改进。
  关于作者：https://bokey.space
 =============================================================================
 * 
 */

var createError = require("http-errors");
var express = require("express");
require('express-async-errors')
var fs = require("fs");
var path = require("path");

// 增加Node.js HTTP客户端连接池限制
require('http').globalAgent.maxSockets = 200;
require('https').globalAgent.maxSockets = 200;
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors"); // 跨域

// 路由引入
var indexRouter = require("./routes/index");
var userRouter = require("./routes/user");
var articleRouter = require("./routes/article");
var ossRouter = require("./routes/oss");
var adminRouter = require("./routes/admin");
var commentRouter = require("./routes/comment");
var friendLinkRouter = require("./routes/friendLink")
var questionRouter = require("./routes/question")
var configurationRouter = require("./routes/configuration")
var weatherRouter = require("./routes/weather"); // 天气API路由
var musicRouter = require("./routes/music"); // 音乐Cookie管理路由

// 中间件引入
var { checkToken, JwtErrorCatch } = require("./middlewares/auth");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 文章封面是可选资源：缺失时返回统一占位图，避免浏览器收到鉴权 JSON 或 404。
const articleCoverDir = path.join(__dirname, "public/uploads/image/articleCover");
const articleCoverPlaceholder = path.join(__dirname, "public/images/article-cover-placeholder.svg");
app.get('/uploads/image/articleCover/:id.png', (req, res, next) => {
  const filePath = path.join(articleCoverDir, `${req.params.id}.png`);
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  return res.sendFile(articleCoverPlaceholder, (error) => {
    if (error) next(error);
  });
});

// 博客前台 Nuxt3 静态文件配置
app.use('/blog/_nuxt', express.static(path.join(__dirname, '../space-log-nuxt3/app/.output/public/_nuxt')));

// 博客前台特定文件路由 - 必须在通配符路由之前
app.get('/blog/favicon.ico', function(req, res) {
  res.sendFile(path.join(__dirname, '../space-log-nuxt3/app/.output/public/favicon.ico'));
});

// 博客前台路由配置 - 将 /blog 请求重定向到 Nuxt3 应用（但排除静态文件）
app.get('/blog', function(req, res) {
  res.sendFile(path.join(__dirname, '../space-log-nuxt3/app/.output/public/index.html'));
});
app.get('/blog/*', function(req, res, next) {
  // 跳过已经处理的静态文件路径
  if (req.path.startsWith('/blog/_nuxt/') || req.path === '/blog/favicon.ico') {
    return next();
  }
  res.sendFile(path.join(__dirname, '../space-log-nuxt3/app/.output/public/index.html'));
});

// 管理后台 SPA fallback（必须在 checkToken 之前，否则刷新页面会触发令牌校验）
app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});
app.get('/admin/*', function(req, res, next) {
  // 带扩展名的是静态资源文件，交给 express.static 处理
  const lastSegment = req.path.split('/').pop();
  if (lastSegment && lastSegment.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

app.use(checkToken); // JWT认证 token合法性

// --路由使用--
// API路由（带 /api 前缀）
app.use("/api/article", articleRouter);
app.use("/api/user", userRouter);
app.use("/api/oss", ossRouter);
app.use("/api/admin", adminRouter);
app.use("/api/comment", commentRouter);
app.use("/api/friendLink",friendLinkRouter)
app.use("/api/question",questionRouter)
app.use('/api/configuration',configurationRouter)
app.use('/api/weather', weatherRouter); // 天气API路由
app.use('/api/music', musicRouter); // 音乐Cookie管理路由
app.use('/music', musicRouter); // 音乐Cookie管理路由（兼容无前缀路径）

// 管理后台路由（不带 /api 前缀）
app.use("/mgmt", indexRouter); // 管理后台页面

// --错误处理--

// JWT 验证错误处理器
app.use(JwtErrorCatch);

// 404 处理中间件
app.use(function (req, res, next) {
  next(createError(404));
});

// 错误处理器
app.use(function (err, req, res, next) {
  const utils = require("./utils/index");
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  console.log('全局错误处理器捕捉到错误：',err);
  res.status(err.status || 500);
  if(err.msg) {
    err = err.msg
  } else if (err.message) {
    err = err.message
  }
  res.json(utils.postMessage(-1, err, {}));
});

module.exports = app;
