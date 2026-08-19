// models/Post.js

const pool = require('../database/db');

async function createPost({ userId, imageUrl, caption, mediaType }) {
  const { rows } = await pool.query(
    `insert into posts (user_id, image_url, caption, media_type)
     values ($1, $2, $3, $4)
     returning id, user_id, image_url, caption, media_type, created_at`,
    [userId, imageUrl, caption || null, mediaType || 'image']
  );
  return rows[0];
}

async function listPosts(limit = 200) {
  const { rows } = await pool.query(
    `select posts.id, posts.image_url, posts.caption, posts.media_type, posts.created_at,
            users.username, users.is_ai
     from posts
     join users on users.id = posts.user_id
     order by posts.created_at desc
     limit $1`,
    [limit]
  );
  return rows;
}

module.exports = { createPost, listPosts };
