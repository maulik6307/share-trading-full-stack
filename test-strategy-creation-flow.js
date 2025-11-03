// Test the complete strategy creation flow
const API_BASE_URL = 'http://localhost:5000/api/v1';

async function testStrategyCreationFlow() {
  console.log('🧪 Testing Strategy Creation Flow...');
  
  try {
    // Step 1: Create a strategy from scratch
    console.log('1. Creating strategy from scratch...');
    const createResponse = await fetch(`${API_BASE_URL}/strategies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real app, you'd need proper auth token
      },
      body: JSON.stringify({
        name: `Frontend Test Strategy ${Date.now()}`,
        description: 'Test strategy created to verify frontend flow',
        type: 'CODE',
        parameters: { symbol: 'AAPL', quantity: 100 },
        code: 'function onTick(data) { console.log("Test"); }',
        tags: ['test', 'frontend']
      })
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.log('❌ Create failed:', errorData);
      return;
    }

    const createData = await createResponse.json();
    const strategyId = createData.data._id;
    console.log(`✅ Created strategy with ID: ${strategyId}`);

    // Step 2: Immediately try to fetch the created strategy
    console.log('2. Fetching created strategy...');
    const fetchResponse = await fetch(`${API_BASE_URL}/strategies/${strategyId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!fetchResponse.ok) {
      const errorData = await fetchResponse.json();
      console.log('❌ Fetch failed:', errorData);
      console.log('⚠️ This explains why the builder page shows "not found"');
      
      // Try again after a short delay
      console.log('3. Retrying after 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const retryResponse = await fetch(`${API_BASE_URL}/strategies/${strategyId}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        console.log('✅ Strategy found on retry:', retryData.data.name);
      } else {
        console.log('❌ Still not found after retry');
      }
      
      return;
    }

    const fetchData = await fetchResponse.json();
    console.log(`✅ Successfully fetched strategy: ${fetchData.data.name}`);

    // Step 3: Test the strategies list endpoint
    console.log('4. Testing strategies list...');
    const listResponse = await fetch(`${API_BASE_URL}/strategies`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log(`✅ Strategies list returned ${listData.data.length} strategies`);
      
      const foundInList = listData.data.find(s => s._id === strategyId);
      if (foundInList) {
        console.log('✅ New strategy appears in list');
      } else {
        console.log('❌ New strategy NOT in list (this could cause UI issues)');
      }
    }

    console.log('\n🎉 Strategy creation flow test completed!');
    console.log(`📝 Strategy ID for frontend testing: ${strategyId}`);
    console.log(`🔗 Builder URL: http://localhost:3001/strategies/builder?id=${strategyId}`);

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testStrategyCreationFlow();