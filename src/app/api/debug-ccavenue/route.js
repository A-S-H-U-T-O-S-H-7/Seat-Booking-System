import { encrypt } from "@/lib/ccavenueCrypto";

export const runtime = 'nodejs';

export async function POST(request) {
  console.log('\n=== CCAvenue Debug API Called ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const body = await request.json();
    console.log('📥 Request body received:', JSON.stringify(body, null, 2));
    
    const { 
      orderId = 'TEST123', 
      amount = '100', 
      billingName = 'Test User', 
      billingEmail = 'test@example.com', 
      billingTel = '9999999999',
      billingAddress = 'Test Address',
      isIndia = true 
    } = body;

    // Get credentials
    const workingKey = isIndia 
      ? process.env.CCAVENUE_INDIA_WORKING_KEY
      : process.env.CCAVENUE_FOREIGN_WORKING_KEY;
    
    const accessCode = isIndia
      ? process.env.CCAVENUE_INDIA_ACCESS_CODE
      : process.env.CCAVENUE_FOREIGN_ACCESS_CODE;
    
    const merchantId = isIndia
      ? process.env.CCAVENUE_INDIA_MERCHANT_ID
      : process.env.CCAVENUE_FOREIGN_MERCHANT_ID;

    console.log('🔑 Credentials Debug:');
    console.log('  Merchant ID:', merchantId || 'MISSING');
    console.log('  Access Code:', accessCode || 'MISSING');
    console.log('  Working Key Length:', workingKey?.length || 0);
    console.log('  Working Key Preview:', workingKey ? workingKey.substring(0, 8) + '...' : 'MISSING');

    // Validate credentials
    if (!workingKey || !accessCode || !merchantId) {
      return Response.json({ 
        error: "Missing CCAvenue credentials",
        debug: {
          workingKey: !!workingKey,
          accessCode: !!accessCode,
          merchantId: !!merchantId
        }
      }, { status: 500 });
    }

    // Validate working key format
    if (workingKey.length !== 32) {
      return Response.json({ 
        error: "Invalid working key length",
        debug: {
          expectedLength: 32,
          actualLength: workingKey.length,
          workingKeyPreview: workingKey.substring(0, 16) + '...'
        }
      }, { status: 500 });
    }

    // Create URLs
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ccavenue/payment-response`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ccavenue/payment-response`;
    
    console.log('🔗 URLs Debug:');
    console.log('  Base URL:', process.env.NEXT_PUBLIC_BASE_URL);
    console.log('  Redirect URL:', redirectUrl);
    console.log('  Cancel URL:', cancelUrl);

    // Create merchant data - EXACT format as CCAvenue expects
    const merchantParams = {
      merchant_id: merchantId,
      order_id: orderId,
      currency: 'INR',
      amount: amount,
      redirect_url: redirectUrl,
      cancel_url: cancelUrl,
      language: 'EN',
      billing_name: billingName,
      billing_email: billingEmail,
      billing_tel: billingTel,
      billing_address: billingAddress,
      billing_city: 'Delhi',
      billing_state: 'Delhi',
      billing_zip: '110001',
      billing_country: 'India',
      delivery_name: billingName,
      delivery_email: billingEmail,
      delivery_tel: billingTel,
      merchant_param1: orderId,
      promo_code: '',
      customer_identifier: ''
    };

    // Convert to query string format (key=value&key=value)
    const merchantData = Object.entries(merchantParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value || '')}`)
      .join('&');

    console.log('📦 Merchant Data Debug:');
    console.log('  Length:', merchantData.length);
    console.log('  First 200 chars:', merchantData.substring(0, 200));
    console.log('  Contains merchant_id:', merchantData.includes('merchant_id='));
    console.log('  Contains order_id:', merchantData.includes('order_id='));
    console.log('  Contains amount:', merchantData.includes('amount='));

    // Test encryption
    let encRequest;
    try {
      console.log('🔐 Starting encryption...');
      console.log('  Plain text length:', merchantData.length);
      console.log('  Working key (first 16 chars):', workingKey.substring(0, 16));
      
      encRequest = encrypt(merchantData, workingKey);
      
      console.log('✅ Encryption successful!');
      console.log('  Encrypted length:', encRequest.length);
      console.log('  Encrypted preview:', encRequest.substring(0, 50) + '...');
      
      // Test if encryption is valid base64
      const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(encRequest);
      console.log('  Is valid Base64:', isValidBase64);
      
    } catch (encryptError) {
      console.error('❌ Encryption failed:', encryptError);
      return Response.json({ 
        error: "Encryption failed",
        debug: {
          errorMessage: encryptError.message,
          workingKeyLength: workingKey?.length,
          merchantDataLength: merchantData.length
        }
      }, { status: 500 });
    }

    // Generate test form HTML for manual testing
    const testFormHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>CCAvenue Test Form</title>
</head>
<body>
    <h2>CCAvenue Test Payment Form</h2>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Amount:</strong> ₹${amount}</p>
    <p><strong>Merchant ID:</strong> ${merchantId}</p>
    <p><strong>Access Code:</strong> ${accessCode}</p>
    
    <form method="post" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction">
        <input type="hidden" name="encRequest" value="${encRequest}">
        <input type="hidden" name="access_code" value="${accessCode}">
        <button type="submit" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer;">
            Pay Now
        </button>
    </form>
    
    <h3>Debug Information:</h3>
    <p><strong>Encrypted Request Length:</strong> ${encRequest.length}</p>
    <p><strong>Encrypted Request Preview:</strong> ${encRequest.substring(0, 100)}...</p>
    <p><strong>Original Data Length:</strong> ${merchantData.length}</p>
    
    <h3>Form Data:</h3>
    <textarea rows="10" cols="80">${merchantData}</textarea>
</body>
</html>`;

    const responseData = {
      success: true,
      debug: {
        credentials: {
          merchantId,
          accessCode,
          workingKeyLength: workingKey.length,
          workingKeyPreview: workingKey.substring(0, 8) + '...'
        },
        merchantData: {
          length: merchantData.length,
          preview: merchantData.substring(0, 200),
          params: merchantParams
        },
        encryption: {
          encRequestLength: encRequest.length,
          encRequestPreview: encRequest.substring(0, 50) + '...',
          isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(encRequest)
        },
        urls: {
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
          redirectUrl,
          cancelUrl,
          ccavenueUrl: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
        },
        formValidation: {
          hasEncRequest: !!encRequest,
          hasAccessCode: !!accessCode,
          encRequestNotEmpty: encRequest && encRequest.length > 0,
          accessCodeNotEmpty: accessCode && accessCode.length > 0
        }
      },
      testData: {
        encRequest,
        accessCode,
        merchantId,
        testFormHtml
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Debug completed successfully');
    return Response.json(responseData);

  } catch (error) {
    console.error('❌ Debug API error:', error);
    return Response.json({ 
      error: "Debug API failed", 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    message: "CCAvenue Debug API",
    usage: "Send POST request with payment data to debug CCAvenue integration",
    example: {
      orderId: "TEST123",
      amount: "100",
      billingName: "Test User",
      billingEmail: "test@example.com",
      billingTel: "9999999999",
      billingAddress: "Test Address",
      isIndia: true
    }
  });
}
