// models/Follow.js

const pool = require('../database/db');

async function follow(followerId, followeeId) {
  await pool.query(
    `insert into follows (follower_id, followee_id) values ($1, $2)
     on conflict do nothing`,
    [followerId, followeeId]
  );
}

async function unfollow(followerId, followeeId) {
  await pool.query(
    `delete from follows where follower_id = $1 and followee_id = $2`,
    [followerId, followeeId]
  );
}

async function isFollowing(followerId, followeeId) {
  const { rows } = await pool.query(
    `select 1 from follows where follower_id = $1 and followee_id = $2`,
    [followerId, followeeId]
  );
  return rows.length > 0;
}

async function counts(userId) {
  const [followers, following] = await Promise.all([
    pool.query(`select count(*)::int as count from follows where followee_id = $1`, [userId]),
    pool.query(`select count(*)::int as count from follows where follower_id = $1`, [userId]),
  ]);
  return { followers: followers.rows[0].count, following: following.rows[0].count };
}

module.exports = { follow, unfollow, isFollowing, counts };
