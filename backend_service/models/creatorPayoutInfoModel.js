const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("CreatorPayoutInfo", {
  CreatorPayoutInfoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "CreatorPayoutInfoId" },
  CreatorProfileId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: "CreatorProfileId" },
  PayoutMethod: { type: DataTypes.STRING(50), allowNull: false, field: "PayoutMethod" },
  AccountName: { type: DataTypes.STRING(255), field: "AccountName" },
  AccountIdentifier: { type: DataTypes.TEXT, field: "AccountIdentifier" },
  Currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: "USD", field: "Currency" },
  IsVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "IsVerified" },
  IsActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "IsActive" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
  UpdatedAt: { type: DataTypes.DATE, field: "UpdatedAt" },
}, { tableName: "CreatorPayoutInfo", timestamps: false });
