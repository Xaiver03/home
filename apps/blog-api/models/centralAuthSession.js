module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "centralAuthSession",
    {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      handleHash: { type: DataTypes.STRING(64), allowNull: false },
      csrfHash: { type: DataTypes.STRING(64), allowNull: false },
      issuer: { type: DataTypes.STRING(512), allowNull: false },
      clientId: { type: DataTypes.STRING(255), allowNull: false },
      identitySubject: { type: DataTypes.UUID, allowNull: false },
      localUserId: { type: DataTypes.BIGINT, allowNull: true },
      localAdminId: { type: DataTypes.INTEGER, allowNull: true },
      mode: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "public" },
      scope: { type: DataTypes.TEXT, allowNull: false },
      accessTokenCiphertext: { type: DataTypes.TEXT, allowNull: false },
      refreshTokenCiphertext: { type: DataTypes.TEXT, allowNull: true },
      tokenExpiresAt: { type: DataTypes.DATE, allowNull: true },
      idleExpiresAt: { type: DataTypes.DATE, allowNull: false },
      absoluteExpiresAt: { type: DataTypes.DATE, allowNull: false },
      revokedAt: { type: DataTypes.DATE, allowNull: true },
      lastCheckedAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: "central_auth_sessions",
      timestamps: true,
      indexes: [
        { name: "central_auth_sessions_handle_hash", unique: true, fields: ["handleHash"] },
        { name: "central_auth_sessions_subject", fields: ["identitySubject"] },
      ],
    },
  );
};
