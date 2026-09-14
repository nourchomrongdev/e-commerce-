const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("UserAccountRole", {
  UserAccountRoleId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "UserAccountRoleId" },
  UserId: { type: DataTypes.INTEGER, allowNull: false, field: "UserId" },
  UserRoleId: { type: DataTypes.INTEGER, allowNull: false, field: "UserRoleId" },
  CreatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: "CreatedAt" },
}, { tableName: "UserAccountRoles", timestamps: false });
