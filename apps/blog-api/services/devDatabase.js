const previewTables = [
  `CREATE TABLE IF NOT EXISTS article (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic VARCHAR(100) NOT NULL,
    introduction TEXT,
    createTime DATETIME NOT NULL,
    updatedTime DATETIME NOT NULL,
    popularity INTEGER NOT NULL DEFAULT 0,
    "like" INTEGER NOT NULL DEFAULT 0,
    typeId INTEGER NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'draft'
  )`,
  `CREATE TABLE IF NOT EXISTS article_type (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    theme VARCHAR(255) NOT NULL,
    introduction TEXT,
    popularity INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS configuration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label VARCHAR(255) NOT NULL,
    content JSON NOT NULL,
    type VARCHAR(150) NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    mail VARCHAR(255) NOT NULL UNIQUE,
    createTime DATETIME NOT NULL,
    updatedTime DATETIME
  )`,
  `CREATE TABLE IF NOT EXISTS comment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    userId INTEGER NOT NULL,
    entityType VARCHAR(50) NOT NULL,
    entityId INTEGER NOT NULL,
    parentId INTEGER,
    createTime DATETIME NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pending',
    subUserId INTEGER,
    "like" INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS friend_link (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    friendName VARCHAR(255) NOT NULL,
    coverLink VARCHAR(255),
    url VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(10) NOT NULL DEFAULT 'pending',
    createTime DATETIME NOT NULL,
    updatedTime DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mail VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE,
    passwordHash VARCHAR(255),
    createTime DATETIME NOT NULL,
    updatedTime DATETIME
  )`,
];

const bootstrapPreviewDatabase = async (sequelize) => {
  for (const statement of previewTables) {
    await sequelize.query(statement);
  }
};

module.exports = {
  bootstrapPreviewDatabase,
};
