// routes/comments.js

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, commentController.list);
router.post('/', requireAuth, commentController.create);

module.exports = router;
