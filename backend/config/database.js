const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // In Vercel environment, we don't need to connect to MongoDB as it's handled per request
    if (process.env.VERCEL) {
      console.log('Running in Vercel environment - MongoDB connection handled per request');
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