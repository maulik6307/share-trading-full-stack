// Test Strategies API endpoints without authentication (for testing purposes)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./backend/src/config/database');
const strategiesService = require('./backend/src/services/strategiesService');
const User = require('./backend/src/models/User');
const Strategy = require('./backend/src/models/Strategy');
const StrategyTemplate = require('./backend/src/models/StrategyTemplate');

let testUserId = null;
let createdStrategyId = null;
let templateId = null;

async function testDatabaseConnection() {
  console.log('🔌 Testing Database Connection...');
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

async function setupTestUser() {
  console.log('\n👤 Setting up test user...');
  try {
    const user = await User.findOne();
    if (user) {
      testUserId = user._id;
      console.log(`✅ Using existing user: ${user.name} (${user.email})`);
      console.log(`   User ID: ${testUserId}`);
      return true;
    } else {
      console.log('❌ No users found in database');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to find user:', error.message);
    return false;
  }
}

async function testTemplateServices() {
  console.log('\n📋 Testing Template Services...');
  
  try {
    // 1. Get all templates
    console.log('1. Testing getTemplates()');
    const templatesResult = await strategiesService.getTemplates();
    console.log(`✅ Found ${templatesResult.templates.length} templates`);
    if (templatesResult.templates.length > 0) {
      templateId = templatesResult.templates[0]._id;
      console.log(`   Using template: ${templatesResult.templates[0].name}`);
    }

    // 2. Get template categories
    console.log('2. Testing getTemplateCategories()');
    const categories = await strategiesService.getTemplateCategories();
    console.log(`✅ Found ${categories.length} categories:`, categories);

    // 3. Get popular templates
    console.log('3. Testing getPopularTemplates()');
    const popularTemplates = await strategiesService.getPopularTemplates(3);
    console.log(`✅ Found ${popularTemplates.length} popular templates`);

    return templateId !== null;
  } catch (error) {
    console.log('❌ Template services failed:', error.message);
    return false;
  }
}

async function testStrategyServices() {
  console.log('\n🎯 Testing Strategy Services...');
  
  try {
    // 1. Get user strategies (initially might be empty)
    console.log('1. Testing getUserStrategies()');
    const strategiesResult = await strategiesService.getUserStrategies(testUserId);
    console.log(`✅ Found ${strategiesResult.strategies.length} existing strategies`);

    // 2. Get status counts
    console.log('2. Testing getStatusCounts()');
    const statusCounts = await strategiesService.getStatusCounts(testUserId);
    console.log('✅ Status counts:', statusCounts);

    // 3. Create strategy from scratch
    console.log('3. Testing createStrategy()');
    const strategyData = {
      name: `Test Strategy ${Date.now()}`,
      description: 'Test strategy created by service test',
      type: 'CODE',
      parameters: { symbol: 'AAPL', quantity: 100 },
      code: 'function onTick(data) { console.log("Test strategy"); }',
      tags: ['test', 'api']
    };

    const createdStrategy = await strategiesService.createStrategy(testUserId, strategyData);
    createdStrategyId = createdStrategy._id;
    console.log(`✅ Created strategy: ${createdStrategy.name}`);
    console.log(`   Strategy ID: ${createdStrategyId}`);

    // 4. Get strategy by ID
    console.log('4. Testing getStrategyById()');
    const retrievedStrategy = await strategiesService.getStrategyById(testUserId, createdStrategyId);
    console.log(`✅ Retrieved strategy: ${retrievedStrategy.name}`);

    // 5. Update strategy
    console.log('5. Testing updateStrategy()');
    const updateData = {
      description: 'Updated description from service test',
      parameters: { symbol: 'TSLA', quantity: 200 }
    };
    const updatedStrategy = await strategiesService.updateStrategy(testUserId, createdStrategyId, updateData);
    console.log('✅ Updated strategy successfully');

    return true;
  } catch (error) {
    console.log('❌ Strategy services failed:', error.message);
    console.log('   Stack:', error.stack);
    return false;
  }
}

async function testStrategyActions() {
  console.log('\n⚡ Testing Strategy Actions...');
  
  if (!createdStrategyId) {
    console.log('❌ No strategy ID available for testing actions');
    return false;
  }

  try {
    // 1. Clone strategy
    console.log('1. Testing cloneStrategy()');
    const clonedStrategy = await strategiesService.cloneStrategy(testUserId, createdStrategyId, 'Cloned Test Strategy');
    console.log(`✅ Cloned strategy: ${clonedStrategy.name}`);

    // 2. Deploy strategy
    console.log('2. Testing deployStrategy()');
    const deployedStrategy = await strategiesService.deployStrategy(testUserId, createdStrategyId);
    console.log(`✅ Deployed strategy, status: ${deployedStrategy.status}`);

    // 3. Pause strategy
    console.log('3. Testing pauseStrategy()');
    const pausedStrategy = await strategiesService.pauseStrategy(testUserId, createdStrategyId);
    console.log(`✅ Paused strategy, status: ${pausedStrategy.status}`);

    // 4. Stop strategy
    console.log('4. Testing stopStrategy()');
    const stoppedStrategy = await strategiesService.stopStrategy(testUserId, createdStrategyId);
    console.log(`✅ Stopped strategy, status: ${stoppedStrategy.status}`);

    return true;
  } catch (error) {
    console.log('❌ Strategy actions failed:', error.message);
    return false;
  }
}

async function testTemplateBasedStrategy() {
  console.log('\n🏗️ Testing Template-Based Strategy Creation...');
  
  if (!templateId) {
    console.log('❌ No template ID available for testing');
    return false;
  }

  try {
    const strategyData = {
      name: `Template Strategy ${Date.now()}`,
      description: 'Strategy created from template via service test',
      parameters: { symbol: 'RELIANCE', quantity: 50 },
      tags: ['template', 'test']
    };

    const templateStrategy = await strategiesService.createFromTemplate(testUserId, templateId, strategyData);
    console.log(`✅ Created template-based strategy: ${templateStrategy.name}`);
    console.log(`   Template ID: ${templateStrategy.templateId}`);
    console.log(`   Type: ${templateStrategy.type}`);

    return true;
  } catch (error) {
    console.log('❌ Template-based strategy creation failed:', error.message);
    return false;
  }
}

async function testPerformanceService() {
  console.log('\n📊 Testing Performance Service...');
  
  try {
    const performanceSummary = await strategiesService.getPerformanceSummary(testUserId);
    console.log('✅ Retrieved performance summary');
    console.log('   Total strategies:', performanceSummary.totalStrategies);
    console.log('   Active strategies:', performanceSummary.activeStrategies);
    console.log('   Total return:', performanceSummary.totalReturn);
    
    return true;
  } catch (error) {
    console.log('❌ Performance service failed:', error.message);
    return false;
  }
}

async function testErrorCases() {
  console.log('\n🚨 Testing Error Cases...');
  
  try {
    // 1. Get non-existent strategy
    console.log('1. Testing getStrategyById() with invalid ID');
    try {
      await strategiesService.getStrategyById(testUserId, new mongoose.Types.ObjectId());
      console.log('❌ Should have thrown error for non-existent strategy');
    } catch (error) {
      console.log('✅ Correctly threw error for non-existent strategy');
    }

    // 2. Create strategy with invalid data
    console.log('2. Testing createStrategy() with invalid data');
    try {
      await strategiesService.createStrategy(testUserId, { description: 'Missing required fields' });
      console.log('❌ Should have thrown validation error');
    } catch (error) {
      console.log('✅ Correctly threw validation error');
    }

    // 3. Update non-existent strategy
    console.log('3. Testing updateStrategy() with invalid ID');
    try {
      await strategiesService.updateStrategy(testUserId, new mongoose.Types.ObjectId(), { name: 'Test' });
      console.log('❌ Should have thrown error for non-existent strategy');
    } catch (error) {
      console.log('✅ Correctly threw error for non-existent strategy');
    }

    return true;
  } catch (error) {
    console.log('❌ Error case testing failed:', error.message);
    return false;
  }
}

async function testDataIntegrity() {
  console.log('\n🔍 Testing Data Integrity...');
  
  try {
    // Check if created strategies are properly stored
    const strategies = await Strategy.find({ userId: testUserId });
    console.log(`✅ Found ${strategies.length} strategies in database`);
    
    // Check template relationships
    const templateStrategies = strategies.filter(s => s.type === 'TEMPLATE');
    console.log(`✅ Found ${templateStrategies.length} template-based strategies`);
    
    // Check activity logs
    const Activity = require('./backend/src/models/Activity');
    const activities = await Activity.find({ userId: testUserId }).sort({ createdAt: -1 }).limit(10);
    console.log(`✅ Found ${activities.length} activity logs`);
    
    return true;
  } catch (error) {
    console.log('❌ Data integrity check failed:', error.message);
    return false;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    // Delete test strategies (keep them for now to verify in frontend)
    // await Strategy.deleteMany({ userId: testUserId, name: /Test Strategy/ });
    console.log('✅ Test data preserved for frontend testing');
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    return true;
  } catch (error) {
    console.log('❌ Cleanup failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Strategies Service Tests...');
  console.log('='.repeat(70));
  
  const results = {
    database: false,
    user: false,
    templates: false,
    strategies: false,
    actions: false,
    templateStrategy: false,
    performance: false,
    errors: false,
    integrity: false
  };

  try {
    results.database = await testDatabaseConnection();
    if (!results.database) return;

    results.user = await setupTestUser();
    if (!results.user) return;

    results.templates = await testTemplateServices();
    results.strategies = await testStrategyServices();
    
    if (results.strategies) {
      results.actions = await testStrategyActions();
    }
    
    if (results.templates) {
      results.templateStrategy = await testTemplateBasedStrategy();
    }
    
    results.performance = await testPerformanceService();
    results.errors = await testErrorCases();
    results.integrity = await testDataIntegrity();
    
    await cleanup();
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 All Service Tests Completed!');
    console.log('\n📋 Test Results Summary:');
    console.log(`${results.database ? '✅' : '❌'} Database Connection`);
    console.log(`${results.user ? '✅' : '❌'} User Setup`);
    console.log(`${results.templates ? '✅' : '❌'} Template Services`);
    console.log(`${results.strategies ? '✅' : '❌'} Strategy CRUD Services`);
    console.log(`${results.actions ? '✅' : '❌'} Strategy Action Services`);
    console.log(`${results.templateStrategy ? '✅' : '❌'} Template-based Strategy Creation`);
    console.log(`${results.performance ? '✅' : '❌'} Performance Services`);
    console.log(`${results.errors ? '✅' : '❌'} Error Handling`);
    console.log(`${results.integrity ? '✅' : '❌'} Data Integrity`);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🏆 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎊 All strategies APIs are working correctly!');
      console.log('✨ Ready for frontend testing!');
    } else {
      console.log('⚠️ Some tests failed - please review the issues above');
    }
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
  }
}

// Run the tests
runAllTests();