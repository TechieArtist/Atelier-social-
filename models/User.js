// models/User.js
// Thin data-access layer around the `users` table. Nothing in here
// knows about HTTP — controllers call these functions.

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

// Includes the password hash — only for use during login, to compare
// against. Never send this row back to the client as-is.
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

module.exports = {
  createUser,
  findByEmailWithPassword,
  findByEmail,
  findByUsername,
  findById,
};
