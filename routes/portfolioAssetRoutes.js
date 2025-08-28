const express = require('express');
const router = express.Router();

const portfolioAssetController = require('../controllers/portfolioAssetController');

// this publishes the controller functions as endpoints you can call
router.get("/portfolioAsset", portfolioAssetController.listAllPortfolioAssets);
router.post("/portfolioAsset", portfolioAssetController.addPortfolioAssets);
router.delete("/portfolioAsset/:portfolio_asset_id", portfolioAssetController.deletePortfolioAsset);

module.exports = router;
