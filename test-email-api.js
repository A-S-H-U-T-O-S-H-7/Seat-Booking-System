const fetch = require('node-fetch');
const FormData = require('form-data');

async function testEmailAPI() {
    try {
        console.log('🧪 Testing external email API...');
        
        const formData = new FormData();
        formData.append('name', 'Test User');
        formData.append('email', 'test@example.com');
        formData.append('order_id', 'TEST123');
        formData.append('booking_type', 'havan');
        formData.append('amount', '100');
        formData.append('details', 'Test booking details');
        formData.append('event_date', '2025-11-15');
        formData.append('mobile', '9876543210');
        formData.append('address', 'Test Address');
        formData.append('pan', '');
        formData.append('valid_from', '2025-01-01');
        formData.append('valid_to', '2025-12-31');
        
        console.log('📤 Sending request to email API...');
        
        const response = await fetch('https://svsamiti.com/havan-booking/email.php', {
            method: 'POST',
            body: formData,
            headers: {
                'User-Agent': 'Test-Script/1.0'
            }
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', response.headers.raw());
        
        const responseText = await response.text();
        console.log('📄 Raw response:', responseText);
        
        try {
            const jsonResponse = JSON.parse(responseText);
            console.log('✅ JSON parsed response:', jsonResponse);
        } catch (e) {
            console.log('⚠️ Response is not valid JSON');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testEmailAPI();
