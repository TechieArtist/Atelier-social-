// routes/aiPosts.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const aiPostController = require('../controllers/aiPostController');
const { requireAuth } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 80 * 1024 * 1024 },
});

router.get('/', requireAuth, aiPostController.list);
router.post('/', requireAuth, upload.single('image'), aiPostController.create);

module.exports = router;
