const { Sequelize } = require('sequelize');
const { bootstrapPreviewDatabase } = require('../services/devDatabase');

describe('bootstrapPreviewDatabase', () => {
  it('creates the tables required by public site routes on an empty SQLite database', async () => {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });

    await bootstrapPreviewDatabase(sequelize);

    const [tables] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    );

    expect(tables.map((table) => table.name)).toEqual(
      expect.arrayContaining([
        'article',
        'article_type',
        'comment',
        'configuration',
        'friend_link',
        'user',
      ]),
    );

    await sequelize.close();
  });
});
