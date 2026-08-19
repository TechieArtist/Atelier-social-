// routes/users.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.get('/search', requireAuth, userController.search);

module.exports = router;
