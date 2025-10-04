const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Publication title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Publication type is required'],
    enum: {
      values: ['journal', 'book', 'conference', 'chapter', 'thesis', 'report'],
      message: 'Publication type must be journal, book, conference, chapter, thesis, or report'
    }
  },
  authors: [{
    type: String,
    required: true,
    trim: true
  }],
  journal: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  conference: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Publication year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 5, 'Year cannot be more than 5 years in the future']
  },
  pages: {
    from: {
      type: Number,
      min: 1
    },
    to: {
      type: Number,
      min: 1
    }
  },
  volume: {
    type: String,
    trim: true
  },
  issue: {
    type: String,
    trim: true
  },
  doi: {
    type: String,
    trim: true
  },
  isbn: {
    type: String,
    trim: true
  },
  impactFactor: {
    type: Number,
    min: 0
  },
  abstract: {
    type: String,
    maxlength: [1000, 'Abstract cannot exceed 1000 characters']
  },
  keywords: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under-review', 'accepted', 'published', 'rejected'],
    default: 'draft'
  },
  submissionDate: {
    type: Date
  },
  publicationDate: {
    type: Date
  },
  url: {
    type: String,
    trim: true
  },
  pdfPath: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: {
    type: Date
  },
  reviewNotes: {
    type: String,
    maxlength: [500, 'Review notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for better search performance
publicationSchema.index({ userId: 1, year: -1 });
publicationSchema.index({ title: 'text', abstract: 'text' });

// Virtual for citation format
publicationSchema.virtual('citation').get(function() {
  const authors = this.authors.join(', ');
  const year = this.year;
  const title = this.title;
  
  switch (this.type) {
    case 'journal':
      return `${authors} (${year}). ${title}. ${this.journal || 'Journal'}, ${this.volume || ''}${this.issue ? `(${this.issue})` : ''}${this.pages.from && this.pages.to ? `, ${this.pages.from}-${this.pages.to}` : ''}.`;
    case 'book':
      return `${authors} (${year}). ${title}. ${this.publisher || 'Publisher'}.`;
    case 'conference':
      return `${authors} (${year}). ${title}. In ${this.conference || 'Conference Proceedings'}${this.pages.from && this.pages.to ? `, pp. ${this.pages.from}-${this.pages.to}` : ''}.`;
    default:
      return `${authors} (${year}). ${title}.`;
  }
});

module.exports = mongoose.model('Publication', publicationSchema);