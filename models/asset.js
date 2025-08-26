const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({path: './.env'});


// creates a sequelize connection
const sequelise = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
});

// defines the asset entity
const Asset = sequelise.define(
    'Asset',
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
    },
    {
        tablename: 'assets',
        timestamps: false,
    }
)


// these functions are directly on the db and do not involve the user directly
async function listAllAssets() {
    try {
        const assets = await Asset.findAll();
        return assets;
    } catch (err) {
        console.log(err);
    }
}

// change this when Asset contains more attributes
// delete if we are to add assets manually
async function addAsset(assetName) {
    try {
        const newAsset = await Asset.create({
            name: assetName
        })
        console.log("Asset Added")
    } catch (err) {
        console.log(err);
    }
}


module.exports = {addAsset, listAllAssets};
