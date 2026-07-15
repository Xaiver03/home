// sequelize 入口文件
const { Sequelize } = require('sequelize');
const config = require('config');
const {
  resolveCompanyDatabasePath,
  usesCompanyDevelopmentDatabase,
} = require('../config/companyContent');

// 开发环境使用 SQLite，生产环境使用 MySQL
const isDev = usesCompanyDevelopmentDatabase();

let sequelize;

if (isDev) {
  // 公司内容开发环境：使用独立 SQLite，避免读取个人站开发数据。
  const dbPath = resolveCompanyDatabasePath();
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
  console.log(`使用 SQLite 数据库: ${dbPath}`);
} else {
  // 生产环境：使用 MySQL
  const mysqlConfig = config.get('mysql');
  sequelize = new Sequelize(
    mysqlConfig.database,
    mysqlConfig.user,
    mysqlConfig.password,
    {
      host: mysqlConfig.host,
      dialect: 'mysql',
      port: 3306,
      timezone: '+08:00',
      pool: {
        max: 20,
        min: 3,
        idle: 20000,
      },
      define: {
        charset: 'utf8',
      },
    },
  );
}

// 数据库连接提示信息
sequelize
  .authenticate()
  .then(() => {
    console.log('Sequelize：数据库连接成功');
  })
  .catch((err) => {
    console.log('Sequelize：数据库连接失败 ', err);
  });

// 创建暴露模型对象
const db = {
  Sequelize,
  sequelize,
};

// 导入模型
db.Article = require('./article.js')(sequelize, Sequelize.DataTypes);
db.ArticleType = require('./articleType.js')(sequelize, Sequelize.DataTypes);
db.User = require('./user.js')(sequelize, Sequelize.DataTypes);
db.Comment = require('./comment.js')(sequelize, Sequelize.DataTypes);
db.Admin = require('./admin.js')(sequelize, Sequelize.DataTypes);
db.FriendLink = require('./friendLink.js')(sequelize,Sequelize.DataTypes);
db.Configuration = require('./configuration.js')(sequelize,Sequelize.DataTypes);
db.Question = require('./question.js')(sequelize, Sequelize.DataTypes);

// 定义模型间的关系
db.ArticleType.hasMany(db.Article, {
  foreignKey: 'typeId',
}); // 一个文章类型对应多个文章，外键为文章中的typeId字段
db.Article.belongsTo(db.ArticleType, {
  foreignKey: 'typeId',
}); // 一个文章类型对应多个文章，外键为文章中的typeId字段
db.Article.hasMany(db.Comment, {
  foreignKey: 'entityId',
});
db.Comment.belongsTo(db.Article, {
  foreignKey: 'entityId',
});
db.User.hasMany(db.Comment, {
  foreignKey: 'userId',
});
db.Comment.belongsTo(db.User, {
  foreignKey: 'userId',
});
db.Comment.belongsTo(db.User, {
  foreignKey: 'subUserId',
  as: 'subUser',
});
db.Comment.hasMany(db.Comment, {
  foreignKey: 'parentId',
  as: 'children', // 定义关联别名
});

module.exports = db;
