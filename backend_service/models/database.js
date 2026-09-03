const { Sequelize } = require("sequelize");

const hasDatabaseParts = process.env.DB_HOST && process.env.DB_PORT && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD;
const databaseUrl = hasDatabaseParts
  ? `postgresql://${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  : process.env.DATABASE_URL;
const sequelize = databaseUrl ? new Sequelize(databaseUrl, { logging: false }) : null;

module.exports = sequelize;
