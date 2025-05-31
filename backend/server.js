require('dotenv').config();

// This file sets up an Express server, connects to a MongoDB database, and defines routes for user authentication.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const postRoutes = require('../backend/routes/post'); // ✅ Make sure path is correct

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// Adjust the path to reach login-page from backend
app.use(express.static(path.join(__dirname, '..', 'login-page')));
app.use(express.static(path.join(__dirname, '..', 'about-page')));
app.use(express.static(path.join(__dirname, '..', 'forgot-password')));
app.use(express.static(path.join(__dirname, '..', 'guidelines-page')));
app.use(express.static(path.join(__dirname, '..', 'home-page')));
app.use(express.static(path.join(__dirname, '..', 'profile-page')));
app.use(express.static(path.join(__dirname, '..', 'signup-page')));  


// Serve login.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login-page', 'login.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'about-page', 'about-page.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'forgot-password', 'forgot-password.html'));
});

app.get('/guidelines', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'guidelines-page', 'guideline-page.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'home-page', 'home-page.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'profile-page', 'profile-page.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'signup-page', 'signup.html'));
});




// Check if MONGO_URI is loaded properly
console.log("👉 MONGO_URI is:", process.env.MONGO_URI);



// Middleware
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', postRoutes); // <-- New line
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes); 

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


