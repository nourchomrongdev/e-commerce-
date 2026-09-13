const sequelize = require("./database");
const UserRole = require("./userRoleModel");
const UserInfo = require("./userModel");
const UserAccount = require("./userAccountModel");
const UserAccountRole = require("./userAccountRoleModel");
const OAuthAccount = require("./oauthAccountModel");
const CreatorProfile = require("./creatorProfileModel");
const Storefront = require("./storefrontModel");
const CreatorPayoutInfo = require("./creatorPayoutInfoModel");
const CardInfo = require("./cardInfoModel");
const Product = require("./productModel");
const Order = require("./orderModel");
const OrderItem = require("./orderItemModel");

if (sequelize) {
  UserInfo.hasOne(UserAccount, { foreignKey: "UserInfoId", as: "account" });
  UserAccount.belongsTo(UserInfo, { foreignKey: "UserInfoId", as: "info" });
  UserRole.hasMany(UserAccount, { foreignKey: "RoleId", as: "accounts" });
  UserAccount.belongsTo(UserRole, { foreignKey: "RoleId", as: "role" });
  UserAccount.hasMany(UserAccountRole, { foreignKey: "UserId", as: "roles" });
  UserRole.hasMany(UserAccountRole, { foreignKey: "UserRoleId", as: "userLinks" });
  UserAccountRole.belongsTo(UserAccount, { foreignKey: "UserId", as: "user" });
  UserAccountRole.belongsTo(UserRole, { foreignKey: "UserRoleId", as: "role" });
  UserAccount.hasMany(OAuthAccount, { foreignKey: "UserId", as: "oauthAccounts" });
  OAuthAccount.belongsTo(UserAccount, { foreignKey: "UserId", as: "account" });
  UserAccount.hasOne(CreatorProfile, { foreignKey: "UserId", as: "creatorProfile" });
  CreatorProfile.belongsTo(UserAccount, { foreignKey: "UserId", as: "user" });
  CreatorProfile.hasOne(Storefront, { foreignKey: "CreatorProfileId", as: "storefront" });
  Storefront.belongsTo(CreatorProfile, { foreignKey: "CreatorProfileId", as: "creatorProfile" });
  CreatorProfile.hasOne(CreatorPayoutInfo, { foreignKey: "CreatorProfileId", as: "payoutInfo" });
  CreatorPayoutInfo.belongsTo(CreatorProfile, { foreignKey: "CreatorProfileId", as: "creatorProfile" });
  CreatorProfile.hasOne(CardInfo, { foreignKey: "CreatorProfileId", as: "cardInfo" });
  CardInfo.belongsTo(CreatorProfile, { foreignKey: "CreatorProfileId", as: "creatorProfile" });
  Storefront.hasMany(Product, { foreignKey: "StorefrontId", as: "products" });
  Product.belongsTo(Storefront, { foreignKey: "StorefrontId", as: "storefront" });
  Storefront.hasMany(OrderItem, { foreignKey: "StorefrontId", as: "orderItems" });
  OrderItem.belongsTo(Storefront, { foreignKey: "StorefrontId", as: "storefront" });
  Order.hasMany(OrderItem, { foreignKey: "OrderId", as: "items" });
  OrderItem.belongsTo(Order, { foreignKey: "OrderId", as: "order" });
}

module.exports = { sequelize, UserRole, UserInfo, UserAccount, UserAccountRole, OAuthAccount, CreatorProfile, Storefront, CreatorPayoutInfo, CardInfo, Product, Order, OrderItem };
