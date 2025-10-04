const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Ensure we're connecting to the correct database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty_management';
    const conn = await mongoose.connect(mongoURI, {
      dbName: 'faculty_management'
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;