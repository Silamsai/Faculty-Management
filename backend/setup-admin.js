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

// Create admin user
// Note: Only administrative roles (admin, dean, vc, researcher) need default accounts.
// Faculty members register through the normal registration process.
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@edu.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@edu.com');
      console.log('Password: admin@1234'); // Updated to meet 8 character requirement
      return;
    }

    // Create admin user with a password that meets the 8 character requirement
    const adminUser = new User({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@edu.com',
      password: 'admin@1234', // Updated to meet 8 character requirement
      phone: '+1-555-ADMIN',
      userType: 'admin',
      department: 'computer-science',
      status: 'active'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@edu.com');
    console.log('🔐 Password: admin@1234'); // Updated to meet 8 character requirement
    console.log('👤 Role: Administrator');
    console.log('');
    console.log('You can now login to the admin dashboard with these credentials.');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the setup
const runSetup = async () => {
  await connectDB();
  await createAdminUser();
};

runSetup();