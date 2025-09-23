// Next.js App Router API route to proxy CCAvenue requests and avoid CORS issues
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { order_id, purpose, amount, name, email, phone, address } = body;

    // Comprehensive validation for CCAvenue API requirements
    const errors = [];
    
    if (!order_id || order_id.trim().length === 0) {
      errors.push('Order ID is required');
    }
    
    if (!purpose || purpose.trim().length === 0) {
      errors.push('Purpose is required');
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      errors.push('Valid amount is required');
    }
    
    if (!name || name.trim().length < 2) {
      errors.push('Customer name must be at least 2 characters');
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Valid email address is required');
    }
    
    if (!phone || !/^[0-9]{10}$/.test(phone.replace(/\D/g, ''))) {
      errors.push('Valid 10-digit phone number is required');
    }
    
    if (errors.length > 0) {
      return NextResponse.json({
        status: false,
        message: 'Validation failed',
        errors: errors
      }, { status: 400 });
    }

    // Get origin from headers
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Prepare data for CCAvenue API with proper formatting
    const paymentData = {
      order_id: order_id.trim(),
      purpose: purpose.trim(),
      amount: parseFloat(amount).toFixed(2), // Ensure decimal format
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.replace(/\D/g, ''), // Remove non-digits
      address: (address || 'Delhi, India').trim(),
      donor_type: body.donor_type || 'indian',
      country: body.country || 'india',
      redirect_url: purpose === 'donation' 
        ? `https://donate.svsamiti.com/api/payment/donation-response`
        : purpose === 'delegate_booking'
        ? `https://donate.svsamiti.com/api/payment/ccavenue-response`
        : `https://donate.svsamiti.com/api/payment/ccavenue-response`,
      cancel_url: purpose === 'donation'
        ? `https://donate.svsamiti.com/api/payment/donation-cancel`
        : purpose === 'delegate_booking'
        ? `https://donate.svsamiti.com/api/payment/ccavenue-cancel`
        : `https://donate.svsamiti.com/api/payment/ccavenue-cancel`
    };

    console.log('🚀 Proxying payment request to CCAvenue:', {
      ...paymentData,
      timestamp: new Date().toISOString()
    });

    // Make request to CCAvenue PHP API
    const response = await fetch('https://svsamiti.com/havan-booking/ccavenueRequest.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Havan-Booking-System/1.0',
      },
      body: new URLSearchParams(paymentData)
    });

    console.log('📥 CCAvenue API response status:', response.status);

    if (!response.ok) {
      throw new Error(`CCAvenue API returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ CCAvenue API response:', {
      status: data.status,
      hasEncRequest: !!data.encRequest,
      hasAccessCode: !!data.access_code,
      errors: data.errors || 'none'
    });

    // Return the response from CCAvenue API
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ CCAvenue proxy error:', error);
    
    return NextResponse.json({
      status: false,
      message: 'Payment request failed',
      errors: [error.message || 'Internal server error']
    }, { status: 500 });
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json({ 
    status: false, 
    message: 'Method not allowed. Only POST requests are accepted.' 
  }, { status: 405 });
}
