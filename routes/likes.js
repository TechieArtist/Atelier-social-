// routes/likes.js

const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { requireAuth } = require('../middleware/auth');

router.post('/toggle', requireAuth, likeController.toggle);

module.exports = router;
