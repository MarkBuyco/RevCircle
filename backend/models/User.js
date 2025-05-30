// This file defines the User model for a MongoDB database using Mongoose.
const mongoose = require('mongoose');

// Define the User schema   
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create a virtual field for the user's full name
module.exports = mongoose.model('User', userSchema);
