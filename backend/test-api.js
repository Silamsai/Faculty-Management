require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testAPI() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('Testing faculty applications API endpoint...');
    // Simulate the API call that the frontend is making
    const pendingFaculty = await User.find({ userType: 'faculty', status: 'pending' })
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 });
    
    console.log('Pending faculty applications found:', pendingFaculty.length);
    
    if (pendingFaculty.length > 0) {
      console.log('Sample pending faculty application:');
      console.log('- Name:', pendingFaculty[0].firstName, pendingFaculty[0].lastName);
      console.log('- Email:', pendingFaculty[0].email);
      console.log('- Department:', pendingFaculty[0].department);
    }
    
    mongoose.connection.close();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testAPI();