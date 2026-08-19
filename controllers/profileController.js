// controllers/profileController.js

const path = require('path');
const supabase = require('../lib/supabaseClient');
const User = require('../models/User');

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;
const AVATAR_BUCKET = 'avatars';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function updateProfile(req, res) {
  try {
    const username = (req.body.username || '').trim();
    const bio = (req.body.bio || '').trim().slice(0, 500);

    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({
        error: 'Username must be 3-30 characters: letters, numbers, "_" or "." only.',
      });
    }

    const user = await User.updateProfile({ id: req.session.userId, username, bio });
    res.json({ user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That username is taken.' });
    }
    console.error('update profile error:', err);
    res.status(500).json({ error: 'Something went wrong saving your profile.' });
  }
}

async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'An image is required.' });
    }
    if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPEG, PNG, WEBP, or GIF images are allowed.' });
    }

    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `${req.session.userId}-${Date.now()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filename, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) {
      console.error('avatar upload error:', uploadError);
      return res.status(500).json({ error: 'Could not upload image.' });
    }

    const { data: publicUrlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filename);

    const user = await User.updateAvatar({
      id: req.session.userId,
      profilePicture: publicUrlData.publicUrl,
    });
    res.json({ user });
  } catch (err) {
    console.error('upload avatar error:', err);
    res.status(500).json({ error: 'Something went wrong uploading your photo.' });
  }
}

module.exports = { updateProfile, uploadAvatar };
