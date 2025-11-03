/**
 * Simple test to check if strategies API is working
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function testStrategiesAPI() {
  console.log('🧪 Testing Strategies API...\n');

  try {
    // Test strategies endpoint
    console.log('Testing GET /strategies');
    const response = await fetch(`${API_BASE_URL}/strategies`);
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success! Found ${data.data.length} strategies`);
      
      if (data.data.length > 0) {
        console.log('\n📋 Available Strategies:');
        data.data.forEach((strategy, index) => {
          console.log(`${index + 1}. ${strategy.name} (${strategy.type}, ${strategy.status})`);
        });
      } else {
        console.log('⚠️  No strategies found. Run the seed script:');
        console.log('   cd backend && node src/utils/seedStrategies.js');
      }
    } else {
      const errorData = await response.json();
      console.log(`❌ Error: ${errorData.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
    console.log('Make sure the backend server is running on http://localhost:5000');
  }
}

testStrategiesAPI();