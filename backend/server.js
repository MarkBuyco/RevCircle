// This file sets up an Express server, connects to a MongoDB database, and defines routes for user authentication.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const postRoutes = require('../backend/routes/post'); // ✅ Make sure path is correct

require('dotenv').config();


// Check if MONGO_URI is loaded properly
console.log("👉 MONGO_URI is:", process.env.MONGO_URI);

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', postRoutes); // <-- New line
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Mount the routes

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected!'))
.catch((err) => console.error('❌ MongoDB connection error:', err.message));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
