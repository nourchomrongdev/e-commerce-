const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("OrderItem", {
  OrderItemId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: "OrderItemId" },
  OrderId: { type: DataTypes.BIGINT, allowNull: false, field: "OrderId" },
  ProductId: { type: DataTypes.INTEGER, allowNull: false, field: "ProductId" },
  StorefrontId: { type: DataTypes.INTEGER, allowNull: false, field: "StorefrontId" },
  ProductName: { type: DataTypes.STRING(255), allowNull: false, field: "ProductName" },
  Quantity: { type: DataTypes.INTEGER, allowNull: false, field: "Quantity" },
  TotalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: "TotalAmount" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
}, { tableName: "OrderItems", timestamps: false });
