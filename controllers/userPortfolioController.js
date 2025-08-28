const userPortfolio = require('../models/userPortfolio');


// these functions use function defined in the model, and make them available to requests by the user
async function listAllUserPortfolios(req, res) {
    try {
        const userPortfolios = await userPortfolio.listAllUserPortfolios();
        res.status(200).send(userPortfolios);
    } catch (err) {
        res.status(500).json({error: "Failed fetching user portfolios."})
    }
}

async function addUserPortfolio(req, res) {
    try {
        const { user_id, portfolio_id } = req.body;
        if (!user_id || !portfolio_id) {
            res.status(400).json({error: "Missing Values"});
        }
        const addUserPortfolio = await userPortfolio.addUserPortfolio(user_id, portfolio_id);
        res.status(200).send(addUserPortfolio);
    } catch (err) {
        res.status(500).json({error: "Failed adding user portfolio.", trace: err})
    }
}

module.exports = {listAllUserPortfolios, addUserPortfolio};