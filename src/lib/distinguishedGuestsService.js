import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

const COLLECTION_NAME = 'distinguished_guests';

// Default placeholder image as base64 or use a real hosted image
const DEFAULT_PLACEHOLDER = 'https://ui-avatars.com/api/?name=Guest&size=120&background=random';

// Upload guest image
export const uploadGuestImage = async (file, guestId) => {
  try {
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `guest_${guestId}_${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, `distinguished_guests/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      success: true,
      imageUrl: downloadURL,
      imagePath: `distinguished_guests/${fileName}`
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create distinguished guest
export const createDistinguishedGuest = async (guestData) => {
  try {
    if (!guestData.name || !guestData.title || !guestData.description) {
      throw new Error('Name, title, and description are required');
    }

    const guestWithMetadata = {
      name: guestData.name.trim(),
      title: guestData.title.trim(),
      description: guestData.description.trim(),
      significance: guestData.significance?.trim() || '',
      category: guestData.category || 'spiritual',
      order: parseInt(guestData.order) || 0,
      imageUrl: guestData.imageUrl || DEFAULT_PLACEHOLDER,
      imagePath: guestData.imagePath || '',
      isActive: guestData.isActive !== undefined ? guestData.isActive : true,
      isExpected: guestData.isExpected !== undefined ? guestData.isExpected : false,
      socialLinks: guestData.socialLinks || {},
      achievements: guestData.achievements || '',
      specialNote: guestData.specialNote || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), guestWithMetadata);
    
    return {
      success: true,
      id: docRef.id,
      message: 'Distinguished guest created successfully'
    };
  } catch (error) {
    console.error('Error creating distinguished guest:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update distinguished guest
export const updateDistinguishedGuest = async (id, updateData) => {
  try {
    if (!id) {
      throw new Error('Guest ID is required');
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Guest not found');
    }

    const updateWithMetadata = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    if (updateWithMetadata.name) updateWithMetadata.name = updateWithMetadata.name.trim();
    if (updateWithMetadata.title) updateWithMetadata.title = updateWithMetadata.title.trim();
    if (updateWithMetadata.description) updateWithMetadata.description = updateWithMetadata.description.trim();
    if (updateWithMetadata.significance) updateWithMetadata.significance = updateWithMetadata.significance.trim();
    if (updateWithMetadata.order !== undefined) updateWithMetadata.order = parseInt(updateWithMetadata.order);
    if (updateWithMetadata.isActive !== undefined) {
  updateWithMetadata.isActive = Boolean(updateWithMetadata.isActive);
}
if (updateWithMetadata.isExpected !== undefined) {
  updateWithMetadata.isExpected = Boolean(updateWithMetadata.isExpected); // ADD THIS
}

    await updateDoc(docRef, updateWithMetadata);
    
    return {
      success: true,
      message: 'Distinguished guest updated successfully'
    };
  } catch (error) {
    console.error('Error updating distinguished guest:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get all distinguished guests (for admin)
export const getAllDistinguishedGuests = async (filters = {}) => {
  try {
    const constraints = [];
    
    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    
    if (filters.isActive !== undefined) {
      constraints.push(where('isActive', '==', filters.isActive));
    }
    
    const q = constraints.length > 0 
      ? query(collection(db, COLLECTION_NAME), ...constraints)
      : collection(db, COLLECTION_NAME);
    
    const querySnapshot = await getDocs(q);
    
    const guests = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unknown Guest',
        title: data.title || '',
        description: data.description || '',
        significance: data.significance || '',
        category: data.category || 'spiritual',
        imageUrl: data.imageUrl || DEFAULT_PLACEHOLDER,
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isExpected: data.isExpected !== undefined ? data.isExpected : false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        socialLinks: data.socialLinks || {},
        achievements: data.achievements || '',
        specialNote: data.specialNote || ''
      };
    });
    
    // Sort by order, then name
    guests.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    });
    
    return {
      success: true,
      data: guests
    };
  } catch (error) {
    console.error('Error fetching all guests:', error);
    
    let errorMessage = error.message;
    if (error.message?.includes('index')) {
      errorMessage = 'Database index is building. Please wait and try again.';
    }
    
    return {
      success: false,
      error: errorMessage,
      data: []
    };
  }
};

// Get guests for public display
export const getGuests = async (filters = {}) => {
  try {
    const constraints = [where('isActive', '==', true)];
    
    if (filters.category && filters.category !== 'all') {
      constraints.push(where('category', '==', filters.category));
    }
    
    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const guests = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unknown Guest',
        title: data.title || '',
        description: data.description || '',
        significance: data.significance || '',
        category: data.category || 'spiritual',
        imageUrl: data.imageUrl || DEFAULT_PLACEHOLDER,
        order: data.order || 0,
        isExpected: data.isExpected !== undefined ? data.isExpected : false,
        socialLinks: data.socialLinks || {},
        achievements: data.achievements || '',
        specialNote: data.specialNote || ''
      };
    });
    
    guests.sort((a, b) => a.order - b.order);
    
    return {
      success: true,
      data: guests
    };
  } catch (error) {
    console.error('Error fetching guests:', error);
    return {
      success: true,
      data: []
    };
  }
};

// Delete distinguished guest
export const deleteDistinguishedGuest = async (id) => {
  try {
    if (!id) {
      throw new Error('Guest ID is required');
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Guest not found');
    }

    const guestData = docSnap.data();
    
    if (guestData.imagePath) {
      try {
        const imageRef = ref(storage, guestData.imagePath);
        await deleteObject(imageRef);
      } catch (imageError) {
        console.warn('Error deleting image:', imageError);
      }
    }
    
    await deleteDoc(docRef);
    
    return {
      success: true,
      message: 'Guest deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting guest:', error);
    return {
      success: false,
      error: error.message
    };
  }
};