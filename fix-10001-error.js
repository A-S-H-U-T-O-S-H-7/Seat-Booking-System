// Fix CCAvenue 10001 Error - Run with: node fix-10001-error.js
import { encrypt } from './src/lib/ccavenueCrypto.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

console.log('🎯 Fixing CCAvenue 10001 Error\n');

const merchantId = process.env.CCAVENUE_INDIA_MERCHANT_ID;
const accessCode = process.env.CCAVENUE_INDIA_ACCESS_CODE;
const workingKey = process.env.CCAVENUE_INDIA_WORKING_KEY;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Create minimal test payload - exact format CCAvenue expects
const orderId = 'FIX_' + Date.now();
const merchantData = `merchant_id=${merchantId}&order_id=${orderId}&currency=INR&amount=100&redirect_url=${baseUrl}/api/ccavenue/payment-response&cancel_url=${baseUrl}/api/ccavenue/payment-response&language=EN&billing_name=Test User&billing_email=test@example.com&billing_tel=9999999999&billing_address=Test Address&billing_city=Delhi&billing_state=Delhi&billing_zip=110001&billing_country=India&delivery_name=Test User&delivery_email=test@example.com&delivery_tel=9999999999&merchant_param1=${orderId}&promo_code=&customer_identifier=`;

console.log('📦 Merchant Data:', merchantData.substring(0, 100) + '...');

try {
    const encRequest = encrypt(merchantData, workingKey);
    console.log('✅ Encryption successful!');
    console.log('📏 Length:', encRequest.length);
    
    // Create working test form
    const testForm = `<!DOCTYPE html>
<html><head><title>Fix 10001 Error</title></head><body>
<h2>🎯 CCAvenue 10001 Fix Test</h2>
<p>Order: ${orderId} | Amount: ₹100</p>
<form method="post" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction">
<input type="hidden" name="encRequest" value="${encRequest}">
<input type="hidden" name="access_code" value="${accessCode}">
<button type="submit" style="background:#28a745;color:white;padding:15px 30px;border:none;cursor:pointer;font-size:16px;">
🚀 TEST CCAvenue Payment</button>
</form>
<div style="margin-top:20px;padding:15px;background:#f8f9fa;">
<h3>Debug Info:</h3>
<p>Merchant: ${merchantId} | Access: ${accessCode}</p>
<p>Encrypted Length: ${encRequest.length} | Valid Base64: ${/^[A-Za-z0-9+/]*={0,2}$/.test(encRequest) ? 'Yes' : 'No'}</p>
</div></body></html>`;

    fs.writeFileSync('./public/fix-10001.html', testForm);
    console.log('✅ Test form created: public/fix-10001.html');
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Start server: npm run dev');
    console.log('2. Open: http://localhost:3000/fix-10001.html');
    console.log('3. Click "TEST CCAvenue Payment"');
    console.log('4. If still 10001 error → Check CCAvenue dashboard domain settings');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.log('🔧 Check: Working key format and environment variables');
}
