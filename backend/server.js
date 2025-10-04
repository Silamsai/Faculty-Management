const express = require('express');
const cors = require('cors');
require('dotenv').config();

const mongoose = require('mongoose');

// Handle different deployment scenarios (root vs backend directory)
let connectDB;
let authRoutes, userRoutes, leaveRoutes, publicationRoutes, facultyApplicationRoutes, galleryRoutes, scheduleChangeRoutes, subjectRoutes;

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
  console.log('✅ Imported routes and config from current directory (backend deployment)');
}

const app = express();

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

// Configure CORS with multiple allowed origins including Vercel domains
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'https://faculty-management.vercel.app',
      'https://faculty-management-2apo.vercel.app',
      'https://faculty-management-git-main-sais-projects-301fe114.vercel.app',
      'https://*.vercel.app'
    ];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Handle wildcard domains
        const regex = new RegExp(allowedOrigin.replace('*', '.*'));
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    })) {
      callback(null, true);
    } else {
      // For development, let's be more permissive
      console.log('CORS blocked origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes with verification logs
app.use('/api/auth', authRoutes, (req, res, next) => {
  console.log("✅ Auth routes mounted at /api/auth");
  next();
});
app.use('/api/users', userRoutes, (req, res, next) => {
  console.log("✅ Users routes mounted at /api/users");
  next();
});
app.use('/api/leaves', leaveRoutes, (req, res, next) => {
  console.log("✅ Leaves routes mounted at /api/leaves");
  next();
});
app.use('/api/publications', publicationRoutes, (req, res, next) => {
  console.log("✅ Publications routes mounted at /api/publications");
  next();
});
app.use('/api/faculty-applications', facultyApplicationRoutes, (req, res, next) => {
  console.log("✅ Faculty applications routes mounted at /api/faculty-applications");
  next();
});
app.use('/api/gallery', galleryRoutes, (req, res, next) => {
  console.log("✅ Gallery routes mounted at /api/gallery");
  next();
});
app.use('/api/schedule-changes', scheduleChangeRoutes, (req, res, next) => {
  console.log("✅ Schedule changes routes mounted at /api/schedule-changes");
  next();
});
app.use('/api/subjects', subjectRoutes, (req, res, next) => {
  console.log("✅ Subjects routes mounted at /api/subjects");
  next();
});

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

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

// Test route for debugging environment variables
app.get('/api/test-env', (req, res) => {
  // Check if required environment variables are set
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  res.json({
    vercel: process.env.VERCEL || 'not set',
    mongodb_uri: process.env.MONGODB_URI ? 'IS SET' : 'NOT SET',
    jwt_secret: process.env.JWT_SECRET ? 'IS SET' : 'NOT SET',
    jwt_secret_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    node_env: process.env.NODE_ENV || 'not set',
    frontend_url: process.env.FRONTEND_URL || 'not set',
    allowed_origins: process.env.ALLOWED_ORIGINS || 'not set',
    mongoose_ready_state: mongoose.connection.readyState,
    mongoose_ready_state_desc: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    missing_env_vars: missingEnvVars,
    timestamp: new Date().toISOString()
  });
});

// Test route for database connection
app.get('/api/test-db', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Try a simple database operation
      const collections = await mongoose.connection.db.listCollections().toArray();
      res.json({
        status: 'connected',
        collections: collections.map(c => c.name)
      });
    } else {
      res.status(500).json({
        status: 'disconnected',
        readyState: mongoose.connection.readyState
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV}`);
});