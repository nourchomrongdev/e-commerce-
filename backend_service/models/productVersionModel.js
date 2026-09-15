const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("ProductVersion", {
  ProductVersionId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: "ProductVersionId" },
  ProductId: { type: DataTypes.INTEGER, allowNull: false, field: "ProductId" },
  UUID: { type: DataTypes.UUID, allowNull: false, field: "UUID" },
  VersionNumber: { type: DataTypes.STRING(50), allowNull: false, field: "VersionNumber" },
  ReleaseNotes: { type: DataTypes.TEXT, field: "ReleaseNotes" },
  IsCurrent: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "IsCurrent" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
}, { tableName: "ProductVersions", timestamps: false });
