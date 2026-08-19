// routes/profile.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.patch('/', requireAuth, profileController.updateProfile);
router.post('/avatar', requireAuth, upload.single('avatar'), profileController.uploadAvatar);

module.exports = router;
