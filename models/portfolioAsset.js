const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({path: './.env'});
const Transaction = require('./transaction')


// creates a sequelize connection
const sequelise = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
});


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
                        model: 'portfolios',
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

async function deletePortfolioAsset(portfolio_asset_id) {
    try {

        // must delete all transaction first

        const checkIfTransacionsToDelete = await Transaction.Transaction.findAll({where: {portfolio_asset_id: portfolio_asset_id}});
        if (checkIfTransacionsToDelete) {
            const transactionsToDelete = await Transaction.deleteAllByPortfolioAssetId(portfolio_asset_id);
        }


        const portfolioAssetToDelete = await PortfolioAsset.findOne({where: {id: portfolio_asset_id}});
        await portfolioAssetToDelete.destroy();
        return 'Deleted';
    } catch (err) {
        console.log(err)
    }
}

// change this when Asset contains more attributes
// delete if we are to add assets manually
async function addPortfolioAsset(portfolio_id, ticker, quantity, purchase_price) {
    let user_id = 1;
    try {
        const newPortfolioAsset = await PortfolioAsset.create({
            portfolio_id: portfolio_id,
            ticker: ticker,
            quantity: quantity
        })
        const newTransaction = await Transaction.addTransaction(user_id, portfolio_id, newPortfolioAsset.id, "buy", quantity, purchase_price);
        console.log("PortfolioAsset Added")
        return newPortfolioAsset
    } catch (err) {
        console.log(err);
    }
}


module.exports = {PortfolioAsset, deletePortfolioAsset, addPortfolioAsset, listAllPortfolioAssets};
