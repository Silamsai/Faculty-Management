const mongoose = require('mongoose');

const scheduleChangeSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Faculty ID is required']
  },
  facultyName: {
    type: String,
    required: [true, 'Faculty name is required']
  },
  facultyEmail: {
    type: String,
    required: [true, 'Faculty email is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required']
  },
  currentSchedule: {
    type: String,
    required: [true, 'Current schedule is required']
  },
  requestedSchedule: {
    type: String,
    required: [true, 'Requested schedule is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason for change is required'],
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
  },
  approvedSchedule: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
scheduleChangeSchema.index({ facultyId: 1, status: 1 });
scheduleChangeSchema.index({ status: 1, appliedDate: -1 });

module.exports = mongoose.model('ScheduleChange', scheduleChangeSchema);