import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        console.log('🧪 Test email endpoint called');
        
        // Get test data from request or use defaults
        const body = await req.json().catch(() => ({}));
        
        const testData = {
            name: body.name || "Test User",
            email: body.email || "test@example.com", // Change this to your email for testing
            order_id: body.order_id || "TEST-" + Date.now(),
            details: body.details || "Test booking details",
            event_date: body.event_date || "2024-12-25",
            booking_type: body.booking_type || "Havan",
            amount: body.amount || "100",
            mobile: body.mobile || "9999999999",
            address: body.address || "Test Address",
            pan: body.pan || "TESTPAN123",
            valid_from: body.valid_from || new Date().toISOString().split('T')[0],
            valid_to: body.valid_to || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
        };
        
        console.log('📧 Test data:', testData);
        
        // Call our email API directly
        const baseUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:3000' 
            : (process.env.NEXT_PUBLIC_BASE_URL || 'https://donate.svsamiti.com');
        
        console.log('🔗 Calling email API at:', `${baseUrl}/api/emails/booking`);
        
        const response = await fetch(`${baseUrl}/api/emails/booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📡 Email API response status:', response.status);
        
        const responseText = await response.text();
        console.log('📥 Email API response:', responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ Failed to parse response:', parseError);
            return NextResponse.json({
                success: false,
                error: 'Invalid response from email API',
                rawResponse: responseText
            });
        }
        
        return NextResponse.json({
            success: true,
            message: 'Test email API called',
            testData,
            emailApiResponse: result,
            rawResponse: responseText
        });
        
    } catch (error) {
        console.error('❌ Test email error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}
