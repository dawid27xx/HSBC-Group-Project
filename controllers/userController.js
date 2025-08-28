const { INTEGER } = require('sequelize');
const jwt = require('jsonwebtoken');
const user = require('../models/user');


// these functions use function defined in the model, and make them available to requests by the user
async function listAllUsers(req, res) {
    try {
        const users = await user.listAllUsers();
        res.status(200).send(users);
    } catch (err) {
        res.status(500).json({error: "Failed fetching users."})
    }
}

async function addUser(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({error: "You must enter a username and a password to register."});
        }
        const addUser = await user.addUser(username, password);
        if (addUser === "user_exists") {
            return res.status(401).json({ message: "Username already in use - please try another." });
        } else {
            return res.status(200).json(addUser);
        }
    } catch (err) {
        res.status(500).json({error: "Failed to add user.", trace: err});
    }
}

async function validateLogin(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({error: "You must enter a username and a password to login."});
        }
        const validateUser = await user.listUser(username, password);
        console.log(validateUser);
        if (validateUser.status === "authorised") {
            const payload = {id: validateUser.id, username: validateUser.username};
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.status(200).json({ success: true, message: "Login successful.", token: token });
        } else {
            res.status(401).json({ message: "Unauthorised credentials." });
        }
        
    } catch (err) {
        res.status(500).json({error: "Failed to login.", trace: err});
    }
}

module.exports = {listAllUsers, addUser, validateLogin};