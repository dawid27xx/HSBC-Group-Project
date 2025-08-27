const express = require('express');
require('dotenv').config({path: './.env'});
const app = express();
const userRoutes = require('./routes/userRoutes')
const portfolioRoutes = require('./routes/portfolioRoutes')
const portfolioAssetsRoutes = require('./routes/portfolioAssetRoutes')

app.use(express.json());

app.use('/users', userRoutes);
app.use('/portfolio', portfolioRoutes);
app.use('/portfolioAsset', portfolioAssetsRoutes);

const PORT = 3000;

app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}/`);
});