require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkPendingFaculty() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('Checking for pending faculty applications...');
    const pendingFaculty = await User.find({ userType: 'faculty', status: 'pending' });
    console.log('Pending faculty count:', pendingFaculty.length);
    
    if (pendingFaculty.length > 0) {
      console.log('Pending faculty applications:');
      pendingFaculty.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      });
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPendingFaculty();