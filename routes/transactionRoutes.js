const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transactionController');

// this publishes the controller functions as endpoints you can call
router.get("/transaction", transactionController.listAllTransactions);
router.post("/transaction", transactionController.addTransactions);

module.exports = router;
