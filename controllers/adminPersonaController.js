// controllers/adminPersonaController.js

const path = require('path');
const supabase = require('../lib/supabaseClient');
const User = require('../models/User');
const Post = require('../models/Post');

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;
const AVATAR_BUCKET = 'avatars';
const POST_BUCKET = 'posts';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

function validUsername(username, res) {
  if (!username) {
    res.status(400).json({ error: 'Username is required.' });
    return false;
  }
  if (!USERNAME_RE.test(username)) {
    res.status(400).json({
      error: 'Username must be 3-30 characters: letters, numbers, "_" or "." only.',
    });
    return false;
  }
  return true;
}

async function list(req, res) {
  try {
    const personas = await User.listPersonas();
    res.json({ personas });
  } catch (err) {
    console.error('list personas error:', err);
    res.status(500).json({ error: 'Something went wrong loading personas.' });
  }
}

async function create(req, res) {
  try {
    const username = (req.body.username || '').trim();
    const bio = (req.body.bio || '').trim().slice(0, 500);
    const personaTag = (req.body.personaTag || '').trim().slice(0, 100) || null;

    if (!validUsername(username, res)) return;

    const persona = await User.createPersona({ username, bio, personaTag });
    res.status(201).json({ persona });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That username is taken.' });
    }
    console.error('create persona error:', err);
    res.status(500).json({ error: 'Something went wrong creating that persona.' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const username = (req.body.username || '').trim();
    const bio = (req.body.bio || '').trim().slice(0, 500);
    const personaTag = (req.body.personaTag || '').trim().slice(0, 100) || null;

    if (!validUsername(username, res)) return;

    const persona = await User.updatePersona({ id, username, bio, personaTag });
    if (!persona) {
      return res.status(404).json({ error: 'Persona not found.' });
    }
    res.json({ persona });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That username is taken.' });
    }
    console.error('update persona error:', err);
    res.status(500).json({ error: 'Something went wrong saving that persona.' });
  }
}

async function uploadAvatar(req, res) {
  try {
    const { id } = req.params;
    const persona = await User.findPersonaById(id);
    if (!persona) {
      return res.status(404).json({ error: 'Persona not found.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'An image is required.' });
    }
    if (!ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPEG, PNG, WEBP, or GIF images are allowed.' });
    }

    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `persona-${id}-${Date.now()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filename, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) {
      console.error('persona avatar upload error:', uploadError);
      return res.status(500).json({ error: 'Could not upload image.' });
    }

    const { data: publicUrlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filename);
    const updated = await User.updateAvatar({ id, profilePicture: publicUrlData.publicUrl });
    res.json({ persona: updated });
  } catch (err) {
    console.error('persona avatar error:', err);
    res.status(500).json({ error: 'Something went wrong uploading that photo.' });
  }
}

async function createPost(req, res) {
  try {
    const { id } = req.params;
    const persona = await User.findPersonaById(id);
    if (!persona) {
      return res.status(404).json({ error: 'Persona not found.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'An image or video is required.' });
    }
    if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPEG, PNG, WEBP, GIF images or MP4/MOV/WEBM videos are allowed.' });
    }

    const mediaType = ALLOWED_VIDEO_TYPES.includes(req.file.mimetype) ? 'video' : 'image';
    const caption = (req.body.caption || '').trim().slice(0, 2200);
    const ext = path.extname(req.file.originalname) || (mediaType === 'video' ? '.mp4' : '.jpg');
    const filename = `persona-${id}-${Date.now()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(POST_BUCKET)
      .upload(filename, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) {
      console.error('persona post upload error:', uploadError);
      return res.status(500).json({ error: 'Could not upload file.' });
    }

    const { data: publicUrlData } = supabase.storage.from(POST_BUCKET).getPublicUrl(filename);

    const post = await Post.createPost({
      userId: id,
      imageUrl: publicUrlData.publicUrl,
      caption,
      mediaType,
    });

    res.status(201).json({ post });
  } catch (err) {
    console.error('create persona post error:', err);
    res.status(500).json({ error: 'Something went wrong creating that post.' });
  }
}

module.exports = { list, create, update, uploadAvatar, createPost };
