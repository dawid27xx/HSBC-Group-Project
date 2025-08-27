const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({path: './.env'});


// creates a sequelize connection
const sequelise = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "mysql",
});

// defines the asset entity
const User = sequelise.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            unique: true,
            primaryKey: true,
        },

        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tablename: 'users',
        timestamps: false,
    }
)

async function listAllUsers() {
    try {
        const users = await User.findAll();
        return users;
    } catch (err) {
        console.log(err);
    }
}

// change this when Asset contains more attributes
// delete if we are to add assets manually
async function addUser(username, password) {
    try {
        const newUser = await User.create({
            username: username,
            password: password
        })
        console.log("User Added", newUser)
    } catch (err) {
        console.log(err);
    }
}


module.exports = {listAllUsers, addUser};
