const express = require('express');
const router = express.Router();

const assetController = require('../controllers/assetController');

// this publishes the controller functions as endpoints you can call
router.get("/assets", assetController.listAllAssets);
router.post("/assets", assetController.addAsset);

module.exports = router;
