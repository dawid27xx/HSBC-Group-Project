const express = require('express');
const router = express.Router();

const portfolioController = require('../controllers/portfolioController');

// this publishes the controller functions as endpoints you can call
router.get("/portfolio", portfolioController.listAllPortfoliosCurrentUser);
router.get("/asset/:portfolio_id", portfolioController.getAssetsInPortfolio);
router.get("/asset/getPricesLastTwoYear/:ticker", portfolioController.getPricesLastTwoYear);
router.get("/asset/getPriceOfStock/:ticker", portfolioController.getPriceOfStock);
router.get("/portfolio/getPricesforPortfolio/:portfolio_id", portfolioController.getPricesLastTwoYearForPortfolio)
router.get("/portfolio/getCumulativePricesforPortfolio/:portfolio_id", portfolioController.getCumulativePortfolioValue)
router.post("/portfolio", portfolioController.addPortfolios);
router.post("/asset", portfolioController.addAssetToPortfolio);
router.patch("/asset", portfolioController.buySellOrder);

module.exports = router;
