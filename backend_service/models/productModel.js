const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("Product", {
  ProductId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "ProductId" },
  StorefrontId: { type: DataTypes.INTEGER, allowNull: false, field: "StorefrontId" },
  ProductName: { type: DataTypes.STRING(255), allowNull: false, field: "ProductName" },
  Price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: "Price" },
  Status: { type: DataTypes.STRING(30), allowNull: false, field: "Status" },
  ThumbnailUrl: { type: DataTypes.TEXT, field: "ThumbnailUrl" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
}, { tableName: "Products", timestamps: false });
