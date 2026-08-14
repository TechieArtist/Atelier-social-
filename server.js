// server.js

require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const pool = require('./database/db');
const authRoutes = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// If you deploy behind a proxy (Render, Railway, Heroku, etc.), this is
// required for secure cookies to work correctly.
if (isProd) app.set('trust proxy', 1);

app.use(express.json());

{
  "returncode" : 0,
  "stdout" : "\/\/ server.js\n\nrequire('dotenv').config();\nconst path = require('path');\nconst express = require('express');\nconst session = require('express-session');\nconst pgSession = require('connect-pg-simple')(session);\n\nconst pool = require('.\/database\/db');\nconst authRoutes = require('.\/routes\/auth');\nconst { requireAuth } = require('.\/middleware\/auth');\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\nconst isProd = process.env.NODE_ENV === 'production';\n\n\/\/ If you deploy behind a proxy (Render, Railway, Heroku, etc.), this is\n\/\/ required for secure cookies to work correctly.\nif (isProd) app.set('trust proxy', 1);\n\napp.use(express.json());\n\n\/\/ Temporary debug logger — prints every request that reaches the server,\n\/\/ so you can confirm from the terminal whether the browser is actually\n\/\/ calling your API. Safe to remove once things are working.\napp.use((req, res, next) => {\n  console.log(`${req.method} ${req.path}`);\n  next();\n});\n\napp.use(\n  session({\n    store: new pgSession({ pool, tableName: 'session' }),\n    secret: process.env.SESSION_SECRET,\n    resave: false,\n    saveUninitialized: false,\n    cookie: {\n      httpOnly: true,\n      secure: isProd,       \/\/ requires HTTPS in production\n      sameSite: 'lax',\n      maxAge: 1000 * 60 * 60 * 24 * 7, \/\/ 7 days\n    },\n  })\n);\n\n\/\/ ---------- API routes ----------\napp.use('\/api\/auth', authRoutes);\n\n\/\/ Example of a protected, non-auth route — this is the pattern every\n\/\/ future feature route (posts, follows, comments…) will follow.\napp.get('\/api\/protected-example', requireAuth, (req, res) => {\n  res.json({ message: `You are logged in as user ${req.session.userId}.` });\n});\n\n\/\/ ---------- static frontend ----------\napp.use(express.static(path.join(__dirname, 'public')));\n\n\/\/ ---------- start ----------\napp.listen(PORT, () => {\n  console.log(`The Atelier server running on http:\/\/localhost:${PORT}`);\n});\n",
  "stderr" : ""
}

app.use(
  session({
    store: new pgSession({ pool, tableName: 'session' }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,       // requires HTTPS in production
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// ---------- API routes ----------
app.use('/api/auth', authRoutes);

// Example of a protected, non-auth route — this is the pattern every
// future feature route (posts, follows, comments…) will follow.
app.get('/api/protected-example', requireAuth, (req, res) => {
  res.json({ message: `You are logged in as user ${req.session.userId}.` });
});

// ---------- static frontend ----------
app.use(express.static(path.join(__dirname, 'public')));

// ---------- start ----------
app.listen(PORT, () => {
  console.log(`The Atelier server running on http://localhost:${PORT}`);
});
