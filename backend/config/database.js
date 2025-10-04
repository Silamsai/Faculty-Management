const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // In Vercel environment, we still need to connect to MongoDB
    if (process.env.VERCEL) {
      console.log('Running in Vercel environment - establishing MongoDB connection');
      // Don't return early, still connect in Vercel
    }

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    // Don't exit in Vercel environment as it can cause issues
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

module.exports = connectDB;