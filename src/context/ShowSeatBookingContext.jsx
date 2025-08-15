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
  error: null
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
  UPDATE_PRICING: 'UPDATE_PRICING'
};

// Helper function to get seat price based on seat type
const getSeatPrice = (seatId) => {
  // Convert to string to handle cases where seatId might be a number or object
  const seatStr = String(seatId);
  if (seatStr.startsWith('A-') || seatStr.startsWith('B-')) {
    return SHOW_SEAT_TYPES.VIP.price; // VIP seats ₹1000
  } else if (seatStr.startsWith('C-')) {
    return SHOW_SEAT_TYPES.REGULAR_C.price; // Block C ₹1000
  } else if (seatStr.startsWith('D-')) {
    return SHOW_SEAT_TYPES.REGULAR_D.price; // Block D ₹500
  }
  return 500; // Default fallback
};

// Reducer function
const showSeatBookingReducer = (state, action) => {
  console.log('Reducer called with action:', action.type, 'payload:', action.payload);
  
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
          console.log('Maximum seats reached');
          return state; // Maximum seats reached
        }
        
        // Check availability
        const seatAvailability = state.seatAvailability[seatId] || {};
        if (seatAvailability.booked || seatAvailability.blocked) {
          console.log('Seat not available for selection');
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

    default:
      console.warn('Unknown action type:', action.type);
      return state;
  }
  
  console.log('New state:', newState);
  return newState;
};

// Provider component
export const ShowSeatBookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(showSeatBookingReducer, initialState);
  const { user } = useAuth();

  // Listen to real-time seat availability updates
  useEffect(() => {
    if (!state.selectedDate || !state.selectedShift) {
      console.log('No date or shift selected, skipping listener');
      return;
    }

    // Convert to consistent date string
    const dateObj = new Date(state.selectedDate);
    const dateKey = formatDateKey(dateObj);
    
    console.log('Setting up real-time listener for:', { dateKey, shift: state.selectedShift });
    
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
    console.log('selectSeat called with seatId:', seatId);
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

  const clearSelection = () => {
    dispatch({ type: ACTIONS.CLEAR_SELECTION });
  };

  const resetBooking = () => {
    dispatch({ type: ACTIONS.RESET_BOOKING });
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
    console.log('processBooking called with:', { userDetails, paymentDetails, state });
    
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
      console.log('Starting booking process...');
      
      // Convert to consistent date string
      const dateObj = new Date(state.selectedDate);
      const dateKey = formatDateKey(dateObj);
      
      // Create booking document
      const bookingRef = doc(collection(db, 'showBookings'));
      const bookingData = {
        id: bookingRef.id,
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
          price: getSeatPrice(seatId),
          section: seatId.split('-')[0],
          row: seatId.split('-')[1],
          pairLetter: seatId.split('-')[2]?.charAt(0),
          pairPosition: seatId.split('-')[2]?.charAt(1)
        })),
        userDetails,
        paymentDetails,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        eventType: 'show'
      };

      console.log('Creating booking document:', bookingData);
      await setDoc(bookingRef, bookingData);
      
      // Update seat availability (show bookings don't use shifts)
      const availabilityRef = doc(db, 'showSeatAvailability', dateKey);
      const currentDoc = await getDoc(availabilityRef);
      const currentSeats = currentDoc.exists() ? currentDoc.data().seats || {} : {};
      
      const updatedSeats = { ...currentSeats };
      state.selectedSeats.forEach(seatId => {
        updatedSeats[seatId] = {
          booked: true,
          bookingId: bookingRef.id,
          userId: user.uid,
          bookedAt: serverTimestamp()
        };
      });
      
      console.log('Updating availability document');
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

      console.log('Booking successful!');
      
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
    clearSelection,
    resetBooking,
    processBooking,
    getSeatStatus,
    isSeatSelected,
    isSeatAvailable,
    getSeatPrice
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