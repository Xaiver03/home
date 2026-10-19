module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "centralOidcState",
    {
      id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
      stateHash: { type: DataTypes.STRING(64), allowNull: false },
      nonceHash: { type: DataTypes.STRING(64), allowNull: false },
      codeVerifierCiphertext: { type: DataTypes.TEXT, allowNull: false },
      returnTo: { type: DataTypes.STRING(512), allowNull: false },
      requestedScope: { type: DataTypes.STRING(1024), allowNull: false },
      requestedMode: { type: DataTypes.STRING(32), allowNull: false, defaultValue: "public" },
      identityEmail: { type: DataTypes.STRING(255), allowNull: true },
      accessTokenCiphertext: { type: DataTypes.TEXT, allowNull: true },
      refreshTokenCiphertext: { type: DataTypes.TEXT, allowNull: true },
      tokenExpiresAt: { type: DataTypes.DATE, allowNull: true },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      consumedAt: { type: DataTypes.DATE, allowNull: true },
      identitySubject: { type: DataTypes.UUID, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: "central_oidc_states",
      timestamps: true,
      indexes: [
        { name: "central_oidc_states_state_hash", unique: true, fields: ["stateHash"] },
        { name: "central_oidc_states_expires_at", fields: ["expiresAt"] },
      ],
    },
  );
};
