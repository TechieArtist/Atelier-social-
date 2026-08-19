// models/AiPost.js

const pool = require('../database/db');

async function createAiPost({ username, persona, imageUrl, caption, mediaType }) {
  const { rows } = await pool.query(
    `insert into ai_posts (username, persona, image_url, caption, media_type)
     values ($1, $2, $3, $4, $5)
     returning id, username, persona, image_url, caption, media_type, created_at`,
    [username, persona, imageUrl, caption || null, mediaType || 'image']
  );
  return rows[0];
}

async function listAiPosts(limit = 50) {
  const { rows } = await pool.query(
    `select id, username, persona, image_url, caption, media_type, created_at
     from ai_posts
     order by created_at desc
     limit $1`,
    [limit]
  );
  return rows;
}

module.exports = { createAiPost, listAiPosts };
