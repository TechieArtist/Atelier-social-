// models/Comment.js

const pool = require('../database/db');

async function createComment({ userId, postId, postType, body }) {
  const { rows } = await pool.query(
    `insert into comments (user_id, post_id, post_type, body)
     values ($1, $2, $3, $4)
     returning id, post_id, body, created_at`,
    [userId, postId, postType, body]
  );
  const userRes = await pool.query(`select username from users where id = $1`, [userId]);
  return { ...rows[0], username: userRes.rows[0].username };
}

async function listComments(postId, limit = 200) {
  const { rows } = await pool.query(
    `select comments.id, comments.body, comments.created_at, users.username
     from comments
     join users on users.id = comments.user_id
     where comments.post_id = $1
     order by comments.created_at asc
     limit $2`,
    [postId, limit]
  );
  return rows;
}

async function countComments(postIds) {
  if (!postIds.length) return {};
  const res = await pool.query(
    `select post_id, count(*)::int as count
     from comments
     where post_id = any($1::uuid[])
     group by post_id`,
    [postIds]
  );
  const counts = {};
  res.rows.forEach((r) => { counts[r.post_id] = r.count; });
  return counts;
}

module.exports = { createComment, listComments, countComments };
