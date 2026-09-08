const { Sequelize } = require("sequelize");

const databaseName = process.env.DB_NAME || process.env.DB_DATABASE;
const databaseUser = process.env.DB_USER || process.env.DB_USERNAME;
const hasDatabaseParts = process.env.DB_HOST && process.env.DB_PORT && databaseName && databaseUser && process.env.DB_PASSWORD;
const databaseUrl = hasDatabaseParts
  ? `postgresql://${encodeURIComponent(databaseUser)}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT}/${databaseName}`
  : process.env.DATABASE_URL;
const sequelize = databaseUrl ? new Sequelize(databaseUrl, { logging: false }) : null;

module.exports = sequelize;
