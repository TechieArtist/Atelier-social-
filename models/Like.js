// models/Like.js

const pool = require('../database/db');

async function toggleLike({ userId, postId, postType }) {
  const existing = await pool.query(
    `select 1 from likes where user_id = $1 and post_id = $2`,
    [userId, postId]
  );

  if (existing.rows.length) {
    await pool.query(
      `delete from likes where user_id = $1 and post_id = $2`,
      [userId, postId]
    );
    return { liked: false };
  }

  await pool.query(
    `insert into likes (user_id, post_id, post_type) values ($1, $2, $3)`,
    [userId, postId, postType]
  );
  return { liked: true };
}

async function getLikeData(postIds, userId) {
  if (!postIds.length) return { counts: {}, likedByMe: new Set() };

  const countsRes = await pool.query(
    `select post_id, count(*)::int as count
     from likes
     where post_id = any($1::uuid[])
     group by post_id`,
    [postIds]
  );
  const counts = {};
  countsRes.rows.forEach((r) => { counts[r.post_id] = r.count; });

  const mineRes = await pool.query(
    `select post_id from likes where user_id = $1 and post_id = any($2::uuid[])`,
    [userId, postIds]
  );
  const likedByMe = new Set(mineRes.rows.map((r) => r.post_id));

  return { counts, likedByMe };
}

module.exports = { toggleLike, getLikeData };
