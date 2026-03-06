const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST: Register a new user (Manager or Sales Agent)
router.post('/signup', async (req, res) => {
    try {
        const { username, password, role, branch, fullName } = req.body;

        // Hash the password for security
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            role,   // Director, Manager, or Sales Agent 
            branch, // Maganjo or Matugga 
            fullName
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST: Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: "User not found" });
        console.log(user)


        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Create JWT Token with role and branch permissions
        const token = jwt.sign(
            { id: user._id, role: user.role, branch: user.branch },
            process.env.JWT_SECRET ,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                branch: user.branch
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;