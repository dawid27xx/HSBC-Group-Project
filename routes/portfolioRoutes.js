const express = require('express');
const auth = require('../utils/auth');
const router = express.Router();

const portfolioController = require('../controllers/portfolioController');

// this publishes the controller functions as endpoints you can call
router.get("/portfolio", auth, portfolioController.listAllPortfoliosCurrentUser);
router.get("/asset/:portfolio_id",auth,  portfolioController.getAssetsInPortfolio);
router.get("/asset/getPricesLastTwoYear/:ticker", auth, portfolioController.getPricesLastTwoYear);
router.get("/asset/getPriceOfStock/:ticker", auth, portfolioController.getPriceOfStock);
router.get("/portfolio/getPricesforPortfolio/:portfolio_id", auth, portfolioController.getPricesLastTwoYearForPortfolio)
router.get("/portfolio/getCumulativePricesforPortfolio/:portfolio_id", portfolioController.getCumulativePortfolioValue)
router.post("/portfolio", auth, portfolioController.addPortfolios);
router.post("/asset", auth, portfolioController.addAssetToPortfolio);
router.patch("/asset", auth, portfolioController.buySellOrder);

module.exports = router;
