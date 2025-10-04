const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      message: 'Profile retrieved successfully',
      user: req.user.getProfile()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, department } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.getProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join('. ') });
    }
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// @route   GET /api/users/all
// @desc    Get all users (Admin only, or Dean for their department)
// @access  Private - Admin or Dean
router.get('/all', auth, async (req, res) => {
  try {
    // Check if user is admin or dean
    const isAdmin = req.user.userType === 'admin';
    const isDean = req.user.userType === 'dean';
    
    // If dean, only allow access to faculty in their department
    if (isDean) {
      // Dean can only access faculty in their department
      if (req.query.userType && req.query.userType !== 'faculty') {
        return res.status(403).json({ message: 'Access denied. Deans can only view faculty members.' });
      }
      
      // If department filter is provided, it must match the dean's department
      if (req.query.department && req.query.department !== req.user.department) {
        return res.status(403).json({ message: 'Access denied. You can only view faculty in your department.' });
      }
    } else if (!isAdmin) {
      // Only admin and dean can access this endpoint
      return res.status(403).json({ 
        message: `Access denied. Required role: admin or dean, your role: ${req.user.userType}` 
      });
    }
    
    const { userType, department, status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (userType) filter.userType = userType;
    if (department) filter.department = department;
    if (status) filter.status = status;
    
    // If dean, automatically filter by their department
    if (isDean) {
      filter.department = req.user.department;
      filter.userType = 'faculty';
    }

    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      message: 'Users retrieved successfully',
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Update user status (Admin only)
// @access  Private - Admin only
router.put('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('Update user status request received');
    console.log('User ID from params:', req.params.id);
    console.log('User making request:', req.user);
    console.log('Request body:', req.body);
    console.log('Content-Type header:', req.get('Content-Type'));
    
    // Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Request body is missing or empty');
      // Try to parse body manually if it's a string
      if (typeof req.body === 'string') {
        try {
          req.body = JSON.parse(req.body);
          console.log('Parsed body from string:', req.body);
        } catch (parseError) {
          console.error('Failed to parse body as JSON:', parseError);
          return res.status(400).json({ message: 'Invalid request body format' });
        }
      } else {
        return res.status(400).json({ message: 'Request body is missing' });
      }
    }
    
    const { status } = req.body;
    
    console.log('Extracted status:', status);
    
    if (status === undefined || status === null) {
      return res.status(400).json({ message: 'Status is required' });
    }

    if (!['pending', 'active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Use findByIdAndUpdate to only update the status field
    console.log('Updating user with ID:', req.params.id);
    console.log('New status:', status);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        status: status,
        updatedAt: Date.now()
      },
      { 
        new: true,
        runValidators: false // Skip validation since we're only updating status
      }
    );
    
    console.log('Updated user:', user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return success message based on status
    let message = `User status updated to ${status}`;
    if (status === 'active') {
      message = 'Faculty member has been approved successfully! They can now log in to the system.';
    } else if (status === 'suspended') {
      message = 'User has been suspended.';
    }

    res.json({
      message: message,
      user: user.getProfile()
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error while updating user status: ' + error.message });
  }
});

// @route   GET /api/users/faculty/pending
// @desc    Get pending faculty applications (Dean/Admin only)
// @access  Private - Dean/Admin only
router.get('/faculty/pending', auth, authorize('dean', 'admin'), async (req, res) => {
  try {
    const pendingFaculty = await User.find({
      userType: 'faculty',
      status: 'pending'
    })
    .select('-password -resetPasswordToken -resetPasswordExpires')
    .sort({ createdAt: -1 });

    res.json({
      message: 'Pending faculty applications retrieved successfully',
      users: pendingFaculty
    });

  } catch (error) {
    console.error('Get pending faculty error:', error);
    res.status(500).json({ message: 'Server error while fetching pending faculty' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private - Admin only
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

// @route   GET /api/users/:id/details
// @desc    Get user details including encrypted password (Admin only - for password recovery)
// @access  Private - Admin only
router.get('/:id/details', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create user details object with masked password for security
    const userDetails = {
      ...user.toObject(),
      // Show first 4 and last 4 characters of encrypted password hash
      passwordHash: user.password ? 
        user.password.substring(0, 4) + '...' + user.password.substring(user.password.length - 4) : '',
      // Add a flag indicating this user's password can be viewed
      canViewPassword: true
    };

    res.json({
      message: 'User details retrieved successfully',
      user: userDetails
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error while fetching user details' });
  }
});

// @route   POST /api/users/create
// @desc    Create a new user (Admin only)
// @access  Private - Admin only
router.post('/create', auth, authorize('admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, userType, department, schoolSection } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !userType || !department) {
      return res.status(400).json({ 
        message: 'All fields are required: firstName, lastName, email, password, phone, userType, department' 
      });
    }

    // Validate user type
    const validUserTypes = ['faculty', 'dean', 'admin', 'researcher', 'vc'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({ 
        message: 'Invalid user type. Must be one of: ' + validUserTypes.join(', ') 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already registered' });
    }

    // Create new user
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save middleware
      phone,
      userType,
      department,
      status: userType === 'faculty' ? 'pending' : 'active' // Faculty needs approval
    };

    // Add schoolSection if provided and required
    if (schoolSection && (userType === 'faculty' || userType === 'dean')) {
      userData.schoolSection = schoolSection;
    }

    const user = new User(userData);

    await user.save();

    // Return success response without sensitive data
    const userResponse = user.getProfile();
    
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join('. ') });
    }
    res.status(500).json({ message: 'Server error while creating user' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private - Admin only
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, userType, department, schoolSection, password } = req.body;

    // Find the user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (userType !== undefined) user.userType = userType;
    if (department !== undefined) user.department = department;
    if (schoolSection !== undefined) user.schoolSection = schoolSection;
    
    // Update password if provided
    if (password !== undefined && password !== '') {
      user.password = password; // Will be hashed by pre-save middleware
    }

    user.updatedAt = Date.now();
    await user.save();

    // Return updated user without sensitive data
    const updatedUser = await User.findById(user._id)
      .select('-password -resetPasswordToken -resetPasswordExpires');

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join('. ') });
    }
    res.status(500).json({ message: 'Server error while updating user' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics (Admin only)
// @access  Private - Admin only
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      message: 'User statistics retrieved successfully',
      stats: {
        total: totalUsers,
        recent: recentUsers,
        byType: stats,
        byStatus: statusStats
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;