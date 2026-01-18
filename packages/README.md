# Shared Packages / 共享包

这个目录包含所有在 monorepo 中共享的内部包。

This directory contains all shared internal packages in the monorepo.

## 包列表 / Package List

### @xld/shared-utils
共享工具函数库，包含：
- HTTP 请求封装 (axios)
- 日期处理函数 (dayjs)
- 表单验证器
- 通用工具函数

Shared utility functions including:
- HTTP request wrapper (axios)
- Date manipulation (dayjs)
- Form validators
- Common utilities

### @xld/shared-types
共享 TypeScript 类型定义，包含：
- API 响应类型
- 数据模型类型
- 通用接口定义

Shared TypeScript type definitions including:
- API response types
- Data model types
- Common interface definitions

### @xld/shared-config
共享配置文件，包含：
- ESLint 配置
- Prettier 配置
- 其他构建工具配置

Shared configuration files including:
- ESLint config
- Prettier config
- Other build tool configs

## 使用方法 / Usage

在任何子项目中引用共享包：

```json
{
  "dependencies": {
    "@xld/shared-utils": "workspace:*",
    "@xld/shared-types": "workspace:*"
  }
}
```

在代码中导入：

```javascript
// JavaScript
import { request, formatDate } from '@xld/shared-utils';

// TypeScript
import type { ApiResponse, UserInfo } from '@xld/shared-types';
```

## 开发规范 / Development Guidelines

1. **版本管理**：所有共享包使用统一版本号
2. **依赖管理**：共享包之间可以相互依赖
3. **文档完善**：每个导出函数都需要 JSDoc 注释
4. **类型安全**：优先使用 TypeScript 编写
5. **测试覆盖**：关键函数需要单元测试

1. **Version Management**: All shared packages use unified version numbers
2. **Dependency Management**: Shared packages can depend on each other
3. **Documentation**: Every exported function needs JSDoc comments
4. **Type Safety**: Prefer TypeScript when possible
5. **Test Coverage**: Critical functions need unit tests
