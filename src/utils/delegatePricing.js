import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Default fallback configuration constants for pricing
export const DEFAULT_PRICING_CONFIG = {
  normal: {
    pricePerPerson: 0,
    fixedDays: 5,
    benefits: [
      '🎟️ Free entry pass valid for 5 days',
    ]
  },
  withoutAssistance: {
    pricePerPerson: 5000,
    fixedDays: 5,
    benefits: [
      '🍴 Enjoy complimentary lunch throughout the event',
      '🎟️ Receive a free entry pass valid for 5 days',
      '🤝 Get assistance with basic needs during event',
      '🎫 Avail a complimentary pass to exclusive shows'
    ]
  },
  withAssistance: {
    pricePerPersonPerDay: 1000,
    minDays: 2,
    maxDays: 5,
    benefits: [
      '✈️ Facility of pick-up & drop from airport/station',
      '🏨 Comfortable stay in well-appointed hotel',
      '🚐 Daily transportation between hotel & venue provided',
      '🍽️ Lunch and dinner served throughout your stay',
      '🛎️ Provided all essential amenities for Havan and Shows',
      '🤝 Personalized care and dedicated assistance'
    ]
  }
};

// Legacy export for backward compatibility
export const PRICING_CONFIG = DEFAULT_PRICING_CONFIG;

// Function to fetch dynamic pricing from Firebase
export const fetchDelegatePricing = async () => {
  try {
    const pricingRef = doc(db, 'settings', 'delegatePricing');
    const pricingSnap = await getDoc(pricingRef);
    
    if (pricingSnap.exists()) {
      const firebaseData = pricingSnap.data();
      console.log('📊 Fetched delegate pricing from Firebase:', firebaseData);
      
      // Merge with defaults to ensure all fields exist
      return {
        normal: {
          ...DEFAULT_PRICING_CONFIG.normal,
          ...firebaseData.normal
        },
        withoutAssistance: {
          ...DEFAULT_PRICING_CONFIG.withoutAssistance,
          ...firebaseData.withoutAssistance
        },
        withAssistance: {
          ...DEFAULT_PRICING_CONFIG.withAssistance,
          ...firebaseData.withAssistance
        }
      };
    } else {
      console.log('⚠️ No delegate pricing found in Firebase, using defaults');
      return DEFAULT_PRICING_CONFIG;
    }
  } catch (error) {
    console.error('❌ Error fetching delegate pricing:', error);
    return DEFAULT_PRICING_CONFIG;
  }
};

export const API_KEY = "aHFpNVJ5ZGpLeUlPcTRNWVFWb1dnRUZMZW85UFhSMzZJenB3T2dLYQ==";