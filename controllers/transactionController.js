const Transaction = require('../models/transaction');


// these functions use function defined in the model, and make them available to requests by the user
async function listAllTransactions(req, res) {
    try {
        const transactions = await Transaction.listAllTransactions();
        res.status(200).send(transactions);
    } catch (err) {
        res.status(500).json({error: "Failed fetching portfolios."})
    }
}
// user_id, portfolio_asset_id, transaction_type, quantity, datetime
async function addTransactions(req, res) {
    try {
        const { user_id, portfolio_asset_id, transaction_type, quantity } = req.body;
        if (!user_id || !portfolio_asset_id || !transaction_type || !quantity) {
            res.status(400).json({error: "Missing Values"});
        }
        const addTransaction = await Transaction.addTransaction(user_id, portfolio_asset_id, transaction_type, quantity);
        res.status(200).send(addTransaction);
    } catch (err) {
        res.status(500).json({error: "Failed adding transaction", trace: err})
    }
}

module.exports = {listAllTransactions, addTransactions};