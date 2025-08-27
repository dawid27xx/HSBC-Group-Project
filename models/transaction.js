const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({path: './.env'});


// creates a sequelize connection
const sequelise = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
});

const User = sequelise.import('./user')
const PortfolioAsset = sequelise.import('./portfolioAsset')

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
                        model: User,
                        key: 'id'
                    }
                },
        pa_id: {
                    type: DataTypes.INTEGER.UNSIGNED,
                    references: {
                        model: PortfolioAsset,
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
            allowNull: false
        }
    },
    {
        tablename: 'transactions',
        timestamps: false,
    }
)


// module.exports = {addAsset, listAllAssets};
