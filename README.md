# The Atelier — backend setup

## 1. Install dependencies
```
npm install
```

## 2. Configure environment
```
cp .env.example .env
```
Then edit `.env`:
- `DATABASE_URL` — from Supabase: Project Settings → Database → Connection string → URI.
  Prefer the **connection pooling** string if Supabase shows you one; it's built for
  server apps making many short-lived queries, which is exactly this.
- `SESSION_SECRET` — any long random string. Generate one with:
  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

## 3. Create the database tables
Paste the contents of `database/schema.sql` into the Supabase SQL Editor and run it,
or from your machine:
```
psql "$DATABASE_URL" -f database/schema.sql
```
This creates `users` and `session` (the latter is required by connect-pg-simple —
it's where login sessions are stored, instead of server memory, so logins survive
restarts).

## 4. Run it
```
npm run dev
```
Visit `http://localhost:3000`.

## What's wired up
- `POST /api/auth/signup` — create account, hashes password with bcrypt, logs you in
- `POST /api/auth/login` — verifies password, starts a session
- `POST /api/auth/logout` — destroys the session
- `GET /api/auth/me` — returns the current user if the session cookie is valid (401 otherwise)

`feed.html` and `profile.html` call `/api/auth/me` on load via `public/js/session.js`
and redirect to `login.html` if there's no valid session — that's the "stay logged in
after refresh" milestone. The logout icon in the nav calls `/api/auth/logout`.

## Note on folder layout
Everything the browser loads (`html`/`css`/`js`) lives under `public/`, served by
`express.static`. That's different from putting `css/` and `js/` at the project root —
Express only serves what you explicitly mount as static, so keeping them nested under
`public/` means one `app.use(express.static('public'))` covers all of it.

## Next steps
Every future protected route follows the same pattern as
`/api/protected-example` in `server.js`: add `requireAuth` as middleware, and
`req.session.userId` tells you who's asking.
