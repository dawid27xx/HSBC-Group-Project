const { Sequelize, DataTypes } = require('sequelize');
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

// change this when Asset contains more attributes
// delete if we are to add assets manually
async function addPortfolio(name, exchange) {
    try {
        const newPortfolio = await Portfolio.create({
            name: name,
            exchange: exchange
        })
        console.log("Portfolio Added", newPortfolio)
    } catch (err) {
        console.log(err);
    }
}


module.exports = {addPortfolio, listAllPortfolios};
