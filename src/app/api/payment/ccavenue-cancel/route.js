// Next.js App Router API route to handle CCAvenue payment cancellations
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    let encResp;
    
    // Try to get the content type
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Handle form data (typical for CCAvenue)
      const formData = await request.formData();
      encResp = formData.get('encResp');
    } else if (contentType.includes('application/json')) {
      // Handle JSON data (from our frontend)
      const body = await request.json();
      encResp = body.encResp;
    } else {
      // Fallback: try to parse as text and extract encResp
      const text = await request.text();
      console.log('Raw cancel request body:', text);
      
      // Try to parse as URL-encoded data
      if (text.includes('encResp=')) {
        const urlParams = new URLSearchParams(text);
        encResp = urlParams.get('encResp');
      }
    }

    console.log('Cancel - Extracted encResp length:', encResp ? encResp.length : 'null');

    // Validate encrypted response
    if (!encResp) {
      return NextResponse.json({
        status: false,
        message: 'Missing encrypted response',
        errors: ['encResp parameter is required']
      }, { status: 400 });
    }

    console.log('🚫 Processing CCAvenue payment cancellation:', {
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

    console.log('📥 CCAvenue cancellation handler status:', response.status);

    if (!response.ok) {
      throw new Error(`CCAvenue response handler returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ CCAvenue cancellation processed:', {
      status: data.status,
      hasData: !!data.data,
      timestamp: new Date().toISOString()
    });

    // If we have valid data, redirect to failure page
    if (data.status && data.data) {
      const paymentInfo = data.data;
      
      // Redirect to payment success page with failure status
      const redirectUrl = new URL('/payment/success', 'https://donate.svsamiti.com');
      redirectUrl.searchParams.set('order_id', paymentInfo.order_id || 'unknown');
      redirectUrl.searchParams.set('status', 'cancelled');
      redirectUrl.searchParams.set('message', 'Payment was cancelled by user');
      
      // Return redirect response
      return NextResponse.json({
        status: true,
        redirect: redirectUrl.toString(),
        data: paymentInfo
      });
    }

    // Return the processed response
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ CCAvenue cancellation processing error:', error);
    
    return NextResponse.json({
      status: false,
      message: 'Payment cancellation processing failed',
      errors: [error.message || 'Internal server error']
    }, { status: 500 });
  }
}

// Also handle GET requests (some payment gateways use GET for cancellations)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const encResp = searchParams.get('encResp');
  
  if (!encResp) {
    // Redirect to general cancellation page
    return NextResponse.redirect(new URL('/payment/success?status=cancelled&message=Payment%20was%20cancelled', 'https://donate.svsamiti.com'));
  }
  
  // Process the encrypted response
  return POST(request);
}
