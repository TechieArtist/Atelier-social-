// routes/feedSettings.js

const express = require('express');
const router = express.Router();
const feedSettingsController = require('../controllers/feedSettingsController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, feedSettingsController.get);
router.patch('/', requireAuth, feedSettingsController.update);

module.exports = router;
