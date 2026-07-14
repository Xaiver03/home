'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('admin')) return;

    const table = await queryInterface.describeTable('admin');
    if (!table.username) {
      await queryInterface.addColumn('admin', 'username', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
        comment: '管理员账号',
      });
    }
    if (!table.passwordHash) {
      await queryInterface.addColumn('admin', 'passwordHash', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '密码哈希',
      });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('admin')) return;

    const table = await queryInterface.describeTable('admin');
    if (table.username) {
      await queryInterface.removeColumn('admin', 'username');
    }
    if (table.passwordHash) {
      await queryInterface.removeColumn('admin', 'passwordHash');
    }
  }
};
