const crypto = require("crypto");

// FIXED: Proper key derivation for CCAvenue
const deriveKey = (workingKey) => {
  return crypto.createHash("md5").update(workingKey, "utf8").digest();
};

// FIXED: Use proper IV (16 zero bytes)
const IV = Buffer.alloc(16, 0);

function encrypt(plainText, workingKey) {
  try {
    console.log('🔐 Encrypting with working key length:', workingKey?.length);
    
    if (!workingKey || workingKey.length !== 32) {
      throw new Error(`Invalid working key length: ${workingKey?.length}, expected 32`);
    }
    
    if (!plainText) {
      throw new Error('Plain text is empty');
    }
    
    const key = deriveKey(workingKey);
    console.log('🔑 Derived key length:', key.length);
    
    const cipher = crypto.createCipheriv("aes-128-cbc", key, IV);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(plainText, "utf8", "base64");
    encrypted += cipher.final("base64");
    
    console.log('✅ Encryption completed, result length:', encrypted.length);
    
    return encrypted;
    
  } catch (error) {
    console.error('❌ Encryption error:', error.message);
    throw error;
  }
}

function decrypt(encBase64, workingKey) {
  try {
    console.log('🔓 Decrypting with working key length:', workingKey?.length);
    
    if (!workingKey || workingKey.length !== 32) {
      throw new Error(`Invalid working key length: ${workingKey?.length}, expected 32`);
    }
    
    if (!encBase64) {
      throw new Error('Encrypted data is empty');
    }
    
    const key = deriveKey(workingKey);
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, IV);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encBase64, "base64", "utf8");
    decrypted += decipher.final("utf8");
    
    console.log('✅ Decryption completed');
    
    return decrypted;
    
  } catch (error) {
    console.error('❌ Decryption error:', error.message);
    throw error;
  }
}

module.exports = { encrypt, decrypt };