const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Protect: Verifies if the user is logged in
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '+4g+PzIOxBHN1vnNuhNM4E67oY5P9d7ljXuwPjnM0kE=');

      // Get user from the token and attach to request
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
};

// 2. Authorize: Checks if the user has the right Role (Manager/Agent/Director)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };