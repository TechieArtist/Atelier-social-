// routes/follows.js

const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { requireAuth } = require('../middleware/auth');

router.post('/:username/toggle', requireAuth, followController.toggle);
router.get('/me/counts', requireAuth, followController.myCounts);

module.exports = router;
