const asset = require('../models/asset');


// these functions use function defined in the model, and make them available to requests by the user
async function listAllAssets(req, res) {
    try {
        const assets = await asset.listAllAssets();
        res.status(200).send(assets);
    } catch (err) {
        res.status(500).json({error: "Failed fetching assets."})
    }
}

async function addAsset(req, res) {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({error: "Missing Values"});
        }
        const addStock = await asset.addAsset(name);
        res.status(200).send(addStock);
    } catch (err) {
        res.status(500).json({error: "Failed adding asset", trace: err})
    }
}

module.exports = {listAllAssets, addAsset};