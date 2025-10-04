const express = require('express');
const Subject = require('../models/Subject');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all subjects (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { department, schoolSection, semester, isActive } = req.query;
    
    const filter = {};
    if (department) filter.department = department;
    if (schoolSection) filter.schoolSection = schoolSection;
    if (semester) filter.semester = semester;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const subjects = await Subject.find(filter)
      .sort({ name: 1 });

    res.json({
      message: 'Subjects retrieved successfully',
      subjects
    });

  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error while fetching subjects' });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get subject by ID (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({
      message: 'Subject retrieved successfully',
      subject
    });

  } catch (error) {
    console.error('Get subject error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    
    res.status(500).json({ message: 'Server error while fetching subject' });
  }
});

// @route   POST /api/subjects
// @desc    Create a new subject (Admin/Dean only)
// @access  Private - Admin/Dean only
router.post('/', auth, authorize('admin', 'dean'), async (req, res) => {
  try {
    const { name, code, department, schoolSection, credits, semester } = req.body;

    // Check if subject with same name or code already exists
    const existingSubject = await Subject.findOne({
      $or: [
        { name: name },
        { code: code }
      ]
    });

    if (existingSubject) {
      return res.status(400).json({ 
        message: 'Subject with this name or code already exists' 
      });
    }

    // Create new subject
    const subject = new Subject({
      name,
      code,
      department,
      schoolSection,
      credits,
      semester
    });

    await subject.save();

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });

  } catch (error) {
    console.error('Create subject error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join('. ') });
    }
    
    res.status(500).json({ message: 'Server error while creating subject' });
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update subject (Admin/Dean only)
// @access  Private - Admin/Dean only
router.put('/:id', auth, authorize('admin', 'dean'), async (req, res) => {
  try {
    const { name, code, department, schoolSection, credits, semester, isActive } = req.body;

    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if another subject with same name or code already exists
    if (name && name !== subject.name) {
      const existingSubject = await Subject.findOne({ 
        name: name,
        _id: { $ne: req.params.id }
      });
      
      if (existingSubject) {
        return res.status(400).json({ 
          message: 'Subject with this name already exists' 
        });
      }
    }

    if (code && code !== subject.code) {
      const existingSubject = await Subject.findOne({ 
        code: code,
        _id: { $ne: req.params.id }
      });
      
      if (existingSubject) {
        return res.status(400).json({ 
          message: 'Subject with this code already exists' 
        });
      }
    }

    // Update subject fields
    if (name !== undefined) subject.name = name;
    if (code !== undefined) subject.code = code;
    if (department !== undefined) subject.department = department;
    if (schoolSection !== undefined) subject.schoolSection = schoolSection;
    if (credits !== undefined) subject.credits = credits;
    if (semester !== undefined) subject.semester = semester;
    if (isActive !== undefined) subject.isActive = isActive;

    subject.updatedAt = Date.now();
    
    await subject.save();

    res.json({
      message: 'Subject updated successfully',
      subject
    });

  } catch (error) {
    console.error('Update subject error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join('. ') });
    }
    
    res.status(500).json({ message: 'Server error while updating subject' });
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete subject (Admin only)
// @access  Private - Admin only
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await Subject.findByIdAndDelete(req.params.id);

    res.json({ message: 'Subject deleted successfully' });

  } catch (error) {
    console.error('Delete subject error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    
    res.status(500).json({ message: 'Server error while deleting subject' });
  }
});

// @route   GET /api/subjects/departments/:department
// @desc    Get subjects by department (public)
// @access  Public
router.get('/departments/:department', async (req, res) => {
  try {
    const subjects = await Subject.find({
      department: req.params.department,
      isActive: true
    }).sort({ semester: 1, name: 1 });

    res.json({
      message: 'Subjects retrieved successfully',
      subjects
    });

  } catch (error) {
    console.error('Get subjects by department error:', error);
    res.status(500).json({ message: 'Server error while fetching subjects' });
  }
});

module.exports = router;