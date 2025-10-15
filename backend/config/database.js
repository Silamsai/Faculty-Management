const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);
    
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // In Vercel environment, we still need to connect to MongoDB
    if (process.env.VERCEL) {
      console.log('Running in Vercel environment - establishing MongoDB connection');
    }

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout (increased from 5 seconds)
      socketTimeoutMS: 60000, // 60 second timeout (increased from 45 seconds)
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Error stack:', error.stack);
    // Don't exit in Vercel environment as it can cause issues
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error; // Re-throw the error so it can be handled by the calling function
  }
};

// For Vercel serverless functions, we need to handle connection caching
if (process.env.VERCEL) {
  // Use a cached connection promise to prevent multiple connections
  let cachedConnectionPromise = null;
  
  const connectDBCached = async () => {
    if (cachedConnectionPromise) {
      // Return existing connection promise
      return cachedConnectionPromise;
    }
    
    // Create new connection promise
    cachedConnectionPromise = connectDB();
    return cachedConnectionPromise;
  };
  
  module.exports = connectDBCached;
} else {
  // For non-Vercel environments, export the original function
  module.exports = connectDB;
}