// controllers/followController.js

const Follow = require('../models/Follow');
const User = require('../models/User');

async function toggle(req, res) {
  try {
    const { username } = req.params;
    const target = await User.findByUsername(username);
    if (!target) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (target.id === req.session.userId) {
      return res.status(400).json({ error: "You can't follow yourself." });
    }

    const already = await Follow.isFollowing(req.session.userId, target.id);
    if (already) {
      await Follow.unfollow(req.session.userId, target.id);
    } else {
      await Follow.follow(req.session.userId, target.id);
    }

    const targetCounts = await Follow.counts(target.id);
    res.json({ following: !already, followerCount: targetCounts.followers });
  } catch (err) {
    console.error('toggle follow error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

async function myCounts(req, res) {
  try {
    const result = await Follow.counts(req.session.userId);
    res.json(result);
  } catch (err) {
    console.error('my follow counts error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

module.exports = { toggle, myCounts };
