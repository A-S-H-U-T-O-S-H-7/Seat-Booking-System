"use client";
import { useState } from 'react';

export default function TestPayment() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testPayment = async () => {
    setLoading(true);
    setResponse('Starting test payment...');
    
    const testData = {
      orderId: 'TEST_' + Date.now(),
      amount: '10',
      billingName: 'Test User',
      billingEmail: 'test@example.com',
      billingTel: '9999999999',
      billingAddress: 'Test Address',
      isIndia: true
    };
    
    console.log('\n=== Test Payment Debug ===');
    console.log('📤 Sending request to /api/ccavenue/create-payment');
    console.log('📋 Test data:', testData);
    
    try {
      const res = await fetch('/api/ccavenue/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      console.log('📥 Response status:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ API Error:', errorText);
        setResponse(`API Error (${res.status}): ${errorText}`);
        return;
      }

      const data = await res.json();
      console.log('📦 Response data:', data);
      
      if (data.success) {
        console.log('✅ Payment request successful!');
        console.log('🔑 Access Code:', data.accessCode);
        console.log('🏪 Merchant ID:', data.merchantId);
        console.log('📊 Debug info:', data.debug);
        console.log('🔐 Encrypted request length:', data.encRequest?.length);
        
        // Create form and submit to CCAvenue
        const form = document.createElement('form');
        form.method = 'post';
        form.action = 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction';
        form.target = '_blank';

        const encInput = document.createElement('input');
        encInput.type = 'hidden';
        encInput.name = 'encRequest';
        encInput.value = data.encRequest;
        form.appendChild(encInput);

        const accInput = document.createElement('input');
        accInput.type = 'hidden';
        accInput.name = 'access_code';
        accInput.value = data.accessCode;
        form.appendChild(accInput);

        console.log('🚀 Submitting form to CCAvenue...');
        document.body.appendChild(form);
        form.submit();
        
        setResponse(`✅ SUCCESS!\n\nPayment Type: ${data.debug?.paymentType}\nMerchant ID: ${data.merchantId}\nAccess Code: ${data.accessCode}\nEncrypted Data Length: ${data.encRequest?.length}\n\nForm submitted to CCAvenue in new tab!`);
      } else {
        console.error('❌ Payment request failed:', data);
        setResponse('❌ Payment request failed:\n' + JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('❌ Network/Parse error:', error);
      setResponse('❌ Network Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Test Payment Gateway</h1>
        
        <button
          onClick={testPayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Test Payment (₹10)'}
        </button>

        {response && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium mb-2">Response:</h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{response}</pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Test Details:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Amount: ₹10</li>
            <li>Test Environment: CCAvenue Sandbox</li>
            <li>Opens in new tab for testing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
