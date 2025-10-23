const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/faculty
// @desc    Get all faculty details
// @access  Public
router.get('/', async (req, res) => {
  try {
    const facultyMembers = await User.find({ userType: 'faculty' })
      .select('-password -resetPasswordToken -resetPasswordExpires');
    
    res.status(200).json({
      success: true,
      count: facultyMembers.length,
      data: facultyMembers
    });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching faculty members'
    });
  }
});

// @route   POST /api/faculty
// @desc    Add a new faculty
// @access  Public (for registration) but can be restricted
router.post('/', async (req, res) => {
  try {
    const { name, firstName, lastName, subject, email, phone, department } = req.body;

    // Validate required fields
    // Either name or both firstName and lastName are required
    if ((!name && (!firstName || !lastName)) || !subject || !email || !phone || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name or firstName and lastName, subject, email, phone, and department'
      });
    }

    // Check if faculty already exists with this email
    const existingFaculty = await User.findOne({ 
      email: email.toLowerCase(),
      userType: 'faculty'
    });

    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: 'Faculty with this email already exists'
      });
    }

    // Create new faculty user
    const faculty = new User({
      firstName: firstName || (name ? name.split(' ')[0] : '') || name,
      lastName: lastName || (name ? name.split(' ').slice(1).join(' ') : '') || '',
      email: email.toLowerCase(),
      password: 'temp1234', // Temporary password, should be changed by user
      phone,
      userType: 'faculty',
      department,
      status: 'pending', // Faculty needs approval
      schoolSection: 'SOET' // Default school section
    });

    // Add subject as a custom field
    faculty.subject = subject;

    await faculty.save();

    // Return faculty data without sensitive information
    const facultyData = faculty.getProfile();
    facultyData.subject = subject; // Add subject to response

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: facultyData
    });

  } catch (error) {
    console.error('Create faculty error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join('. ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating faculty'
    });
  }
});

// @route   PUT /api/faculty/:id
// @desc    Edit/update a faculty
// @access  Private - Admin only
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, firstName, lastName, subject, email, phone, department } = req.body;

    // Find the faculty member
    const faculty = await User.findById(req.params.id);
    
    if (!faculty || faculty.userType !== 'faculty') {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    // Update fields if provided
    if (name !== undefined) {
      faculty.firstName = firstName || (name ? name.split(' ')[0] : '') || name;
      faculty.lastName = lastName || (name ? name.split(' ').slice(1).join(' ') : '') || '';
    } else {
      if (firstName !== undefined) faculty.firstName = firstName;
      if (lastName !== undefined) faculty.lastName = lastName;
    }
    if (email !== undefined) faculty.email = email.toLowerCase();
    if (phone !== undefined) faculty.phone = phone;
    if (department !== undefined) faculty.department = department;
    if (subject !== undefined) faculty.subject = subject;

    faculty.updatedAt = Date.now();
    await faculty.save();

    // Return updated faculty data
    const updatedFaculty = faculty.getProfile();
    updatedFaculty.subject = faculty.subject;

    res.status(200).json({
      success: true,
      message: 'Faculty updated successfully',
      data: updatedFaculty
    });

  } catch (error) {
    console.error('Update faculty error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join('. ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating faculty'
    });
  }
});

// @route   DELETE /api/faculty/:id
// @desc    Delete a faculty
// @access  Private - Admin only
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const faculty = await User.findById(req.params.id);
    
    if (!faculty || faculty.userType !== 'faculty') {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Faculty member deleted successfully'
    });

  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting faculty'
    });
  }
});

module.exports = router;