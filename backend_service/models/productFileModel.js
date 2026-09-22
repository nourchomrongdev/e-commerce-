const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("ProductFile", {
  ProductFileId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: "ProductFileId" },
  UUID: { type: DataTypes.UUID, allowNull: false, field: "UUID" },
  ProductId: { type: DataTypes.INTEGER, allowNull: false, field: "ProductId" },
  ProductVersionId: { type: DataTypes.BIGINT, field: "ProductVersionId" },
  FileName: { type: DataTypes.STRING(255), allowNull: false, field: "FileName" },
  StorageKey: { type: DataTypes.TEXT, allowNull: false, field: "StorageKey" },
  FileUrl: { type: DataTypes.TEXT, field: "FileUrl" },
  FileSize: { type: DataTypes.BIGINT, allowNull: false, field: "FileSize" },
  MimeType: { type: DataTypes.STRING(150), field: "MimeType" },
  IsProtected: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "IsProtected" },
  IsActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "IsActive" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
}, { tableName: "ProductFiles", timestamps: false });
