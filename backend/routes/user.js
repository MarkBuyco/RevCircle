const express = require('express');
const router = express.Router();
const User = require('../models/User'); // adjust path as needed
const { verifyToken } = require('../middleware/authMiddleware'); // adjust path as needed
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists before multer tries to save files
const uploadDir = path.join(__dirname, '..', 'uploads', 'profileImages');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload with absolute path
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename with extension
  }
});
const upload = multer({ storage });

// GET /api/users/me - get current user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/me - update profile (username + optional image)
router.put('/me', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update username if provided
    if (req.body.username) {
      user.username = req.body.username;
    }

    // Update profile image if file uploaded
    if (req.file) {
      // Remove old image file if exists
      if (user.profileImage) {
        // Remove leading slash if present to avoid absolute path issue
        const oldImagePath = user.profileImage.startsWith('/')
          ? user.profileImage.slice(1)
          : user.profileImage;

        const oldPath = path.join(__dirname, '..', oldImagePath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      user.profileImage = '/uploads/profileImages/' + req.file.filename;
    }

    await user.save();

    res.json({
      username: user.username,
      profileImage: user.profileImage
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
