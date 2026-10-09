const path = require('path');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.dev.db'),
    logging: false
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    username: process.env.DB_USER || process.env.MYSQL_USER || 'blog_user_r2',
    // 口令不落仓库：这条 sequelize-cli 路径读 DB_PASSWORD，运行时那条读 MYSQL_PASSWORD（node-config）
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || 'space_log_blog',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    timezone: '+08:00',
    pool: {
      max: 20,
      min: 3,
      idle: 20000
    },
    define: {
      charset: 'utf8'
    },
    logging: false
  }
};
