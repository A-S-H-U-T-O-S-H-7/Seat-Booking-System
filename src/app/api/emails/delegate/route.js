import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const emailData = await req.json();

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
        
        // Add required fields - ensure none are empty strings
        const name = (emailData.name && emailData.name.trim()) || 'Delegate Member';
        const email = (emailData.email && emailData.email.trim()) || 'no-email@example.com';
        const order_id = (emailData.order_id && emailData.order_id.trim()) || 'UNKNOWN';
        const details = (emailData.details && emailData.details.trim()) || 'Delegate Registration Details';
        const event_date = (emailData.event_date && emailData.event_date.trim()) || 'November 15, 2025';
        const booking_type = (emailData.booking_type && emailData.booking_type.trim()) || 'Delegate Registration';
        
        // Ensure amount is always a valid string (never empty, null, or undefined)
        // External API requires non-zero amount, so we use '1' for free registrations
        let amount = emailData.amount !== undefined && emailData.amount !== null && emailData.amount !== '' 
            ? emailData.amount.toString() 
            : '0';
        
        // For free registrations (amount = '0'), use 'Free' string
        // but keep the actual amount for display purposes
        const displayAmount = amount;
        // Handle different delegate types
        if (amount === '0' && emailData.booking_type && emailData.booking_type.includes('Delegate')) {
            amount = 'Free'; // Use 'Free' for free delegate registrations
        } else if (amount === '0') {
            amount = '1'; // For other booking types that require non-zero amount
        }
        
        formData.append("name", name);
        formData.append("email", email);
        formData.append("order_id", order_id);
        formData.append("details", details);
        formData.append("event_date", event_date);
        formData.append("booking_type", booking_type);
        formData.append("amount", amount);
        
        if (!email.includes('@') || email === 'no-email@example.com') {
            throw new Error('Valid email address is required for sending delegate confirmation');
        }
        
        // Add optional fields if they exist
        if (emailData.mobile) formData.append("mobile", emailData.mobile.toString().trim());
        if (emailData.address) formData.append("address", emailData.address.trim());
        if (emailData.pan) formData.append("pan", emailData.pan.trim());
        formData.append("valid_from", emailData.valid_from || new Date().toISOString().split('T')[0]);
        formData.append("valid_to", emailData.valid_to || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        // Send to external API using the new general-email.php endpoint
        
        // Prepare form data for the new API format
        const newFormData = new FormData();
        newFormData.append("name", name);
        newFormData.append("email", email);
        newFormData.append("registrationId", order_id);
        newFormData.append("eventDate", "3-7 Dec, 2025");
        newFormData.append("purpose", "Delegate Registration");
        
        // Add delegate-specific fields
        if (emailData.registration_type) newFormData.append("registrationType", emailData.registration_type);
        if (emailData.delegate_type) newFormData.append("delegateType", emailData.delegate_type);
        if (emailData.duration) newFormData.append("duration", emailData.duration);
        
        // Send numberOfPersons in multiple formats to ensure PHP receives it
        const numPersons = emailData.number_of_person ? String(emailData.number_of_person) : '';
        if (numPersons) {
          newFormData.append("numberOfPersons", numPersons);
          newFormData.append("number_of_person", numPersons);
          newFormData.append("number_of_persons", numPersons);
          newFormData.append("numPersons", numPersons);
        }
        
        // Determine which endpoint to use based on delegate type
        // Paid delegates (withAssistance, withoutAssistance) use delegate-email.php
        // Free delegates (normal) use general-email.php
        const isPaidDelegate = emailData.delegate_type === 'withAssistance' || emailData.delegate_type === 'withoutAssistance';
        const emailEndpoint = isPaidDelegate 
            ? 'https://svsamiti.com/havan-booking/delegate-email.php'
            : 'https://svsamiti.com/havan-booking/general-email.php';
        
        console.log(`📧 Sending ${emailData.delegate_type} delegate email to: ${emailEndpoint}`);
        
        // Call the appropriate external email API from server-side (no CORS issues)
        const response = await fetch(emailEndpoint, {
            method: 'POST',
            body: newFormData,
            headers: {
                'User-Agent': 'Havan-Booking-System/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`External API returned ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            return NextResponse.json({
                status: false,
                errors: ['Invalid response from email service'],
                message: 'Email service error',
                rawResponse: responseText
            });
        }

        if (result.status) {
            return NextResponse.json({
                status: true,
                message: result.message || 'Delegate confirmation email sent successfully'
            });
        } else {
            return NextResponse.json({
                status: false,
                errors: result.errors || [result.message || 'Email service error'],
                message: result.message || 'Failed to send email'
            });
        }

    } catch (error) {
        return NextResponse.json({
            status: false,
            errors: [error.message || 'Internal server error'],
            message: 'Failed to send delegate email'
        });
    }
}
