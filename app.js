const express = require('express');
require('dotenv').config({path: './.env'});
const app = express();
const userRoutes = require('./routes/userRoutes')
const portfolioRoutes = require('./routes/portfolioRoutes')
const portfolioAssetsRoutes = require('./routes/portfolioAssetRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const userPortfolio = require('./routes/userPortfolioRoutes')

app.use(express.json());

app.use('/users', userRoutes);
app.use('/portfolio', portfolioRoutes);
app.use('/portfolioAsset', portfolioAssetsRoutes);
app.use('/transaction', transactionRoutes);
app.use('/userPortfolio', userPortfolio)


const PORT = 3000;

app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}/`);
});