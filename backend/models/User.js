const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  userType: {
    type: String,
    required: [true, 'User type is required'],
    enum: {
      values: ['faculty', 'dean', 'admin', 'researcher', 'vc'],
      message: 'User type must be faculty, dean, admin, researcher, or vc'
    }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: [
        'computer-science',
        'cse',
        'Btech-CSE',
        'Btech-ECE',
        'Btech-EEE',
        'Btech-Mech',
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
  schoolSection: {
    type: String,
    required: function() {
      // Only required for faculty and dean users when creating new users
      // Don't require for updates since we're only changing status
      return this.isNew && (this.userType === 'faculty' || this.userType === 'dean');
    },
    enum: {
      values: [
        'SOET',
        'School of Forensics science',
        'radiology and Agriculture',
        'Anesthesia',
        'Optometry',
        'Pharmacy'
      ],
      message: 'Please select a valid school section'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: function() {
      return this.userType === 'faculty' ? 'pending' : 'active';
    }
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user profile without sensitive data
userSchema.methods.getProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

// Handle duplicate email error
userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    if (error.keyPattern && error.keyPattern.email) {
      next(new Error('Email address is already registered. Please use a different email or try logging in.'));
    } else {
      next(error);
    }
  } else {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);