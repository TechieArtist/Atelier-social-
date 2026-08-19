// routes/posts.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 80 * 1024 * 1024 },
});

router.get('/', requireAuth, postController.list);
router.post('/', requireAuth, upload.single('image'), postController.create);

module.exports = router;
