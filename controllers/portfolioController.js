const Portfolio = require('../models/portfolio');
const UserPortfolio = require('../models/userPortfolio')


// these functions use function defined in the model, and make them available to requests by the user
async function listAllPortfolios(req, res) {
    try {
        const portfolios = await Portfolio.listAllPortfolios();
        res.status(200).send(portfolios);
    } catch (err) {
        res.status(500).json({error: "Failed fetching portfolios."})
    }
}

async function listAllPortfoliosCurrentUser(req, res) {
    try {
        let userId = 1;
        const portfolios = await Portfolio.listAllPortfoliosCurrentUser(userId);
        res.status(200).send(portfolios);
    } catch (err) {
        res.status(500).json({error: "Failed fetching portfolios."})
    }
}

async function getAssetsInPortfolio(req, res) {
    try {
        const { portfolio_id } = req.params;
        const assetsForPortfolio = await Portfolio.getAssetsInPortfolio(portfolio_id);
        res.status(200).send(assetsForPortfolio);
    } catch (err) {
        res.status(500).json({error: "Failed fetching assets in a portfolio."})
    }
}

async function buySellOrder(req, res) {
    try {
        const { portfolio_id, ticker, transaction_type, quantity} = req.body;
        const buySellOrder = await Portfolio.buySellOrder(portfolio_id, ticker, transaction_type, quantity);
        res.status(200).send(buySellOrder);
    } catch (err) {
        res.status(500).json({error: "Buy/Sell Order Failed."})
    }
}

async function addAssetToPortfolio(req, res) {
    try {
        const { portfolio_id, ticker, quantity } = req.body;
        const assetsForPortfolio = await Portfolio.addAssetToPortfolio(portfolio_id, ticker, quantity);
        res.status(200).send(assetsForPortfolio);
    } catch (err) {
        res.status(500).json({error: "Failed adding asset in a portfolio."})
    }
}

async function addPortfolios(req, res) {
    try {
        let userId = 1;
        const { name, exchange } = req.body;
        if (!name || !exchange) {
            res.status(400).json({error: "Missing Values"});
        }
        const addPortfolio = await Portfolio.addPortfolio(name, exchange);
        const portfolioId = addPortfolio.id;
        
        const addUserPortfolio = await UserPortfolio.addUserPortfolio(userId, portfolioId)
        res.status(200).send(addPortfolio);
    } catch (err) {
        res.status(500).json({error: "Failed adding portfolio", trace: err})
    }
}

module.exports = {listAllPortfolios, buySellOrder, addAssetToPortfolio, addPortfolios, listAllPortfoliosCurrentUser, getAssetsInPortfolio};