const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// this publishes the controller functions as endpoints you can call
router.get("/users", userController.listAllUsers);
router.post("/register", userController.addUser);
router.post("/login", userController.validateLogin);

module.exports = router;
