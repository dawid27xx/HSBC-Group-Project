const { Sequelize, DataTypes } = require('sequelize');
const UserPortfolio = require('./userPortfolio');
const PortfolioAsset = require('./portfolioAsset')
require('dotenv').config({path: './.env'});


// creates a sequelize connection
const sequelise = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
});

// defines the asset entity
const Portfolio = sequelise.define(
    'Portfolio',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            unique: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        exchange: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tablename: 'portfolios',
        timestamps: false,
    }
)

async function listAllPortfolios() {
    try {
        const portfolios = await Portfolio.findAll();
        return portfolios;
    } catch (err) {
        console.log(err);
    }
}

async function getAssetsInPortfolio(portfolio_id) {
    try {
        const assets = await PortfolioAsset.PortfolioAsset.findAll({
            where: {portfolio_id: portfolio_id}
        })
        return assets
    } catch (err) {
        console.log(err);
    }
}

async function addAssetToPortfolio(portfolio_id, ticker, quantity) {
    try {
        const newAssetToPortfolio = await PortfolioAsset.addPortfolioAsset(portfolio_id, ticker, quantity);
        console.log("New Asset Added");
        return newAssetToPortfolio
    } catch (err) {
        console.log("Failed to add Asset");
    }
}

async function listAllPortfoliosCurrentUser(userId) {
    try {
        var portfolios = [];
        const userPortfoliosId = await UserPortfolio.UserPortfolio.findAll({
            attributes: ['portfolio_id'],
            where: { user_id: userId },
        });
        for (const idObject of userPortfoliosId) {
            const portfolio = await Portfolio.findOne({ 
                where: { id: idObject.portfolio_id }
            });
            
            let portfolioObject = {
                id: portfolio.id,
                name: portfolio.name,
                exchange: portfolio.exchange
            };
            console.log(portfolioObject);
            portfolios.push(portfolioObject);
        }

        return portfolios;
    } catch (err) {
        console.log(err);
    }
}


// change this when Asset contains more attributes
// delete if we are to add assets manually
async function addPortfolio(name, exchange) {
    try {
        const newPortfolio = await Portfolio.create({
            name: name,
            exchange: exchange
        })
        console.log("Portfolio Added")
        return newPortfolio;
    } catch (err) {
        console.log(err);
    }
}


module.exports = {addPortfolio, addAssetToPortfolio, getAssetsInPortfolio, listAllPortfolios, listAllPortfoliosCurrentUser};
