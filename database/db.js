// database/db.js
// Single shared connection pool. Every model/query goes through this
// so we don't open a new connection per request.

const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env and paste your ' +
    'Supabase connection string (Project Settings → Database → Connection string → URI).'
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase's pooler requires SSL; this accepts their cert without
  // needing the CA bundle locally.
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
});

module.exports = pool;
