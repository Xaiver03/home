const { Sequelize } = require('sequelize');

const modelFactories = [
  ['admin', require('../models/admin')],
  ['article', require('../models/article')],
  ['article_type', require('../models/articleType')],
  ['comment', require('../models/comment')],
  ['configuration', require('../models/configuration')],
  ['friend_link', require('../models/friendLink')],
  ['question', require('../models/question')],
  ['user', require('../models/user')],
];

describe('primary key index declarations', () => {
  let sequelize;

  beforeEach(() => {
    sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it.each(modelFactories)('%s keeps id as the primary key without a duplicate PRIMARY index', (tableName, factory) => {
    const model = factory(sequelize, Sequelize.DataTypes);
    const primaryAttributes = Object.values(model.getAttributes()).filter((attribute) => attribute.primaryKey);
    const primaryIndexes = model.options.indexes.filter((index) => index.name === 'PRIMARY');

    expect(primaryAttributes.map((attribute) => attribute.field)).toEqual(['id']);
    expect(primaryIndexes).toEqual([]);
    expect(model.getTableName()).toBe(tableName);
  });
});
