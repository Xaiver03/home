'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('admin', 'username', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      comment: '管理员账号',
    });
    await queryInterface.addColumn('admin', 'passwordHash', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: '密码哈希',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('admin', 'username');
    await queryInterface.removeColumn('admin', 'passwordHash');
  }
};
