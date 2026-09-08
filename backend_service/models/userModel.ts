const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("UserInfo", {
  UserInfoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "UserInfoId" },
  UUID: { type: DataTypes.UUID, unique: true, field: "UUID" },
  FullName: { type: DataTypes.STRING(255), field: "FullName" },
  Email: { type: DataTypes.STRING(255), allowNull: false, unique: true, field: "Email" },
  Phone: { type: DataTypes.STRING(50), field: "Phone" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
  UpdatedAt: { type: DataTypes.DATE, field: "UpdatedAt" },
}, { tableName: "UserInfo", timestamps: false });
