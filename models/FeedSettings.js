// models/FeedSettings.js

const pool = require('../database/db');

async function getRealPercent() {
  const { rows } = await pool.query(
    `select real_percent from feed_settings where id = 1`
  );
  return rows[0] ? rows[0].real_percent : 30;
}

async function setRealPercent(percent) {
  const { rows } = await pool.query(
    `update feed_settings
     set real_percent = $1, updated_at = now()
     where id = 1
     returning real_percent`,
    [percent]
  );
  return rows[0].real_percent;
}

module.exports = { getRealPercent, setRealPercent };
