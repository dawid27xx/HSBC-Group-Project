const express = require('express');
const router = express.Router();

const portfolioController = require('../controllers/portfolioController');

// this publishes the controller functions as endpoints you can call
router.get("/portfolio", portfolioController.listAllPortfoliosCurrentUser);
router.get("/asset/:portfolio_id", portfolioController.getAssetsInPortfolio);
router.post("/portfolio", portfolioController.addPortfolios);
router.post("/asset", portfolioController.addAssetToPortfolio);

module.exports = router;
