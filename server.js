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
