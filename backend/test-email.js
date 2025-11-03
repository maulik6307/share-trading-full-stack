const emailService = require('./src/utils/emailService');
require('dotenv').config();

async function testEmail() {
  try {
    console.log('Testing email service...');
    
    // Test password reset email
    const testEmail = 'test@example.com';
    const resetToken = 'test-reset-token-123';
    const resetUrl = 'http://localhost:3000/reset-password/test-reset-token-123';
    
    console.log('Sending password reset email...');
    const result = await emailService.sendPasswordResetEmail(testEmail, resetToken, resetUrl);
    
    console.log('Email sent successfully!', result);
  } catch (error) {
    console.error('Email test failed:', error.message);
    console.log('\nPlease check your email configuration in .env file:');
    console.log('- EMAIL_USER should be your Gmail address');
    console.log('- EMAIL_PASS should be your Gmail app password (not regular password)');
    console.log('- Make sure 2-factor authentication is enabled on your Gmail account');
    console.log('\nSee EMAIL_SETUP.md for detailed instructions.');
  }
}

testEmail();