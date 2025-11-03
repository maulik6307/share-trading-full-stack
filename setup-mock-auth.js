/**
 * Script to set up mock authentication for testing backtesting API
 */

console.log('🔧 Setting up mock authentication for testing...\n');

// Instructions for manual setup
console.log('📋 Manual Setup Instructions:');
console.log('1. Open your browser Developer Tools (F12)');
console.log('2. Go to the Application/Storage tab');
console.log('3. Find "Local Storage" for your domain (http://localhost:3000)');
console.log('4. Add the following entries:');
console.log('');
console.log('Key: token');
console.log('Value: mock-jwt-token-for-testing');
console.log('');
console.log('Key: user');
console.log('Value: {"id":"mock-user-id","name":"Test User","email":"test@example.com","role":"user"}');
console.log('');
console.log('5. Refresh the page');
console.log('');

// Alternative: Create a simple HTML file to set localStorage
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Mock Auth Setup</title>
</head>
<body>
    <h1>Mock Authentication Setup</h1>
    <button onclick="setupMockAuth()">Setup Mock Auth</button>
    <button onclick="clearAuth()">Clear Auth</button>
    <div id="status"></div>
    
    <script>
        function setupMockAuth() {
            localStorage.setItem('token', 'mock-jwt-token-for-testing');
            localStorage.setItem('user', JSON.stringify({
                id: 'mock-user-id',
                name: 'Test User',
                email: 'test@example.com',
                role: 'user',
                username: 'testuser'
            }));
            document.getElementById('status').innerHTML = '✅ Mock auth set up! Refresh your app.';
        }
        
        function clearAuth() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            document.getElementById('status').innerHTML = '🗑️ Auth cleared!';
        }
        
        // Show current auth status
        window.onload = function() {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            if (token && user) {
                document.getElementById('status').innerHTML = '✅ Auth is set up';
            } else {
                document.getElementById('status').innerHTML = '❌ No auth found';
            }
        }
    </script>
</body>
</html>
`;

const fs = require('fs');
fs.writeFileSync('mock-auth-setup.html', htmlContent);

console.log('📄 Created mock-auth-setup.html file');
console.log('   Open this file in your browser to set up mock authentication');
console.log('');

console.log('🔧 Alternative: Backend Auth Bypass');
console.log('   For testing, you can temporarily disable auth middleware:');
console.log('   1. Edit backend/src/routes/backtest.js');
console.log('   2. Remove "protect" middleware from routes');
console.log('   3. Restart backend server');
console.log('');

console.log('⚠️  Remember to re-enable authentication after testing!');

// Create a temporary auth bypass version of the routes
const routesBypass = `
const express = require('express');
// const { protect } = require('../middleware/auth'); // DISABLED FOR TESTING
const {
  getBacktests,
  getStatusCounts,
  getRunningBacktests,
  createBacktest,
  getBacktest,
  updateBacktest,
  deleteBacktest,
  cancelBacktest,
  retryBacktest,
  cloneBacktest
} = require('../controllers/backtestController');

const router = express.Router();

// Mock user middleware for testing
const mockUser = (req, res, next) => {
  req.user = { id: 'mock-user-id', name: 'Test User', email: 'test@example.com' };
  next();
};

// Status and running backtests routes (before :id routes)
router.get('/status-counts', mockUser, getStatusCounts);
router.get('/running', mockUser, getRunningBacktests);

// Main CRUD routes
router.route('/')
  .get(mockUser, getBacktests)
  .post(mockUser, createBacktest);

router.route('/:id')
  .get(mockUser, getBacktest)
  .put(mockUser, updateBacktest)
  .delete(mockUser, deleteBacktest);

// Action routes
router.post('/:id/cancel', mockUser, cancelBacktest);
router.post('/:id/retry', mockUser, retryBacktest);
router.post('/:id/clone', mockUser, cloneBacktest);

module.exports = router;
`;

fs.writeFileSync('backend-routes-no-auth.js', routesBypass);
console.log('📄 Created backend-routes-no-auth.js');
console.log('   Replace backend/src/routes/backtest.js with this content for testing');
console.log('   (Remember to restore original after testing)');