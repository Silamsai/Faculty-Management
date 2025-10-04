const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { auth, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for gallery image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/gallery');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
    }
  }
});

// @route   GET /api/gallery
// @desc    Get all gallery images (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      limit = 12,
      page = 1,
      sortBy = 'displayOrder'
    } = req.query;

    // Build filter - only show active images on public gallery
    const filter = { isActive: true };
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Build sort
    const sort = {};
    if (sortBy === 'displayOrder') {
      sort.displayOrder = 1;
      sort.uploadDate = -1;
    } else if (sortBy === 'newest') {
      sort.uploadDate = -1;
    } else if (sortBy === 'oldest') {
      sort.uploadDate = 1;
    }

    // Get images with pagination
    const images = await Gallery.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploadedBy', 'firstName lastName')
      .select('-imagePath'); // Don't expose server file paths

    // Get total count
    const total = await Gallery.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: images,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/gallery/categories
// @desc    Get available gallery categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Gallery.distinct('category', { isActive: true });
    
    const categoryInfo = {
      'campus': { name: 'Campus', icon: '🏫' },
      'classroom': { name: 'Classrooms', icon: '📚' },
      'laboratory': { name: 'Laboratories', icon: '🔬' },
      'library': { name: 'Library', icon: '📖' },
      'events': { name: 'Events', icon: '🎉' },
      'sports': { name: 'Sports', icon: '⚽' },
      'dormitory': { name: 'Dormitories', icon: '🏠' },
      'facilities': { name: 'Facilities', icon: '🏢' },
      'graduation': { name: 'Graduation', icon: '🎓' },
      'research': { name: 'Research', icon: '🔍' }
    };

    const formattedCategories = categories.map(cat => ({
      value: cat,
      ...categoryInfo[cat]
    }));

    res.status(200).json({
      success: true,
      data: formattedCategories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   POST /api/gallery
// @desc    Upload new gallery image
// @access  Private (Admin only)
router.post('/', auth, authorize(['admin']), upload.single('image'), async (req, res) => {
  try {
    console.log('Gallery upload request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { title, description, category, tags, displayOrder } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // Check if image was uploaded
    if (!req.file) {
      console.log('No file uploaded in request');
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    console.log('File uploaded successfully:', req.file.filename);

    // Parse tags if provided
    let parsedTags = [];
    if (tags) {
      try {
        // Try to parse as JSON array first
        parsedTags = JSON.parse(tags);
      } catch (e) {
        // If that fails, split by comma
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    // Create gallery item - set isActive to true by default and category to 'campus' if not provided
    const galleryItem = new Gallery({
      title,
      description: description || '',
      category: category || 'campus', // Default to 'campus' for homepage display
      tags: parsedTags,
      displayOrder: displayOrder || 0,
      isActive: true, // Images are active by default so they appear on homepage
      imagePath: req.file.path,
      imageUrl: `/uploads/gallery/${req.file.filename}`,
      uploadedBy: req.user.id,
      fileSize: req.file.size,
      // Note: For dimensions, you'd typically use a library like 'sharp' or 'jimp'
      // For now, we'll skip dimensions
    });

    await galleryItem.save();
    console.log('Gallery item saved to database:', galleryItem._id);

    // Populate the uploadedBy field for response
    await galleryItem.populate('uploadedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully and is now visible on the homepage.',
      data: {
        ...galleryItem.toObject(),
        imagePath: undefined // Don't expose server path
      }
    });

  } catch (error) {
    console.error('Upload gallery image error:', error);
    
    // Delete uploaded file if gallery creation fails
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Cleaned up uploaded file after error');
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/gallery/admin
// @desc    Get all gallery images for admin management
// @access  Private (Admin only)
router.get('/admin', auth, authorize(['admin']), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      isActive,
      sortBy = 'uploadDate',
      order = 'desc'
    } = req.query;

    // Build filter - show all images in admin panel
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Build sort
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // Get images with pagination
    const images = await Gallery.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('uploadedBy', 'firstName lastName');

    // Get total count
    const total = await Gallery.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: images,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get admin gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery image
// @access  Private (Admin only)
router.put('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const { title, description, category, tags, displayOrder, isActive } = req.body;

    // Parse tags if provided
    let parsedTags;
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (parsedTags !== undefined) updateData.tags = parsedTags;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const galleryItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('uploadedBy', 'firstName lastName');

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully',
      data: {
        ...galleryItem.toObject(),
        imagePath: undefined // Don't expose server path
      }
    });

  } catch (error) {
    console.error('Update gallery item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery image
// @access  Private (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Delete the image file
    if (galleryItem.imagePath && fs.existsSync(galleryItem.imagePath)) {
      fs.unlinkSync(galleryItem.imagePath);
    }

    // Delete from database
    await Gallery.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully'
    });

  } catch (error) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// @route   GET /api/gallery/image/:filename
// @desc    Serve gallery images
// @access  Public
router.get('/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/gallery', filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Serve the image
    res.sendFile(path.resolve(imagePath));

  } catch (error) {
    console.error('Serve image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;