const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("UserRole", {
  UserRoleId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "UserRoleId" },
  UUID: { type: DataTypes.UUID, unique: true, field: "UUID" },
  RoleName: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: "RoleName" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
}, { tableName: "UsersRoles", timestamps: false });
