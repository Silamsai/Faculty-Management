const express = require('express');
const Publication = require('../models/Publication');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/publications
// @desc    Get user's publications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, year } = req.query;
    
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (year) filter.year = year;

    const publications = await Publication.find(filter)
      .sort({ year: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Publication.countDocuments(filter);

    res.json({
      message: 'Publications retrieved successfully',
      publications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get publications error:', error);
    res.status(500).json({ message: 'Server error while fetching publications' });
  }
});

// @route   POST /api/publications
// @desc    Create a new publication
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const publicationData = {
      ...req.body,
      userId: req.user._id
    };

    const publication = new Publication(publicationData);
    await publication.save();

    res.status(201).json({
      message: 'Publication created successfully',
      publication
    });

  } catch (error) {
    console.error('Create publication error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join('. ') });
    }
    
    res.status(500).json({ message: 'Server error while creating publication' });
  }
});

// @route   GET /api/publications/export/csv
// @desc    Export user's publications as CSV
// @access  Private
router.get('/export/csv', auth, async (req, res) => {
  try {
    const publications = await Publication.find({ userId: req.user._id })
      .sort({ year: -1, createdAt: -1 });

    // Create CSV content
    const csvHeader = 'Title,Type,Authors,Journal/Publisher/Conference,Year,Status,DOI,Impact Factor,Verified\n';
    const csvContent = publications.map(pub => {
      const venue = pub.journal || pub.publisher || pub.conference || '';
      const authors = pub.authors.join('; ');
      return `"${pub.title}","${pub.type}","${authors}","${venue}","${pub.year}","${pub.status}","${pub.doi || ''}","${pub.impactFactor || ''}","${pub.isVerified ? 'Yes' : 'No'}"`;
    }).join('\n');

    const csv = csvHeader + csvContent;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="publications_${req.user.firstName}_${req.user.lastName}_${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.send(csv);

  } catch (error) {
    console.error('Export publications error:', error);
    res.status(500).json({ message: 'Server error while exporting publications' });
  }
});

// @route   GET /api/publications/stats
// @desc    Get publication statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Publication.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              status: '$status'
            }
          }
        }
      }
    ]);

    const typeStats = await Publication.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const yearStats = await Publication.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      message: 'Publication statistics retrieved successfully',
      stats: {
        total: stats[0]?.total || 0,
        verified: stats[0]?.verified || 0,
        byType: typeStats,
        recentYears: yearStats
      }
    });

  } catch (error) {
    console.error('Get publication stats error:', error);
    res.status(500).json({ message: 'Server error while fetching publication statistics' });
  }
});

// @route   GET /api/publications/:id
// @desc    Get publication by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName');

    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    // Check if user owns this publication or has admin/dean access
    if (publication.userId._id.toString() !== req.user._id.toString() && 
        !['admin', 'dean'].includes(req.user.userType)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      message: 'Publication retrieved successfully',
      publication
    });

  } catch (error) {
    console.error('Get publication error:', error);
    res.status(500).json({ message: 'Server error while fetching publication' });
  }
});

// @route   PUT /api/publications/:id
// @desc    Update publication
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    // Check if user owns this publication
    if (publication.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update publication
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        publication[key] = req.body[key];
      }
    });

    await publication.save();

    res.json({
      message: 'Publication updated successfully',
      publication
    });

  } catch (error) {
    console.error('Update publication error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join('. ') });
    }
    
    res.status(500).json({ message: 'Server error while updating publication' });
  }
});

// @route   DELETE /api/publications/:id
// @desc    Delete publication
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    // Check if user owns this publication or is admin
    if (publication.userId.toString() !== req.user._id.toString() && 
        req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Publication.findByIdAndDelete(req.params.id);

    res.json({ message: 'Publication deleted successfully' });

  } catch (error) {
    console.error('Delete publication error:', error);
    res.status(500).json({ message: 'Server error while deleting publication' });
  }
});

// @route   PUT /api/publications/:id/verify
// @desc    Verify publication (Admin/Dean only)
// @access  Private - Admin/Dean only
router.put('/:id/verify', auth, authorize('admin', 'dean'), async (req, res) => {
  try {
    const { isVerified, reviewNotes } = req.body;
    
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }

    publication.isVerified = isVerified;
    publication.verifiedBy = req.user._id;
    publication.verificationDate = new Date();
    if (reviewNotes) publication.reviewNotes = reviewNotes;

    await publication.save();

    res.json({
      message: `Publication ${isVerified ? 'verified' : 'unverified'} successfully`,
      publication
    });

  } catch (error) {
    console.error('Verify publication error:', error);
    res.status(500).json({ message: 'Server error while verifying publication' });
  }
});

module.exports = router;