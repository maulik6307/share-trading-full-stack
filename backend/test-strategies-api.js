require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const User = require('./src/models/User');
const strategiesService = require('./src/services/strategiesService');

async function testStrategiesAPI() {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();

    // Find a test user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);

    // Test getting templates
    console.log('\n📋 Testing template endpoints...');
    
    const templates = await strategiesService.getTemplates();
    console.log(`✅ Found ${templates.templates.length} templates`);
    
    const categories = await strategiesService.getTemplateCategories();
    console.log(`✅ Found ${categories.length} categories: ${categories.join(', ')}`);
    
    const popularTemplates = await strategiesService.getPopularTemplates(3);
    console.log(`✅ Found ${popularTemplates.length} popular templates`);

    // Test getting user strategies
    console.log('\n🎯 Testing strategy endpoints...');
    
    const userStrategies = await strategiesService.getUserStrategies(user._id);
    console.log(`✅ Found ${userStrategies.strategies.length} user strategies`);
    
    const statusCounts = await strategiesService.getStatusCounts(user._id);
    console.log(`✅ Status counts:`, statusCounts);

    // Test creating a strategy from template
    if (templates.templates.length > 0) {
      console.log('\n🚀 Testing strategy creation from template...');
      
      const template = templates.templates[0];
      const strategyData = {
        name: `Test Strategy - ${Date.now()}`,
        description: 'Test strategy created from API test',
        parameters: template.defaultParameters
      };

      const newStrategy = await strategiesService.createFromTemplate(user._id, template._id, strategyData);
      console.log(`✅ Created strategy: ${newStrategy.name} (ID: ${newStrategy._id})`);

      // Test updating the strategy
      const updatedStrategy = await strategiesService.updateStrategy(user._id, newStrategy._id, {
        description: 'Updated description from API test'
      });
      console.log(`✅ Updated strategy description`);

      // Test cloning the strategy
      const clonedStrategy = await strategiesService.cloneStrategy(user._id, newStrategy._id, `${newStrategy.name} (Clone)`);
      console.log(`✅ Cloned strategy: ${clonedStrategy.name} (ID: ${clonedStrategy._id})`);

      // Test performance summary
      const performanceSummary = await strategiesService.getPerformanceSummary(user._id);
      console.log(`✅ Performance summary:`, performanceSummary);

      console.log('\n🎉 All tests passed successfully!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

testStrategiesAPI();