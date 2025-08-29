const express = require('express');
const auth = require('../utils/auth')
const router = express.Router();

const userPortfolioController = require('../controllers/userPortfolioController');

// this publishes the controller functions as endpoints you can call
router.get("/userPortfolio", auth, userPortfolioController.listAllUserPortfolios);
router.post("/userPortfolio", userPortfolioController.addUserPortfolio);

module.exports = router;
