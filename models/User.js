// models/User.js
// Thin data-access layer around the `users` table. Nothing in here
// knows about HTTP — controllers call these functions.
//
// Personas (AI accounts) are just rows in this same table with
// is_ai = true. That's deliberate: it means search, follow, and posts
// all work on them identically to real accounts, with no separate code
// path. is_ai/persona_tag are intentionally excluded from the public
// columns below so nothing in a normal API response reveals which
// accounts are personas — only the dedicated admin endpoints see them.

const pool = require('../database/db');

const PUBLIC_COLUMNS = `
  id, username, email, profile_picture, bio, followers, following, created_at
`;

async function createUser({ username, email, passwordHash }) {
  const { rows } = await pool.query(
    `insert into users (username, email, password)
     values ($1, $2, $3)
     returning ${PUBLIC_COLUMNS}`,
    [username, email, passwordHash]
  );
  return rows[0];
}

async function findByEmailWithPassword(email) {
  const { rows } = await pool.query(
    `select id, username, email, password, profile_picture, bio, followers, following, created_at
     from users
     where lower(email) = lower($1)`,
    [email]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const { rows } = await pool.query(
    `select ${PUBLIC_COLUMNS} from users where lower(email) = lower($1)`,
    [email]
  );
  return rows[0] || null;
}

async function findByUsername(username) {
  const { rows } = await pool.query(
    `select ${PUBLIC_COLUMNS} from users where lower(username) = lower($1)`,
    [username]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    `select ${PUBLIC_COLUMNS} from users where id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function updateProfile({ id, username, bio }) {
  const { rows } = await pool.query(
    `update users set username = $1, bio = $2 where id = $3
     returning ${PUBLIC_COLUMNS}`,
    [username, bio, id]
  );
  return rows[0];
}

async function updateAvatar({ id, profilePicture }) {
  const { rows } = await pool.query(
    `update users set profile_picture = $1 where id = $2
     returning ${PUBLIC_COLUMNS}`,
    [profilePicture, id]
  );
  return rows[0];
}

async function searchUsers(query, excludeUserId, limit = 20) {
  const { rows } = await pool.query(
    `select id, username, bio, profile_picture
     from users
     where lower(username) like lower($1) and id != $2
     order by username asc
     limit $3`,
    [`%${query}%`, excludeUserId, limit]
  );
  return rows;
}

async function createPersona({ username, bio, personaTag }) {
  const { rows } = await pool.query(
    `insert into users (username, bio, persona_tag, is_ai, email, password)
     values ($1, $2, $3, true, null, null)
     returning id, username, bio, profile_picture, persona_tag, is_ai, created_at`,
    [username, bio || null, personaTag]
  );
  return rows[0];
}

async function updatePersona({ id, username, bio, personaTag }) {
  const { rows } = await pool.query(
    `update users
     set username = $1, bio = $2, persona_tag = $3
     where id = $4 and is_ai = true
     returning id, username, bio, profile_picture, persona_tag, is_ai, created_at`,
    [username, bio || null, personaTag, id]
  );
  return rows[0] || null;
}

async function listPersonas() {
  const { rows } = await pool.query(
    `select id, username, bio, profile_picture, persona_tag, created_at
     from users
     where is_ai = true
     order by username asc`
  );
  return rows;
}

async function findPersonaById(id) {
  const { rows } = await pool.query(
    `select id, username, bio, profile_picture, persona_tag, created_at
     from users
     where id = $1 and is_ai = true`,
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  createUser,
  findByEmailWithPassword,
  findByEmail,
  findByUsername,
  findById,
  updateProfile,
  updateAvatar,
  searchUsers,
  createPersona,
  updatePersona,
  listPersonas,
  findPersonaById,
};
