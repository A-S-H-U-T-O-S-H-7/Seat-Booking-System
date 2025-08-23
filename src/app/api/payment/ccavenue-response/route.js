// Next.js App Router API route to handle CCAvenue response processing
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
      console.log('Raw request body:', text);
      
      // Try to parse as URL-encoded data
      if (text.includes('encResp=')) {
        const urlParams = new URLSearchParams(text);
        encResp = urlParams.get('encResp');
      }
    }

    console.log('Extracted encResp length:', encResp ? encResp.length : 'null');

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

    // If we have valid data, prepare redirect URL
    if (data.status && data.data) {
      const paymentInfo = data.data;
      
      // Create redirect URL based on payment status
      const redirectUrl = new URL('/payment/success', 'https://donate.svsamiti.com');
      redirectUrl.searchParams.set('order_id', paymentInfo.order_id || 'unknown');
      
      if (paymentInfo.order_status === 'Success') {
        redirectUrl.searchParams.set('status', 'success');
        redirectUrl.searchParams.set('amount', paymentInfo.amount || '0');
        redirectUrl.searchParams.set('tracking_id', paymentInfo.tracking_id || '');
      } else {
        redirectUrl.searchParams.set('status', 'failed');
        redirectUrl.searchParams.set('message', encodeURIComponent(paymentInfo.failure_message || 'Payment failed'));
      }
      
      console.log('🔀 Redirecting to:', redirectUrl.toString());
      
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
    console.error('❌ CCAvenue response processing error:', error);
    
    return NextResponse.json({
      status: false,
      message: 'Payment response processing failed',
      errors: [error.message || 'Internal server error']
    }, { status: 500 });
  }
}

// Handle GET requests (CCAvenue might redirect with query params)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const encResp = searchParams.get('encResp');
    
    console.log('GET request - encResp length:', encResp ? encResp.length : 'null');
    
    if (!encResp) {
      return NextResponse.json({
        status: false,
        message: 'Missing encrypted response in query parameters',
        errors: ['encResp parameter is required']
      }, { status: 400 });
    }
    
    // Process the same way as POST
    console.log('🔐 Processing CCAvenue encrypted response (GET):', {
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

    console.log('📥 CCAvenue response handler status (GET):', response.status);

    if (!response.ok) {
      throw new Error(`CCAvenue response handler returned status ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ CCAvenue response processed (GET):', {
      status: data.status,
      hasData: !!data.data,
      timestamp: new Date().toISOString()
    });

    // If we have valid data, redirect directly
    if (data.status && data.data) {
      const paymentInfo = data.data;
      
      // Create redirect URL based on payment status
      const redirectUrl = new URL('/payment/success', 'https://donate.svsamiti.com');
      redirectUrl.searchParams.set('order_id', paymentInfo.order_id || 'unknown');
      
      if (paymentInfo.order_status === 'Success') {
        redirectUrl.searchParams.set('status', 'success');
        redirectUrl.searchParams.set('amount', paymentInfo.amount || '0');
        redirectUrl.searchParams.set('tracking_id', paymentInfo.tracking_id || '');
      } else {
        redirectUrl.searchParams.set('status', 'failed');
        redirectUrl.searchParams.set('message', encodeURIComponent(paymentInfo.failure_message || 'Payment failed'));
      }
      
      console.log('🔀 Redirecting to (GET):', redirectUrl.toString());
      
      // For GET requests, return an actual redirect
      return NextResponse.redirect(redirectUrl.toString());
    }

    // Return error if no valid data
    return NextResponse.json({
      status: false,
      message: 'Invalid payment response data',
      errors: ['Could not process payment response']
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ CCAvenue GET response processing error:', error);
    
    // Redirect to error page
    const errorUrl = new URL('/payment/success', 'https://donate.svsamiti.com');
    errorUrl.searchParams.set('status', 'error');
    errorUrl.searchParams.set('message', encodeURIComponent(error.message || 'Payment processing failed'));
    
    return NextResponse.redirect(errorUrl.toString());
  }
}
