// Import Express for auth route definitions.
const express = require('express');
// Import JWT library for token creation.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Import User model for registration/login queries.
const User = require('../models/User.js');
// Import auth middleware for protected profile endpoint.
const { protect } = require('../middleware/auth.js');
const path = require('path')

// Create router dedicated to authentication endpoints.
const router = express.Router();

// Register a new user account.
router.post('/register', async (req, res) => {
  try {
    // Read registration input fields.
    const { username, password, fullName, email, role, branch } = req.body;

    // Validate mandatory fields.
    if (!username || !password || !fullName) {
      return res.status(400).json({ error: 'Username, password, and full name are required' });
    }

    // Ensure username uniqueness.
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Ensure email uniqueness if email is provided.
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document.
    const user = new User({
      username,
      password: hashedPassword,
      fullName,
      email,
      role,
      branch,
    });

    // Save user document.
    await user.save();

    // Return safe user profile fields (excluding password).
    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branch: user.branch,
      },
    });
  } catch (error) {
    // Return server error for unexpected failures.
    return res.status(500).json({ error: error.message });
  }
});



router.get('/login',(req,res)=>{

  res.sendFile(path.join(__dirname, "../../public/login.html"));
})




// Authenticate user and issue JWT token.
router.post('/login', async (req, res) => {
  try {
    // Read login credentials.
    const { username, password } = req.body;

    // Validate required credentials.
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Load user by username.
    const user = await User.findOne({ username });

    // Reject unknown users.
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Support bcrypt hashed passwords and legacy plain-text records.
    let isMatch = false;
    if (typeof user.password === 'string' && user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Sign JWT containing user id and role.
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || '+4g+PzIOxBHN1vnNuhNM4E67oY5P9d7ljXuwPjnM0kE=',
      { expiresIn: '24h' }
    );

    // Return token and safe user profile fields.
    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        branch: user.branch,
      },
    });
  } catch (error) {
    // Return server error for unexpected failures.
    return res.status(500).json({ error: error.message });
  }
});

// Return the currently authenticated user's profile.
router.get('/me', protect, async (req, res) => {
  return res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      branch: req.user.branch,
    },
  });
});

// Export auth router.
module.exports = router;
