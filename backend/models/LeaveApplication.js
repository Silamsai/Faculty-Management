const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant ID is required']
  },
  applicantName: {
    type: String,
    required: [true, 'Applicant name is required']
  },
  applicantEmail: {
    type: String,
    required: [true, 'Applicant email is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  leaveType: {
    type: String,
    required: [true, 'Leave type is required'],
    enum: {
      values: ['sick', 'vacation', 'personal', 'maternity', 'paternity', 'emergency', 'other'],
      message: 'Please select a valid leave type'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(endDate) {
        return endDate >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewNotes: {
    type: String,
    maxlength: [500, 'Review notes cannot exceed 500 characters'],
    default: ''
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  reviewedDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
leaveApplicationSchema.index({ applicantId: 1, status: 1 });
leaveApplicationSchema.index({ status: 1, appliedDate: -1 });

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);