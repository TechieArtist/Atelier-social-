// routes/adminPersonas.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const adminPersonaController = require('../controllers/adminPersonaController');
const { requireAuth } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 80 * 1024 * 1024 },
});

router.get('/', requireAuth, adminPersonaController.list);
router.post('/', requireAuth, adminPersonaController.create);
router.patch('/:id', requireAuth, adminPersonaController.update);
router.post('/:id/avatar', requireAuth, upload.single('avatar'), adminPersonaController.uploadAvatar);
router.post('/:id/posts', requireAuth, upload.single('image'), adminPersonaController.createPost);

module.exports = router;
