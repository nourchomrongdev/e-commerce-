const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("Product", {
  ProductId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "ProductId" },
  UUID: { type: DataTypes.UUID, allowNull: false, field: "UUID" },
  StorefrontId: { type: DataTypes.INTEGER, allowNull: false, field: "StorefrontId" },
  CategoryId: { type: DataTypes.INTEGER, allowNull: false, field: "CategoryId" },
  ProductName: { type: DataTypes.STRING(255), allowNull: false, field: "ProductName" },
  Slug: { type: DataTypes.STRING(255), allowNull: false, unique: true, field: "Slug" },
  Description: { type: DataTypes.TEXT, field: "Description" },
  ProductType: { type: DataTypes.STRING(50), allowNull: false, field: "ProductType" },
  Price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: "Price" },
  DiscountPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0, field: "DiscountPercent" },
  Currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "USD", field: "Currency" },
  Status: { type: DataTypes.STRING(30), allowNull: false, field: "Status" },
  ThumbnailUrl: { type: DataTypes.TEXT, field: "ThumbnailUrl" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
  UpdatedAt: { type: DataTypes.DATE, field: "UpdatedAt" },
}, { tableName: "Products", timestamps: false });
