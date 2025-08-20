export async function GET() {
  console.log('=== CCAvenue Environment Variables Test ===');
  
  const envVars = {
    // India credentials
    INDIA_MERCHANT_ID: process.env.CCAVENUE_INDIA_MERCHANT_ID,
    INDIA_ACCESS_CODE: process.env.CCAVENUE_INDIA_ACCESS_CODE,
    INDIA_WORKING_KEY: process.env.CCAVENUE_INDIA_WORKING_KEY,
    
    // Foreign credentials
    FOREIGN_MERCHANT_ID: process.env.CCAVENUE_FOREIGN_MERCHANT_ID,
    FOREIGN_ACCESS_CODE: process.env.CCAVENUE_FOREIGN_ACCESS_CODE,
    FOREIGN_WORKING_KEY: process.env.CCAVENUE_FOREIGN_WORKING_KEY,
    
    // Base URL
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
  };

  console.log('Environment Variables Check:');
  console.log('INDIA_MERCHANT_ID:', envVars.INDIA_MERCHANT_ID ? 'SET' : 'MISSING');
  console.log('INDIA_ACCESS_CODE:', envVars.INDIA_ACCESS_CODE ? 'SET' : 'MISSING');
  console.log('INDIA_WORKING_KEY:', envVars.INDIA_WORKING_KEY ? `SET (${envVars.INDIA_WORKING_KEY?.length} chars)` : 'MISSING');
  console.log('FOREIGN_MERCHANT_ID:', envVars.FOREIGN_MERCHANT_ID ? 'SET' : 'MISSING');
  console.log('FOREIGN_ACCESS_CODE:', envVars.FOREIGN_ACCESS_CODE ? 'SET' : 'MISSING');
  console.log('FOREIGN_WORKING_KEY:', envVars.FOREIGN_WORKING_KEY ? `SET (${envVars.FOREIGN_WORKING_KEY?.length} chars)` : 'MISSING');
  console.log('BASE_URL:', envVars.BASE_URL);

  // Validate working key lengths
  const indiaKeyValid = envVars.INDIA_WORKING_KEY?.length === 32;
  const foreignKeyValid = envVars.FOREIGN_WORKING_KEY?.length === 32;

  const response = {
    message: 'CCAvenue Environment Variables Test',
    timestamp: new Date().toISOString(),
    credentials: {
      india: {
        merchantId: envVars.INDIA_MERCHANT_ID || 'MISSING',
        accessCode: envVars.INDIA_ACCESS_CODE || 'MISSING',
        workingKeySet: !!envVars.INDIA_WORKING_KEY,
        workingKeyLength: envVars.INDIA_WORKING_KEY?.length || 0,
        workingKeyValid: indiaKeyValid,
        workingKeyPreview: envVars.INDIA_WORKING_KEY ? envVars.INDIA_WORKING_KEY.substring(0, 8) + '...' : 'MISSING'
      },
      foreign: {
        merchantId: envVars.FOREIGN_MERCHANT_ID || 'MISSING',
        accessCode: envVars.FOREIGN_ACCESS_CODE || 'MISSING',
        workingKeySet: !!envVars.FOREIGN_WORKING_KEY,
        workingKeyLength: envVars.FOREIGN_WORKING_KEY?.length || 0,
        workingKeyValid: foreignKeyValid,
        workingKeyPreview: envVars.FOREIGN_WORKING_KEY ? envVars.FOREIGN_WORKING_KEY.substring(0, 8) + '...' : 'MISSING'
      }
    },
    urls: {
      baseUrl: envVars.BASE_URL,
      testCCAvenue: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
      prodCCAvenue: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
      redirectUrl: `${envVars.BASE_URL}/api/ccavenue/payment-response`,
      cancelUrl: `${envVars.BASE_URL}/api/ccavenue/payment-response`
    },
    validation: {
      allIndiaCredsSet: !!(envVars.INDIA_MERCHANT_ID && envVars.INDIA_ACCESS_CODE && envVars.INDIA_WORKING_KEY),
      allForeignCredsSet: !!(envVars.FOREIGN_MERCHANT_ID && envVars.FOREIGN_ACCESS_CODE && envVars.FOREIGN_WORKING_KEY),
      indiaWorkingKeyValid: indiaKeyValid,
      foreignWorkingKeyValid: foreignKeyValid,
      baseUrlSet: !!envVars.BASE_URL
    }
  };

  return Response.json(response, { status: 200 });
}
