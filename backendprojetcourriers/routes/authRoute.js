const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController');



router.post('/login', UserController.login);
router.post('/logout/:id',UserController.logout);
module.exports = router;