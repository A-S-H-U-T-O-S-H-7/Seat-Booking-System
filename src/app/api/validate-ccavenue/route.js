export const runtime = 'nodejs';

export async function GET() {
  console.log('\n=== CCAvenue Credentials Validation ===');
  
  // Check all environment variables
  const credentials = {
    india: {
      merchantId: process.env.CCAVENUE_INDIA_MERCHANT_ID,
      accessCode: process.env.CCAVENUE_INDIA_ACCESS_CODE,
      workingKey: process.env.CCAVENUE_INDIA_WORKING_KEY
    },
    foreign: {
      merchantId: process.env.CCAVENUE_FOREIGN_MERCHANT_ID,
      accessCode: process.env.CCAVENUE_FOREIGN_ACCESS_CODE,
      workingKey: process.env.CCAVENUE_FOREIGN_WORKING_KEY
    },
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL
  };

  // Validation results
  const validation = {
    india: {
      merchantIdValid: !!(credentials.india.merchantId && credentials.india.merchantId.length > 0),
      accessCodeValid: !!(credentials.india.accessCode && credentials.india.accessCode.length > 0),
      workingKeyValid: !!(credentials.india.workingKey && credentials.india.workingKey.length === 32),
      workingKeyLength: credentials.india.workingKey?.length || 0,
      workingKeyFormat: credentials.india.workingKey ? /^[A-Fa-f0-9]{32}$/.test(credentials.india.workingKey) : false
    },
    foreign: {
      merchantIdValid: !!(credentials.foreign.merchantId && credentials.foreign.merchantId.length > 0),
      accessCodeValid: !!(credentials.foreign.accessCode && credentials.foreign.accessCode.length > 0),
      workingKeyValid: !!(credentials.foreign.workingKey && credentials.foreign.workingKey.length === 32),
      workingKeyLength: credentials.foreign.workingKey?.length || 0,
      workingKeyFormat: credentials.foreign.workingKey ? /^[A-Fa-f0-9]{32}$/.test(credentials.foreign.workingKey) : false
    },
    baseUrlValid: !!(credentials.baseUrl && credentials.baseUrl.startsWith('http'))
  };

  // Issues detection
  const issues = [];
  
  if (!validation.india.merchantIdValid) {
    issues.push('India Merchant ID is missing or invalid');
  }
  if (!validation.india.accessCodeValid) {
    issues.push('India Access Code is missing or invalid');
  }
  if (!validation.india.workingKeyValid) {
    issues.push(`India Working Key is invalid (length: ${validation.india.workingKeyLength}, expected: 32)`);
  }
  if (!validation.india.workingKeyFormat) {
    issues.push('India Working Key format is invalid (should be 32 hexadecimal characters)');
  }
  
  if (!validation.baseUrlValid) {
    issues.push('Base URL is missing or invalid');
  }

  console.log('Validation Results:');
  console.log('India Merchant ID:', validation.india.merchantIdValid ? '✅' : '❌');
  console.log('India Access Code:', validation.india.accessCodeValid ? '✅' : '❌');
  console.log('India Working Key:', validation.india.workingKeyValid ? '✅' : '❌');
  console.log('India Working Key Format:', validation.india.workingKeyFormat ? '✅' : '❌');
  console.log('Base URL:', validation.baseUrlValid ? '✅' : '❌');

  const allValid = validation.india.merchantIdValid && 
                  validation.india.accessCodeValid && 
                  validation.india.workingKeyValid && 
                  validation.india.workingKeyFormat && 
                  validation.baseUrlValid;

  return Response.json({
    status: allValid ? 'valid' : 'invalid',
    message: allValid ? 'All CCAvenue credentials are valid' : 'Some CCAvenue credentials are invalid',
    validation,
    issues,
    recommendations: [
      'Ensure working key is exactly 32 hexadecimal characters',
      'Verify merchant ID is numeric',
      'Check access code format',
      'Confirm base URL starts with http or https'
    ],
    credentials: {
      india: {
        merchantId: credentials.india.merchantId || 'MISSING',
        accessCode: credentials.india.accessCode || 'MISSING',
        workingKeyPreview: credentials.india.workingKey ? 
          credentials.india.workingKey.substring(0, 8) + '...' + credentials.india.workingKey.substring(24) : 'MISSING'
      },
      baseUrl: credentials.baseUrl || 'MISSING'
    },
    timestamp: new Date().toISOString()
  });
}
