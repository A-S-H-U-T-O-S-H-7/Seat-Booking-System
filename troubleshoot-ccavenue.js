// Run this script with: node troubleshoot-ccavenue.js
// This will help identify all CCAvenue issues

import { encrypt } from './src/lib/ccavenueCrypto.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 CCAvenue Complete Troubleshooting\n');

// 1. Check environment variables
console.log('1️⃣ ENVIRONMENT VARIABLES CHECK:');
const envVars = {
  merchantId: process.env.CCAVENUE_INDIA_MERCHANT_ID,
  accessCode: process.env.CCAVENUE_INDIA_ACCESS_CODE,
  workingKey: process.env.CCAVENUE_INDIA_WORKING_KEY,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL
};

console.log(`✅ Merchant ID: ${envVars.merchantId ? 'SET (' + envVars.merchantId + ')' : '❌ MISSING'}`);
console.log(`✅ Access Code: ${envVars.accessCode ? 'SET (' + envVars.accessCode + ')' : '❌ MISSING'}`);
console.log(`✅ Working Key: ${envVars.workingKey ? 'SET (length: ' + envVars.workingKey.length + ')' : '❌ MISSING'}`);
console.log(`✅ Base URL: ${envVars.baseUrl ? 'SET (' + envVars.baseUrl + ')' : '❌ MISSING'}`);

// 2. Working Key Validation
console.log('\n2️⃣ WORKING KEY VALIDATION:');
if (envVars.workingKey) {
  const isCorrectLength = envVars.workingKey.length === 32;
  const isHexFormat = /^[A-Fa-f0-9]{32}$/.test(envVars.workingKey);
  
  console.log(`Length check: ${isCorrectLength ? '✅' : '❌'} (${envVars.workingKey.length}/32)`);
  console.log(`Format check: ${isHexFormat ? '✅' : '❌'} (should be 32 hex chars)`);
  console.log(`Preview: ${envVars.workingKey.substring(0, 8)}...${envVars.workingKey.substring(24)}`);
  
  if (!isCorrectLength || !isHexFormat) {
    console.log('❌ ISSUE: Working key format is invalid!');
  }
} else {
  console.log('❌ CRITICAL: Working key is missing!');
}

// 3. Test encryption with sample data
console.log('\n3️⃣ ENCRYPTION TEST:');
if (envVars.workingKey) {
  try {
    const testData = `merchant_id=${envVars.merchantId}&order_id=TEST123&currency=INR&amount=100&redirect_url=${envVars.baseUrl}/api/ccavenue/payment-response&cancel_url=${envVars.baseUrl}/api/ccavenue/payment-response&language=EN&billing_name=Test User&billing_email=test@example.com&billing_tel=9999999999&billing_address=Test Address&billing_city=Delhi&billing_state=Delhi&billing_zip=110001&billing_country=India`;
    
    console.log(`Test data length: ${testData.length}`);
    console.log(`Test data preview: ${testData.substring(0, 100)}...`);
    
    const encrypted = encrypt(testData, envVars.workingKey);
    
    console.log('✅ Encryption successful!');
    console.log(`Encrypted length: ${encrypted.length}`);
    console.log(`Encrypted preview: ${encrypted.substring(0, 50)}...`);
    
    // Check if encrypted data is valid base64
    const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(encrypted);
    console.log(`Base64 valid: ${isValidBase64 ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log('❌ ENCRYPTION FAILED:', error.message);
  }
} else {
  console.log('❌ Cannot test encryption - working key missing');
}

// 4. Common Issues Check
console.log('\n4️⃣ COMMON ISSUES CHECK:');

const issues = [];

// Check for whitespace in credentials
if (envVars.workingKey && (envVars.workingKey.includes(' ') || envVars.workingKey.includes('\t'))) {
  issues.push('Working key contains whitespace characters');
}

if (envVars.accessCode && (envVars.accessCode.includes(' ') || envVars.accessCode.includes('\t'))) {
  issues.push('Access code contains whitespace characters');
}

// Check URL format
if (envVars.baseUrl && !envVars.baseUrl.startsWith('http')) {
  issues.push('Base URL does not start with http/https');
}

// Check for localhost in production
if (envVars.baseUrl && envVars.baseUrl.includes('localhost')) {
  issues.push('Using localhost URL (this won\'t work for CCAvenue callbacks in production)');
}

if (issues.length > 0) {
  console.log('❌ ISSUES FOUND:');
  issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue}`);
  });
} else {
  console.log('✅ No common issues detected');
}

// 5. Form data validation
console.log('\n5️⃣ FORM DATA VALIDATION:');
const requiredFields = [
  'merchant_id',
  'order_id', 
  'currency',
  'amount',
  'redirect_url',
  'cancel_url'
];

console.log('Required fields for CCAvenue:');
requiredFields.forEach(field => {
  console.log(`  ✅ ${field}`);
});

// 6. Recommendations
console.log('\n6️⃣ RECOMMENDATIONS:');
console.log('1. Ensure working key is exactly 32 hexadecimal characters');
console.log('2. Remove any spaces or special characters from credentials');
console.log('3. For production, use a public domain (not localhost)');
console.log('4. Test with minimal data first');
console.log('5. Check CCAvenue dashboard for any account issues');
console.log('6. Verify merchant account is active and configured for your domain');

console.log('\n🎯 NEXT STEPS:');
console.log('1. If all checks pass, the issue might be with CCAvenue account settings');
console.log('2. Try testing with CCAvenue test credentials first');
console.log('3. Contact CCAvenue support with your merchant ID if issues persist');
console.log('4. Check if your domain is whitelisted in CCAvenue dashboard');
