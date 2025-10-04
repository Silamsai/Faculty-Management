const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
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
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: [6, 'OTP must be 6 digits']
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    enum: {
      values: ['faculty-application', 'password-reset', 'email-verification'],
      message: 'Invalid OTP purpose'
    }
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: [3, 'Maximum OTP verification attempts exceeded']
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    }
  }
}, {
  timestamps: true
});

// Index for automatic document deletion after expiration
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for better query performance
otpSchema.index({ email: 1, purpose: 1 });

// Method to verify OTP
otpSchema.methods.verifyOTP = function(inputOtp) {
  // Check if OTP is expired
  if (new Date() > this.expiresAt) {
    return { success: false, message: 'OTP has expired' };
  }
  
  // Check if OTP is already used
  if (this.isUsed) {
    return { success: false, message: 'OTP has already been used' };
  }
  
  // Check if maximum attempts reached
  if (this.attempts >= 3) {
    return { success: false, message: 'Maximum verification attempts exceeded' };
  }
  
  // Increment attempts
  this.attempts++;
  
  // Check if OTP matches
  if (this.otp === inputOtp) {
    this.isUsed = true;
    return { success: true, message: 'OTP verified successfully' };
  } else {
    return { success: false, message: 'Invalid OTP' };
  }
};

// Generate 6-digit OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = mongoose.model('OTP', otpSchema);