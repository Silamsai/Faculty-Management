const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Helper function to ensure database connection in Vercel
const ensureDBConnection = async () => {
  if (process.env.VERCEL && mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    // Ensure database connection in Vercel environment
    await ensureDBConnection();
    
    const { firstName, lastName, email, password, phone, userType, department, schoolSection } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email address is already registered. Please use a different email or try logging in.' 
      });
    }

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

    // Send welcome email (don't block if it fails)
    try {
      await sendWelcomeEmail(email, firstName, userType);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
    }

    // Generate JWT token
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
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join('. ') });
    }

    // Handle duplicate email error
    if (error.message.includes('Email address is already registered')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    // Ensure database connection in Vercel environment
    await ensureDBConnection();
    
    const { email, password } = req.body;

    // Check if user exists by email or username
    let user;
    if (email.includes('@')) {
      // Login with email
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      // Login with username (for now we'll treat it as email)
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact administrator.' });
    }

    // Check if faculty account is still pending
    if (user.userType === 'faculty' && user.status === 'pending') {
      return res.status(403).json({ 
        message: 'Your faculty account is pending approval. Please wait for administrator approval.' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: user.getProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
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

module.exports = router;