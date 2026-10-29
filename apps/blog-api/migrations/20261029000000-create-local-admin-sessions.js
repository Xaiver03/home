'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.some((entry) => String(entry).toLowerCase() === 'local_admin_sessions')) return;

    await queryInterface.createTable('local_admin_sessions', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      handleHash: { type: Sequelize.STRING(64), allowNull: false, comment: '会话句柄哈希' },
      csrfHash: { type: Sequelize.STRING(64), allowNull: false, comment: 'CSRF 令牌哈希' },
      adminId: { type: Sequelize.INTEGER, allowNull: false, comment: '管理员id' },
      idleExpiresAt: { type: Sequelize.DATE, allowNull: false, comment: '空闲过期时间' },
      absoluteExpiresAt: { type: Sequelize.DATE, allowNull: false, comment: '绝对过期时间' },
      revokedAt: { type: Sequelize.DATE, allowNull: true, comment: '撤销时间' },
      lastCheckedAt: { type: Sequelize.DATE, allowNull: true, comment: '最近校验时间' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('local_admin_sessions', ['handleHash'], {
      unique: true,
      name: 'local_admin_sessions_handle_hash',
    });
    await queryInterface.addIndex('local_admin_sessions', ['adminId'], {
      name: 'local_admin_sessions_admin',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('local_admin_sessions');
  },
};
