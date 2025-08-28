const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transactionController');

// this publishes the controller functions as endpoints you can call
// router.get("/transaction", transactionController.listAllTransactions);
router.post("/transaction", transactionController.addTransactions);
router.get('/transaction', transactionController.listAllTransactionsCurrentUser);
router.get('/transactionByPortfolio/:portfolio_id', transactionController.listAllTransactionsPortfolio);
router.get('/transactionByPortfolioAsset/:portfolio_asset_id', transactionController.listAllTransactionsPortfolioAsset);


module.exports = router;
