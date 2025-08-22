// Next.js App Router API route to handle CCAvenue response processing
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { encResp } = body;

    // Validate encrypted response
    if (!encResp) {
      return NextResponse.json({
        status: false,
        message: 'Missing encrypted response',
        errors: ['encResp parameter is required']
      }, { status: 400 });
    }

    console.log('🔐 Processing CCAvenue encrypted response:', {
      encRespLength: encResp.length,
      timestamp: new Date().toISOString()
    });

    // Send encrypted response to CCAvenue response handler
    const response = await fetch('https://svsamiti.com/havan-booking/ccavResponseHandler.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Havan-Booking-System/1.0',
      },
      body: new URLSearchParams({
        encResp: encResp
      })
    });

    console.log('📥 CCAvenue response handler status:', response.status);

    if (!response.ok) {
      throw new Error(`CCAvenue response handler returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ CCAvenue response processed:', {
      status: data.status,
      hasData: !!data.data,
      timestamp: new Date().toISOString()
    });

    // Return the processed response
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ CCAvenue response processing error:', error);
    
    return NextResponse.json({
      status: false,
      message: 'Payment response processing failed',
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
