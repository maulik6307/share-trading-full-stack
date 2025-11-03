// Debug script to identify infinite API calls
const originalFetch = global.fetch;
let callCount = 0;
const apiCalls = [];

// Mock fetch to track API calls
global.fetch = async function(...args) {
  callCount++;
  const url = args[0];
  const options = args[1] || {};
  
  if (typeof url === 'string' && url.includes('/api/v1/strategies')) {
    const timestamp = new Date().toISOString();
    apiCalls.push({
      count: callCount,
      timestamp,
      url,
      method: options.method || 'GET',
      stack: new Error().stack
    });
    
    console.log(`🔄 API Call #${callCount}: ${options.method || 'GET'} ${url}`);
    
    // Detect potential infinite loops
    if (callCount > 10) {
      console.warn(`⚠️ High number of API calls detected (${callCount})`);
      
      // Check for repeated calls in short time
      const recentCalls = apiCalls.slice(-5);
      const sameUrlCalls = recentCalls.filter(call => call.url === url);
      
      if (sameUrlCalls.length >= 3) {
        console.error(`🚨 INFINITE LOOP DETECTED: ${url} called ${sameUrlCalls.length} times in quick succession`);
        console.error('Recent calls:', recentCalls);
        
        // Log stack trace of the problematic call
        console.error('Stack trace:', new Error().stack);
      }
    }
  }
  
  return originalFetch.apply(this, args);
};

// Export debug info
global.getAPICallStats = () => {
  console.log(`📊 Total API calls: ${callCount}`);
  console.log('📋 Call history:', apiCalls);
  
  // Group by URL
  const urlGroups = {};
  apiCalls.forEach(call => {
    if (!urlGroups[call.url]) {
      urlGroups[call.url] = [];
    }
    urlGroups[call.url].push(call);
  });
  
  console.log('📈 Calls by URL:');
  Object.entries(urlGroups).forEach(([url, calls]) => {
    console.log(`  ${url}: ${calls.length} calls`);
    if (calls.length > 5) {
      console.warn(`    ⚠️ High frequency endpoint`);
    }
  });
  
  return { callCount, apiCalls, urlGroups };
};

// Reset stats
global.resetAPICallStats = () => {
  callCount = 0;
  apiCalls.length = 0;
  console.log('🔄 API call stats reset');
};

console.log('🔍 API call debugging enabled. Use getAPICallStats() to view stats.');