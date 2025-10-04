const mongoose = require('mongoose');

const facultyApplicationSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  // Academic Information
  // Removed jobPostingId reference
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: [
        'computer-science',
        'cse',
        'ece',
        'eee',
        'bsc',
        'anesthesia',
        'radiology',
        'mathematics', 
        'physics',
        'chemistry',
        'biology',
        'english',
        'history',
        'economics'
      ],
      message: 'Please select a valid department'
    }
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
    maxlength: [200, 'Specialization cannot exceed 200 characters']
  },
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    enum: {
      values: ['0-2', '3-5', '6-10', '11-15', '15+'],
      message: 'Please select a valid experience range'
    }
  },
  education: {
    type: String,
    required: [true, 'Education details are required'],
    trim: true,
    maxlength: [500, 'Education details cannot exceed 500 characters']
  },
  
  // Optional Information
  publications: {
    type: String,
    trim: true,
    maxlength: [1000, 'Publications cannot exceed 1000 characters']
  },
  achievements: {
    type: String,
    trim: true,
    maxlength: [1000, 'Achievements cannot exceed 1000 characters']
  },
  whyJoin: {
    type: String,
    required: [true, 'Please explain why you want to join'],
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters']
  },
  availableFrom: {
    type: Date
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['pending', 'under-review', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  
  // Resume/CV
  resumePath: {
    type: String,
    required: [true, 'Resume is required']
  },
  
  // Review Information
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewNotes: {
    type: String,
    maxlength: [1000, 'Review notes cannot exceed 1000 characters']
  },
  reviewedDate: {
    type: Date,
    default: null
  },
  
  // Interview Information
  interviewScheduled: {
    type: Boolean,
    default: false
  },
  interviewDate: {
    type: Date
  },
  interviewNotes: {
    type: String,
    maxlength: [1000, 'Interview notes cannot exceed 1000 characters']
  },
  
  // Application Metadata
  applicationId: {
    type: String,
    unique: true,
    required: false,
    default: function() {
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `CU-FA-${timestamp.slice(-6)}-${random}`;
    }
  },
  submittedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique application ID before saving (backup)
facultyApplicationSchema.pre('save', function(next) {
  if (!this.applicationId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.applicationId = `CU-FA-${timestamp.slice(-6)}-${random}`;
  }
  next();
});

// Index for better query performance
facultyApplicationSchema.index({ email: 1 });
facultyApplicationSchema.index({ status: 1, submittedDate: -1 });
facultyApplicationSchema.index({ department: 1, status: 1 });
facultyApplicationSchema.index({ applicationId: 1 });

module.exports = mongoose.model('FacultyApplication', facultyApplicationSchema);