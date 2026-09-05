const sequelize = require("./database");
const UserRole = require("./userRoleModel");
const UserInfo = require("./userModel");
const UserAccount = require("./userAccountModel");
const OAuthAccount = require("./oauthAccountModel");

if (sequelize) {
  UserInfo.hasOne(UserAccount, { foreignKey: "UserInfoId", as: "account" });
  UserAccount.belongsTo(UserInfo, { foreignKey: "UserInfoId", as: "info" });
  UserRole.hasMany(UserAccount, { foreignKey: "RoleId", as: "accounts" });
  UserAccount.belongsTo(UserRole, { foreignKey: "RoleId", as: "role" });
  UserAccount.hasMany(OAuthAccount, { foreignKey: "UserId", as: "oauthAccounts" });
  OAuthAccount.belongsTo(UserAccount, { foreignKey: "UserId", as: "account" });
}

module.exports = { sequelize, UserRole, UserInfo, UserAccount, OAuthAccount };
