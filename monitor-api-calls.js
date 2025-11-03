/**
 * Monitor API calls to check if excessive polling is fixed
 */

console.log('📊 API Call Monitor - Tracking backtesting API calls...\n');

const API_BASE_URL = 'http://localhost:5000/api/v1';
const callCounts = {
  'status-counts': 0,
  'running': 0,
  'backtests': 0,
  'total': 0
};

let startTime = Date.now();

// Function to test and count API calls
async function testEndpoint(endpoint, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/backtests${endpoint}`);
    callCounts[name]++;
    callCounts.total++;
    
    const status = response.status;
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(`[${timestamp}] ${name}: ${status} (Total: ${callCounts[name]})`);
    
    return { status, timestamp };
  } catch (error) {
    console.log(`[${new Date().toLocaleTimeString()}] ${name}: ERROR - ${error.message}`);
    return { status: 'ERROR', timestamp: new Date().toLocaleTimeString() };
  }
}

// Monitor for a specific duration
async function monitorAPICalls(durationMinutes = 2) {
  console.log(`🕐 Monitoring for ${durationMinutes} minutes...\n`);
  
  const endTime = Date.now() + (durationMinutes * 60 * 1000);
  
  while (Date.now() < endTime) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    console.log(`\n--- ${elapsed}s elapsed ---`);
    
    // Test the three main endpoints
    await Promise.all([
      testEndpoint('/status-counts', 'status-counts'),
      testEndpoint('/running', 'running'),
      testEndpoint('/', 'backtests')
    ]);
    
    // Wait 5 seconds before next check
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  // Final report
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL REPORT');
  console.log('='.repeat(50));
  console.log(`Total monitoring time: ${durationMinutes} minutes`);
  console.log(`Total API calls: ${callCounts.total}`);
  console.log(`Status counts calls: ${callCounts['status-counts']}`);
  console.log(`Running backtests calls: ${callCounts.running}`);
  console.log(`All backtests calls: ${callCounts.backtests}`);
  console.log(`Average calls per minute: ${(callCounts.total / durationMinutes).toFixed(1)}`);
  
  if (callCounts.total > 50) {
    console.log('\n❌ EXCESSIVE API CALLS DETECTED');
    console.log('The frontend is still making too many requests.');
    console.log('Expected: ~6-12 calls per minute');
    console.log(`Actual: ${(callCounts.total / durationMinutes).toFixed(1)} calls per minute`);
  } else {
    console.log('\n✅ API CALLS LOOK NORMAL');
    console.log('The polling optimization appears to be working.');
  }
}

// Instructions
console.log('💡 Instructions:');
console.log('1. Make sure the frontend is running and backtesting page is open');
console.log('2. This script will monitor API calls for 2 minutes');
console.log('3. Expected behavior: Initial 3 calls, then minimal polling');
console.log('4. If you create a backtest, expect some additional calls');
console.log('');

// Start monitoring
monitorAPICalls(2).catch(console.error);