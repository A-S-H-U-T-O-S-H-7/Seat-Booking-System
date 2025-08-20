import { createCipheriv, createDecipheriv, createHash } from "crypto";

export function encrypt(plainText, workingKey) {
  try {
    console.log('🔐 CCAvenue Encrypt - Starting...');
    console.log('  Plain text length:', plainText.length);
    console.log('  Working key length:', workingKey.length);
    console.log('  Working key preview:', workingKey.substring(0, 8) + '...');
    
    // CCAvenue uses MD5 hash of working key for AES encryption
    const keyHash = createHash('md5').update(workingKey, 'utf8').digest();
    console.log('  Key hash length:', keyHash.length);
    
    // Use the working key as IV (first 16 bytes)
    const iv = Buffer.from(workingKey.substring(0, 16), 'utf8');
    console.log('  IV length:', iv.length);
    
    const cipher = createCipheriv('aes-128-cbc', keyHash, iv);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    console.log('✅ CCAvenue Encrypt - Success!');
    console.log('  Encrypted length:', encrypted.length);
    console.log('  Encrypted preview:', encrypted.substring(0, 50) + '...');
    
    return encrypted;
  } catch (error) {
    console.error('❌ CCAvenue Encrypt - Error:', error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

export function decrypt(encText, workingKey) {
  try {
    console.log('🔓 CCAvenue Decrypt - Starting...');
    console.log('  Encrypted text length:', encText.length);
    console.log('  Working key length:', workingKey.length);
    
    // CCAvenue uses MD5 hash of working key for AES decryption
    const keyHash = createHash('md5').update(workingKey, 'utf8').digest();
    
    // Use the working key as IV (first 16 bytes)
    const iv = Buffer.from(workingKey.substring(0, 16), 'utf8');
    
    const decipher = createDecipheriv('aes-128-cbc', keyHash, iv);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    console.log('✅ CCAvenue Decrypt - Success!');
    console.log('  Decrypted length:', decrypted.length);
    
    return decrypted;
  } catch (error) {
    console.error('❌ CCAvenue Decrypt - Error:', error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
}
