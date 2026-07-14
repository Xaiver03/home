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
    username: process.env.DB_USER || 'blog_user',
    password: process.env.DB_PASSWORD || 'C3AnRPL8HHGNbd33reAV',
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
