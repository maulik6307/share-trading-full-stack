const mongoose = require('mongoose');
const { seedDashboardData } = require('./src/utils/seedDashboardData');
require('dotenv').config();

async function runSeeding() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get user ID from command line argument
    const userId = process.argv[2];
    
    if (!userId) {
      console.log('Usage: node seed-dashboard.js <userId>');
      console.log('Example: node seed-dashboard.js 507f1f77bcf86cd799439011');
      process.exit(1);
    }

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Invalid user ID format');
      process.exit(1);
    }

    // Seed dashboard data
    await seedDashboardData(userId);
    
    console.log('✅ Dashboard seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

runSeeding();