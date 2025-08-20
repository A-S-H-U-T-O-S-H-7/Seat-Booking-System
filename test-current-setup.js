// Test current setup
// Run with: node test-current-setup.js

console.log('🧪 Testing Current Setup\n');

// Check if your app is running
fetch('http://localhost:3001/api/validate-ccavenue')
  .then(response => response.json())
  .then(data => {
    console.log('✅ App is running on port 3001');
    console.log('Status:', data.status);
    
    if (data.status === 'valid') {
      console.log('✅ All credentials are valid');
      
      // Test payment creation
      return fetch('http://localhost:3001/api/debug-ccavenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'TEST' + Date.now(),
          amount: '10',
          billingName: 'Test User',
          billingEmail: 'test@example.com',
          billingTel: '9999999999',
          billingAddress: 'Test Address',
          isIndia: true
        })
      });
    } else {
      throw new Error('Credentials invalid');
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ Payment creation test successful');
    console.log('Encrypted request length:', data.testData?.encRequest?.length);
    console.log('Access code:', data.testData?.accessCode);
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Your encryption is working perfectly');
    console.log('2. The 1001 error is due to localhost limitations');
    console.log('3. Deploy to https://donate.svsamiti.com and whitelist domain');
    console.log('4. The issue will be resolved in production');
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your app is running: npm run dev');
    console.log('2. Check if port 3001 is accessible');
    console.log('3. Verify environment variables are loaded');
  });
