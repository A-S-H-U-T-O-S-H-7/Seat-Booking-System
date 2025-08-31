// Test delegate email API without the problematic number_of_persons field
const testWorkaround = async () => {
  try {
    console.log('🧪 Testing delegate email API without number_of_persons field (WORKAROUND)...');
    
    const formData = new FormData();
    formData.append('name', 'Test Delegate');
    formData.append('email', 'test@example.com');
    formData.append('participation_type', 'Delegate');
    formData.append('registration_type', 'Individual');
    formData.append('duration', '3');
    // NOT including number_of_persons field
    formData.append('amount', '5000');
    formData.append('payment_id', 'test_payment_123');
    formData.append('order_id', 'test_order_456');
    formData.append('transaction_date', '2025-08-31');
    
    console.log('📤 Sending test request WITHOUT number_of_persons...');
    
    const response = await fetch('https://svsamiti.com/havan-booking/delegate-email.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Havan-Booking-System/1.0'
      }
    });
    
    const responseText = await response.text();
    console.log('📨 Response status:', response.status);
    console.log('📨 Raw response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ Parsed JSON response:', result);
      
      if (result.status) {
        console.log('🎉 SUCCESS! Delegate email API works without number_of_persons field!');
        console.log('✅ The workaround is effective - emails should now be delivered.');
        return true;
      } else {
        console.log('❌ Still failed:', result.errors || 'Unknown error');
        
        // Check if it's still the same error
        if (result.errors && result.errors.some(error => error.includes('Number of Persons'))) {
          console.log('😞 Same validation error - the workaround did not work');
          return false;
        } else {
          console.log('📋 Different error - this might be progress!');
          console.log('New errors:', result.errors);
          return 'different_error';
        }
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      console.log('Raw response was:', responseText);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Run the workaround test
console.log('🚀 Testing workaround for delegate email issue...');
testWorkaround().then(result => {
  if (result === true) {
    console.log('\n🎯 SOLUTION CONFIRMED: Remove the number_of_persons field to fix delegate emails!');
    console.log('📋 Action Items:');
    console.log('1. ✅ Already removed number_of_persons from emailService.js');
    console.log('2. 🔄 Deploy the updated code');
    console.log('3. 📧 Test with real delegate registrations');
    console.log('4. 🐛 Report API bug to backend team for permanent fix');
  } else if (result === 'different_error') {
    console.log('\n📈 PARTIAL PROGRESS: Field validation passed, but other issues remain');
    console.log('Check the new error messages above for next steps');
  } else {
    console.log('\n❌ WORKAROUND FAILED: The API issue is deeper than expected');
    console.log('Consider alternative solutions or contact backend team');
  }
  
  console.log('\n✅ Workaround testing complete!');
}).catch(console.error);
