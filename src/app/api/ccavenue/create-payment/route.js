// app/api/ccavenue/create-payment/route.js
import { NextResponse } from "next/server";
import { encrypt } from "@/lib/ccavenueCrypto";

export async function POST(req) {
  try {
    const {
      amount,
      billingName,
      billingEmail,
      billingTel,
      billingAddress,
    } = await req.json();

    // CCAvenue Keys (make sure these are stored in .env.local)
    const merchantId = process.env.CCAVENUE_MERCHANT_ID;
    const accessCode = process.env.CCAVENUE_ACCESS_CODE;
    const workingKey = process.env.CCAVENUE_WORKING_KEY;

    // Validate workingKey length (must be 16 chars)
    if (!workingKey || workingKey.length !== 16) {
      throw new Error("Invalid Working Key: Must be 16 characters.");
    }

    // Generate unique order id
    const orderId = `ORD${Date.now()}`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ccavenue/handle-response`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ccavenue/handle-response`;

    // ✅ Build merchantData string as per CCAvenue spec
    const merchantData =
      `merchant_id=${merchantId}` +
      `&order_id=${orderId}` +
      `&currency=INR` +
      `&amount=${amount}` +
      `&redirect_url=${redirectUrl}` +
      `&cancel_url=${cancelUrl}` +
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
      `&merchant_param2=${billingEmail}` +
      `&merchant_param3=${billingTel}` +
      `&merchant_param4=` +
      `&merchant_param5=`;

    console.log("Generated merchantData:", merchantData);

    // Encrypt the data using CCAvenue utils
    const encRequest = encrypt(merchantData, workingKey);

    // Return response to frontend
    return NextResponse.json({
      encRequest,
      accessCode,
      orderId,
    });
  } catch (error) {
    console.error("CCAvenue Create Payment Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
