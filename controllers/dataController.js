// controllers

const axios = require("axios");
const Data = require("../models/dataModel");
const { Op } = require("sequelize");
const sequelize = require("../database/connection");

const fetchAndStoreData = async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const jsonData = response.data;

    // Store data in the database
    await Data.bulkCreate(jsonData);

    res.status(200).json({ message: "Data stored successfully" });
  } catch (error) {
    console.log(error);
    if (error?.name === "SequelizeUniqueConstraintError"){
      res.status(201).json({message: "Data is already added!"})
    }
      res.status(500).json({ message: "Internal Server Error", error });
  }
};

const listProduct = async (req, res) => {
  const { month = 3 } = req.params;
  const { page = 1, pageSize = 10, search = "" } = await req.query;
  const offset = (page - 1) * pageSize;

  try {
    const condition = {};

    if (search)
      condition[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];

    const listProduct = await Data.findAndCountAll({
      where: {
        [Op.and]: [
          {
            dateOfSale: sequelize.literal(
              `EXTRACT(MONTH FROM "dateOfSale") = ${month}`
            ),
          },
          {
            [Op.or]: {
              title: { [Op.iLike]: `%${search}%` },
              description: { [Op.iLike]: `%${search}%` },
            },
          },
        ],
      },
      limit: pageSize,
      offset: offset,
    });

    res.status(200).json({
      data: listProduct,
      totalcount: listProduct.count,
      page: +page,
      pageSize: pageSize,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getStatistics = async (req, res) => {
  const { month } = req.params;

  try {
    // Calculate total sale amount
    const totalSaleAmount = await Data.sum("price", {
      where: sequelize.literal(`EXTRACT(MONTH FROM "dateOfSale") = ${month}`),
    });

    // Calculate total number of sold items
    const totalSoldItems = await Data.count({
      where: {
        dateOfSale: sequelize.literal(
          `EXTRACT(MONTH FROM "dateOfSale") = ${month}`
        ),
        sold: true,
      },
    });

    // Calculate total number of unsold items
    const totalUnsoldItems = await Data.count({
      where: {
        dateOfSale: sequelize.literal(
          `EXTRACT(MONTH FROM "dateOfSale") = ${month}`
        ),
        sold: false,
      },
    });
    return {
      totalSaleAmount: totalSaleAmount || 0,
      totalSoldItems: totalSoldItems || 0,
      totalUnsoldItems: totalUnsoldItems || 0,
      month,
    };
    // res.json({
    //   totalSaleAmount: totalSaleAmount || 0,
    //   totalSoldItems: totalSoldItems || 0,
    //   totalUnsoldItems: totalUnsoldItems || 0,
    //   month,
    // });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch pie chart data");
    // res.status(500).json({ message: "Internal server error" });
  }
};

const getBarChartData = async (req, res) => {
  const { month = 3 } = req.params;

  try {
    // Define the price ranges
    const priceRanges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity },
    ];

    // Fetch the count of items within each price range
    const barChartData = [];
    for (const range of priceRanges) {
      const count = await Data.count({
        where: {
          dateOfSale: sequelize.literal(
            `EXTRACT(MONTH FROM "dateOfSale") = ${month}`
          ),
          price: { [Op.between]: [range.min, range.max] },
        },
      });
      barChartData.push({ priceRange: `${range.min}-${range.max}`, count });
    }
    return { result: barChartData };
    // res.json({ result: barChartData });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch pie chart data");
    // res.status(500).json({ message: "Internal server error" });
  }
};

const getPieChartData = async (req, res) => {
  const { month = 3 } = req.params;

  try {
    // Fetch unique categories and count of items for each category
    const pieChartData = await Data.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("category")), "itemCount"],
      ],
      where: sequelize.literal(`EXTRACT(MONTH FROM "dateOfSale") = ${month}`),
      group: ["category"],
    });
    return { result: pieChartData };
    // res.json({ result: pieChartData });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch pie chart data");
    // res.status(500).json({ message: "Internal server error" });
  }
};

const getAllStatistics = async (req, res) => {
  // const { month } = req.params;
  try {
    const [barChartData, pieChartData, statistics] = await Promise.all([
      getBarChartData(req, res),
      getPieChartData(req, res),
      getStatistics(req, res),
    ]);

    const combinedRes = {
      barChartData,
      pieChartData,
      statistics,
    };
    res.status(200).json(combinedRes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  fetchAndStoreData,
  listProduct,
  getAllStatistics,
  getBarChartData,
  getPieChartData,
  getStatistics,
};
