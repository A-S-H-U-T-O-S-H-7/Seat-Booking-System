import { createHash, createCipheriv, createDecipheriv } from "crypto";

/**
 * CCAvenue Crypto Utilities for Next.js
 * Uses proper AES-128-CBC encryption as required by CCAvenue
 */

// FIXED: Proper key derivation for CCAvenue
const deriveKey = (workingKey) => {
  return createHash("md5").update(workingKey, "utf8").digest();
};

// FIXED: Use working key first 16 bytes as IV (CCAvenue standard)
const getIV = (workingKey) => {
  return Buffer.from(workingKey.substring(0, 16), 'utf8');
};

export function encrypt(plainText, workingKey) {
  try {
    console.log('🔐 CCAvenue Encrypt - Starting...');
    console.log('  Plain text length:', plainText?.length || 0);
    console.log('  Working key length:', workingKey?.length || 0);
    console.log('  Working key preview:', workingKey ? workingKey.substring(0, 8) + '...' : 'MISSING');
    
    // Support both 16-char ASCII and 32-char hex working keys
    const isValidKey = workingKey && (workingKey.length === 16 || workingKey.length === 32);
    if (!isValidKey) {
      throw new Error(`Invalid working key length: ${workingKey?.length || 0}, expected 16 (ASCII) or 32 (hex)`);
    }
    
    const keyType = workingKey.length === 16 ? 'ASCII (legacy)' : 'hex (modern)';
    console.log(`  Working key type: ${workingKey.length}-char ${keyType}`);
    
    if (!plainText || plainText.length === 0) {
      throw new Error('Plain text is empty or invalid');
    }
    
    // CCAvenue uses MD5 hash of working key for AES encryption
    const key = deriveKey(workingKey);
    const iv = getIV(workingKey);
    
    console.log('  Key hash length:', key.length);
    console.log('  IV length:', iv.length);
    
    const cipher = createCipheriv("aes-128-cbc", key, iv);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(plainText, "utf8", "base64");
    encrypted += cipher.final("base64");
    
    console.log('✅ CCAvenue Encrypt - Success!');
    console.log('  Encrypted length:', encrypted.length);
    console.log('  Encrypted preview:', encrypted.substring(0, 50) + '...');
    
    return encrypted;
    
  } catch (error) {
    console.error('❌ CCAvenue Encrypt - Error:', error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

export function decrypt(encBase64, workingKey) {
  try {
    console.log('🔓 CCAvenue Decrypt - Starting...');
    console.log('  Encrypted text length:', encBase64?.length || 0);
    console.log('  Working key length:', workingKey?.length || 0);
    
    // Support both 16-char ASCII and 32-char hex working keys
    const isValidKey = workingKey && (workingKey.length === 16 || workingKey.length === 32);
    if (!isValidKey) {
      throw new Error(`Invalid working key length: ${workingKey?.length || 0}, expected 16 (ASCII) or 32 (hex)`);
    }
    
    const keyType = workingKey.length === 16 ? 'ASCII (legacy)' : 'hex (modern)';
    console.log(`  Working key type: ${workingKey.length}-char ${keyType}`);
    
    if (!encBase64 || encBase64.length === 0) {
      throw new Error('Encrypted data is empty or invalid');
    }
    
    // CCAvenue uses MD5 hash of working key for AES decryption
    const key = deriveKey(workingKey);
    const iv = getIV(workingKey);
    
    const decipher = createDecipheriv("aes-128-cbc", key, iv);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encBase64, "base64", "utf8");
    decrypted += decipher.final("utf8");
    
    console.log('✅ CCAvenue Decrypt - Success!');
    console.log('  Decrypted length:', decrypted.length);
    
    return decrypted;
    
  } catch (error) {
    console.error('❌ CCAvenue Decrypt - Error:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
}
