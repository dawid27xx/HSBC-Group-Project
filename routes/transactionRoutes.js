const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// this publishes the controller functions as endpoints you can call
router.get("/users", userController.listAllUsers);
router.post("/users", userController.addUsers);

module.exports = router;
