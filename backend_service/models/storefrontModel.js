const { DataTypes } = require("sequelize");
const sequelize = require("./database");

module.exports = sequelize?.define("Storefront", {
  StorefrontId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: "StorefrontId" },
  UUID: { type: DataTypes.UUID, unique: true, field: "UUID" },
  CreatorProfileId: { type: DataTypes.INTEGER, allowNull: false, field: "CreatorProfileId" },
  StoreName: { type: DataTypes.STRING(150), allowNull: false, field: "StoreName" },
  StoreSlug: { type: DataTypes.STRING(150), allowNull: false, unique: true, field: "StoreSlug" },
  Description: { type: DataTypes.TEXT, field: "Description" },
  LogoUrl: { type: DataTypes.TEXT, field: "LogoUrl" },
  BannerUrl: { type: DataTypes.TEXT, field: "BannerUrl" },
  WebsiteUrl: { type: DataTypes.TEXT, field: "WebsiteUrl" },
  ThemeSettings: { type: DataTypes.JSONB, allowNull: false, defaultValue: {}, field: "ThemeSettings" },
  IsPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: "IsPublished" },
  IsActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "IsActive" },
  CreatedAt: { type: DataTypes.DATE, field: "CreatedAt" },
  UpdatedAt: { type: DataTypes.DATE, field: "UpdatedAt" },
}, { tableName: "Storefronts", timestamps: false });
