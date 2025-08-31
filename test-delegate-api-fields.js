// Test different field name variations to identify what the API expects
const testDifferentFields = async () => {
  const baseData = {
    name: 'Test Delegate',
    email: 'test@example.com',
    participation_type: 'Delegate',
    registration_type: 'Individual',
    duration: '3',
    amount: '5000',
    payment_id: 'test_payment_123',
    order_id: 'test_order_456',
    transaction_date: '2025-08-31'
  };

  // Test different possible field names for number of persons
  const fieldVariations = [
    { field: 'number_of_persons', value: '1' },
    { field: 'numberOfPersons', value: '1' },
    { field: 'persons', value: '1' },
    { field: 'no_of_persons', value: '1' },
    { field: 'person_count', value: '1' },
    { field: 'total_persons', value: '1' },
    { field: 'num_persons', value: '1' }
  ];

  for (const variation of fieldVariations) {
    try {
      console.log(`\n🧪 Testing field name: "${variation.field}" with value: "${variation.value}"`);
      
      const formData = new FormData();
      
      // Add base data
      Object.keys(baseData).forEach(key => {
        formData.append(key, baseData[key]);
      });
      
      // Add the field variation
      formData.append(variation.field, variation.value);
      
      console.log(`📤 Sending test request with ${variation.field}...`);
      
      const response = await fetch('https://svsamiti.com/havan-booking/delegate-email.php', {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': 'Havan-Booking-System/1.0'
        }
      });
      
      const responseText = await response.text();
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', responseText);
        continue;
      }
      
      if (result.status) {
        console.log(`✅ SUCCESS with field "${variation.field}": Email API accepted the request!`);
        console.log('Response:', result);
        break; // Found the correct field name
      } else {
        console.log(`❌ Failed with "${variation.field}":`, result.errors);
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${variation.field}:`, error.message);
    }
    
    // Wait 1 second between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
};

// Also test without any person field to see what other fields might be missing
const testWithoutPersonField = async () => {
  try {
    console.log('\n🧪 Testing without any person field to identify other missing fields...');
    
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
    // Intentionally NOT including any person field
    
    const response = await fetch('https://svsamiti.com/havan-booking/delegate-email.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Havan-Booking-System/1.0'
      }
    });
    
    const responseText = await response.text();
    const result = JSON.parse(responseText);
    
    console.log('📨 Response without person field:', result);
    
  } catch (error) {
    console.error('❌ Test without person field failed:', error);
  }
};

// Run tests
console.log('🚀 Starting delegate email API field testing...');
testDifferentFields().then(() => {
  console.log('\n🔄 Now testing without person field...');
  return testWithoutPersonField();
}).then(() => {
  console.log('\n✅ Field testing complete!');
}).catch(console.error);
