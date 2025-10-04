const express = require('express');
const LeaveApplication = require('../models/LeaveApplication');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/leaves/apply
// @desc    Submit a leave application
// @access  Private - Faculty only
router.post('/apply', auth, authorize('faculty'), async (req, res) => {
  try {
    const { leaveType, startDate, endDate, duration, reason } = req.body;
    
    console.log('Leave application request body:', req.body); // Debug log

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !duration || !reason) {
      return res.status(400).json({ 
        message: 'All fields are required',
        missingFields: {
          leaveType: !leaveType,
          startDate: !startDate,
          endDate: !endDate,
          duration: !duration,
          reason: !reason
        }
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'End date must be after or equal to start date' });
    }

    // Validate leave type
    const validLeaveTypes = ['sick', 'vacation', 'personal', 'maternity', 'paternity', 'emergency', 'other'];
    if (!validLeaveTypes.includes(leaveType)) {
      return res.status(400).json({ 
        message: 'Invalid leave type',
        validTypes: validLeaveTypes
      });
    }

    // Validate duration
    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      return res.status(400).json({ message: 'Duration must be a positive number' });
    }

    // Create leave application
    const leaveApplication = new LeaveApplication({
      applicantId: req.user._id,
      applicantName: `${req.user.firstName} ${req.user.lastName}`,
      applicantEmail: req.user.email,
      department: req.user.department,
      leaveType,
      startDate: start,
      endDate: end,
      duration: parsedDuration,
      reason
    });

    await leaveApplication.save();

    res.status(201).json({
      message: 'Leave application submitted successfully',
      application: leaveApplication
    });

  } catch (error) {
    console.error('Apply leave error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join('. ') });
    }
    res.status(500).json({ message: 'Server error while submitting leave application: ' + error.message });
  }
});

// @route   GET /api/leaves/my-applications
// @desc    Get current user's leave applications
// @access  Private - Faculty only
router.get('/my-applications', auth, authorize('faculty'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { applicantId: req.user._id };
    if (status) filter.status = status;

    const applications = await LeaveApplication.find(filter)
      .populate('reviewedBy', 'firstName lastName')
      .sort({ appliedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LeaveApplication.countDocuments(filter);

    res.json({
      message: 'Leave applications retrieved successfully',
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Server error while fetching leave applications' });
  }
});

// @route   GET /api/leaves/all
// @desc    Get all leave applications for review
// @access  Private - Dean/Admin only
router.get('/all', auth, authorize('dean', 'admin'), async (req, res) => {
  try {
    const { status, department, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;

    const applications = await LeaveApplication.find(filter)
      .populate('applicantId', 'firstName lastName email department')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ appliedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await LeaveApplication.countDocuments(filter);

    res.json({
      message: 'Leave applications retrieved successfully',
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ message: 'Server error while fetching leave applications' });
  }
});

// @route   GET /api/leaves/pending
// @desc    Get pending leave applications for review
// @access  Private - Dean/Admin only
router.get('/pending', auth, authorize('dean', 'admin'), async (req, res) => {
  try {
    const applications = await LeaveApplication.find({ status: 'pending' })
      .populate('applicantId', 'firstName lastName email department')
      .sort({ appliedDate: -1 });

    res.json({
      message: 'Pending leave applications retrieved successfully',
      applications
    });

  } catch (error) {
    console.error('Get pending applications error:', error);
    res.status(500).json({ message: 'Server error while fetching pending applications' });
  }
});

// @route   PUT /api/leaves/:id/review
// @desc    Review leave application (approve/reject)
// @access  Private - Dean/Admin only
router.put('/:id/review', auth, authorize('dean', 'admin'), async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    if (status === 'rejected' && !reviewNotes) {
      return res.status(400).json({ message: 'Review notes are required for rejection' });
    }

    const application = await LeaveApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot review application that is already ${application.status}` 
      });
    }

    // Update application
    application.status = status;
    application.reviewedBy = req.user._id;
    application.reviewNotes = reviewNotes || '';
    application.reviewedDate = new Date();

    await application.save();

    // Populate reviewer details for response
    await application.populate('reviewedBy', 'firstName lastName');

    res.json({
      message: `Leave application ${status} successfully`,
      application
    });

  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({ message: 'Server error while reviewing application' });
  }
});

// @route   GET /api/leaves/:id
// @desc    Get specific leave application details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await LeaveApplication.findById(req.params.id)
      .populate('applicantId', 'firstName lastName email department')
      .populate('reviewedBy', 'firstName lastName');

    if (!application) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    // Faculty can only view their own applications
    if (req.user.userType === 'faculty' && application.applicantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      message: 'Leave application retrieved successfully',
      application
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Server error while fetching application' });
  }
});

// @route   DELETE /api/leaves/:id
// @desc    Delete leave application (own application only, and only if pending)
// @access  Private - Faculty only
router.delete('/:id', auth, authorize('faculty'), async (req, res) => {
  try {
    const application = await LeaveApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    // Check if user owns the application
    if (application.applicantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only delete pending applications
    if (application.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot delete application that is already ${application.status}` 
      });
    }

    await LeaveApplication.findByIdAndDelete(req.params.id);

    res.json({ message: 'Leave application deleted successfully' });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ message: 'Server error while deleting application' });
  }
});

// @route   GET /api/leaves/stats/summary
// @desc    Get leave statistics summary
// @access  Private - Dean/Admin only
router.get('/stats/summary', auth, authorize('dean', 'admin'), async (req, res) => {
  try {
    const stats = await LeaveApplication.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await LeaveApplication.aggregate([
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await LeaveApplication.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$appliedDate' },
            month: { $month: '$appliedDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const totalApplications = await LeaveApplication.countDocuments();
    const pendingCount = await LeaveApplication.countDocuments({ status: 'pending' });
    const recentApplications = await LeaveApplication.countDocuments({
      appliedDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      message: 'Leave statistics retrieved successfully',
      stats: {
        total: totalApplications,
        pending: pendingCount,
        recent: recentApplications,
        byStatus: stats,
        byType: typeStats,
        monthly: monthlyStats
      }
    });

  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;