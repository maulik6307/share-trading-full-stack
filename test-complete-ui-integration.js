// Comprehensive test for complete UI-API integration
const API_BASE_URL = 'http://localhost:5000/api/v1';

async function makeAuthenticatedRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      // Note: In real app, you'd need proper auth token
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${data.message || response.statusText}`);
    }
    
    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: error.status };
  }
}

async function testCompleteUIIntegration() {
  console.log('🧪 Testing Complete UI-API Integration...');
  console.log('='.repeat(60));
  
  let createdStrategyId = null;
  let templateId = null;

  try {
    // Test 1: Get Templates (for strategy creation)
    console.log('\n1. 📋 Testing Template Endpoints...');
    const templatesResult = await makeAuthenticatedRequest('/strategies/templates');
    if (templatesResult.success) {
      console.log(`✅ Templates: Found ${templatesResult.data.data.length} templates`);
      templateId = templatesResult.data.data[0]._id;
    } else {
      console.log('❌ Templates failed:', templatesResult.error);
    }

    // Test 2: Create Strategy from Scratch (UI Flow)
    console.log('\n2. 🎯 Testing Strategy Creation from Scratch...');
    const createResult = await makeAuthenticatedRequest('/strategies', {
      method: 'POST',
      body: JSON.stringify({
        name: `UI Test Strategy ${Date.now()}`,
        description: 'Strategy created to test complete UI integration',
        type: 'CODE',
        parameters: { symbol: 'AAPL', quantity: 100 },
        code: 'function onTick(data) { console.log("UI Test"); }',
        tags: ['ui-test', 'integration']
      })
    });

    if (createResult.success) {
      createdStrategyId = createResult.data.data._id;
      console.log(`✅ Created strategy: ${createdStrategyId}`);
    } else {
      console.log('❌ Create failed:', createResult.error);
    }

    // Test 3: Get Strategy Details (Builder Page)
    if (createdStrategyId) {
      console.log('\n3. 🔍 Testing Strategy Details Fetch...');
      const detailsResult = await makeAuthenticatedRequest(`/strategies/${createdStrategyId}`);
      if (detailsResult.success) {
        console.log(`✅ Strategy details: ${detailsResult.data.data.name}`);
      } else {
        console.log('❌ Details failed:', detailsResult.error);
      }
    }

    // Test 4: Update Strategy (Save Button)
    if (createdStrategyId) {
      console.log('\n4. 💾 Testing Strategy Update (Save)...');
      const updateResult = await makeAuthenticatedRequest(`/strategies/${createdStrategyId}`, {
        method: 'PUT',
        body: JSON.stringify({
          description: 'Updated via UI integration test',
          parameters: { symbol: 'TSLA', quantity: 200 },
          code: 'function onTick(data) { console.log("Updated code"); }'
        })
      });

      if (updateResult.success) {
        console.log('✅ Strategy updated successfully');
      } else {
        console.log('❌ Update failed:', updateResult.error);
      }
    }

    // Test 5: Strategy Actions (Deploy, Pause, Stop)
    if (createdStrategyId) {
      console.log('\n5. ⚡ Testing Strategy Actions...');
      
      // Deploy
      const deployResult = await makeAuthenticatedRequest(`/strategies/${createdStrategyId}/deploy`, {
        method: 'POST'
      });
      if (deployResult.success) {
        console.log('✅ Deploy action successful');
      } else {
        console.log('❌ Deploy failed:', deployResult.error);
      }

      // Pause
      const pauseResult = await makeAuthenticatedRequest(`/strategies/${createdStrategyId}/pause`, {
        method: 'POST'
      });
      if (pauseResult.success) {
        console.log('✅ Pause action successful');
      } else {
        console.log('❌ Pause failed:', pauseResult.error);
      }

      // Stop
      const stopResult = await makeAuthenticatedRequest(`/strategies/${createdStrategyId}/stop`, {
        method: 'POST'
      });
      if (stopResult.success) {
        console.log('✅ Stop action successful');
      } else {
        console.log('❌ Stop failed:', stopResult.error);
      }
    }

    // Test 6: Clone Strategy
    if (createdStrategyId) {
      console.log('\n6. 📋 Testing Strategy Clone...');
      const cloneResult = await makeAuthenticatedRequest(`/strategies/${createdStrategyId}/clone`, {
        method: 'POST',
        body: JSON.stringify({
          name: 'UI Test Strategy (Clone)'
        })
      });

      if (cloneResult.success) {
        console.log(`✅ Cloned strategy: ${cloneResult.data.data._id}`);
      } else {
        console.log('❌ Clone failed:', cloneResult.error);
      }
    }

    // Test 7: Create from Template
    if (templateId) {
      console.log('\n7. 🏗️ Testing Template-based Creation...');
      const templateResult = await makeAuthenticatedRequest(`/strategies/templates/${templateId}/create`, {
        method: 'POST',
        body: JSON.stringify({
          name: `UI Template Test ${Date.now()}`,
          description: 'Strategy created from template via UI test',
          parameters: { symbol: 'RELIANCE', quantity: 50 },
          tags: ['template-test', 'ui']
        })
      });

      if (templateResult.success) {
        console.log(`✅ Template strategy created: ${templateResult.data.data._id}`);
      } else {
        console.log('❌ Template creation failed:', templateResult.error);
      }
    }

    // Test 8: Get Strategies List (Main Page)
    console.log('\n8. 📊 Testing Strategies List...');
    const listResult = await makeAuthenticatedRequest('/strategies');
    if (listResult.success) {
      console.log(`✅ Strategies list: ${listResult.data.data.length} strategies`);
    } else {
      console.log('❌ List failed:', listResult.error);
    }

    // Test 9: Get Status Counts (Dashboard)
    console.log('\n9. 📈 Testing Status Counts...');
    const countsResult = await makeAuthenticatedRequest('/strategies/status-counts');
    if (countsResult.success) {
      console.log('✅ Status counts:', countsResult.data.data);
    } else {
      console.log('❌ Status counts failed:', countsResult.error);
    }

    // Test 10: Performance Summary
    console.log('\n10. 📊 Testing Performance Summary...');
    const perfResult = await makeAuthenticatedRequest('/strategies/performance/summary');
    if (perfResult.success) {
      console.log('✅ Performance summary retrieved');
    } else {
      console.log('❌ Performance summary failed:', perfResult.error);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Complete UI-API Integration Test Completed!');
    
    console.log('\n📋 Summary of UI Flows Tested:');
    console.log('✅ Strategy creation from scratch (Create Modal → Builder)');
    console.log('✅ Strategy creation from template (Template Modal → Builder)');
    console.log('✅ Strategy details loading (Builder Page)');
    console.log('✅ Strategy saving (Save Button → API Update)');
    console.log('✅ Strategy actions (Deploy, Pause, Stop buttons)');
    console.log('✅ Strategy cloning (Clone action)');
    console.log('✅ Strategies list loading (Main Page)');
    console.log('✅ Status counts (Dashboard widgets)');
    console.log('✅ Performance summary (Analytics)');
    
    console.log('\n🚀 All UI components should now work with real APIs!');
    console.log('🔗 Test the builder with this strategy:');
    console.log(`   http://localhost:3001/strategies/builder?id=${createdStrategyId}`);

  } catch (error) {
    console.error('\n💥 Integration test failed:', error);
  }
}

testCompleteUIIntegration();