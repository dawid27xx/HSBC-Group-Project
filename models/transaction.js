const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({path: './.env'});


// creates a sequelize connection
const sequelise = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
});

// defines the asset entity
const Transaction = sequelise.define(
    'Transactions',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            unique: true,
            primaryKey: true,
        },

        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            references: {
                model: 'user',
                key: 'id'
            }
                },
        portfolio_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            references: {
                model: 'portfolio',
                key: 'id'
            }
        },
        portfolio_asset_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            references: {
                model: 'portfolioasset',
                key: 'id'
            }
                },
        transaction_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        datetime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tablename: 'transactions',
        timestamps: false,
    }
)

async function listAllTransactions() {
    try {
        const transactions = await Transaction.findAll();
        return transactions;
    } catch (err) {
        console.log(err);
    }
}

// change this when Asset contains more attributes
// delete if we are to add assets manually
async function addTransaction(user_id, portfolio_asset_id, transaction_type, quantity) {
    try {
        const newTransaction = await Transaction.create({
            user_id: user_id,
            portfolio_asset_id: portfolio_asset_id,
            transaction_type: transaction_type,
            quantity: quantity
        })
        console.log("Transaction Added", newTransaction)
    } catch (err) {
        console.log(err);
    }
}


module.exports = {addTransaction, listAllTransactions};
