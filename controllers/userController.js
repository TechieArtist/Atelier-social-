// controllers/userController.js

const User = require('../models/User');
const Follow = require('../models/Follow');

async function search(req, res) {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.json({ users: [] });
    }

    const results = await User.searchUsers(q, req.session.userId);
    const withStatus = await Promise.all(
      results.map(async (u) => ({
        ...u,
        following: await Follow.isFollowing(req.session.userId, u.id),
      }))
    );

    res.json({ users: withStatus });
  } catch (err) {
    console.error('search users error:', err);
    res.status(500).json({ error: 'Something went wrong searching.' });
  }
}

module.exports = { search };
