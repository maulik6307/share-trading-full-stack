const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function getUserId() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get the most recent user (or you can search by email)
    const users = await User.find({ isActive: true }).sort({ createdAt: -1 }).limit(5);
    
    if (users.length === 0) {
      console.log('❌ No users found. Please register a user first.');
      process.exit(1);
    }

    console.log('\n📋 Available Users:');
    console.log('==================');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    console.log('💡 To seed dashboard data for a user, run:');
    console.log(`   node seed-dashboard.js ${users[0]._id}`);
    console.log('');
    console.log('🔄 Or use the auto-seed script:');
    console.log('   node auto-seed-dashboard.js');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getUserId();