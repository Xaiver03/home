'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const tableName of ['user', 'admin']) {
      const tables = await queryInterface.showAllTables();
      const actual = tables.find((name) => String(name).toLowerCase() === tableName);
      if (!actual) continue;
      const table = await queryInterface.describeTable(actual);
      if (!table.identitySubject) {
        await queryInterface.addColumn(actual, 'identitySubject', {
          type: Sequelize.UUID,
          allowNull: true,
          comment: '中央统一身份 subject；只允许显式双证明绑定',
        });
        // SQLite 不支持 ALTER TABLE ADD COLUMN ... UNIQUE；用显式唯一索引兼容
        // SQLite 与 MySQL，并保持索引名称稳定，便于审计和回滚。
        await queryInterface.addIndex(actual, ['identitySubject'], {
          unique: true,
          name: `${actual}_identity_subject`,
        });
      }
    }

    const tables = await queryInterface.showAllTables();
    const has = (name) => tables.some((entry) => String(entry).toLowerCase() === name);
    if (!has('central_auth_sessions')) {
      await queryInterface.createTable('central_auth_sessions', {
        id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
        handleHash: { type: Sequelize.STRING(64), allowNull: false },
        csrfHash: { type: Sequelize.STRING(64), allowNull: false },
        issuer: { type: Sequelize.STRING(512), allowNull: false },
        clientId: { type: Sequelize.STRING(255), allowNull: false },
        identitySubject: { type: Sequelize.UUID, allowNull: false },
        localUserId: { type: Sequelize.BIGINT, allowNull: true },
        localAdminId: { type: Sequelize.INTEGER, allowNull: true },
        mode: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'public' },
        scope: { type: Sequelize.TEXT, allowNull: false },
        accessTokenCiphertext: { type: Sequelize.TEXT, allowNull: false },
        refreshTokenCiphertext: { type: Sequelize.TEXT, allowNull: true },
        tokenExpiresAt: { type: Sequelize.DATE, allowNull: true },
        idleExpiresAt: { type: Sequelize.DATE, allowNull: false },
        absoluteExpiresAt: { type: Sequelize.DATE, allowNull: false },
        revokedAt: { type: Sequelize.DATE, allowNull: true },
        lastCheckedAt: { type: Sequelize.DATE, allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
      await queryInterface.addIndex('central_auth_sessions', ['handleHash'], {
        unique: true,
        name: 'central_auth_sessions_handle_hash',
      });
      await queryInterface.addIndex('central_auth_sessions', ['identitySubject'], {
        name: 'central_auth_sessions_subject',
      });
    }
    if (!has('central_oidc_states')) {
      await queryInterface.createTable('central_oidc_states', {
        id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
        stateHash: { type: Sequelize.STRING(64), allowNull: false },
        nonceHash: { type: Sequelize.STRING(64), allowNull: false },
        codeVerifierCiphertext: { type: Sequelize.TEXT, allowNull: false },
        returnTo: { type: Sequelize.STRING(512), allowNull: false },
        requestedScope: { type: Sequelize.STRING(1024), allowNull: false },
        requestedMode: { type: Sequelize.STRING(32), allowNull: false, defaultValue: 'public' },
        identityEmail: { type: Sequelize.STRING(255), allowNull: true },
        accessTokenCiphertext: { type: Sequelize.TEXT, allowNull: true },
        refreshTokenCiphertext: { type: Sequelize.TEXT, allowNull: true },
        tokenExpiresAt: { type: Sequelize.DATE, allowNull: true },
        expiresAt: { type: Sequelize.DATE, allowNull: false },
        consumedAt: { type: Sequelize.DATE, allowNull: true },
        identitySubject: { type: Sequelize.UUID, allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
      await queryInterface.addIndex('central_oidc_states', ['stateHash'], {
        unique: true,
        name: 'central_oidc_states_state_hash',
      });
      await queryInterface.addIndex('central_oidc_states', ['expiresAt'], {
        name: 'central_oidc_states_expires_at',
      });
    }
  },

  async down(queryInterface) {
    for (const name of ['central_oidc_states', 'central_auth_sessions']) {
      const tables = await queryInterface.showAllTables();
      if (tables.some((entry) => String(entry).toLowerCase() === name)) {
        await queryInterface.dropTable(name);
      }
    }
    for (const tableName of ['user', 'admin']) {
      const tables = await queryInterface.showAllTables();
      const actual = tables.find((name) => String(name).toLowerCase() === tableName);
      if (!actual) continue;
      const table = await queryInterface.describeTable(actual);
      if (table.identitySubject) await queryInterface.removeColumn(actual, 'identitySubject');
    }
  },
};
