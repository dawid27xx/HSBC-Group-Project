const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({path: './.env'});


// creates a sequelize connection
const sequelise = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
});

const User = sequelise.import('./user')
const Portfolio = sequelise.import('/portfolio')

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
                model: User,
                key: 'id'
            }
        },
        portfolio_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            references: {
                model: Portfolio,
                key: 'id'
            }
        }
    },
    {
        tablename: 'userPortfolios',
        timestamps: false,
    }
)

User.belongsToMany(Portfolio, {through: UserPortfolio})


// module.exports = {addAsset, listAllAssets};
