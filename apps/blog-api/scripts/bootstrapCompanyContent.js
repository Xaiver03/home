const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const {
  getCompanyConfigurationDefaults,
  getCompanyFriendLinks,
  getCompanyInitialAdmin,
  resolveCompanyDatabasePath,
} = require('../config/companyContent');
const { bootstrapPreviewDatabase } = require('../services/devDatabase');

const bootstrapCompanyContent = async ({
  sequelize,
  Configuration,
  FriendLink,
  Admin,
  initialAdmin = null,
  hashPassword = (password) => bcrypt.hash(password, 10),
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

  let adminsCreated = 0;
  if (initialAdmin) {
    if (!Admin) throw new Error('初始化首位管理员时必须提供 Admin 模型');
    const existingAdmin = await Admin.findOne({ where: { mail: initialAdmin.mail } });
    if (!existingAdmin) {
      const passwordHash = await hashPassword(initialAdmin.password);
      await Admin.create({
        mail: initialAdmin.mail,
        username: initialAdmin.username,
        passwordHash,
      });
      adminsCreated += 1;
    }
  }

  return { configurationsCreated, friendLinksCreated, adminsCreated };
};

const createCompanyBootstrapDependencies = ({ storage = resolveCompanyDatabasePath() } = {}) => {
  const sequelize = new Sequelize({ dialect: 'sqlite', storage, logging: false });

  return {
    sequelize,
    Configuration: require('../models/configuration')(sequelize, DataTypes),
    FriendLink: require('../models/friendLink')(sequelize, DataTypes),
    Admin: require('../models/admin')(sequelize, DataTypes),
  };
};

const run = async () => {
  const initialAdmin = getCompanyInitialAdmin();

  if (!initialAdmin) {
    throw new Error(
      '首次初始化需要设置 COMPANY_ADMIN_EMAIL 和 COMPANY_ADMIN_PASSWORD，以创建可登录的公司管理员。',
    );
  }

  const { sequelize, Configuration, FriendLink, Admin } = createCompanyBootstrapDependencies();

  try {
    const result = await bootstrapCompanyContent({
      sequelize,
      Configuration,
      FriendLink,
      Admin,
      initialAdmin,
    });
    const summary = [
      `新增 ${result.configurationsCreated} 项配置`,
      `新增 ${result.friendLinksCreated} 条友链`,
      `新增 ${result.adminsCreated} 位管理员`,
    ].join('，');
    console.log(`公司内容初始化完成：${summary}。`);
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
