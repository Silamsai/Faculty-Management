const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing database connection...');

const testConnection = async () => {
  try {
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'IS SET' : 'NOT SET');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Test a simple query
    console.log('Testing database query...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Error stack:', error.stack);
  }
};

testConnection();