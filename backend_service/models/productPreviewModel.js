const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("ProductPreview", {
  ProductPreviewId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: "ProductPreviewId" },
  ProductId: { type: DataTypes.INTEGER, allowNull: false, field: "ProductId" },
  PreviewType: { type: DataTypes.STRING(50), allowNull: false, field: "PreviewType" },
  Title: { type: DataTypes.STRING(255), field: "Title" },
  PreviewUrl: { type: DataTypes.TEXT, allowNull: false, field: "PreviewUrl" },
  SortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: "SortOrder" },
  IsActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "IsActive" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
}, { tableName: "ProductPreviews", timestamps: false });
