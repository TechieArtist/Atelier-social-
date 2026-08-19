// server.js

require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const pool = require('./database/db');
const authRoutes = require('./routes/auth');
const aiPostRoutes = require('./routes/aiPosts');
const profileRoutes = require('./routes/profile');
const likeRoutes = require('./routes/likes');
const commentRoutes = require('./routes/comments');
const followRoutes = require('./routes/follows');
const userRoutes = require('./routes/users');
const feedSettingsRoutes = require('./routes/feedSettings');
const postRoutes = require('./routes/posts');
const { requireAuth } = require('./middleware/auth');
const adminPersonaRoutes = require('./routes/adminPersonas');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

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
      secure: isProd,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai-posts', aiPostRoutes);
app.use('/api/feed-settings', feedSettingsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/personas', adminPersonaRoutes);



app.get('/api/protected-example', requireAuth, (req, res) => {
  res.json({ message: `You are logged in as user ${req.session.userId}.` });
});
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`The Atelier server running on http://localhost:${PORT}`);
});
