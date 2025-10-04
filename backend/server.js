const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Log environment variables for debugging (remove in production)
console.log('Environment variables check:');
console.log('VERCEL:', process.env.VERCEL);
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
console.log('NODE_ENV:', process.env.NODE_ENV);

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

// Connect to MongoDB (will be handled per request in Vercel)
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
      callback(null, true); // Temporarily allow all origins for debugging
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// For Vercel, we need to export the app as a serverless function
module.exports = (req, res) => {
  // Add a small delay to ensure all async operations complete
  return app(req, res);
};

// Only start the server if this file is run directly (not in Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
};