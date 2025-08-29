const express = require('express');
const auth = require('../utils/auth')
const router = express.Router();

const transactionController = require('../controllers/transactionController');

// this publishes the controller functions as endpoints you can call
// router.get("/transaction", transactionController.listAllTransactions);
router.post("/transaction", auth, transactionController.addTransactions);
router.get('/transaction', auth, transactionController.listAllTransactionsCurrentUser);
router.get('/transactionByPortfolio/:portfolio_id', auth, transactionController.listAllTransactionsPortfolio);
router.get('/transactionByPortfolioAsset/:portfolio_asset_id', auth, transactionController.listAllTransactionsPortfolioAsset);


module.exports = router;
