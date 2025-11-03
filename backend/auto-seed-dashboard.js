const mongoose = require('mongoose');
const User = require('./src/models/User');
const { seedDashboardData } = require('./src/utils/seedDashboardData');
require('dotenv').config();

async function autoSeedDashboard() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get the most recent user
    const user = await User.findOne({ isActive: true }).sort({ createdAt: -1 });
    
    if (!user) {
      console.log('❌ No users found. Please register a user first.');
      console.log('💡 Go to http://localhost:3000 and create an account');
      process.exit(1);
    }

    console.log(`🎯 Found user: ${user.name} (${user.email})`);
    console.log(`📋 User ID: ${user._id}`);
    console.log('');

    // Seed dashboard data for this user
    console.log('🌱 Seeding dashboard data...');
    await seedDashboardData(user._id);
    
    console.log('');
    console.log('🎉 Dashboard data seeded successfully!');
    console.log('💻 You can now visit http://localhost:3000/dashboard to see the data');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Auto-seeding failed:', error.message);
    process.exit(1);
  }
}

autoSeedDashboard();