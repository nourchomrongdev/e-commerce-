const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("OAuthAccount", {
  OAuthAccountId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "OAuthAccountId" },
  UUID: { type: DataTypes.UUID, unique: true, field: "UUID" },
  Provider: { type: DataTypes.STRING(50), allowNull: false, field: "Provider" },
  ProviderAccountId: { type: DataTypes.STRING(255), allowNull: false, field: "ProviderAccountId" },
  ProviderEmail: { type: DataTypes.STRING(255), field: "ProviderEmail" },
  UserId: { type: DataTypes.INTEGER, allowNull: false, field: "UserId" },
  AccessToken: { type: DataTypes.TEXT, field: "AccessToken" },
  RefreshToken: { type: DataTypes.TEXT, field: "RefreshToken" },
  TokenExpiresAt: { type: DataTypes.DATE, field: "TokenExpiresAt" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
  UpdatedAt: { type: DataTypes.DATE, field: "UpdatedAt" },
}, { tableName: "OAuthAccounts", timestamps: false });
