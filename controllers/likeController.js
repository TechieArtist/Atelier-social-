// controllers/likeController.js

const Like = require('../models/Like');

async function toggle(req, res) {
  try {
    const { postId, postType } = req.body;
    if (!postId || !['real', 'ai'].includes(postType)) {
      return res.status(400).json({ error: 'postId and a valid postType are required.' });
    }
    const result = await Like.toggleLike({ userId: req.session.userId, postId, postType });
    res.json(result);
  } catch (err) {
    console.error('toggle like error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

module.exports = { toggle };
