// models/dataModel.js

const Sequelize = require("sequelize");
const sequelize = require("../database/connection");

const Data = sequelize.define(
  "Data",
  {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    image: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    sold: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },

    dateOfSale: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    // Define the format of the date
    dateFormat: "YYYY-MM-DD HH:mm:ss",
  }
);

module.exports = Data;
