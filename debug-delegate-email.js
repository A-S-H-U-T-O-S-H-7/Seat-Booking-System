// Debug script for delegate email API
const testDelegateEmail = async () => {
  try {
    console.log('🧪 Testing delegate email API...');
    
    const formData = new FormData();
    formData.append('name', 'Test Delegate');
    formData.append('email', 'test@example.com');
    formData.append('participation_type', 'Delegate');
    formData.append('registration_type', 'Individual');
    formData.append('duration', '3');
    formData.append('number_of_persons', '1');
    formData.append('amount', '5000');
    formData.append('payment_id', 'test_payment_123');
    formData.append('order_id', 'test_order_456');
    formData.append('transaction_date', '2025-01-29');
    
    console.log('📤 Sending test request to delegate email API...');
    
    const response = await fetch('https://svsamiti.com/havan-booking/delegate-email.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Havan-Booking-System/1.0'
      }
    });
    
    const responseText = await response.text();
    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers));
    console.log('📨 Raw response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ Parsed JSON response:', result);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      console.log('Raw response was:', responseText);
      return;
    }
    
    if (result.status) {
      console.log('✅ Test delegate email sent successfully!');
    } else {
      console.error('❌ Delegate email API error:', result.errors);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Also test with the exact data structure from the actual delegate service
const testWithRealData = async () => {
  try {
    console.log('🧪 Testing with real delegate data structure...');
    
    const delegateData = {
      delegateDetails: {
        name: 'John Smith',
        email: 'john.smith@example.com',
        mobile: '9876543210'
      },
      eventDetails: {
        participationType: 'Delegate',
        registrationType: 'Company',
        duration: '5',
        numberOfPersons: '2'
      },
      totalAmount: 10000,
      bookingId: 'DELEGATE-1738156531234-567',
      payment: {
        transactionId: 'TXN123456789'
      }
    };
    
    const formData = new FormData();
    formData.append('name', delegateData.delegateDetails?.name || '');
    formData.append('email', delegateData.delegateDetails?.email || '');
    formData.append('participation_type', delegateData.eventDetails?.participationType || 'Delegate');
    formData.append('registration_type', delegateData.eventDetails?.registrationType || '');
    formData.append('duration', delegateData.eventDetails?.duration || '');
    formData.append('number_of_persons', delegateData.eventDetails?.numberOfPersons || '1');
    formData.append('amount', delegateData.totalAmount?.toString() || '');
    formData.append('payment_id', delegateData.payment?.transactionId || '');
    formData.append('order_id', delegateData.bookingId || '');
    formData.append('transaction_date', new Date().toISOString().split('T')[0]);
    
    console.log('📤 Sending request with real data structure...');
    
    const response = await fetch('https://svsamiti.com/havan-booking/delegate-email.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Havan-Booking-System/1.0'
      }
    });
    
    const responseText = await response.text();
    console.log('📨 Real data test - Status:', response.status);
    console.log('📨 Real data test - Response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('✅ Real data test - Parsed:', result);
      
      if (result.status) {
        console.log('✅ Real data delegate email sent successfully!');
      } else {
        console.error('❌ Real data delegate email API error:', result.errors);
      }
    } catch (parseError) {
      console.error('❌ Real data test - Failed to parse JSON:', parseError);
    }
    
  } catch (error) {
    console.error('❌ Real data test failed:', error);
  }
};

// Run both tests
testDelegateEmail();
setTimeout(() => testWithRealData(), 2000);
