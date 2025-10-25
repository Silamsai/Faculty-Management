const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/faculty_management_system');
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

// Create dean user
// Note: Only administrative roles (admin, dean, vc, researcher) need default accounts.
// Faculty members register through the normal registration process.
const createDeanUser = async () => {
  try {
    // Check if dean already exists
    const existingDean = await User.findOne({ email: 'dean@edu.com' });
    if (existingDean) {
      console.log('Dean user already exists!');
      console.log('Email: dean@edu.com');
      console.log('Password: dean@123');
      return;
    }

    // Create dean user
    const deanUser = new User({
      firstName: 'Dean',
      lastName: 'User',
      email: 'dean@edu.com',
      password: 'dean@123',
      phone: '+1-555-DEAN',
      userType: 'dean',
      department: 'computer-science',
      schoolSection: 'SOET',
      status: 'active'
    });

    await deanUser.save();
    console.log('✅ Dean user created successfully!');
    console.log('📧 Email: dean@edu.com');
    console.log('🔐 Password: dean@123');
    console.log('👤 Role: Dean');
    console.log('');
    console.log('You can now login to the dean dashboard with these credentials.');
    
  } catch (error) {
    console.error('Error creating dean user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the setup
const runSetup = async () => {
  await connectDB();
  await createDeanUser();
};

runSetup();