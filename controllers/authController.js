// controllers/authController.js

const bcrypt = require('bcrypt');
const User = require('../models/User');

const SALT_ROUNDS = 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;

async function signup(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({
        error: 'Username must be 3-30 characters: letters, numbers, "_" or "." only.',
      });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'That email address doesn\'t look valid.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const [existingEmail, existingUsername] = await Promise.all([
      User.findByEmail(email),
      User.findByUsername(username),
    ]);
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    if (existingUsername) {
      return res.status(409).json({ error: 'That username is taken.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.createUser({ username, email, passwordHash });

    // Log them in immediately after signup.
    req.session.userId = user.id;

    res.status(201).json({ user });
  } catch (err) {
    console.error('signup error:', err);
    res.status(500).json({ error: 'Something went wrong creating your account.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findByEmailWithPassword(email);
    if (!user) {
      // Same message as a wrong password — don't reveal whether the
      // email exists.
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    req.session.userId = user.id;

    const { password: _omit, ...publicUser } = user;
    res.json({ user: publicUser });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Something went wrong logging you in.' });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('logout error:', err);
      return res.status(500).json({ error: 'Could not log out.' });
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
}

async function me(req, res) {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: 'Not logged in.' });
    }
    res.json({ user });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}

module.exports = { signup, login, logout, me };
