const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("Order", {
  OrderId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true, field: "OrderId" },
  OrderNumber: { type: DataTypes.STRING(50), allowNull: false, field: "OrderNumber" },
  TotalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: "TotalAmount" },
  Status: { type: DataTypes.STRING(30), allowNull: false, field: "Status" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
}, { tableName: "Orders", timestamps: false });
