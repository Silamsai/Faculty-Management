const express = require('express');
const router = express.Router();
const FacultyApplication = require('../models/FacultyApplication');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { auth, authorize } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// @route   POST /api/faculty-applications/send-otp
// @desc    Send OTP for faculty application
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if there's already a recent OTP for this email
    const existingOTP = await OTP.findOne({
      email: email.toLowerCase(),
      purpose: 'faculty-application',
      expiresAt: { $gt: new Date() }
    });

    if (existingOTP && !existingOTP.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'OTP already sent. Please check your email or wait for expiry.'
      });
    }

    // Generate new OTP
    const otpCode = OTP.generateOTP();

    // Save OTP to database
    const newOTP = new OTP({
      email: email.toLowerCase(),
      otp: otpCode,
      purpose: 'faculty-application'
    });

    await newOTP.save();

    // Send OTP email
    try {
      await emailService.sendOTPEmail(email, otpCode, 'faculty application');
      
      console.log(`✨ OTP generated for ${email}: ${otpCode} (valid for 10 minutes)`);
      
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your email'
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Delete the OTP if email sending fails
      await OTP.findByIdAndDelete(newOTP._id);
      
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/faculty-applications/verify-otp
// @desc    Verify OTP for faculty application
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find the OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      purpose: 'faculty-application',
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    // Verify OTP
    const verificationResult = otpRecord.verifyOTP(otp);
    
    // Save the updated OTP record
    await otpRecord.save();

    if (verificationResult.success) {
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/faculty-applications/submit
// @desc    Submit faculty application
// @access  Public (after OTP verification)
router.post('/submit', upload.single('resume'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      specialization,
      experience,
      education,
      publications,
      achievements,
      whyJoin,
      availableFrom
      // Removed jobPostingId
    } = req.body;

    // Debug: Log incoming department value
    console.log('📋 Incoming application data:');
    console.log('- Department value:', JSON.stringify(department));
    console.log('- Department type:', typeof department);
    console.log('- Department length:', department ? department.length : 'null');
    // Removed jobPostingId log
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !department || !specialization || !experience || !education || !whyJoin) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // Check if resume was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume is required'
      });
    }

    // Removed job posting verification

    // Check if application already exists for this email
    const existingApplication = await FacultyApplication.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Application already submitted for this email'
      });
    }

    // Create new faculty application
    const facultyApplication = new FacultyApplication({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      // Removed jobPostingId
      department,
      specialization,
      experience,
      education,
      publications,
      achievements,
      whyJoin,
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      resumePath: req.file.path
    });

    await facultyApplication.save();

    // Send confirmation email
    try {
      await emailService.sendFacultyApplicationConfirmation(
        email,
        firstName,
        facultyApplication.applicationId
      );
    } catch (emailError) {
      console.error('Confirmation email failed:', emailError);
      // Don't fail the application if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: facultyApplication.applicationId,
        status: facultyApplication.status,
        submittedDate: facultyApplication.submittedDate
      }
    });

  } catch (error) {
    console.error('Submit application error:', error);
    
    // Delete uploaded file if application creation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/faculty-applications
// @desc    Get all faculty applications (Admin/HR only)
// @access  Private
router.get('/', auth, authorize('admin', 'dean'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      department,
      sortBy = 'submittedDate',
      order = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;

    // Build sort
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // Get applications with pagination
    const applications = await FacultyApplication.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-resumePath') // Exclude file path for security
      .populate('reviewedBy', 'firstName lastName');
      // Removed jobPostingId population

    // Get total count
    const total = await FacultyApplication.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/faculty-applications/:id
// @desc    Get single faculty application
// @access  Private
router.get('/:id', auth, authorize('admin', 'dean'), async (req, res) => {
  try {
    const application = await FacultyApplication.findById(req.params.id)
      .populate('reviewedBy', 'firstName lastName');
      // Removed jobPostingId population

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   PUT /api/faculty-applications/:id/review
// @desc    Review faculty application and update job posting vacancies
// @access  Private
router.put('/:id/review', auth, authorize('admin', 'dean'), async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'under-review', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get the current application
    const currentApplication = await FacultyApplication.findById(req.params.id);
    if (!currentApplication) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const previousStatus = currentApplication.status;
    
    // Update the application
    const application = await FacultyApplication.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewNotes,
        reviewedBy: req.user.id,
        reviewedDate: new Date()
      },
      { new: true }
    ).populate('reviewedBy', 'firstName lastName');
    // Removed jobPostingId population

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // If application is hired, create a user account
    if (status === 'hired' && previousStatus !== 'hired') {
      try {
        // Check if user already exists with this email
        const existingUser = await User.findOne({ email: application.email.toLowerCase() });
        if (!existingUser) {
          // Generate a random password for the new user
          const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
          
          // Create new user account
          const newUser = new User({
            firstName: application.firstName,
            lastName: application.lastName,
            email: application.email.toLowerCase(),
            password: randomPassword,
            phone: application.phone,
            userType: 'faculty',
            department: application.department,
            status: 'active', // Automatically active since they were hired
            schoolSection: 'SOET' // Default school section, can be updated later
          });

          await newUser.save();
          
          // Send welcome email with login details
          try {
            await emailService.sendWelcomeEmail(
              application.email,
              application.firstName,
              'faculty',
              randomPassword // Include password in welcome email
            );
          } catch (emailError) {
            console.error('Welcome email failed:', emailError);
          }
        }
      } catch (userError) {
        console.error('Error creating user from application:', userError);
        // Don't fail the application review if user creation fails
      }
    }

    // Removed job posting vacancy update logic

    // Send status update email
    try {
      await emailService.sendApplicationStatusUpdate(
        application.email,
        application.firstName,
        application.applicationId,
        status
      );
    } catch (emailError) {
      console.error('Status email failed:', emailError);
    }

    res.status(200).json({
      success: true,
      message: `Application ${status === 'hired' ? 'approved and hired' : 'reviewed'} successfully`,
      data: application
    });

  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/faculty-applications/download-resume/:id
// @desc    Download resume file
// @access  Private
router.get('/download-resume/:id', auth, authorize('admin', 'dean'), async (req, res) => {
  try {
    const application = await FacultyApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (!application.resumePath || !fs.existsSync(application.resumePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found'
      });
    }

    const fileName = `resume_${application.firstName}_${application.lastName}_${application.applicationId}.pdf`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    res.sendFile(path.resolve(application.resumePath));

  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;