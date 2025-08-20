import { encrypt } from "@/lib/ccavenueCrypto";

// This API route uses Node.js runtime for crypto support
export const runtime = 'nodejs';

export async function POST(request) {
  console.log('\n=== CCAvenue Payment API Called ===');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const body = await request.json();
    console.log('📥 Request body received:', JSON.stringify(body, null, 2));
    
    const { 
      orderId, 
      amount, 
      billingName, 
      billingEmail, 
      billingTel,
      billingAddress,
      isIndia = true 
    } = body;

    console.log('🌍 Payment type:', isIndia ? 'INDIA' : 'FOREIGN');

    // Validate required fields
    if (!orderId || !amount || !billingName || !billingEmail || !billingTel) {
      console.error('❌ Missing required fields:', {
        orderId: !!orderId,
        amount: !!amount,
        billingName: !!billingName,
        billingEmail: !!billingEmail,
        billingTel: !!billingTel
      });
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Select credentials based on location
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
    console.log('  Working Key:', workingKey ? `SET (${workingKey.length} chars, preview: ${workingKey.substring(0, 8)}...)` : 'MISSING');
    console.log('  Environment vars loaded from:', isIndia ? 'INDIA' : 'FOREIGN', 'credentials');

    // Validate environment variables
    if (!workingKey || !accessCode || !merchantId) {
      console.error('Missing CCAvenue environment variables:', {
        workingKey: !!workingKey,
        accessCode: !!accessCode,
        merchantId: !!merchantId
      });
      return Response.json({ error: "Payment configuration error" }, { status: 500 });
    }

    // Create merchant data string
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ccavenue/payment-response`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ccavenue/payment-response`;
    
    console.log('🔗 URLs Debug:');
    console.log('  Base URL:', process.env.NEXT_PUBLIC_BASE_URL);
    console.log('  Redirect URL:', redirectUrl);
    console.log('  Cancel URL:', cancelUrl);
    console.log('  CCAvenue PRODUCTION URL: https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction');
    
    const merchantData = [
      `merchant_id=${merchantId}`,
      `order_id=${orderId}`,
      `currency=INR`,
      `amount=${amount}`,
      `redirect_url=${redirectUrl}`,
      `cancel_url=${cancelUrl}`,
      `language=EN`,
      `billing_name=${billingName}`,
      `billing_email=${billingEmail}`,
      `billing_tel=${billingTel}`,
      `billing_address=${billingAddress || 'N/A'}`,
      `billing_city=Delhi`,
      `billing_state=Delhi`,
      `billing_zip=110001`,
      `billing_country=India`,
      `delivery_name=${billingName}`,
      `delivery_email=${billingEmail}`,
      `delivery_tel=${billingTel}`,
      `merchant_param1=${orderId}`, // Store booking ID for reference
      `promo_code=`,
      `customer_identifier=`
    ].join('&');

    console.log('📦 Merchant Data (first 200 chars):', merchantData.substring(0, 200) + '...');
    console.log('📦 Full merchant data length:', merchantData.length, 'characters');

    // Encrypt the merchant data
    console.log('🔐 Starting encryption with working key...');
    let encRequest;
    try {
      encRequest = encrypt(merchantData, workingKey);
      console.log('✅ Encryption successful! Encrypted data length:', encRequest.length);
      console.log('🔐 Encrypted request preview:', encRequest.substring(0, 50) + '...');
    } catch (encryptError) {
      console.error('❌ Encryption failed:', encryptError);
      console.error('   Working key length:', workingKey?.length);
      console.error('   Working key preview:', workingKey?.substring(0, 16) + '...');
      return Response.json({ error: "Payment encryption failed" }, { status: 500 });
    }

    const responseData = {
      encRequest,
      accessCode,
      merchantId,
      success: true,
      debug: {
        paymentType: isIndia ? 'INDIA' : 'FOREIGN',
        merchantDataLength: merchantData.length,
        encRequestLength: encRequest.length,
        timestamp: new Date().toISOString()
      }
    };

    console.log('✅ Payment request created successfully!');
    console.log('📤 Response data (without encRequest):', {
      accessCode: responseData.accessCode,
      merchantId: responseData.merchantId,
      success: responseData.success,
      debug: responseData.debug
    });

    return Response.json(responseData);

  } catch (error) {
    console.error('Payment creation error:', error);
    return Response.json({ error: "Payment creation failed" }, { status: 500 });
  }
}
