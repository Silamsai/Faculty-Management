const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');
const { auth } = require('../middleware/auth');
const connectDB = require('../config/database');

const router = express.Router();

// Helper function to ensure database connection in Vercel
const ensureDBConnection = async () => {
  try {
    if (process.env.VERCEL) {
      console.log('Vercel environment detected');
      if (mongoose.connection.readyState !== 1) {
        console.log('Establishing new MongoDB connection...');
        await connectDB(); // Use the same connection function as the main app
        console.log('MongoDB connection established via connectDB');
      } else {
        console.log('MongoDB already connected');
      }
    }
  } catch (error) {
    console.error('Error in ensureDBConnection:', error.message);
    throw error;
  }
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    
    // Ensure database connection in Vercel environment
    await ensureDBConnection();
    
    const { firstName, lastName, email, password, phone, userType, department, schoolSection } = req.body;

    console.log('Checking for existing user with email:', email.toLowerCase());
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists with this email');
      return res.status(400).json({ 
        message: 'Email address is already registered. Please use a different email or try logging in.' 
      });
    }

    console.log('Creating new user');
    // Create new user
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
    console.log('User saved successfully');

    // Send welcome email (don't block if it fails)
    try {
      console.log('Sending welcome email');
      await sendWelcomeEmail(email, firstName, userType);
      console.log('Welcome email sent');
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
    }

    // Generate JWT token
    console.log('Generating JWT token');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Signup successful');
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.getProfile()
    });

  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join('. ') });
    }

    // Handle duplicate email error
    if (error.message && error.message.includes('Email address is already registered')) {
      return res.status(400).json({ message: error.message });
    }

    // Handle MongoDB connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(500).json({ message: 'Database connection error. Please try again later.' });
    }

    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    // Ensure database connection in Vercel environment
    await ensureDBConnection();
    
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Check if user exists by email or username
    let user;
    if (email.includes('@')) {
      // Login with email
      console.log('Searching for user by email');
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      // Login with username (for now we'll treat it as email)
      console.log('Searching for user by username/email');
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', user.email, user.userType, user.status);

    // Check if account is suspended
    if (user.status === 'suspended') {
      console.log('Account suspended');
      return res.status(403).json({ message: 'Your account has been suspended. Please contact administrator.' });
    }

    // Check if faculty account is still pending
    if (user.userType === 'faculty' && user.status === 'pending') {
      console.log('Faculty account pending approval');
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

    console.log('Login successful for user:', user.email);
    res.json({
      message: 'Login successful',
      token,
      user: user.getProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle MongoDB connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
      return res.status(500).json({ message: 'Database connection error. Please try again later.' });
    }
    
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset link
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

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
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({
      message: 'Token is valid',
      user: req.user.getProfile()
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Server error during token verification' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password for authenticated user
// @access  Private
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(req.user._id);
    
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
    res.status(500).json({ message: 'Server error during password change' });
  }
});

// Test route to check if auth routes are working
router.get('/test', (req, res) => {
  res.json({
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;