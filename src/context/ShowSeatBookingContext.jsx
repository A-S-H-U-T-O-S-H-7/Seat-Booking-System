"use client";
import { createContext, useContext, useReducer, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { formatDateKey } from '@/utils/dateUtils';
import { calculatePriceBreakdown, getNextBulkMilestone, formatCurrency, getDiscountDisplayInfo } from '@/utils/pricingUtils';

const ShowSeatBookingContext = createContext();

// Seat types and pricing for show
const SHOW_SEAT_TYPES = {
  VIP: {
    price: 1000,
    name: 'VIP Sofa',
    capacity: 1,
    color: 'bg-gradient-to-br from-orange-300 via-yellow-300 to-amber-400',
    selectedColor: 'bg-blue-600'
  },
  REGULAR_C: {
    price: 1000,
    name: 'Regular Block C',
    capacity: 1,
    color: 'bg-emerald-400',
    selectedColor: 'bg-blue-600'
  },
  REGULAR_D: {
    price: 500,
    name: 'Regular Block D',
    capacity: 1,
    color: 'bg-teal-300',
    selectedColor: 'bg-blue-600'
  }
};

// Initial state
const initialState = {
  selectedSeats: [],
  selectedDate: '',
  selectedShift: 'evening',
  seatAvailability: {},
  totalPrice: 0,
  totalCapacity: 0,
  currentStep: 1,
  bookingData: {
    userDetails: {},
    paymentDetails: {}
  },
  loading: false,
  error: null,
  // Event settings for discount calculations
  eventSettings: null,
  selectedEventDate: null,
  // New pricing settings from admin
  priceSettings: {
    seatTypes: {
      VIP: { price: 1000 },
      REGULAR_C: { price: 1000 },
      REGULAR_D: { price: 500 }
    },
    earlyBirdDiscounts: [],
    bulkBookingDiscounts: [],
    taxRate: 0
  }
};

// Action types
const ACTIONS = {
  SET_SEAT_AVAILABILITY: 'SET_SEAT_AVAILABILITY',
  SELECT_SEAT: 'SELECT_SEAT',
  SET_DATE: 'SET_DATE',
  SET_SHIFT: 'SET_SHIFT',
  SET_STEP: 'SET_STEP',
  SET_BOOKING_DATA: 'SET_BOOKING_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  RESET_BOOKING: 'RESET_BOOKING',
  UPDATE_PRICING: 'UPDATE_PRICING',
  SET_PRICE_SETTINGS: 'SET_PRICE_SETTINGS',
  SET_EVENT_SETTINGS: 'SET_EVENT_SETTINGS',
  SET_SELECTED_EVENT_DATE: 'SET_SELECTED_EVENT_DATE'
};

// Helper function to get seat price based on seat type
// This needs to be inside the provider to access current state
let currentPriceSettings = null;

const getSeatPrice = (seatId) => {
  // Convert to string to handle cases where seatId might be a number or object
  const seatStr = String(seatId);
  let price = 0;
  
  if (seatStr.startsWith('A-') || seatStr.startsWith('B-')) {
    // Use dynamic pricing from current settings
    price = currentPriceSettings?.seatTypes?.VIP?.price || SHOW_SEAT_TYPES.VIP.price; // VIP seats
  } else if (seatStr.startsWith('C-')) {
    price = currentPriceSettings?.seatTypes?.REGULAR_C?.price || SHOW_SEAT_TYPES.REGULAR_C.price; // Block C
  } else if (seatStr.startsWith('D-')) {
    price = currentPriceSettings?.seatTypes?.REGULAR_D?.price || SHOW_SEAT_TYPES.REGULAR_D.price; // Block D
  } else {
    price = 500; // Default fallback
  }
  
  // Ensure we return a number, not a string
  return Number(price) || 500;
};

// Reducer function
const showSeatBookingReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case ACTIONS.SET_SEAT_AVAILABILITY:
      newState = {
        ...state,
        seatAvailability: action.payload
      };
      break;

    case ACTIONS.SELECT_SEAT:
      const seatId = action.payload;
      const currentSelectedSeats = Array.isArray(state.selectedSeats) ? state.selectedSeats : [];
      
      // Toggle seat selection
      if (currentSelectedSeats.includes(seatId)) {
        // Deselect seat
        const filteredSeats = currentSelectedSeats.filter(id => id !== seatId);
        const newTotalPrice = filteredSeats.reduce((sum, id) => sum + getSeatPrice(id), 0);
        const newTotalCapacity = filteredSeats.length;
        
        newState = {
          ...state,
          selectedSeats: filteredSeats,
          totalPrice: newTotalPrice,
          totalCapacity: newTotalCapacity
        };
      } else {
        // Select seat
        if (currentSelectedSeats.length >= 10) {
          return state; // Maximum seats reached
        }
        
        // Check availability
        const seatAvailability = state.seatAvailability[seatId] || {};
        if (seatAvailability.booked || seatAvailability.blocked) {
          return state;
        }
        
        const selectedSeats = [...currentSelectedSeats, seatId];
        const totalPrice = selectedSeats.reduce((sum, id) => sum + getSeatPrice(id), 0);
        const totalCapacity = selectedSeats.length;
        
        newState = {
          ...state,
          selectedSeats,
          totalPrice,
          totalCapacity
        };
      }
      break;

    case ACTIONS.SET_DATE:
      newState = {
        ...state,
        selectedDate: action.payload,
        selectedSeats: [],
        totalPrice: 0,
        totalCapacity: 0
      };
      break;

    case ACTIONS.SET_SHIFT:
      newState = {
        ...state,
        selectedShift: action.payload
      };
      break;

    case ACTIONS.SET_STEP:
      newState = {
        ...state,
        currentStep: action.payload
      };
      break;

    case ACTIONS.SET_BOOKING_DATA:
      newState = {
        ...state,
        bookingData: {
          ...state.bookingData,
          ...action.payload
        }
      };
      break;

    case ACTIONS.SET_LOADING:
      newState = {
        ...state,
        loading: action.payload
      };
      break;

    case ACTIONS.SET_ERROR:
      newState = {
        ...state,
        error: action.payload
      };
      break;

    case ACTIONS.CLEAR_SELECTION:
      newState = {
        ...state,
        selectedSeats: [],
        totalPrice: 0,
        totalCapacity: 0
      };
      break;

    case ACTIONS.RESET_BOOKING:
      newState = {
        ...initialState
      };
      break;

    case ACTIONS.UPDATE_PRICING:
      const safeSelectedSeats = Array.isArray(state.selectedSeats) ? state.selectedSeats : [];
      const updatedTotalPrice = safeSelectedSeats.reduce((sum, id) => sum + getSeatPrice(id), 0);
      newState = {
        ...state,
        totalPrice: updatedTotalPrice
      };
      break;

    case ACTIONS.SET_PRICE_SETTINGS:
      // Update pricing settings and recalculate totals if seats are selected
      const currentSeats = Array.isArray(state.selectedSeats) ? state.selectedSeats : [];
      const recalculatedPrice = currentSeats.reduce((sum, id) => sum + getSeatPrice(id), 0);
      
      newState = {
        ...state,
        priceSettings: action.payload,
        totalPrice: recalculatedPrice
      };
      break;

    case ACTIONS.SET_EVENT_SETTINGS:
      newState = {
        ...state,
        eventSettings: action.payload
      };
      break;

    case ACTIONS.SET_SELECTED_EVENT_DATE:
      newState = {
        ...state,
        selectedEventDate: action.payload
      };
      break;

    default:
      return state;
  }
  
  return newState;
};

// Provider component
export const ShowSeatBookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(showSeatBookingReducer, initialState);
  const { user } = useAuth();
  
  // Update the global reference when state changes
  currentPriceSettings = state.priceSettings;
  
  // Create context-aware getSeatPrice function
  const getSeatPriceWithContext = (seatId) => {
    const seatStr = String(seatId);
    let price = 0;
    
    if (seatStr.startsWith('A-') || seatStr.startsWith('B-')) {
      // Both A and B use Block A price (sync functionality)
      price = state.priceSettings?.seatTypes?.VIP?.price || 1200;
    } else if (seatStr.startsWith('C-')) {
      price = state.priceSettings?.seatTypes?.REGULAR_C?.price || 600;
    } else if (seatStr.startsWith('D-')) {
      price = state.priceSettings?.seatTypes?.REGULAR_D?.price || 400;
    } else {
      price = 500; // Default fallback
    }
    
    return Number(price) || 500;
  };

  // Real-time sync with admin pricing settings for shows
  useEffect(() => {
    const pricingRef = doc(db, 'settings', 'showPricing');
    
    // Set up real-time listener for show pricing changes
    const unsubscribePricing = onSnapshot(pricingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newPriceSettings = {
          seatTypes: {
            VIP: { price: data.seatTypes?.blockA?.price || 1200 }, // Both A and B use Block A price
            REGULAR_C: { price: data.seatTypes?.blockC?.price || 600 },
            REGULAR_D: { price: data.seatTypes?.blockD?.price || 400 }
          },
          earlyBirdDiscounts: data.earlyBirdDiscounts || [],
          bulkBookingDiscounts: data.bulkBookingDiscounts || [],
          taxRate: data.taxRate || 0
        };
        
        // Update global SHOW_SEAT_TYPES
        SHOW_SEAT_TYPES.VIP.price = newPriceSettings.seatTypes.VIP.price;
        SHOW_SEAT_TYPES.REGULAR_C.price = newPriceSettings.seatTypes.REGULAR_C.price;
        SHOW_SEAT_TYPES.REGULAR_D.price = newPriceSettings.seatTypes.REGULAR_D.price;
        
        dispatch({ type: ACTIONS.SET_PRICE_SETTINGS, payload: newPriceSettings });
        
        // Only show toast when prices actually change and user has selections
      } else {
        // Set default values if document doesn't exist
        const defaultSettings = {
          seatTypes: {
            VIP: { price: 1000 },
            REGULAR_C: { price: 1000 },
            REGULAR_D: { price: 500 }
          },
          earlyBirdDiscounts: [],
          bulkBookingDiscounts: [],
          taxRate: 0
        };
        dispatch({ type: ACTIONS.SET_PRICE_SETTINGS, payload: defaultSettings });
      }
    }, (error) => {
      console.error('Error listening to show price settings:', error);
      // Set default values on error
      const defaultSettings = {
        seatTypes: {
          VIP: { price: 1000 },
          REGULAR_C: { price: 1000 },
          REGULAR_D: { price: 500 }
        },
        earlyBirdDiscounts: [],
        bulkBookingDiscounts: [],
        taxRate: 0
      };
      dispatch({ type: ACTIONS.SET_PRICE_SETTINGS, payload: defaultSettings });
    });

    // Return cleanup function
    return () => {
      unsubscribePricing();
    };
  }, [state.selectedSeats]);

  // Real-time sync with show event settings to get event dates
  useEffect(() => {
    const showSettingsRef = doc(db, 'settings', 'shows');
    
    const unsubscribeShowSettings = onSnapshot(showSettingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        dispatch({ type: ACTIONS.SET_EVENT_SETTINGS, payload: data });
        
        // Set the event date for discount calculations
        // Use the start date of the show event for early bird calculations
        if (data.eventDates?.startDate) {
          // Convert the date string to a proper Date object
          const eventDate = new Date(data.eventDates.startDate);
          if (!isNaN(eventDate.getTime())) {
            dispatch({ type: ACTIONS.SET_SELECTED_EVENT_DATE, payload: eventDate });
          }
        } else {
          // Fallback to default event date if not set in Firebase
          const defaultEventDate = new Date('2025-11-15');
          dispatch({ type: ACTIONS.SET_SELECTED_EVENT_DATE, payload: defaultEventDate });
        }
      } else {
        // Use default event date if document doesn't exist
        const defaultEventDate = new Date('2025-11-15');
        dispatch({ type: ACTIONS.SET_SELECTED_EVENT_DATE, payload: defaultEventDate });
      }
    }, (error) => {
      console.error('Error listening to show settings:', error);
      // Use default event date on error
      const defaultEventDate = new Date('2025-11-15');
      dispatch({ type: ACTIONS.SET_SELECTED_EVENT_DATE, payload: defaultEventDate });
    });

    return () => {
      unsubscribeShowSettings();
    };
  }, []);

  // Listen to real-time seat availability updates
  useEffect(() => {
    if (!state.selectedDate || !state.selectedShift) {
      return;
    }

    // Convert to consistent date string
    const dateObj = new Date(state.selectedDate);
    const dateKey = formatDateKey(dateObj);
    
    // Listen to seat availability (show bookings don't use shifts)
    const availabilityRef = doc(db, 'showSeatAvailability', dateKey);
    
    const unsubscribe = onSnapshot(availabilityRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        dispatch({ type: ACTIONS.SET_SEAT_AVAILABILITY, payload: data.seats || {} });
      } else {
        // Create initial document if not exists
        setDoc(availabilityRef, { 
          seats: {}, 
          createdAt: serverTimestamp() 
        });
        dispatch({ type: ACTIONS.SET_SEAT_AVAILABILITY, payload: {} });
      }
    }, (error) => {
      console.error('Error fetching seat availability:', error);
    });

    return () => unsubscribe();
  }, [state.selectedDate, state.selectedShift]);

  // Actions
  const selectSeat = (seatId) => {
    dispatch({ type: ACTIONS.SELECT_SEAT, payload: seatId });
  };

  const setSelectedDate = (date) => {
    const dateStr = date instanceof Date ? date.toISOString() : date;
    dispatch({ type: ACTIONS.SET_DATE, payload: dateStr });
    dispatch({ type: ACTIONS.CLEAR_SELECTION });
  };

  const setDateAndShift = (date, shift) => {
    const dateStr = date instanceof Date ? date.toISOString() : date;
    dispatch({ type: ACTIONS.SET_DATE, payload: dateStr });
    dispatch({ type: ACTIONS.SET_SHIFT, payload: shift });
    dispatch({ type: ACTIONS.CLEAR_SELECTION });
  };

  const setCurrentStep = (step) => {
    dispatch({ type: ACTIONS.SET_STEP, payload: step });
  };

  const setBookingData = (data) => {
    dispatch({ type: ACTIONS.SET_BOOKING_DATA, payload: data });
  };

  const updateUserDetails = (userDetails) => {
    dispatch({ type: ACTIONS.SET_BOOKING_DATA, payload: { userDetails } });
  };

  const clearSelection = () => {
    dispatch({ type: ACTIONS.CLEAR_SELECTION });
  };

  const resetBooking = () => {
    dispatch({ type: ACTIONS.RESET_BOOKING });
  };

  // Pricing calculation functions using the pricing utilities
  const getPricingBreakdown = () => {
    // Get the base price for each selected seat and sum them
    const baseAmount = state.selectedSeats.reduce((sum, seatId) => {
      return sum + getSeatPriceWithContext(seatId);
    }, 0);
    
    const quantity = state.selectedSeats.length;
    
    if (quantity === 0) {
      return {
        basePrice: 0,
        quantity: 0,
        baseAmount: 0,
        discounts: {
          earlyBird: { percent: 0, applied: false },
          bulk: { percent: 0, applied: false },
          best: { percent: 0, type: 'none' },
          combined: { percent: 0, applied: false }
        },
        discountAmount: 0,
        discountedAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
        originalAmount: 0
      };
    }
    
    // Use average price for discount calculations but preserve the actual total amount
    const averagePrice = baseAmount / quantity;
    
    
    const breakdown = calculatePriceBreakdown({
      basePrice: averagePrice,
      quantity: quantity,
      selectedDate: state.selectedEventDate,
      earlyBirdDiscounts: state.priceSettings.earlyBirdDiscounts,
      bulkDiscounts: state.priceSettings.bulkBookingDiscounts,
      quantityKey: 'minSeats', // Shows use seat-based discounts
      taxRate: state.priceSettings.taxRate
    });
    
    // Override baseAmount to use actual sum instead of calculated average * quantity
    // This ensures that mixed-price seats are calculated correctly
    // Use combined discount instead of best discount
    const combinedDiscountPercent = breakdown.discounts.combined.percent;
    const result = {
      ...breakdown,
      baseAmount: baseAmount,
      discountAmount: Math.round((baseAmount * combinedDiscountPercent) / 100),
      discountedAmount: baseAmount - Math.round((baseAmount * combinedDiscountPercent) / 100),
      totalAmount: baseAmount - Math.round((baseAmount * combinedDiscountPercent) / 100) + breakdown.taxAmount,
      originalAmount: baseAmount
    };
    
    return result;
  };
  
  const getBaseAmount = () => {
    return state.selectedSeats.reduce((sum, seatId) => {
      return sum + getSeatPriceWithContext(seatId);
    }, 0);
  };
  
  const getDiscountAmount = () => {
    const breakdown = getPricingBreakdown();
    return breakdown.discountAmount;
  };
  
  const getTaxAmount = () => {
    const breakdown = getPricingBreakdown();
    return breakdown.taxAmount;
  };
  
  const getTotalAmount = () => {
    const breakdown = getPricingBreakdown();
    return breakdown.totalAmount;
  };
  
  const getEarlyBirdDiscount = () => {
    const breakdown = getPricingBreakdown();
    return breakdown.discounts.earlyBird.percent;
  };
  
  const getBulkDiscount = () => {
    const breakdown = getPricingBreakdown();
    return breakdown.discounts.bulk.percent;
  };
  
  const getNextMilestone = () => {
    return getNextBulkMilestone(
      state.selectedSeats.length,
      state.priceSettings.bulkBookingDiscounts,
      'minSeats'
    );
  };

  const getTotalDiscountPercent = () => {
    const breakdown = getPricingBreakdown();
    return breakdown.discounts.combined.percent;
  };
  
  // Get current discount info for display
  const getCurrentDiscountInfo = () => {
    const breakdown = getPricingBreakdown();
    const combinedDiscount = breakdown.discounts.combined;
    const baseAmount = getBaseAmount();
    
    if (!combinedDiscount.applied || combinedDiscount.percent === 0) {
      return null;
    }

    // Calculate total discount amount
    const totalDiscountAmount = Math.round((baseAmount * combinedDiscount.percent) / 100);

    // If both discounts are applied
    if (combinedDiscount.earlyBird && combinedDiscount.bulk) {
      const earlyBirdAmount = Math.round((baseAmount * combinedDiscount.earlyBird.percent) / 100);
      const bulkAmount = Math.round((baseAmount * combinedDiscount.bulk.percent) / 100);
      
      return {
        type: 'combined',
        percent: combinedDiscount.percent,
        amount: totalDiscountAmount,
        label: 'Early Bird + Bulk Discount',
        earlyBird: {
          percent: combinedDiscount.earlyBird.percent,
          amount: earlyBirdAmount,
          label: 'Early Bird'
        },
        bulk: {
          percent: combinedDiscount.bulk.percent,
          amount: bulkAmount,
          label: 'Bulk Discount'
        }
      };
    }
    
    // If only early bird is applied
    if (combinedDiscount.earlyBird) {
      return {
        type: 'earlyBird',
        percent: combinedDiscount.percent,
        amount: totalDiscountAmount,
        label: 'Early Bird Discount'
      };
    }
    
    // If only bulk discount is applied
    if (combinedDiscount.bulk) {
      return {
        type: 'bulk',
        percent: combinedDiscount.percent,
        amount: totalDiscountAmount,
        label: 'Bulk Discount'
      };
    }
    
    return null;
  };

  // Get seat status
  const getSeatStatus = (seatId) => {
    const availability = state.seatAvailability[seatId] || {};
    if (availability.blocked) return 'blocked';
    if (availability.booked) return 'booked';
    return 'available';
  };

  // Check if seat is selected
  const isSeatSelected = (seatId) => {
    return Array.isArray(state.selectedSeats) && state.selectedSeats.includes(seatId);
  };

  // Check if seat is available
  const isSeatAvailable = (seatId) => {
    const availability = state.seatAvailability[seatId] || {};
    return !availability.booked && !availability.blocked;
  };

  // Process the booking
  const processBooking = async (userDetails, paymentDetails) => {
    
    if (!user) {
      toast.error('Please login to book seats');
      return { success: false, error: 'User not authenticated' };
    }

    if (!Array.isArray(state.selectedSeats) || state.selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return { success: false, error: 'No seats selected' };
    }

    if (!state.selectedDate || !state.selectedShift) {
      toast.error('Please select a date and shift');
      return { success: false, error: 'Date or shift not selected' };
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      
      // Convert to consistent date string
      const dateObj = new Date(state.selectedDate);
      const dateKey = formatDateKey(dateObj);
      
      // Generate sequential booking ID
      const { generateSequentialBookingId } = await import('@/services/bookingIdService');
      const bookingId = await generateSequentialBookingId('show');
      
      // Create booking document
      const bookingRef = doc(db, 'showBookings', bookingId);
      const expiryTime = paymentDetails.method === 'pending_payment' 
        ? new Date(Date.now() + 5 * 60 * 1000) 
        : null;
      
      const bookingData = {
        id: bookingId,
        bookingId: bookingId,
        userId: user.uid,
        userEmail: user.email,
        showDetails: {
          date: state.selectedDate,
          time: state.selectedShift,
          selectedSeats: state.selectedSeats,
          totalPrice: state.totalPrice,
          totalCapacity: state.totalCapacity
        },
        seats: state.selectedSeats.map(seatId => ({
          seatId: seatId,
          price: getSeatPriceWithContext(seatId),
          section: seatId.split('-')[0],
          row: seatId.split('-')[1],
          pairLetter: seatId.split('-')[2]?.charAt(0),
          pairPosition: seatId.split('-')[2]?.charAt(1)
        })),
        userDetails,
        paymentDetails,
        status: paymentDetails.method === 'pending_payment' ? 'pending' : 'confirmed',
        createdAt: serverTimestamp(),
        expiryTime: expiryTime, // Add expiry time for cleanup service
        eventType: 'show'
      };

      await setDoc(bookingRef, bookingData);
      
      // Update seat availability (show bookings don't use shifts)
      const availabilityRef = doc(db, 'showSeatAvailability', dateKey);
      const currentDoc = await getDoc(availabilityRef);
      const currentSeats = currentDoc.exists() ? currentDoc.data().seats || {} : {};
      
      const updatedSeats = { ...currentSeats };
      state.selectedSeats.forEach(seatId => {
        // Set expiry time to 5 minutes from now for blocked seats
        const expiryTime = paymentDetails.method === 'pending_payment' 
          ? new Date(Date.now() + 5 * 60 * 1000) 
          : null;
        
        updatedSeats[seatId] = {
          booked: paymentDetails.method !== 'pending_payment', // Only mark as booked if payment is confirmed
          blocked: paymentDetails.method === 'pending_payment', // Block seats during pending payment
          bookingId: bookingId,
          userId: user.uid,
          bookedAt: paymentDetails.method !== 'pending_payment' ? serverTimestamp() : null,
          blockedAt: paymentDetails.method === 'pending_payment' ? serverTimestamp() : null,
          expiryTime: expiryTime // Add expiry time for cleanup service
        };
      });
      
      await setDoc(availabilityRef, {
        seats: updatedSeats,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      // Update stats
      const statsRef = doc(db, 'showStats', dateKey);
      await setDoc(statsRef, {
        date: dateKey,
        totalBookings: increment(1),
        totalSeatsBooked: increment(state.selectedSeats.length),
        totalRevenue: increment(state.totalPrice),
        lastUpdated: serverTimestamp()
      }, { merge: true });

      // Clear selection
      dispatch({ type: ACTIONS.CLEAR_SELECTION });
      
      return { success: true, bookingId: bookingRef.id };

    } catch (error) {
      console.error('Error processing booking:', error);
      toast.error('Failed to book seats. Please try again.');
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  };

  const value = {
    ...state,
    SHOW_SEAT_TYPES,
    selectSeat,
    setSelectedDate,
    setDateAndShift,
    setCurrentStep,
    setBookingData,
    updateUserDetails,
    clearSelection,
    resetBooking,
    processBooking,
    getSeatStatus,
    isSeatSelected,
    isSeatAvailable,
    getSeatPrice: getSeatPriceWithContext,
    // Pricing calculation functions
    getPricingBreakdown,
    getBaseAmount,
    getDiscountAmount,
    getTaxAmount,
    getTotalAmount,
    getEarlyBirdDiscount,
    getBulkDiscount,
    getNextMilestone,
    getTotalDiscountPercent,
    getCurrentDiscountInfo,
    // Export pricing settings for components
    priceSettings: state.priceSettings
  };

  return (
    <ShowSeatBookingContext.Provider value={value}>
      {children}
    </ShowSeatBookingContext.Provider>
  );
};

export const useShowSeatBooking = () => {
  const context = useContext(ShowSeatBookingContext);
  if (!context) {
    throw new Error('useShowSeatBooking must be used within a ShowSeatBookingProvider');
  }
  return context;
};