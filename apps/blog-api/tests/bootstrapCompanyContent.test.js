const { Sequelize, DataTypes } = require('sequelize');

const {
  bootstrapCompanyContent,
  createCompanyBootstrapDependencies,
} = require('../scripts/bootstrapCompanyContent');

describe('company content bootstrap', () => {
  let sequelize;
  let Configuration;
  let FriendLink;

  beforeEach(async () => {
    sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
    Configuration = require('../models/configuration')(sequelize, DataTypes);
    FriendLink = require('../models/friendLink')(sequelize, DataTypes);
  });

  afterEach(async () => {
    await sequelize.close();
  });

  test('creates missing company configuration and the approved CEO friend link', async () => {
    const result = await bootstrapCompanyContent({ sequelize, Configuration, FriendLink });

    expect(result.configurationsCreated).toBeGreaterThan(0);
    expect(await Configuration.count()).toBe(result.configurationsCreated);
    expect(await FriendLink.findOne({ where: { url: 'https://xiangleideng.site' }, raw: true })).toMatchObject(
      {
        friendName: '灯下灯 · 个人站',
        status: 'active',
      },
    );
  });

  test('creates standalone CLI dependencies without loading private app configuration', async () => {
    const dependencies = createCompanyBootstrapDependencies({ storage: ':memory:' });

    expect(dependencies.sequelize.getDialect()).toBe('sqlite');
    expect(dependencies.Configuration.tableName).toBe('configuration');
    expect(dependencies.FriendLink.tableName).toBe('friend_link');

    await dependencies.sequelize.close();
  });

  test('is idempotent and never overwrites edited company content', async () => {
    await bootstrapCompanyContent({ sequelize, Configuration, FriendLink });
    const brand = await Configuration.findOne({ where: { label: 'site-brand' } });
    await brand.update({ content: { name: '编辑后的团队名称' } });

    const secondRun = await bootstrapCompanyContent({ sequelize, Configuration, FriendLink });
    const preservedBrand = await Configuration.findOne({ where: { label: 'site-brand' }, raw: true });
    const preservedContent =
      typeof preservedBrand.content === 'string'
        ? JSON.parse(preservedBrand.content)
        : preservedBrand.content;

    expect(secondRun).toMatchObject({ configurationsCreated: 0, friendLinksCreated: 0 });
    expect(preservedContent).toEqual({ name: '编辑后的团队名称' });
  });
});
