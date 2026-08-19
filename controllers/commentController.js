// controllers/commentController.js

const Comment = require('../models/Comment');

async function list(req, res) {
  try {
    const { postId } = req.query;
    if (!postId) {
      return res.status(400).json({ error: 'postId is required.' });
    }
    const comments = await Comment.listComments(postId);
    res.json({ comments });
  } catch (err) {
    console.error('list comments error:', err);
    res.status(500).json({ error: 'Something went wrong loading comments.' });
  }
}

async function create(req, res) {
  try {
    const { postId, postType } = req.body;
    const body = (req.body.body || '').trim().slice(0, 500);

    if (!postId || !['real', 'ai'].includes(postType)) {
      return res.status(400).json({ error: 'postId and a valid postType are required.' });
    }
    if (!body) {
      return res.status(400).json({ error: 'Comment cannot be empty.' });
    }

    const comment = await Comment.createComment({
      userId: req.session.userId,
      postId,
      postType,
      body,
    });
    res.status(201).json({ comment });
  } catch (err) {
    console.error('create comment error:', err);
    res.status(500).json({ error: 'Something went wrong posting your comment.' });
  }
}

module.exports = { list, create };
