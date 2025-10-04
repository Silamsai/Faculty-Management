const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Image title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  imagePath: {
    type: String,
    required: [true, 'Image path is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'campus',
        'classroom', 
        'laboratory',
        'library',
        'events',
        'sports',
        'dormitory',
        'facilities',
        'graduation',
        'research'
      ],
      message: 'Please select a valid category'
    }
  },
  isActive: {
    type: Boolean,
    default: true  // Changed back to true - images are active by default
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  fileSize: {
    type: Number // in bytes
  },
  dimensions: {
    width: Number,
    height: Number
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
gallerySchema.index({ category: 1, isActive: 1, displayOrder: 1 });
gallerySchema.index({ uploadedBy: 1 });
gallerySchema.index({ uploadDate: -1 });

// Virtual for formatted file size
gallerySchema.virtual('formattedFileSize').get(function() {
  if (!this.fileSize) return 'Unknown';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = this.fileSize;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
});

module.exports = mongoose.model('Gallery', gallerySchema);