const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    trim: true,
    unique: true,
    maxlength: [20, 'Subject code cannot exceed 20 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: [
        'Btech-CSE',
        'Btech-MECH',
        'Btech-CIVIL',
        'Btech-ECE',
        'bsc',
        'anesthesia',
        'radiology',
        'mathematics', 
        'Btech-EEE',
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
    required: [true, 'School section is required'],
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
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits cannot exceed 10']
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: [1, 'Semester must be at least 1'],
    max: [8, 'Semester cannot exceed 8']
  },
  isActive: {
    type: Boolean,
    default: true
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

// Ensure name and code are unique
subjectSchema.index({ name: 1 }, { unique: true });
subjectSchema.index({ code: 1 }, { unique: true });

// Pre-save middleware to update timestamps
subjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Subject', subjectSchema);