// controllers/aiPostController.js

const path = require('path');
const supabase = require('../lib/supabaseClient');
const AiPost = require('../models/AiPost');

const BUCKET = 'ai-posts';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

async function create(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'An image or video is required.' });
    }
    if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPEG, PNG, WEBP, GIF images or MP4/MOV/WEBM videos are allowed.' });
    }

    const username = (req.body.username || '').trim();
    const persona = (req.body.persona || '').trim();
    if (!username || !persona) {
      return res.status(400).json({ error: 'Username and persona are required.' });
    }

    const mediaType = ALLOWED_VIDEO_TYPES.includes(req.file.mimetype) ? 'video' : 'image';
    const caption = (req.body.caption || '').trim().slice(0, 2200);
    const ext = path.extname(req.file.originalname) || (mediaType === 'video' ? '.mp4' : '.jpg');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) {
      console.error('ai storage upload error:', uploadError);
      return res.status(500).json({ error: 'Could not upload file.' });
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    const post = await AiPost.createAiPost({
      username,
      persona,
      imageUrl: publicUrlData.publicUrl,
      caption,
      mediaType,
    });

    res.status(201).json({ post });
  } catch (err) {
    console.error('create ai post error:', err);
    res.status(500).json({ error: 'Something went wrong creating that seed post.' });
  }
}

async function list(req, res) {
  try {
    const posts = await AiPost.listAiPosts();
    res.json({ posts });
  } catch (err) {
    console.error('list ai posts error:', err);
    res.status(500).json({ error: 'Something went wrong loading seed posts.' });
  }
}

module.exports = { create, list };
