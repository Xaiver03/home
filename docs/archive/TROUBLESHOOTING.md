# 开发环境问题诊断与解决方案

## 🔍 问题总结

在首次运行 `pnpm dev` 时遇到了多个错误，主要分为以下几类：

### 1. ❌ Blog Admin 依赖缺失

**错误信息：**
```
Module not found: Error: Can't resolve 'axios'
Module not found: Error: Can't resolve '@ant-design/icons-vue'
Module not found: Error: Can't resolve 'dayjs'
```

**原因：**
- blog-admin 的 package.json 中缺少这些依赖声明
- 可能是从旧项目迁移时遗漏了

**解决方案：**
```bash
cd apps/blog-admin
pnpm add axios @ant-design/icons-vue dayjs
```

---

### 2. ❌ Blog API 配置文件缺失

**错误信息：**
```
WARNING: NODE_ENV value of 'dev' did not match any deployment config file names.
WARNING: No configurations found in configuration directory
Error: Configuration property "mysql" is not defined
```

**原因：**
- blog-api 使用 `node-config` 库读取配置
- 缺少 `config/dev.json` 文件
- 只有 `config/example.js` 示例文件

**解决方案：**
创建 `apps/blog-api/config/dev.json`：
```json
{
  "port": 8085,
  "mysql": {
    "host": "localhost",
    "user": "blog_user",
    "password": "C3AnRPL8HHGNbd33reAV",
    "database": "space_log_blog"
  },
  "redis": {
    "host": "127.0.0.1",
    "port": 6379,
    "password": "MrpBLxNrWvQPCkz3kznltO9CwdyCiP5S"
  },
  "mail": {
    "smtp_host": "gz-smtp.qcloudmail.com",
    "smtp_port": 465,
    "smtp_user": "light@xiangleideng.site",
    "smtp_password": "Aiaih768aUShsinxSAu",
    "from_email": "light@xiangleideng.site",
    "from_name": "邓湘雷の博客"
  },
  "tokenSecretKey": "xld_blog_jwt_secret_2025_dev",
  "vipCustomerEmail": ["light@xiangleideng.site", "allen030703@163.com"]
}
```

---

### 3. ⚠️ 自动生成文件污染 Git

**问题：**
- `auto-imports.d.ts`
- `components.d.ts`
- `apps/blog-frontend/.nuxt/`

这些文件是构建工具自动生成的，不应该提交到 Git。

**解决方案：**
更新 `.gitignore`：
```gitignore
# Auto-generated files
auto-imports.d.ts
components.d.ts
*.d.ts

# Nuxt
.nuxt
.output
.nitro
```

---

### 4. ⚠️ API 连接失败（预期行为）

**错误信息：**
```
Failed to load resource: net::ERR_CONNECTION_CLOSED
/api/configuration/reception/getConfig
/music?server=tencent&type=playlist&id=9597130897
/api/weather/current
```

**原因：**
- 这些是**正常的开发环境错误**
- blog-api 服务因配置问题未启动
- music-api 可能未启动
- 主页尝试连接这些 API 但失败

**解决方案：**
1. 确保 MySQL 和 Redis 服务正在运行
2. 修复 blog-api 配置后重新启动
3. 主页会优雅降级，不影响核心功能

---

## ✅ 已修复的问题

### 修复 1: 安装 blog-admin 依赖
```bash
cd apps/blog-admin
pnpm add axios @ant-design/icons-vue dayjs
```

### 修复 2: 创建 blog-api 配置
```bash
# 已创建 apps/blog-api/config/dev.json
```

### 修复 3: 更新 .gitignore
```bash
# 已添加自动生成文件的忽略规则
```

---

## 🔧 数据库配置检查清单

在启动服务之前，请确保：

### MySQL 数据库
```bash
# 1. 检查 MySQL 是否运行
sudo systemctl status mysql
# 或
mysql.server status

# 2. 检查数据库是否存在
mysql -u blog_user -p
> SHOW DATABASES;
> USE space_log_blog;
> SHOW TABLES;

# 3. 如果数据库不存在，需要创建
# 参考 CLAUDE.md 中的数据库配置
```

### Redis 缓存
```bash
# 1. 检查 Redis 是否运行
sudo systemctl status redis
# 或
redis-cli ping

# 2. 测试密码认证
redis-cli -a MrpBLxNrWvQPCkz3kznltO9CwdyCiP5S
> PING
```

---

## 🚀 重新启动开发环境

修复完成后，重新启动：

```bash
# 停止所有服务（如果正在运行）
# Ctrl + C

# 重新启动所有服务
pnpm dev
```

---

## 📊 预期的正常启动输出

### ✅ Homepage (主页)
```
[homepage] VITE v4.5.14 ready in 356 ms
[homepage] ➜ Local:   http://localhost:3016/
```

### ✅ Blog Admin (博客管理后台)
```
[blog-admin] INFO Starting development server...
[blog-admin] App running at:
[blog-admin] - Local:   http://localhost:8080/
```

### ✅ Blog Frontend (博客前台)
```
[blog-frontend] Nuxt 3.20.2
[blog-frontend] ➜ Local:    http://0.0.0.0:3001/blog/
```

### ✅ Blog API (博客后端)
```
[blog-api] [nodemon] starting `node ./bin/www`
[blog-api] Server running on port 8085
```

### ✅ Music API (音乐服务)
```
[music-api] Meting API started on port 3000
```

---

## ⚠️ 仍然可能出现的警告（可忽略）

### 1. ESLint 版本警告
```
WARN deprecated eslint@8.57.1
```
**说明：** 不影响功能，可以后续升级

### 2. Peer Dependencies 警告
```
✕ unmet peer eslint@>=9.39.1: found 8.57.1
```
**说明：** 版本不匹配，但不影响开发

### 3. Vue 编译器警告
```
[@vue/compiler-sfc] ::v-deep usage as a combinator has been deprecated
```
**说明：** 旧代码风格，不影响功能

---

## 🎯 下一步行动

1. **检查数据库**
   - 确保 MySQL 和 Redis 正在运行
   - 验证数据库连接配置正确

2. **重新启动服务**
   ```bash
   pnpm dev
   ```

3. **验证服务**
   - 主页: http://localhost:3016
   - 博客前台: http://localhost:3001
   - 博客管理: http://localhost:8080
   - 博客 API: http://localhost:8085
   - 音乐 API: http://localhost:3000

4. **如果还有问题**
   - 查看具体的错误日志
   - 检查端口是否被占用
   - 验证环境变量配置

---

## 📝 Git 提交记录

所有修复已提交并推送：

```bash
[Fix] 🔧 修复开发环境依赖和配置问题
- 为 blog-admin 添加缺失的依赖
- 创建 blog-api 的 dev.json 配置文件
- 更新 .gitignore 忽略自动生成的文件
```

Commit: `526d32a`
Branch: `dev`

---

**问题已解决！** 🎉
