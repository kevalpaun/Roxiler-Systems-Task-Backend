// database/connection.js
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  "your_postgreSQL_databasename",
  "Enter_your_UserName",
  "Enter_your_Password",
  {
    host: "localhost",
    dialect: "postgres",
  }
);

module.exports = sequelize;
