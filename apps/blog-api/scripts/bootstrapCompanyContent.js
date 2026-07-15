const { Sequelize, DataTypes } = require('sequelize');

const {
  getCompanyConfigurationDefaults,
  getCompanyFriendLinks,
  resolveCompanyDatabasePath,
} = require('../config/companyContent');
const { bootstrapPreviewDatabase } = require('../services/devDatabase');

const bootstrapCompanyContent = async ({
  sequelize,
  Configuration,
  FriendLink,
  prepareDatabase = bootstrapPreviewDatabase,
}) => {
  await prepareDatabase(sequelize);

  let configurationsCreated = 0;
  for (const item of getCompanyConfigurationDefaults()) {
    const [, created] = await Configuration.findOrCreate({
      where: { label: item.label },
      defaults: item,
    });
    if (created) configurationsCreated += 1;
  }

  let friendLinksCreated = 0;
  for (const item of getCompanyFriendLinks()) {
    const [friendLink, created] = await FriendLink.findOrCreate({
      where: { url: item.url },
      defaults: item,
    });

    if (created) {
      friendLinksCreated += 1;
      await friendLink.update({ status: item.status }, { hooks: false });
    }
  }

  return { configurationsCreated, friendLinksCreated };
};

const createCompanyBootstrapDependencies = ({ storage = resolveCompanyDatabasePath() } = {}) => {
  const sequelize = new Sequelize({ dialect: 'sqlite', storage, logging: false });

  return {
    sequelize,
    Configuration: require('../models/configuration')(sequelize, DataTypes),
    FriendLink: require('../models/friendLink')(sequelize, DataTypes),
  };
};

const run = async () => {
  const { sequelize, Configuration, FriendLink } = createCompanyBootstrapDependencies();

  try {
    const result = await bootstrapCompanyContent({ sequelize, Configuration, FriendLink });
    console.log(
      `公司内容初始化完成：新增 ${result.configurationsCreated} 项配置，新增 ${result.friendLinksCreated} 条友链。`,
    );
  } finally {
    await sequelize.close();
  }
};

if (require.main === module) {
  run().catch((error) => {
    console.error('公司内容初始化失败：', error);
    process.exitCode = 1;
  });
}

module.exports = { bootstrapCompanyContent, createCompanyBootstrapDependencies };
