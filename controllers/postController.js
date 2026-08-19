// controllers/postController.js

const path = require('path');
const supabase = require('../lib/supabaseClient');
const Post = require('../models/Post');
const FeedSettings = require('../models/FeedSettings');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const { mixFeed } = require('../lib/feedMix');

const BUCKET = 'posts';
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

    const mediaType = ALLOWED_VIDEO_TYPES.includes(req.file.mimetype) ? 'video' : 'image';
    const caption = (req.body.caption || '').trim().slice(0, 2200);
    const ext = path.extname(req.file.originalname) || (mediaType === 'video' ? '.mp4' : '.jpg');
    const filename = `${req.session.userId}-${Date.now()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) {
      console.error('storage upload error:', uploadError);
      return res.status(500).json({ error: 'Could not upload file.' });
    }

    const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    const post = await Post.createPost({
      userId: req.session.userId,
      imageUrl: publicUrlData.publicUrl,
      caption,
      mediaType,
    });

    res.status(201).json({ post });
  } catch (err) {
    console.error('create post error:', err);
    res.status(500).json({ error: 'Something went wrong creating your post.' });
  }
}

async function list(req, res) {
  try {
    const [allPosts, realPercent] = await Promise.all([
      Post.listPosts(),
      FeedSettings.getRealPercent(),
    ]);

    const realPosts = [];
    const aiPosts = [];
    for (const p of allPosts) {
      const { is_ai, ...rest } = p;
      const tagged = { ...rest, post_type: is_ai ? 'ai' : 'real' };
      (is_ai ? aiPosts : realPosts).push(tagged);
    }

    const mixed = mixFeed(realPosts, aiPosts, realPercent);

    const ids = mixed.map((p) => p.id);
    const [{ counts: likeCounts, likedByMe }, commentCounts] = await Promise.all([
      Like.getLikeData(ids, req.session.userId),
      Comment.countComments(ids),
    ]);

    const posts = mixed.map((p) => ({
      ...p,
      like_count: likeCounts[p.id] || 0,
      liked_by_me: likedByMe.has(p.id),
      comment_count: commentCounts[p.id] || 0,
    }));

    res.json({ posts });
  } catch (err) {
    console.error('list posts error:', err);
    res.status(500).json({ error: 'Something went wrong loading the feed.' });
  }
}

module.exports = { create, list };
