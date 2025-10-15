const express = require('express');
const cors = require('cors');
require('dotenv').config();

const mongoose = require('mongoose');

// Handle different deployment scenarios (root vs backend directory)
let connectDB;
let authRoutes, userRoutes, leaveRoutes, publicationRoutes, facultyApplicationRoutes, galleryRoutes, scheduleChangeRoutes, subjectRoutes, facultyRoutes;

try {
  // Try importing from backend directory (when running from repo root)
  connectDB = require('./backend/config/database');
  authRoutes = require('./backend/routes/auth');
  userRoutes = require('./backend/routes/users');
  leaveRoutes = require('./backend/routes/leaves');
  publicationRoutes = require('./backend/routes/publications');
  facultyApplicationRoutes = require('./backend/routes/facultyApplications');
  galleryRoutes = require('./backend/routes/gallery');
  scheduleChangeRoutes = require('./backend/routes/scheduleChanges');
  subjectRoutes = require('./backend/routes/subjects');
  facultyRoutes = require('./backend/routes/faculty');
  console.log('✅ Imported routes and config from backend directory (repo root deployment)');
} catch (error) {
  // Fallback to current directory imports (when running from backend directory)
  connectDB = require('./config/database');
  authRoutes = require('./routes/auth');
  userRoutes = require('./routes/users');
  leaveRoutes = require('./routes/leaves');
  publicationRoutes = require('./routes/publications');
  facultyApplicationRoutes = require('./routes/facultyApplications');
  galleryRoutes = require('./routes/gallery');
  scheduleChangeRoutes = require('./routes/scheduleChanges');
  subjectRoutes = require('./routes/subjects');
  facultyRoutes = require('./routes/faculty');
  console.log('✅ Imported routes and config from current directory (backend deployment)');
}

const app = express();

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

// Configure CORS to allow requests from Vercel frontend
app.use(cors({
  origin: [
    'https://faculty-management-frontend.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Faculty Management System API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL ? 'true' : 'false',
    mongodbConnected: mongoose.connection.readyState === 1
  });
});

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

// Use Render port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV}`);
});