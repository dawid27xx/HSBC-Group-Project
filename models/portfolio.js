const { Sequelize, DataTypes } = require('sequelize');
const UserPortfolio = require('./userPortfolio');
const PortfolioAsset = require('./portfolioAsset');
const Transaction = require('./transaction');
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

async function buySellOrder(portfolio_id, ticker, transaction_type, quantity) {
    let orderFulfilled = 0;
    try {
        const portfolioAsset = await PortfolioAsset.PortfolioAsset.findOne({
            where: {portfolio_id: portfolio_id, ticker: ticker}
        })
        
        if (transaction_type.toLowerCase() == 'sell') {
            let currQuantity = portfolioAsset.quantity;
            if (quantity > currQuantity) {
                return "Cannot Sell More Than Owned."
            } else {
                portfolioAsset.quantity = currQuantity - quantity;
                await portfolioAsset.save();
                orderFulfilled = 1;
            }
        } else if (transaction_type.toLowerCase() == 'buy') {
            let currQuantity = portfolioAsset.quantity;
            portfolioAsset.quantity = currQuantity + quantity;
            await portfolioAsset.save();
            orderFulfilled = 1;
        } else {
            return "Invalid Order Type";
        }

        if (orderFulfilled) {
            let userId = 1;
            try {
                const newTransactionlog = await Transaction.addTransaction(userId, portfolio_id ,portfolioAsset.id, transaction_type, quantity);
                console.log("Transaction log created.")
                return "Buy/Sell Order Success."
            } catch (err) {
                console.log("Error creating transaction log.")
            }
        } else {
            return "Order not Fulfilled."
        }

    } catch (err) {
        console.log("Error Carrying out buy/sell order")
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


module.exports = {addPortfolio, buySellOrder, addAssetToPortfolio, getAssetsInPortfolio, listAllPortfolios, listAllPortfoliosCurrentUser};
