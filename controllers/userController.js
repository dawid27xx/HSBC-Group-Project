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

async function addUsers(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({error: "Missing Values"});
        }
        const addUser = await user.addUser(username, password);
        res.status(200).send(addUser);
    } catch (err) {
        res.status(500).json({error: "Failed adding user", trace: err})
    }
}

module.exports = {listAllUsers, addUsers};