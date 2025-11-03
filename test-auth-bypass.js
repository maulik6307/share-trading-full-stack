/**
 * Test script to check backtesting API without authentication
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function testWithoutAuth() {
  console.log('🧪 Testing backtesting API without authentication...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/backtests/status-counts`);
    console.log(`Status: ${response.status}`);
    const data = await response.text();
    console.log(`Response: ${data}`);
    
    if (response.status === 401) {
      console.log('✅ Expected 401 - Authentication is working correctly');
      console.log('❌ Issue: Frontend is not sending valid authentication token');
    } else if (response.status === 429) {
      console.log('❌ Still rate limited - backend server needs restart');
    } else {
      console.log('✅ API responded - authentication might be bypassed');
    }
    
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
    console.log('Backend server might not be running');
  }
}

async function testServerHealth() {
  console.log('🏥 Testing server health...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    console.log(`Health Status: ${response.status}`);
    const data = await response.text();
    console.log(`Health Response: ${data.substring(0, 100)}...`);
    
    if (response.status === 200) {
      console.log('✅ Backend server is running');
    } else {
      console.log('❌ Backend server health check failed');
    }
    
  } catch (error) {
    console.log(`❌ Cannot reach backend server: ${error.message}`);
  }
}

async function main() {
  await testServerHealth();
  console.log('\n' + '='.repeat(50) + '\n');
  await testWithoutAuth();
  
  console.log('\n💡 Possible Solutions:');
  console.log('1. Restart backend server to apply rate limit changes');
  console.log('2. Check if user is properly authenticated in frontend');
  console.log('3. Verify JWT token is being sent in requests');
  console.log('4. Check browser localStorage for auth token');
  console.log('5. Temporarily disable auth middleware for testing');
}

main().catch(console.error);