const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

router.get("/fetchAndStoreData", dataController.fetchAndStoreData); //API to initialize Database and Store Data In DataBase

router.get("/listProduct/:month", dataController.listProduct); //API to list the all transactions

router.get("/getStatistics/:month", dataController.getStatistics); //API for statistics

router.get("/barchart/:month", dataController.getBarChartData); //API for bar chart

router.get("/pieChart/:month", dataController.getPieChartData); //API for bar chart

router.get("/getAllStatistics/:month", dataController.getAllStatistics); //API for bar chart

module.exports = router;
