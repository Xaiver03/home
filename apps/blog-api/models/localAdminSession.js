module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "localAdminSession",
    {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      handleHash: { type: DataTypes.STRING(64), allowNull: false },
      csrfHash: { type: DataTypes.STRING(64), allowNull: false },
      adminId: { type: DataTypes.INTEGER, allowNull: false },
      idleExpiresAt: { type: DataTypes.DATE, allowNull: false },
      absoluteExpiresAt: { type: DataTypes.DATE, allowNull: false },
      revokedAt: { type: DataTypes.DATE, allowNull: true },
      lastCheckedAt: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: "local_admin_sessions",
      timestamps: true,
      indexes: [
        { name: "local_admin_sessions_handle_hash", unique: true, fields: ["handleHash"] },
        { name: "local_admin_sessions_admin", fields: ["adminId"] },
      ],
    },
  );
};
