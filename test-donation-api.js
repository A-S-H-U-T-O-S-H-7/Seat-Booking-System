// Test donation email API to see if it works - for comparison with delegate API
const testDonationAPI = async () => {
  try {
    console.log('🧪 Testing donation email API for comparison...');
    
    const formData = new FormData();
    formData.append('name', 'Test Donor');
    formData.append('email', 'test@example.com');
    formData.append('amount', '1000');
    formData.append('payment_id', 'test_payment_123');
    formData.append('order_id', 'test_order_456');
    formData.append('transaction_date', '2025-08-31');
    
    console.log('📤 Sending test request to donation email API...');
    
    const response = await fetch('https://svsamiti.com/havan-booking/donation-email.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Havan-Booking-System/1.0'
      }
    });
    
    const responseText = await response.text();
    console.log('📨 Donation API Response status:', response.status);
    console.log('📨 Donation API Raw response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ Donation API Parsed response:', result);
      
      if (result.status) {
        console.log('✅ Donation email API is working correctly!');
        return true;
      } else {
        console.log('❌ Donation API errors:', result.errors);
        return false;
      }
    } catch (parseError) {
      console.error('❌ Failed to parse donation API JSON:', parseError);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Donation API test failed:', error);
    return false;
  }
};

// Test if delegate API works without the problematic number_of_persons field
const testDelegateWithoutPersonCount = async () => {
  try {
    console.log('\n🧪 Testing delegate API without number_of_persons field...');
    
    const formData = new FormData();
    formData.append('name', 'Test Delegate');
    formData.append('email', 'test@example.com');
    formData.append('participation_type', 'Delegate');
    formData.append('registration_type', 'Individual');
    formData.append('duration', '3');
    formData.append('amount', '5000');
    formData.append('payment_id', 'test_payment_123');
    formData.append('order_id', 'test_order_456');
    formData.append('transaction_date', '2025-08-31');
    // Deliberately NOT including any person count field
    
    console.log('📤 Sending test request to delegate API without person count...');
    
    const response = await fetch('https://svsamiti.com/havan-booking/delegate-email.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Havan-Booking-System/1.0'
      }
    });
    
    const responseText = await response.text();
    console.log('📨 Delegate API Response status:', response.status);
    console.log('📨 Delegate API Raw response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ Delegate API Parsed response:', result);
      
      if (result.status) {
        console.log('✅ Delegate API works when person count is omitted!');
        return 'works_without_person_count';
      } else {
        console.log('❌ Delegate API errors:', result.errors);
        
        // Check if the error is still about number of persons
        if (result.errors && result.errors.some(error => error.includes('Number of Persons'))) {
          return 'still_requires_person_count';
        } else {
          return 'different_errors';
        }
      }
    } catch (parseError) {
      console.error('❌ Failed to parse delegate API JSON:', parseError);
      return 'parse_error';
    }
    
  } catch (error) {
    console.error('❌ Delegate API test failed:', error);
    return 'network_error';
  }
};

// Main execution
console.log('🚀 Starting API comparison testing...');

testDonationAPI().then(donationWorking => {
  if (donationWorking) {
    console.log('\n✅ Donation API is functioning normally - this confirms the email infrastructure is working.');
    console.log('The issue is specifically with the delegate API validation.');
  } else {
    console.log('\n❌ Donation API is also having issues - this might indicate a broader server problem.');
  }
  
  return testDelegateWithoutPersonCount();
}).then(delegateResult => {
  console.log('\n📊 Delegate API Test Result:', delegateResult);
  
  switch (delegateResult) {
    case 'works_without_person_count':
      console.log('🎉 SOLUTION FOUND: The delegate API works when person count is omitted!');
      console.log('This suggests the validation logic for this field is broken.');
      break;
    case 'still_requires_person_count':
      console.log('🤔 The API still requires person count even when omitted - validation is definitely broken.');
      break;
    case 'different_errors':
      console.log('📋 Different errors appeared - the person count validation might be working but other fields are missing.');
      break;
    default:
      console.log('❌ Unable to determine the issue conclusively.');
  }
  
  console.log('\n✅ Comparison testing complete!');
}).catch(console.error);
