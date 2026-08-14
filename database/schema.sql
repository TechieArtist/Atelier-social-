-- database/schema.sql
-- Run this once against your Supabase database, either by pasting it
-- into the Supabase SQL Editor, or via psql "$DATABASE_URL" -f database/schema.sql

create extension if not exists pgcrypto;

-- ---------- users ----------

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  email text unique not null,
  password text not null,          -- bcrypt hash, never plain text
  profile_picture text,
  bio text,
  followers integer not null default 0,
  following integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_email on users (lower(email));
create index if not exists idx_users_username on users (lower(username));

-- ---------- sessions ----------
-- This exact shape is required by connect-pg-simple. Session data
-- (which user id is logged in) lives here instead of server memory,
-- so logins survive server restarts/redeploys.

create table if not exists "session" (
  "sid" varchar not null collate "default",
  "sess" json not null,
  "expire" timestamp(6) not null
)
with (oids = false);

alter table "session"
  drop constraint if exists "session_pkey",
  add constraint "session_pkey" primary key ("sid") not deferrable initially immediate;

create index if not exists "idx_session_expire" on "session" ("expire");
