const PortfolioAsset = require('../models/portfolioAsset');


// these functions use function defined in the model, and make them available to requests by the user
async function listAllPortfolioAssets(req, res) {
    try {
        const portfolioAssets = await PortfolioAsset.listAllPortfolioAssets();
        res.status(200).send(portfolioAssets);
    } catch (err) {
        res.status(500).json({error: "Failed fetching portfolioAssets."})
    }
}

async function deletePortfolioAsset(req, res) {
    try {
        const {portfolio_asset_id} = req.params;
        const portfolioAssetToDelete = await PortfolioAsset.deletePortfolioAsset(portfolio_asset_id);
        res.status(200).send("Asset Deleted");
    } catch (err) {
        res.status(500).json({error: "Failed Deleting an asset."})
    }
}

async function addPortfolioAssets(req, res) {
    try {
      const { portfolio_id, ticker, quantity } = req.body;
  
      if (!portfolio_id || !ticker || quantity == null) {
        return res.status(400).json({ error: "Missing Values" });
      }
  
      const addPortfolioAsset = await PortfolioAsset.addPortfolioAsset(
        portfolio_id,
        ticker,
        quantity
      );
      return res.status(200).send(addPortfolioAsset);
    } catch (err) {
      return res.status(500).json({ error: "Failed adding portfolio", trace: err });
    }
  }
  

module.exports = {listAllPortfolioAssets, addPortfolioAssets, deletePortfolioAsset};