const express = require('express');
const router = express.Router();

const userPortfolioController = require('../controllers/userPortfolioController');

// this publishes the controller functions as endpoints you can call
router.get("/userPortfolio", userPortfolioController.listAllUserPortfolios);
router.post("/userPortfolio", userPortfolioController.addUserPortfolio);

module.exports = router;
