const express = require('express');
const cors = require('cors');
require('dotenv').config({path: './.env'});
const app = express();
const userRoutes = require('./routes/userRoutes')
const portfolioRoutes = require('./routes/portfolioRoutes')
const portfolioAssetsRoutes = require('./routes/portfolioAssetRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const userPortfolio = require('./routes/userPortfolioRoutes')


app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

app.use('/auth', userRoutes);
app.use('/portfolio', portfolioRoutes);
app.use('/portfolioAsset', portfolioAssetsRoutes);
app.use('/transaction', transactionRoutes);
app.use('/userPortfolio', userPortfolio)


const PORT = 5000;

app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}/`);
});