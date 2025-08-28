const { name } = require('xml-name-validator');
const Portfolio = require('../models/portfolio');


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

async function addPortfolios(req, res) {
    try {
        const { name, exchange } = req.body;
        if (!name || !exchange) {
            res.status(400).json({error: "Missing Values"});
        }
        const addPortfolio = await Portfolio.addPortfolio(name, exchange);
        res.status(200).send(addPortfolio);
    } catch (err) {
        res.status(500).json({error: "Failed adding portfolio", trace: err})
    }
}

module.exports = {listAllPortfolios, addPortfolios, listAllPortfoliosCurrentUser};