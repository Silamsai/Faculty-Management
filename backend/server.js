const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leaveRoutes = require('./routes/leaves');
const publicationRoutes = require('./routes/publications');
const facultyApplicationRoutes = require('./routes/facultyApplications');
const galleryRoutes = require('./routes/gallery');
const scheduleChangeRoutes = require('./routes/scheduleChanges');
const subjectRoutes = require('./routes/subjects');
// Removed jobPostingRoutes import

const app = express();

// Connect to MongoDB
connectDB();

// Configure CORS with multiple allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [process.env.FRONTEND_URL || 'http://localhost:5173'];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/faculty-applications', facultyApplicationRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/schedule-changes', scheduleChangeRoutes);
app.use('/api/subjects', subjectRoutes);
// Removed job postings route

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Faculty Management System API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});