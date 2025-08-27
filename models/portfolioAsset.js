const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({path: './.env'});


// creates a sequelize connection
const sequelise = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
});

const Portfolio = sequelise.import('/portfolio')


// defines the asset entity
const PortfolioAsset = sequelise.define(
    'PortfolioAssets',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            unique: true,
            primaryKey: true,
        },
        portfolio_id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    references: {
                        model: Portfolio,
                        key: 'id'
                    }
                },
        ticker: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    },
    {
        tablename: 'portfolioAssets',
        timestamps: false,
    }
)

async function listAllPortfolioAssets() {
    try {
        const portfoliosAssets = await PortfolioAsset.findAll();
        return portfoliosAssets;
    } catch (err) {
        console.log(err);
    }
}

// change this when Asset contains more attributes
// delete if we are to add assets manually
async function addPortfolioAsset(portfolio_id, ticker, quantity) {
    try {
        const newPortfolioAsset = await PortfolioAsset.create({
            portfolio_id: portfolio_id,
            ticker: ticker,
            quantity: quantity
        })
        console.log("PortfolioAsset Added", newPortfolioAsset)
    } catch (err) {
        console.log(err);
    }
}


module.exports = {addPortfolioAsset, listAllPortfolioAssets};
