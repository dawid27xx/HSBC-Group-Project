const Transaction = require('../models/transaction');


// these functions use function defined in the model, and make them available to requests by the user
async function listAllTransactions(req, res) {
    try {
        const transactions = await Transaction.listAllTransactions();
        res.status(200).send(transactions);
    } catch (err) {
        res.status(500).json({error: "Failed fetching transactions."})
    }
}

async function listAllTransactionsCurrentUser(req, res) {
    try {
        let userId = req.user.id;
        const transactions = await Transaction.listAllTransactionsCurrentUser(userId);
        res.status(200).send(transactions);
    } catch (err) {
        res.status(500).json({error: "Failed fetching transactions for current user"})
    }
}

async function listAllTransactionsPortfolio(req, res) {
    try {
        let userId = req.user.id;
        const { portfolio_id } = req.params;
        const transactions = await Transaction.listAllTransactionsCurrentUser(userId);
        const transactionsByPortfolio = transactions.filter((t) => t.portfolio_id == portfolio_id);
        res.status(200).send(transactionsByPortfolio);
    } catch (err) {
        res.status(500).json({error: "Failed fetching transactions for current user"})
    }
}
async function listAllTransactionsPortfolioAsset(req, res) {
    try {
        let userId = req.user.id;
        const { portfolio_asset_id } = req.params;
        const transactions = await Transaction.listAllTransactionsCurrentUser(userId);
        const transactionsByPortfolio = transactions.filter((t) => t.portfolio_asset_id == portfolio_asset_id);
        res.status(200).send(transactionsByPortfolio);
    } catch (err) {
        res.status(500).json({error: "Failed fetching transactions for current user"})
    }
}


// user_id, portfolio_asset_id, transaction_type, quantity, datetime
async function addTransactions(req, res) {
    try {
        const { user_id, portfolio_asset_id, portfolio_id, transaction_type, quantity } = req.body;
        if (!user_id || !portfolio_asset_id || !portfolio_id || !transaction_type || !quantity) {
            res.status(400).json({error: "Missing Values"});
        }
        const addTransaction = await Transaction.addTransaction(user_id, portfolio_asset_id, portfolio_id, transaction_type, quantity);
        res.status(200).send(addTransaction);
    } catch (err) {
        res.status(500).json({error: "Failed adding transaction", trace: err})
    }
}

module.exports = {listAllTransactions, listAllTransactionsPortfolioAsset, listAllTransactionsPortfolio, addTransactions, listAllTransactionsCurrentUser};