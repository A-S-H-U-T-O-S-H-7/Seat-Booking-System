import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const emailData = await req.json();
        console.log('📧 Booking email API received data:', emailData);

        // Validate required fields
        const requiredFields = ['name', 'email', 'order_id'];
        const missingFields = requiredFields.filter(field => !emailData[field]);
        
        if (missingFields.length > 0) {
            return NextResponse.json({
                status: false,
                errors: missingFields.map(field => `${field} is required`),
                message: 'Missing required fields'
            });
        }

        // Prepare form data for the external email API
        const formData = new FormData();
        
        // Add required fields
        formData.append("name", emailData.name.trim());
        formData.append("email", emailData.email.trim());
        formData.append("order_id", emailData.order_id.trim());
        formData.append("details", emailData.details || 'Booking confirmation details');
        formData.append("event_date", emailData.event_date || 'To be announced');
        formData.append("booking_type", emailData.booking_type || 'General Booking');
        // Ensure amount is always a valid string (never empty, null, or undefined)
        const amount = emailData.amount !== undefined && emailData.amount !== null && emailData.amount !== '' 
            ? emailData.amount.toString() 
            : '0';
        formData.append("amount", amount);
        
        // Add optional fields if they exist
        if (emailData.mobile) formData.append("mobile", emailData.mobile.toString().trim());
        if (emailData.address) formData.append("address", emailData.address.trim());
        if (emailData.pan) formData.append("pan", emailData.pan.trim());
        formData.append("valid_from", emailData.valid_from || new Date().toISOString().split('T')[0]);
        formData.append("valid_to", emailData.valid_to || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        console.log('📤 Sending booking email to external API...');
        
        // Call the external email API from server-side (no CORS issues)
        const response = await fetch('https://svsamiti.com/havan-booking/email.php', {
            method: 'POST',
            body: formData,
            headers: {
                'User-Agent': 'Havan-Booking-System/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`External API returned ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log('📥 External API response:', responseText);

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ Failed to parse external API response:', parseError);
            return NextResponse.json({
                status: false,
                errors: ['Invalid response from email service'],
                message: 'Email service error',
                rawResponse: responseText
            });
        }

        if (result.status) {
            console.log('✅ Booking email sent successfully');
            return NextResponse.json({
                status: true,
                message: result.message || 'Booking confirmation email sent successfully'
            });
        } else {
            console.log('❌ External API returned error:', result);
            return NextResponse.json({
                status: false,
                errors: result.errors || [result.message || 'Email service error'],
                message: result.message || 'Failed to send email'
            });
        }

    } catch (error) {
        console.error('❌ Booking email API error:', error);
        return NextResponse.json({
            status: false,
            errors: [error.message || 'Internal server error'],
            message: 'Failed to send booking email'
        });
    }
}
