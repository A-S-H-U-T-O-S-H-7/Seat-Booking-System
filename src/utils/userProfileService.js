// src/utils/userProfileService.js
import { collection, query, where, getDocs, limit, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Fetches and aggregates user profile information from booking history
 * @param {string} userId - Firebase auth user ID
 * @returns {Promise<Object>} Aggregated user profile data
 */
export async function fetchUserProfileData(userId) {
  try {
    const userProfile = {
      email: null,
      name: null,
      phone: null,
      aadhar: null,
      address: null,
      emergencyContact: null,
      bookingHistory: {
        totalBookings: 0,
        havanBookings: 0,
        showBookings: 0,
        stallBookings: 0,
        firstBookingDate: null,
        lastBookingDate: null
      }
    };

    // First, check if user has manually saved profile data
    const userProfileRef = doc(db, 'userProfiles', userId);
    const userProfileDoc = await getDoc(userProfileRef);
    
    if (userProfileDoc.exists()) {
      const savedProfile = userProfileDoc.data();
      // Use saved profile data as base
      Object.keys(userProfile).forEach(key => {
        if (key !== 'bookingHistory' && savedProfile[key]) {
          userProfile[key] = savedProfile[key];
        }
      });
    }

    // Fetch data from all booking collections
    const bookingCollections = [
      { collection: 'bookings', type: 'havan' },
      { collection: 'showBookings', type: 'show' },
      { collection: 'stallBookings', type: 'stall' }
    ];

    for (const { collection: collectionName, type } of bookingCollections) {
      const q = query(
        collection(db, collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10) // Get recent bookings to find user data
      );

      const snapshot = await getDocs(q);
      const bookings = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          ...data,
          type,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now())
        });
      });

      // Update booking history counts
      if (type === 'havan') {
        userProfile.bookingHistory.havanBookings = bookings.length;
      } else if (type === 'show') {
        userProfile.bookingHistory.showBookings = bookings.length;
      } else if (type === 'stall') {
        userProfile.bookingHistory.stallBookings = bookings.length;
      }

      // Extract user details from the most recent complete booking
      for (const booking of bookings) {
        const customerDetails = booking.customerDetails || booking.userDetails;
        
        if (customerDetails) {
          // Fill in missing profile data with data from bookings (only if not already set from saved profile)
          if (!userProfile.name && customerDetails.name?.trim()) {
            userProfile.name = customerDetails.name.trim();
          }
          
          if (!userProfile.email && customerDetails.email?.trim()) {
            userProfile.email = customerDetails.email.trim();
          }
          
          if (!userProfile.phone && customerDetails.phone?.trim()) {
            userProfile.phone = customerDetails.phone.trim();
          }
          
          if (!userProfile.aadhar && customerDetails.aadhar?.trim()) {
            userProfile.aadhar = customerDetails.aadhar.trim();
          }
          
          if (!userProfile.address && customerDetails.address?.trim()) {
            userProfile.address = customerDetails.address.trim();
          }

          if (!userProfile.emergencyContact && customerDetails.emergencyContact?.trim()) {
            userProfile.emergencyContact = customerDetails.emergencyContact.trim();
          }
        }

        // Track booking dates
        const bookingDate = booking.createdAt;
        if (!userProfile.bookingHistory.firstBookingDate || bookingDate < userProfile.bookingHistory.firstBookingDate) {
          userProfile.bookingHistory.firstBookingDate = bookingDate;
        }
        if (!userProfile.bookingHistory.lastBookingDate || bookingDate > userProfile.bookingHistory.lastBookingDate) {
          userProfile.bookingHistory.lastBookingDate = bookingDate;
        }
      }
    }

    // Calculate total bookings
    userProfile.bookingHistory.totalBookings = 
      userProfile.bookingHistory.havanBookings + 
      userProfile.bookingHistory.showBookings + 
      userProfile.bookingHistory.stallBookings;

    return userProfile;
  } catch (error) {
    console.error('Error fetching user profile data:', error);
    return {
      email: null,
      name: null,
      phone: null,
      aadhar: null,
      address: null,
      emergencyContact: null,
      bookingHistory: {
        totalBookings: 0,
        havanBookings: 0,
        showBookings: 0,
        stallBookings: 0,
        firstBookingDate: null,
        lastBookingDate: null
      }
    };
  }
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
  if (!phone || phone.length !== 10) return phone;
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}

/**
 * Format Aadhar number for display (mask middle digits)
 * @param {string} aadhar - Aadhar number
 * @returns {string} Masked Aadhar number
 */
export function formatAadharNumber(aadhar) {
  if (!aadhar || aadhar.length !== 12) return aadhar;
  return `${aadhar.slice(0, 4)} **** ${aadhar.slice(-4)}`;
}

/**
 * Get user initials for avatar
 * @param {string} name - Full name
 * @param {string} email - Email address (fallback)
 * @returns {string} User initials
 */
export function getUserInitials(name, email) {
  if (name && name.trim()) {
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.trim()[0].toUpperCase();
  }
  
  if (email && email.trim()) {
    return email.trim()[0].toUpperCase();
  }
  
  return 'U';
}

/**
 * Check if user profile is complete
 * @param {Object} userProfile - User profile data
 * @returns {Object} Completion status and missing fields
 */
export function getProfileCompleteness(userProfile) {
  const requiredFields = ['name', 'email', 'phone', 'aadhar'];
  const optionalFields = ['address', 'emergencyContact'];
  
  const missing = requiredFields.filter(field => !userProfile[field]?.trim());
  const optionalMissing = optionalFields.filter(field => !userProfile[field]?.trim());
  
  const completionPercentage = Math.round(
    ((requiredFields.length - missing.length) / requiredFields.length) * 100
  );
  
  return {
    isComplete: missing.length === 0,
    completionPercentage,
    missingRequired: missing,
    missingOptional: optionalMissing,
    hasBookingHistory: userProfile.bookingHistory.totalBookings > 0
  };
}
