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

// Create researcher user
// Note: Only administrative roles (admin, dean, vc, researcher) need default accounts.
// Faculty members register through the normal registration process.
const createResearcherUser = async () => {
  try {
    // Check if researcher already exists
    const existingResearcher = await User.findOne({ email: 'researcher@edu.com' });
    if (existingResearcher) {
      console.log('Researcher user already exists!');
      console.log('Email: researcher@edu.com');
      console.log('Password: researcher@123');
      return;
    }

    // Create researcher user
    const researcherUser = new User({
      firstName: 'Research',
      lastName: 'Scholar',
      email: 'researcher@edu.com',
      password: 'researcher@123',
      phone: '+1-555-RESEARCH',
      userType: 'researcher',
      department: 'computer-science',
      status: 'active'
    });

    await researcherUser.save();
    console.log('✅ Researcher user created successfully!');
    console.log('📧 Email: researcher@edu.com');
    console.log('🔐 Password: researcher@123');
    console.log('👤 Role: Researcher');
    console.log('');
    console.log('You can now login as a researcher with these credentials.');
    
  } catch (error) {
    console.error('Error creating researcher user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the setup
const runSetup = async () => {
  await connectDB();
  await createResearcherUser();
};

runSetup();