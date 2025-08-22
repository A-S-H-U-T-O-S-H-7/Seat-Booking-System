import { encrypt } from "@/lib/ccavenueCrypto";
import { NextResponse } from "next/server";

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

    // FIXED: Use correct environment variable names
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

    // FIXED: Validate workingKey length (supports both 16-ASCII and 32-hex formats)
    const isValidWorkingKey = workingKey && (workingKey.length === 16 || workingKey.length === 32);
    if (!isValidWorkingKey) {
      console.error('❌ Invalid working key length:', workingKey?.length);
      console.error('   Expected: 16 chars (ASCII) or 32 chars (hex)');
      return Response.json({ 
        error: "Invalid Working Key: Must be 16 ASCII characters or 32 hexadecimal characters.",
        debug: { 
          workingKeyLength: workingKey?.length,
          expectedFormats: ['16 ASCII chars', '32 hex chars']
        }
      }, { status: 500 });
    }
    
    console.log('✅ Working key format:', workingKey.length === 16 ? '16-char ASCII (legacy)' : '32-char hex (modern)');

    // Validate environment variables
    if (!merchantId || !accessCode) {
      console.error('❌ Missing CCAvenue environment variables');
      return Response.json({ error: "Payment configuration error" }, { status: 500 });
    }

    // FIXED: Use absolute URLs with proper encoding
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://donate.svsamiti.com';
    const redirectUrl = `${baseUrl}/api/ccavenue/payment-response`;
    const cancelUrl = `${baseUrl}/api/ccavenue/payment-response`;
    
    console.log('🌐 URL Configuration:');
    console.log('  Base URL:', baseUrl);
    console.log('  Redirect URL:', redirectUrl);
    console.log('  Cancel URL:', cancelUrl);

    // ✅ Build merchantData string as per CCAvenue spec - FIXED: Properly encode URLs
    const merchantData =
      `merchant_id=${merchantId}` +
      `&order_id=${orderId}` +
      `&currency=INR` +
      `&amount=${amount}` +
      `&redirect_url=${encodeURIComponent(redirectUrl)}` +
      `&cancel_url=${encodeURIComponent(cancelUrl)}` +
      `&language=EN` +
      `&billing_name=${encodeURIComponent(billingName)}` +
      `&billing_address=${encodeURIComponent(billingAddress || "N/A")}` +
      `&billing_city=Delhi` +
      `&billing_state=Delhi` +
      `&billing_zip=110001` +
      `&billing_country=India` +
      `&billing_tel=${billingTel}` +
      `&billing_email=${encodeURIComponent(billingEmail)}` +
      `&delivery_name=${encodeURIComponent(billingName)}` +
      `&delivery_address=${encodeURIComponent(billingAddress || "N/A")}` +
      `&delivery_city=Delhi` +
      `&delivery_state=Delhi` +
      `&delivery_zip=110001` +
      `&delivery_country=India` +
      `&delivery_tel=${billingTel}` +
      `&merchant_param1=${orderId}` +
      `&merchant_param2=${encodeURIComponent(billingEmail)}` +
      `&merchant_param3=${billingTel}` +
      `&merchant_param4=` +
      `&merchant_param5=`;
    
    console.log('🔍 Merchant Data Debug:');
    console.log('  Redirect URL (encoded):', encodeURIComponent(redirectUrl));
    console.log('  Cancel URL (encoded):', encodeURIComponent(cancelUrl));
    console.log('  Full merchant data length:', merchantData.length);

    console.log("Generated merchantData:", merchantData);

    // Encrypt the data using CCAvenue utils
    const encRequest = encrypt(merchantData, workingKey);

    console.log('✅ Payment request created successfully!');
    
    // Return response to frontend with success flag
    return NextResponse.json({
      success: true,
      encRequest,
      accessCode,
      orderId,
      merchantId,
      debug: {
        paymentType: isIndia ? 'INDIA' : 'FOREIGN',
        merchantDataLength: merchantData.length,
        encRequestLength: encRequest.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("CCAvenue Create Payment Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
