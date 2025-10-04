const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

// Test route to check if auth routes are working
router.get('/test', (req, res) => {
  console.log('✅ Auth test route accessed');
  res.json({
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  });
});

// Simplified database connection for Vercel
const connectToDatabase = async () => {
  // In Vercel, we need to ensure connection for each request
  if (process.env.VERCEL) {
    console.log('Vercel environment: checking database connection');
    
    // If not connected, establish connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Establishing new database connection');
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 10000,
        });
        console.log('Database connected successfully');
      } catch (error) {
        console.error('Database connection failed:', error.message);
        throw new Error('Failed to connect to database');
      }
    } else {
      console.log('Database already connected');
    }
  }
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request received');
    
    // Ensure database connection
    await connectToDatabase();
    
    const { firstName, lastName, email, password, phone, userType, department, schoolSection } = req.body;
    console.log('Request body:', { firstName, lastName, email, phone, userType, department, schoolSection });

    // Check if user already exists
    console.log('Checking for existing user');
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ 
        message: 'Email address is already registered. Please use a different email or try logging in.' 
      });
    }

    // Create new user
    console.log('Creating new user');
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      userType,
      department,
      schoolSection
    });

    await user.save();
    console.log('User created successfully');

    // Generate JWT token
    console.log('Generating JWT token');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.getProfile()
    });

  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join('. ') });
    }

    res.status(500).json({ message: 'Server error during registration: ' + error.message });
  }
});

// Login route with additional logging
router.post('/login', async (req, res) => {
  console.log('🔑 Login route accessed');
  console.log('🔑 Request body:', req.body);
  
  try {
    console.log('Login request received');
    
    // Ensure database connection
    await connectToDatabase();
    
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Check if user exists
    console.log('Searching for user');
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', user.email, user.userType);

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact administrator.' });
    }

    if (user.userType === 'faculty' && user.status === 'pending') {
      return res.status(403).json({ 
        message: 'Your faculty account is pending approval. Please wait for administrator approval.' 
      });
    }

    // Check password
    console.log('Checking password');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    console.log('Generating JWT token');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Login successful');
    res.json({
      message: 'Login successful',
      token,
      user: user.getProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset link
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Ensure database connection
    await connectToDatabase();

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token before saving to database
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set expiration (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    // Save reset token to user document
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = expiresAt;
    await user.save();

    // Send reset link via email
    try {
      const { sendPasswordResetEmail } = require('../utils/emailService');
      await sendPasswordResetEmail(email, resetToken);
      res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.',
        email: email
      });
    } catch (emailError) {
      console.error('Reset email error:', emailError);
      res.status(500).json({ message: 'Error sending reset email. Please try again.' });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Ensure database connection
    await connectToDatabase();

    // Hash the token to compare with database
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by reset token and check if token is valid and not expired
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// @route   GET /api/auth/verify-reset-token
// @desc    Verify if reset token is valid
// @access  Public
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Ensure database connection
    await connectToDatabase();

    // Hash the token to compare with database
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by reset token and check if token is valid and not expired
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    res.json({ message: 'Token is valid', email: user.email });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({ message: 'Server error during token verification' });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify JWT token
// @access  Private
router.get('/verify', async (req, res) => {
  try {
    // Ensure database connection
    await connectToDatabase();
    
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid, user not found' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account is suspended' });
    }

    res.json({
      message: 'Token is valid',
      user: user.getProfile()
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password for authenticated user
// @access  Private
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    // Ensure database connection
    await connectToDatabase();

    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid, user not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error during password change' });
  }
});

module.exports = router;