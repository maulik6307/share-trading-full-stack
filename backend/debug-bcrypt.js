const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testBcrypt() {
  try {
    console.log('Testing bcrypt functionality...');
    
    const testPassword = 'testpassword123';
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    
    console.log('1. Generating salt...');
    const salt = await bcrypt.genSalt(saltRounds);
    console.log('Salt generated:', salt);
    
    console.log('2. Hashing password...');
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    console.log('Password hashed:', hashedPassword);
    
    console.log('3. Comparing correct password...');
    const isMatch1 = await bcrypt.compare(testPassword, hashedPassword);
    console.log('Correct password match:', isMatch1);
    
    console.log('4. Comparing incorrect password...');
    const isMatch2 = await bcrypt.compare('wrongpassword', hashedPassword);
    console.log('Incorrect password match:', isMatch2);
    
    console.log('5. Testing with undefined values...');
    try {
      await bcrypt.compare(undefined, hashedPassword);
    } catch (error) {
      console.log('Error with undefined password:', error.message);
    }
    
    try {
      await bcrypt.compare(testPassword, undefined);
    } catch (error) {
      console.log('Error with undefined hash:', error.message);
    }
    
    console.log('✅ Bcrypt test completed successfully');
  } catch (error) {
    console.error('❌ Bcrypt test failed:', error);
  }
}

testBcrypt();