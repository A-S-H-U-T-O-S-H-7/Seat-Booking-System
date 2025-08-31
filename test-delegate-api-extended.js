// Extended test to find the correct field name and value type
const testExtendedVariations = async () => {
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

  // Test more field variations including case variations
  const fieldVariations = [
    // Original variations
    { field: 'number_of_persons', value: '1' },
    // Try with integer instead of string
    { field: 'number_of_persons', value: 1 },
    // PHP style variations
    { field: 'numberofpersons', value: '1' },
    { field: 'NumberOfPersons', value: '1' },
    { field: 'Number_Of_Persons', value: '1' },
    // Common API field names
    { field: 'total_attendees', value: '1' },
    { field: 'attendees', value: '1' },
    { field: 'head_count', value: '1' },
    { field: 'pax', value: '1' },
    { field: 'quantity', value: '1' },
    { field: 'count', value: '1' }
  ];

  for (const variation of fieldVariations) {
    try {
      console.log(`\n🧪 Testing field: "${variation.field}" with value: ${JSON.stringify(variation.value)}`);
      
      const formData = new FormData();
      
      // Add base data
      Object.keys(baseData).forEach(key => {
        formData.append(key, baseData[key]);
      });
      
      // Add the field variation
      formData.append(variation.field, variation.value);
      
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
        console.log(`✅ SUCCESS! Field "${variation.field}" worked!`);
        console.log('Response:', result);
        return variation.field; // Return the working field name
      } else {
        console.log(`❌ "${variation.field}":`, result.errors?.join(', ') || 'Unknown error');
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${variation.field}:`, error.message);
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return null; // No working field found
};

// Test with all possible combinations of common delegate fields
const testFullFieldSet = async () => {
  try {
    console.log('\n🧪 Testing with comprehensive field set...');
    
    const allFields = {
      // Basic info
      'name': 'Test Delegate',
      'email': 'test@example.com',
      
      // Event info
      'participation_type': 'Delegate',
      'registration_type': 'Individual',
      'duration': '3',
      'amount': '5000',
      'payment_id': 'test_payment_123',
      'order_id': 'test_order_456',
      'transaction_date': '2025-08-31',
      
      // Variations of person count - try multiple at once
      'number_of_persons': '1',
      'numberOfPersons': '1',
      'persons': '1',
      'attendees': '1',
      'pax': '1',
      'quantity': '1',
      'count': '1',
      'total_persons': '1',
      'person_count': '1'
    };
    
    const formData = new FormData();
    Object.keys(allFields).forEach(key => {
      formData.append(key, allFields[key]);
    });
    
    const response = await fetch('https://svsamiti.com/havan-booking/delegate-email.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Havan-Booking-System/1.0'
      }
    });
    
    const responseText = await response.text();
    const result = JSON.parse(responseText);
    
    console.log('📨 Response with all fields:', result);
    
    if (result.status) {
      console.log('✅ SUCCESS with comprehensive field set!');
      return true;
    } else {
      console.log('❌ Still failed:', result.errors);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
    return false;
  }
};

// Main test execution
console.log('🚀 Starting extended delegate email API testing...');

testExtendedVariations().then(workingField => {
  if (workingField) {
    console.log(`\n🎉 Found working field: "${workingField}"`);
  } else {
    console.log('\n❌ No individual field worked, trying comprehensive approach...');
    return testFullFieldSet();
  }
}).then(success => {
  if (success === false) {
    console.log('\n🤔 The API might expect a completely different field name or have server-side validation issues.');
    console.log('Consider checking the PHP source code or API documentation.');
  }
  console.log('\n✅ Extended testing complete!');
}).catch(console.error);
