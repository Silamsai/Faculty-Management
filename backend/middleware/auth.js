const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware called for:', req.method, req.url);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth middleware - Token from header:', token);
    
    if (!token) {
      console.log('No token provided in request');
      console.log('Request headers:', req.headers);
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('User found:', user);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'Token is not valid, user not found' });
    }

    if (user.status === 'suspended') {
      console.log('User account is suspended');
      return res.status(403).json({ message: 'Account is suspended' });
    }

    req.user = user;
    console.log('Authentication successful, proceeding to next middleware');
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorize middleware - Required roles:', roles);
    console.log('User making request:', req.user);
    
    if (!req.user) {
      console.log('No user in request, access denied');
      return res.status(401).json({ message: 'Access denied. Please login first.' });
    }

    if (!roles.includes(req.user.userType)) {
      console.log('User role not authorized:', req.user.userType);
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}, your role: ${req.user.userType}` 
      });
    }

    console.log('Authorization successful, proceeding to next middleware');
    next();
  };
};

module.exports = { auth, authorize };