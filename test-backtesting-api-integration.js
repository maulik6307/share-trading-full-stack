/**
 * Test script to verify backtesting API integration
 * Run with: node test-backtesting-api-integration.js
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Mock user token (you'll need to replace this with a real token)
const TEST_TOKEN = 'your-test-token-here';

async function testBacktestingAPI() {
  console.log('🧪 Testing Backtesting API Integration...\n');

  try {
    // Test 1: Get backtests
    console.log('1. Testing GET /backtests');
    const getResponse = await fetch(`${API_BASE_URL}/backtests`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET backtests successful');
      console.log(`   Found ${data.data.length} backtests`);
    } else {
      console.log('❌ GET backtests failed:', getResponse.status);
    }

    // Test 2: Get status counts
    console.log('\n2. Testing GET /backtests/status-counts');
    const countsResponse = await fetch(`${API_BASE_URL}/backtests/status-counts`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (countsResponse.ok) {
      const data = await countsResponse.json();
      console.log('✅ GET status counts successful');
      console.log('   Counts:', data.data);
    } else {
      console.log('❌ GET status counts failed:', countsResponse.status);
    }

    // Test 3: Create backtest (you'll need a valid strategy ID)
    console.log('\n3. Testing POST /backtests');
    const createData = {
      name: 'Test Backtest API Integration',
      description: 'Testing the API integration',
      strategyId: 'your-strategy-id-here', // Replace with actual strategy ID
      startDate: '2024-01-01',
      endDate: '2024-06-01',
      initialCapital: 100000,
      commission: 0.1,
      slippage: 0.05,
      tags: ['test', 'api']
    };

    const createResponse = await fetch(`${API_BASE_URL}/backtests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createData)
    });
    
    if (createResponse.ok) {
      const data = await createResponse.json();
      console.log('✅ POST backtest successful');
      console.log('   Created backtest:', data.data.name);
      
      const backtestId = data.data._id;
      
      // Test 4: Get single backtest
      console.log('\n4. Testing GET /backtests/:id');
      const getSingleResponse = await fetch(`${API_BASE_URL}/backtests/${backtestId}`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (getSingleResponse.ok) {
        const singleData = await getSingleResponse.json();
        console.log('✅ GET single backtest successful');
        console.log('   Status:', singleData.data.status);
      } else {
        console.log('❌ GET single backtest failed:', getSingleResponse.status);
      }

      // Test 5: Cancel backtest (if it's running)
      console.log('\n5. Testing POST /backtests/:id/cancel');
      const cancelResponse = await fetch(`${API_BASE_URL}/backtests/${backtestId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (cancelResponse.ok) {
        const cancelData = await cancelResponse.json();
        console.log('✅ POST cancel backtest successful');
        console.log('   New status:', cancelData.data.status);
      } else {
        console.log('❌ POST cancel backtest failed:', cancelResponse.status);
      }

      // Test 6: Delete backtest
      console.log('\n6. Testing DELETE /backtests/:id');
      const deleteResponse = await fetch(`${API_BASE_URL}/backtests/${backtestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (deleteResponse.ok) {
        console.log('✅ DELETE backtest successful');
      } else {
        console.log('❌ DELETE backtest failed:', deleteResponse.status);
      }

    } else {
      console.log('❌ POST backtest failed:', createResponse.status);
      const errorData = await createResponse.json();
      console.log('   Error:', errorData.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Backtesting API integration test completed!');
}

// Instructions for running the test
console.log('📋 Before running this test:');
console.log('1. Make sure your backend server is running on http://localhost:5000');
console.log('2. Replace TEST_TOKEN with a valid JWT token');
console.log('3. Replace "your-strategy-id-here" with a valid strategy ID');
console.log('4. Run: node test-backtesting-api-integration.js\n');

// Uncomment the line below to run the test
// testBacktestingAPI();

module.exports = { testBacktestingAPI };