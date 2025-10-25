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

// Create VC user
// Note: Only administrative roles (admin, dean, vc, researcher) need default accounts.
// Faculty members register through the normal registration process.
const createVCUser = async () => {
  try {
    // Check if VC already exists
    const existingVC = await User.findOne({ email: 'vc@edu.com' });
    if (existingVC) {
      console.log('VC user already exists!');
      console.log('Email: vc@edu.com');
      console.log('Password: vc@12345');
      return;
    }

    // Create VC user
    const vcUser = new User({
      firstName: 'Vice',
      lastName: 'Chancellor',
      email: 'vc@edu.com',
      password: 'vc@12345',
      phone: '+1-555-VC',
      userType: 'vc',
      department: 'computer-science',
      status: 'active'
    });

    await vcUser.save();
    console.log('✅ VC user created successfully!');
    console.log('📧 Email: vc@edu.com');
    console.log('🔐 Password: vc@12345');
    console.log('👤 Role: Vice Chancellor');
    console.log('');
    console.log('You can now login to the VC dashboard with these credentials.');
    
  } catch (error) {
    console.error('Error creating VC user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the setup
const runSetup = async () => {
  await connectDB();
  await createVCUser();
};

runSetup();