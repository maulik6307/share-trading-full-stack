// Simple test to verify frontend can connect to backend API
const API_BASE_URL = 'http://localhost:5000/api/v1';

async function testFrontendAPI() {
  try {
    console.log('🔌 Testing frontend API connection...');
    
    // Test templates endpoint (no auth required for templates)
    const templatesResponse = await fetch(`${API_BASE_URL}/strategies/templates`);
    
    if (templatesResponse.status === 401) {
      console.log('✅ API is responding (authentication required as expected)');
      console.log('📝 Templates endpoint requires authentication - this is correct');
    } else if (templatesResponse.ok) {
      const data = await templatesResponse.json();
      console.log('✅ Templates endpoint accessible:', data);
    } else {
      console.log('❌ Unexpected response:', templatesResponse.status, templatesResponse.statusText);
    }

    // Test health endpoint if it exists
    try {
      const healthResponse = await fetch('http://localhost:5000/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
      }
    } catch (e) {
      console.log('ℹ️ No health endpoint available');
    }

    console.log('🎉 Frontend API connection test completed');
    
  } catch (error) {
    console.error('❌ Frontend API test failed:', error.message);
  }
}

testFrontendAPI();