# 数据库迁移系统使用指南

## 概述

本项目使用 Sequelize CLI 进行数据库迁移管理。

## 环境配置

- **开发环境 (development)**: 使用 SQLite (`database.db`)
- **生产环境 (production)**: 使用 MySQL

配置文件位于 `config/database.js`

## 常用命令

### 创建新的迁移文件

```bash
# 在 blog-api 目录下执行
pnpm migration:generate your-migration-name

# 或使用完整命令
npx sequelize-cli migration:generate --name your-migration-name
```

### 运行迁移（应用数据库变更）

```bash
# 开发环境
NODE_ENV=development pnpm db:migrate

# 生产环境
NODE_ENV=production pnpm db:migrate
```

### 回滚迁移

```bash
# 回滚最后一次迁移
NODE_ENV=development pnpm db:migrate:undo

# 回滚所有迁移
NODE_ENV=development pnpm db:migrate:undo:all
```

## 迁移文件示例

创建新表的迁移文件示例：

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('example_table', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('example_table');
  }
};
```

## 注意事项

1. **现有数据库**: 当前数据库表已经存在，迁移系统用于管理**未来的变更**
2. **生产环境**: 在生产环境运行迁移前，务必先备份数据库
3. **团队协作**: 每次数据库结构变更都应该创建迁移文件并提交到 Git
4. **迁移顺序**: 迁移文件按时间戳顺序执行，不要修改已运行的迁移文件

## 工作流程

### 添加新字段

1. 创建迁移文件：
```bash
pnpm migration:generate add-field-to-table
```

2. 编辑迁移文件：
```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'avatar', {
      type: Sequelize.STRING(500),
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'avatar');
  }
};
```

3. 更新对应的模型文件 (`models/user.js`)

4. 运行迁移：
```bash
NODE_ENV=development pnpm db:migrate
```

### 修改字段

```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'name', {
      type: Sequelize.STRING(500), // 从 255 改为 500
      allowNull: false
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'name', {
      type: Sequelize.STRING(255),
      allowNull: false
    });
  }
};
```

## 常见问题

### Q: 如何在生产环境运行迁移？

A: 使用环境变量指定环境：
```bash
NODE_ENV=production pnpm db:migrate
```

### Q: 迁移失败了怎么办？

A:
1. 检查错误信息
2. 修复迁移文件中的问题
3. 回滚失败的迁移：`pnpm db:migrate:undo`
4. 重新运行迁移

### Q: 如何查看迁移状态？

A: 查看 `SequelizeMeta` 表，它记录了已执行的迁移。

## 参考资料

- [Sequelize Migrations 官方文档](https://sequelize.org/docs/v6/other-topics/migrations/)
- [Sequelize CLI 文档](https://github.com/sequelize/cli)
