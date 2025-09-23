// Direct redirect handler for CCAvenue - handles both GET and POST redirects
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const encResp = searchParams.get('encResp');
    
    console.log('Direct GET redirect - encResp length:', encResp ? encResp.length : 'null');
    
    if (encResp) {
      // Process via our response API
      const processedUrl = new URL('/payment/status', 'https://donate.svsamiti.com');
      processedUrl.searchParams.set('encResp', encResp);
      
      return NextResponse.redirect(processedUrl.toString());
    }
    
    // No encrypted response, redirect to generic success page
    const errorUrl = new URL('/payment/success', 'https://donate.svsamiti.com');
    errorUrl.searchParams.set('status', 'error');
    errorUrl.searchParams.set('message', 'No payment response received');
    
    return NextResponse.redirect(errorUrl.toString());
    
  } catch (error) {
    console.error('❌ Redirect GET error:', error);
    
    const errorUrl = new URL('/payment/success', 'https://donate.svsamiti.com');
    errorUrl.searchParams.set('status', 'error');
    errorUrl.searchParams.set('message', encodeURIComponent(error.message || 'Redirect failed'));
    
    return NextResponse.redirect(errorUrl.toString());
  }
}

export async function POST(request) {
  try {
    let encResp;
    
    // Try to get the content type
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Handle form data (typical for CCAvenue)
      const formData = await request.formData();
      encResp = formData.get('encResp');
    } else {
      // Fallback: try to parse as text and extract encResp
      const text = await request.text();
      console.log('Raw redirect POST body:', text);
      
      if (text.includes('encResp=')) {
        const urlParams = new URLSearchParams(text);
        encResp = urlParams.get('encResp');
      }
    }
    
    console.log('Direct POST redirect - encResp length:', encResp ? encResp.length : 'null');
    
    if (encResp) {
      // Redirect to our status page with the encrypted response
      const processedUrl = new URL('/payment/status', 'https://donate.svsamiti.com');
      processedUrl.searchParams.set('encResp', encResp);
      
      return NextResponse.redirect(processedUrl.toString());
    }
    
    // No encrypted response, redirect to generic success page
    const errorUrl = new URL('/payment/success', 'https://donate.svsamiti.com');
    errorUrl.searchParams.set('status', 'error');
    errorUrl.searchParams.set('message', 'No payment response received');
    
    return NextResponse.redirect(errorUrl.toString());
    
  } catch (error) {
    console.error('❌ Redirect POST error:', error);
    
    const errorUrl = new URL('/payment/success', 'https://donate.svsamiti.com');
    errorUrl.searchParams.set('status', 'error');
    errorUrl.searchParams.set('message', encodeURIComponent(error.message || 'Redirect failed'));
    
    return NextResponse.redirect(errorUrl.toString());
  }
}
