// controllers/feedSettingsController.js

const FeedSettings = require('../models/FeedSettings');

async function get(req, res) {
  try {
    const realPercent = await FeedSettings.getRealPercent();
    res.json({ realPercent });
  } catch (err) {
    console.error('get feed settings error:', err);
    res.status(500).json({ error: 'Something went wrong loading feed settings.' });
  }
}

async function update(req, res) {
  try {
    const value = Number(req.body.realPercent);
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      return res.status(400).json({ error: 'realPercent must be a whole number between 0 and 100.' });
    }
    const realPercent = await FeedSettings.setRealPercent(value);
    res.json({ realPercent });
  } catch (err) {
    console.error('update feed settings error:', err);
    res.status(500).json({ error: 'Something went wrong saving that.' });
  }
}

module.exports = { get, update };
