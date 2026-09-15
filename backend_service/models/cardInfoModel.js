const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("CardInfo", {
  CardInfoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "CardInfoId" },
  UUID: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, field: "UUID" },
  CreatorProfileId: { type: DataTypes.INTEGER, allowNull: false, field: "CreatorProfileId" },
  StorefrontId: { type: DataTypes.INTEGER, allowNull: true, field: "StorefrontId" },
  CardName: { type: DataTypes.STRING(255), field: "CardName" },
  CardNumber: { type: DataTypes.TEXT, field: "CardNumber" },
  CardExpiry: { type: DataTypes.TEXT, field: "CardExpiry" },
  CardCvc: { type: DataTypes.TEXT, field: "CardCvc" },
  CardBrand: { type: DataTypes.TEXT, field: "CardBrand" },
  Provider: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "PayPal", field: "Provider" },
  StripePaymentMethodId: { type: DataTypes.STRING(255), field: "StripePaymentMethodId" },
  Methods: { type: DataTypes.JSONB, allowNull: false, defaultValue: [], field: "Methods" },
  PrimaryMethod: { type: DataTypes.STRING(50), field: "PrimaryMethod" },
  TaxId: { type: DataTypes.STRING(255), field: "TaxId" },
  PaypalEmail: { type: DataTypes.STRING(255), field: "PaypalEmail" },
  StripeEmail: { type: DataTypes.STRING(255), field: "StripeEmail" },
  StripeAccountId: { type: DataTypes.STRING(255), field: "StripeAccountId" },
  Metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {}, field: "Metadata" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
  UpdatedAt: { type: DataTypes.DATE, field: "UpdatedAt" },
}, { tableName: "CardInfo", timestamps: false });
