const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const { verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Create a new post (now with title and body)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    console.log('🟢 Creating new post...');
    console.log('Title:', req.body.title);
    console.log('Body:', req.body.body);
    console.log('Caption (fallback):', req.body.caption);
    console.log('User ID:', req.user.id);
    console.log('Image file:', req.file);

    const newPost = new Post({
      userId: req.user.id,
      title: req.body.title || '',
      body: req.body.body || req.body.caption || '',
      image: req.file ? req.file.path.replace(/\\/g, '/') : null,
    });

    await newPost.save();
    console.log('✅ Post saved:', newPost);
    res.status(201).json(newPost);
  } catch (err) {
    console.error('❌ Error creating post:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'username')
      .populate('comments.userId', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a post
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('❌ Error deleting post:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/:id/comments
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      userId: req.user.id,
      text: req.body.text
    };

    post.comments.push(newComment);
    await post.save();

    // ✅ Fetch the post again and populate the last comment's userId
    const updatedPost = await Post.findById(post._id).populate({
      path: 'comments.userId',
      select: 'username'
    });

    const lastComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.status(201).json(lastComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts/:id/like
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const liked = post.likes.includes(req.user.id);
    if (liked) {
      post.likes.pull(req.user.id); // Unlike
    } else {
      post.likes.push(req.user.id); // Like
    }

    await post.save();
    res.json({ liked: !liked, likesCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:postId
router.delete('/:postId', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;
