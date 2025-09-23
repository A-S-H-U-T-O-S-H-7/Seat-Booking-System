import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'react-hot-toast';

/**
 * Upload delegate image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} delegateId - Unique delegate ID for organizing storage
 * @param {Function} onProgress - Callback for upload progress (optional)
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadDelegateImage = async (file, delegateId, onProgress = null) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 5MB');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed');
    }

    // Create unique file name with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileName = `delegate_${delegateId}_${timestamp}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `delegates/images/${fileName}`);
    
    console.log('🔥 Uploading delegate image to Firebase Storage:', fileName);

    // Upload file
    const uploadResult = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    console.log('✅ Delegate image uploaded successfully:', downloadURL);
    
    return {
      success: true,
      url: downloadURL,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type
    };

  } catch (error) {
    console.error('❌ Error uploading delegate image:', error);
    
    let errorMessage = 'Failed to upload image';
    
    if (error.code === 'storage/unauthorized') {
      errorMessage = 'You do not have permission to upload images';
    } else if (error.code === 'storage/quota-exceeded') {
      errorMessage = 'Storage quota exceeded. Please try again later';
    } else if (error.code === 'storage/invalid-format') {
      errorMessage = 'Invalid image format. Please use JPEG, PNG, or WebP';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Delete delegate image from Firebase Storage
 * @param {string} imageUrl - The download URL of the image to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteDelegateImage = async (imageUrl) => {
  try {
    if (!imageUrl) {
      return { success: true }; // Nothing to delete
    }

    // Extract the file path from the download URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid image URL format');
    }
    
    const filePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, filePath);
    
    console.log('🗑️ Deleting delegate image from Firebase Storage:', filePath);
    
    await deleteObject(storageRef);
    
    console.log('✅ Delegate image deleted successfully');
    
    return { success: true };

  } catch (error) {
    console.error('❌ Error deleting delegate image:', error);
    
    // Don't throw error for delete operations, just log it
    return {
      success: false,
      error: error.message || 'Failed to delete image'
    };
  }
};

/**
 * Validate image file before upload
 * @param {File} file - The image file to validate
 * @returns {{isValid: boolean, error?: string}}
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file size (max 5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  // Check if it's actually an image by trying to read it
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ isValid: true });
    };
    img.onerror = () => {
      resolve({ isValid: false, error: 'Invalid image file' });
    };
    img.src = URL.createObjectURL(file);
  });
};
