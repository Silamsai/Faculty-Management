const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Configure CORS to allow requests from frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://faculty-management-gamma.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const facultyRoutes = require('./routes/faculty');
const leaveRoutes = require('./routes/leaves');
const subjectRoutes = require('./routes/subjects');
const publicationRoutes = require('./routes/publications');
const galleryRoutes = require('./routes/gallery');
const scheduleChangeRoutes = require('./routes/scheduleChanges');
const facultyApplicationRoutes = require('./routes/facultyApplications');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/schedule-changes', scheduleChangeRoutes);
app.use('/api/faculty-applications', facultyApplicationRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Faculty Management System API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database connection
const connectDB = require('./config/database');
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.message);
  console.error('Error stack:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Server port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV || 'development'}`);
});