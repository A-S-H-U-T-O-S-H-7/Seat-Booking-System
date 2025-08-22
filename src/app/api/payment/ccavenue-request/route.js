// Next.js App Router API route to proxy CCAvenue requests and avoid CORS issues
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { order_id, amount, name, email, phone, address } = body;

    // Validate required fields
    if (!order_id || !amount || !name || !email || !phone) {
      return NextResponse.json({
        status: false,
        message: 'Missing required fields',
        errors: ['order_id, amount, name, email, and phone are required']
      }, { status: 400 });
    }

    // Get origin from headers
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Prepare data for CCAvenue API
    const paymentData = {
      order_id,
      amount: amount.toString(),
      name,
      email,
      phone,
      address: address || 'Delhi, India',
      redirect_url: `${origin}/payment/success`,
      cancel_url: `${origin}/payment/cancel`
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
