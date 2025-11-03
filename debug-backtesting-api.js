/**
 * Debug script to test backtesting API endpoints
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function testBacktestingEndpoints() {
  console.log('🔍 Debugging Backtesting API Endpoints...\n');

  // Test endpoints without authentication first
  const endpoints = [
    '/health',
    '/backtests',
    '/backtests/status-counts',
    '/backtests/running'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`Status: ${response.status}`);
      console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
      console.log('---\n');

    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log('---\n');
    }
  }

  // Test with mock authentication
  console.log('Testing with mock authentication...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/backtests/status-counts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      }
    });

    console.log(`Auth test status: ${response.status}`);
    const text = await response.text();
    console.log(`Auth test response: ${text}`);

  } catch (error) {
    console.log(`❌ Auth test error: ${error.message}`);
  }
}

// Test server connectivity
async function testServerConnectivity() {
  console.log('🌐 Testing server connectivity...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    console.log(`Health check status: ${response.status}`);
    const data = await response.text();
    console.log(`Health check response: ${data}`);
  } catch (error) {
    console.log(`❌ Server not reachable: ${error.message}`);
    console.log('Make sure the backend server is running on http://localhost:5000');
  }
}

async function main() {
  await testServerConnectivity();
  console.log('\n' + '='.repeat(50) + '\n');
  await testBacktestingEndpoints();
}

main().catch(console.error);