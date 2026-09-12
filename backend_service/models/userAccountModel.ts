const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("UserAccount", {
  UserId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "UserId" },
  UUID: { type: DataTypes.UUID, unique: true, field: "UUID" },
  UserInfoId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: "UserInfoId" },
  Username: { type: DataTypes.STRING(255), unique: true, field: "Username" },
  PasswordHash: { type: DataTypes.STRING(255), field: "PasswordHash" },
  ResetOtpHash: { type: DataTypes.STRING(64), field: "ResetOtpHash" },
  ResetOtpExpiresAt: { type: DataTypes.DATE, field: "ResetOtpExpiresAt" },
  RoleId: { type: DataTypes.INTEGER, allowNull: false, field: "RoleId" },
  Status: { type: DataTypes.ENUM("active", "inactive", "suspended", "banned"), allowNull: false, field: "Status" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
  UpdatedAt: { type: DataTypes.DATE, field: "UpdatedAt" },
}, { tableName: "UserAccounts", timestamps: false });
