const express = require('express');
const auth = require('../utils/auth');
const router = express.Router();

const portfolioController = require('../controllers/portfolioController');

// this publishes the controller functions as endpoints you can call
router.get("/portfolio", auth, portfolioController.listAllPortfoliosCurrentUser); // for index
router.get("/asset/:portfolio_id",auth,  portfolioController.getAssetsInPortfolio); // everywhere
router.get("/portfolio/getCumulativePricesforPortfolio/:portfolio_id", portfolioController.getCumulativePortfolioValue) // last two year charts
router.post("/portfolio", auth, portfolioController.addPortfolios); // index
router.post("/asset", auth, portfolioController.addAssetToPortfolio); // manage
router.patch("/asset", auth, portfolioController.buySellOrder); // manage
router.get("/portfolio/getWeeklyChange/:portfolio_id", auth, portfolioController.getWeeklyChangeForPortfolio); // everywhere
router.get("/assetPrice/:ticker", auth, portfolioController.getPriceOfStock)


module.exports = router;
