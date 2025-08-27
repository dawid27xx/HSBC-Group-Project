const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({path: './.env'});


// creates a sequelize connection
const sequelise = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
});

// defines the asset entity
const UserPortfolio = sequelise.define(
    'UserPortfolio',
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
        }
    },
    {
        tablename: 'userPortfolios',
        timestamps: false,
    }
)

async function listAllUserPortfolios() {
    try {
        const UserPortfolios = await UserPortfolio.findAll();
        return UserPortfolios;
    } catch (err) {
        console.log(err);
    }
}

// change this when Asset contains more attributes
// delete if we are to add assets manually
async function addUserPortfolio(user_id, portfolio_id) {
    try {
        const newUserPortfolio = await UserPortfolio.create({
            portfolio_id: portfolio_id,
            user_id: user_id
        })
        console.log("UserPortfolio Added", newUserPortfolio)
    } catch (err) {
        console.log(err);
    }
}

module.exports = {addUserPortfolio, listAllUserPortfolios};
