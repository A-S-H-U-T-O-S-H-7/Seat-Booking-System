// Test script to debug email service
const testBookingData = {
  id: 'BK-test-123',
  bookingId: 'BK-test-123',
  customerDetails: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '9876543210',
    address: 'Test Address, Delhi'
  },
  eventDate: new Date('2025-11-15'),
  shift: 'morning',
  seats: ['A1', 'A2'],
  totalAmount: 2000,
  status: 'confirmed',
  order_id: 'BK-test-123',
  amount: 2000
};

// Test email service function
async function testEmailService() {
  try {
    console.log('🧪 Testing email service...');
    
    // Simulate the email service call
    const emailData = {
      name: testBookingData.customerDetails.name,
      email: testBookingData.customerDetails.email,
      order_id: testBookingData.order_id,
      details: JSON.stringify({
        seats: testBookingData.seats,
        eventDate: testBookingData.eventDate,
        shift: testBookingData.shift,
        totalAmount: testBookingData.totalAmount
      }),
      event_date: testBookingData.eventDate.toISOString().split('T')[0],
      booking_type: 'havan',
      amount: testBookingData.amount.toString(),
      mobile: testBookingData.customerDetails.phone,
      address: testBookingData.customerDetails.address,
      pan: '',
      valid_from: '',
      valid_to: ''
    };
    
    console.log('📧 Email data prepared:', emailData);
    
    // Simulate the fetch call to email API
    const formData = new FormData();
    Object.keys(emailData).forEach(key => {
      formData.append(key, emailData[key] || '');
    });
    
    console.log('📨 Sending test email...');
    
    const response = await fetch('https://svsamiti.com/havan-booking/email.php', {
      method: 'POST',
      body: formData,
    });
    
    console.log('📥 Email API response status:', response.status);
    
    const result = await response.text();
    console.log('📄 Email API response:', result);
    
    try {
      const jsonResult = JSON.parse(result);
      console.log('✅ Email API JSON response:', jsonResult);
    } catch (e) {
      console.log('⚠️ Email API returned non-JSON response');
    }
    
  } catch (error) {
    console.error('❌ Email test error:', error);
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testEmailService };
} else if (typeof window !== 'undefined') {
  window.testEmailService = testEmailService;
}

console.log('🚀 Test email service loaded. Run testEmailService() to test.');
