/**
 * Debug script to check what's in the strategies database
 */

const mongoose = require('mongoose');
const Strategy = require('./backend/src/models/Strategy');

async function debugStrategiesDB() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sharetrading', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 Connected to MongoDB');

    // Get all strategies
    const allStrategies = await Strategy.find({}).lean();
    console.log(`\n📋 Total strategies in database: ${allStrategies.length}`);

    if (allStrategies.length > 0) {
      console.log('\n🔍 All strategies:');
      allStrategies.forEach((strategy, index) => {
        console.log(`${index + 1}. ${strategy.name}`);
        console.log(`   User ID: ${strategy.userId}`);
        console.log(`   Status: ${strategy.status}`);
        console.log(`   Type: ${strategy.type}`);
        console.log(`   Archived: ${strategy.isArchived}`);
        console.log('');
      });

      // Test the getByUser method
      const testUserId = '507f1f77bcf86cd799439011';
      console.log(`🧪 Testing getByUser with userId: ${testUserId}`);
      
      const userStrategies = await Strategy.getByUser(testUserId);
      console.log(`✅ Found ${userStrategies.length} strategies for user`);
      
      if (userStrategies.length > 0) {
        console.log('\n📋 User strategies:');
        userStrategies.forEach((strategy, index) => {
          console.log(`${index + 1}. ${strategy.name} (${strategy.type}, ${strategy.status})`);
        });
      }
    } else {
      console.log('\n⚠️  No strategies found in database');
      console.log('Run the seed script: cd backend && node src/utils/seedStrategies.js');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📊 Disconnected from MongoDB');
  }
}

debugStrategiesDB();