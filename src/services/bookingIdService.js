import { db } from '@/lib/firebase';
import { doc, runTransaction, getDoc, setDoc } from 'firebase/firestore';

/**
 * Generate sequential booking IDs in format: sjpr-{type}-{number}
 * Examples: sjpr-havan-00001, sjpr-stall-00002, sjpr-show-00003
 */

const BOOKING_TYPES = {
  HAVAN: 'havan',
  STALL: 'stall', 
  SHOW: 'show',
  DELEGATE: 'delegate' // Optional for future use
};

/**
 * Initialize counter document if it doesn't exist
 */
const initializeCounters = async () => {
  try {
    const counterRef = doc(db, 'counters', 'bookingIds');
    const counterSnap = await getDoc(counterRef);
    
    if (!counterSnap.exists()) {
      await setDoc(counterRef, {
        havan: { count: 0 },
        stall: { count: 0 },
        show: { count: 0 },
        delegate: { count: 0 },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Booking ID counters initialized');
    }
  } catch (error) {
    console.error('❌ Error initializing counters:', error);
    throw error;
  }
};

/**
 * Generate next sequential booking ID
 * @param {string} bookingType - Type of booking (havan, stall, show)
 * @returns {Promise<string>} Generated booking ID
 */
export const generateSequentialBookingId = async (bookingType) => {
  // Validate booking type
  if (!Object.values(BOOKING_TYPES).includes(bookingType)) {
    throw new Error(`Invalid booking type: ${bookingType}. Must be one of: ${Object.values(BOOKING_TYPES).join(', ')}`);
  }

  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const bookingId = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'counters', 'bookingIds');
        const counterDoc = await transaction.get(counterRef);

        if (!counterDoc.exists()) {
          // Initialize counters if document doesn't exist
          const initialData = {
            havan: { count: 0 },
            stall: { count: 0 },
            show: { count: 0 },
            delegate: { count: 0 },
            createdAt: new Date(),
            updatedAt: new Date()
          };
          transaction.set(counterRef, initialData);
          
          // Return first ID
          const nextNumber = 1;
          const formattedNumber = nextNumber.toString().padStart(5, '0');
          return `sjpr-${bookingType}-${formattedNumber}`;
        }

        const data = counterDoc.data();
        const currentCount = data[bookingType]?.count || 0;
        const nextCount = currentCount + 1;
        
        // Update the counter
        transaction.update(counterRef, {
          [`${bookingType}.count`]: nextCount,
          [`${bookingType}.lastUpdated`]: new Date(),
          updatedAt: new Date()
        });

        // Generate the booking ID with 5-digit padding
        const formattedNumber = nextCount.toString().padStart(5, '0');
        return `sjpr-${bookingType}-${formattedNumber}`;
      });

      console.log(`✅ Generated booking ID: ${bookingId}`);
      return bookingId;

    } catch (error) {
      retryCount++;
      console.warn(`⚠️ Transaction retry ${retryCount}/${maxRetries} for ${bookingType}:`, error.message);
      
      if (retryCount >= maxRetries) {
        console.error(`❌ Failed to generate booking ID after ${maxRetries} retries:`, error);
        // Fallback to timestamp-based ID to prevent booking failure
        const fallbackId = `sjpr-${bookingType}-${Date.now()}`;
        console.log(`🔄 Using fallback ID: ${fallbackId}`);
        return fallbackId;
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
    }
  }
};

/**
 * Get current counter values (for admin dashboard)
 * @returns {Promise<Object>} Current counter values
 */
export const getCurrentCounters = async () => {
  try {
    const counterRef = doc(db, 'counters', 'bookingIds');
    const counterSnap = await getDoc(counterRef);
    
    if (!counterSnap.exists()) {
      await initializeCounters();
      return {
        havan: { count: 0 },
        stall: { count: 0 },
        show: { count: 0 },
        delegate: { count: 0 }
      };
    }
    
    return counterSnap.data();
  } catch (error) {
    console.error('❌ Error getting counters:', error);
    throw error;
  }
};

/**
 * Reset counter for a specific booking type (admin only)
 * @param {string} bookingType - Type to reset
 * @param {number} newCount - New count value (default: 0)
 */
export const resetCounter = async (bookingType, newCount = 0) => {
  try {
    const counterRef = doc(db, 'counters', 'bookingIds');
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      if (!counterDoc.exists()) {
        throw new Error('Counter document does not exist');
      }
      
      transaction.update(counterRef, {
        [`${bookingType}.count`]: newCount,
        [`${bookingType}.resetAt`]: new Date(),
        updatedAt: new Date()
      });
    });
    
    console.log(`✅ Reset ${bookingType} counter to ${newCount}`);
  } catch (error) {
    console.error(`❌ Error resetting ${bookingType} counter:`, error);
    throw error;
  }
};

/**
 * Validate booking ID format
 * @param {string} bookingId - Booking ID to validate
 * @returns {boolean} True if valid format
 */
export const validateBookingIdFormat = (bookingId) => {
  const pattern = /^sjpr-(havan|stall|show|delegate)-\d{5}$/;
  return pattern.test(bookingId);
};

/**
 * Extract booking type from booking ID
 * @param {string} bookingId - Booking ID
 * @returns {string|null} Booking type or null if invalid
 */
export const extractBookingType = (bookingId) => {
  const match = bookingId.match(/^sjpr-(havan|stall|show|delegate)-\d{5}$/);
  return match ? match[1] : null;
};

export { BOOKING_TYPES };
