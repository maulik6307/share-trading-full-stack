/**
 * Script to wait for rate limit reset and test backtesting API
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function waitForRateLimit() {
  console.log('⏳ Waiting for rate limit to reset...');
  
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
      
      if (response.status === 200) {
        console.log('✅ Rate limit reset! Server is accessible.');
        return true;
      } else if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        console.log(`⏳ Still rate limited. Retry after: ${retryAfter} seconds`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    attempts++;
  }
  
  return false;
}

async function testBacktestingAPI() {
  console.log('🧪 Testing backtesting API after rate limit reset...\n');
  
  try {
    // Test status counts endpoint
    const response = await fetch(`${API_BASE_URL}/backtests/status-counts`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Mock token
      }
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.text();
    console.log(`Response: ${data}`);
    
    if (response.status === 401) {
      console.log('✅ API is working! (401 is expected without valid auth)');
    } else if (response.status === 429) {
      console.log('❌ Still rate limited');
    } else {
      console.log('✅ API responded successfully');
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function main() {
  const resetSuccess = await waitForRateLimit();
  
  if (resetSuccess) {
    await testBacktestingAPI();
    console.log('\n💡 Tips to avoid rate limiting:');
    console.log('1. Reduced polling from 3s to 10s intervals');
    console.log('2. Increased rate limit for development to 1000 requests');
    console.log('3. Added better error handling for 429 responses');
    console.log('4. Consider using WebSocket for real-time updates in production');
  } else {
    console.log('❌ Could not reset rate limit. Try restarting the backend server.');
  }
}

main().catch(console.error);