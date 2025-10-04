const express = require('express');
const router = express.Router();
const ScheduleChange = require('../models/ScheduleChange');
const { auth } = require('../middleware/auth');

// Get all schedule changes (for deans)
router.get('/all', auth, async (req, res) => {
  try {
    // Only deans and admins can view all schedule changes
    if (req.user.userType !== 'dean' && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const scheduleChanges = await ScheduleChange.find()
      .sort({ createdAt: -1 });
    
    res.json({ scheduleChanges });
  } catch (error) {
    console.error('Error fetching schedule changes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get schedule changes for a specific faculty
router.get('/my-changes', auth, async (req, res) => {
  try {
    const scheduleChanges = await ScheduleChange.find({ facultyId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({ scheduleChanges });
  } catch (error) {
    console.error('Error fetching my schedule changes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit a schedule change request
router.post('/request', auth, async (req, res) => {
  try {
    const { currentSchedule, requestedSchedule, reason } = req.body;

    // Validate required fields
    if (!currentSchedule || !requestedSchedule || !reason) {
      return res.status(400).json({ message: 'Current schedule, requested schedule, and reason are required' });
    }

    // Only faculty can submit schedule change requests
    if (req.user.userType !== 'faculty') {
      return res.status(403).json({ message: 'Only faculty can submit schedule change requests' });
    }

    const scheduleChange = new ScheduleChange({
      facultyId: req.user.id,
      facultyName: `${req.user.firstName} ${req.user.lastName}`,
      facultyEmail: req.user.email,
      department: req.user.department,
      currentSchedule,
      requestedSchedule,
      reason
    });

    await scheduleChange.save();
    
    res.status(201).json({ 
      message: 'Schedule change request submitted successfully',
      scheduleChange 
    });
  } catch (error) {
    console.error('Error submitting schedule change request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Review a schedule change request (for deans)
router.put('/:id/review', auth, async (req, res) => {
  try {
    const { status, reviewNotes, approvedSchedule } = req.body;

    // Only deans and admins can review schedule changes
    if (req.user.userType !== 'dean' && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const scheduleChange = await ScheduleChange.findById(req.params.id);
    
    if (!scheduleChange) {
      return res.status(404).json({ message: 'Schedule change request not found' });
    }

    scheduleChange.status = status;
    scheduleChange.reviewedBy = req.user.id;
    scheduleChange.reviewNotes = reviewNotes || '';
    scheduleChange.reviewedDate = new Date();
    
    if (status === 'approved' && approvedSchedule) {
      scheduleChange.approvedSchedule = approvedSchedule;
    }

    await scheduleChange.save();
    
    res.json({ 
      message: `Schedule change request ${status} successfully`,
      scheduleChange 
    });
  } catch (error) {
    console.error('Error reviewing schedule change request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;