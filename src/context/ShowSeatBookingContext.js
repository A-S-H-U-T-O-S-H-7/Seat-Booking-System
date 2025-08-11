"use client";
import { createContext, useContext, useReducer, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const ShowSeatBookingContext = createContext();

// Seat types and pricing
const SEAT_TYPES = {
  VIP: {
    price: 1000,
    name: 'VIP Sofa',
    capacity: 2, // 2 people per sofa
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    selectedColor: 'bg-gradient-to-r from-purple-600 to-pink-600'
  },
  REGULAR: {
    price: 300,
    name: 'Regular Seat',
    capacity: 1, // 1 person per seat
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    selectedColor: 'bg-gradient-to-r from-blue-600 to-indigo-600'
  }
};

// Generate seat layout for the auditorium
const generateSeatLayout = () => {
  const seats = {};
  
  // VIP Section - 8 rows, 14 sofas per row (7 left, 7 right), 2 people per sofa
  for (let row = 1; row <= 8; row++) {
    for (let seat = 1; seat <= 14; seat++) {
      const seatId = `VIP-R${row}-S${seat}`;
      const side = seat <= 7 ? 'LEFT' : 'RIGHT';
      const seatNumber = seat <= 7 ? seat : seat - 7;
      
      seats[seatId] = {
        id: seatId,
        row: row,
        seat: seatNumber,
        side: side,
        type: 'VIP',
        section: 'VIP',
        price: SEAT_TYPES.VIP.price,
        capacity: SEAT_TYPES.VIP.capacity,
        isBooked: false,
        isSelected: false,
        isBlocked: false,
        displayName: `VIP-R${row}-${side.charAt(0)}${seatNumber}`
      };
    }
  }

  // Regular Section - 35 rows, 30 seats per row (15 left, 15 right), 1 person per seat  
  for (let row = 1; row <= 35; row++) {
    for (let seat = 1; seat <= 30; seat++) {
      const seatId = `REG-R${row}-S${seat}`;
      const side = seat <= 15 ? 'LEFT' : 'RIGHT';
      const seatNumber = seat <= 15 ? seat : seat - 15;
      
      seats[seatId] = {
        id: seatId,
        row: row,
        seat: seatNumber,
        side: side,
        type: 'REGULAR',
        section: 'REGULAR',
        price: SEAT_TYPES.REGULAR.price,
        capacity: SEAT_TYPES.REGULAR.capacity,
        isBooked: false,
        isSelected: false,
        isBlocked: false,
        displayName: `REG-R${row}-${side.charAt(0)}${seatNumber}`
      };
    }
  }

  return seats;
};

// Initial state
const initialState = {
  seats: generateSeatLayout(),
  selectedSeats: [],
  selectedDate: '',
  selectedShift: '',
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
  SET_SEATS: 'SET_SEATS',
  SELECT_SEAT: 'SELECT_SEAT',
  DESELECT_SEAT: 'DESELECT_SEAT',
  SET_DATE: 'SET_DATE',
  SET_SHIFT: 'SET_SHIFT',
  SET_STEP: 'SET_STEP',
  SET_BOOKING_DATA: 'SET_BOOKING_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  RESET_BOOKING: 'RESET_BOOKING'
};

// Reducer function
const showSeatBookingReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_SEATS:
      return {
        ...state,
        seats: action.payload
      };

    case ACTIONS.SELECT_SEAT:
      const seatToSelect = state.seats[action.payload];
      if (seatToSelect && !seatToSelect.isBooked && !seatToSelect.isBlocked) {
        const updatedSeats = {
          ...state.seats,
          [action.payload]: {
            ...seatToSelect,
            isSelected: true
          }
        };
        
        const selectedSeats = [...state.selectedSeats, action.payload];
        const totalPrice = selectedSeats.reduce((sum, seatId) => sum + updatedSeats[seatId].price, 0);
        const totalCapacity = selectedSeats.reduce((sum, seatId) => sum + updatedSeats[seatId].capacity, 0);
        
        return {
          ...state,
          seats: updatedSeats,
          selectedSeats,
          totalPrice,
          totalCapacity
        };
      }
      return state;

    case ACTIONS.DESELECT_SEAT:
      const seatToDeselect = state.seats[action.payload];
      if (seatToDeselect) {
        const updatedSeats = {
          ...state.seats,
          [action.payload]: {
            ...seatToDeselect,
            isSelected: false
          }
        };
        
        const selectedSeats = state.selectedSeats.filter(id => id !== action.payload);
        const totalPrice = selectedSeats.reduce((sum, seatId) => sum + updatedSeats[seatId].price, 0);
        const totalCapacity = selectedSeats.reduce((sum, seatId) => sum + updatedSeats[seatId].capacity, 0);
        
        return {
          ...state,
          seats: updatedSeats,
          selectedSeats,
          totalPrice,
          totalCapacity
        };
      }
      return state;

    case ACTIONS.SET_DATE:
      return {
        ...state,
        selectedDate: action.payload
      };

    case ACTIONS.SET_SHIFT:
      return {
        ...state,
        selectedShift: action.payload
      };

    case ACTIONS.SET_STEP:
      return {
        ...state,
        currentStep: action.payload
      };

    case ACTIONS.SET_BOOKING_DATA:
      return {
        ...state,
        bookingData: {
          ...state.bookingData,
          ...action.payload
        }
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case ACTIONS.CLEAR_SELECTION:
      const clearedSeats = Object.keys(state.seats).reduce((acc, seatId) => {
        acc[seatId] = {
          ...state.seats[seatId],
          isSelected: false
        };
        return acc;
      }, {});
      
      return {
        ...state,
        seats: clearedSeats,
        selectedSeats: [],
        totalPrice: 0,
        totalCapacity: 0
      };

    case ACTIONS.RESET_BOOKING:
      return {
        ...initialState,
        seats: state.seats // Keep the current seat state
      };

    default:
      return state;
  }
};

// Provider component
export const ShowSeatBookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(showSeatBookingReducer, initialState);
  const { user } = useAuth();

  // Listen to real-time seat availability changes
  useEffect(() => {
    if (!state.selectedDate || !state.selectedShift) return;

    const showBookingsQuery = query(
      collection(db, 'showBookings'),
      where('date', '==', state.selectedDate),
      where('shift', '==', state.selectedShift),
      where('status', '==', 'confirmed')
    );

    const unsubscribe = onSnapshot(showBookingsQuery, (snapshot) => {
      const bookedSeats = new Set();
      
      snapshot.forEach((doc) => {
        const booking = doc.data();
        if (booking.seats && Array.isArray(booking.seats)) {
          booking.seats.forEach(seatId => bookedSeats.add(seatId));
        }
      });

      // Update seat availability
      const updatedSeats = Object.keys(state.seats).reduce((acc, seatId) => {
        acc[seatId] = {
          ...state.seats[seatId],
          isBooked: bookedSeats.has(seatId),
          // If seat becomes booked and was selected, deselect it
          isSelected: bookedSeats.has(seatId) ? false : state.seats[seatId].isSelected
        };
        return acc;
      }, {});

      // Update selected seats list if any selected seats are now booked
      const validSelectedSeats = state.selectedSeats.filter(seatId => !bookedSeats.has(seatId));
      const totalPrice = validSelectedSeats.reduce((sum, seatId) => sum + updatedSeats[seatId].price, 0);
      const totalCapacity = validSelectedSeats.reduce((sum, seatId) => sum + updatedSeats[seatId].capacity, 0);

      dispatch({ type: ACTIONS.SET_SEATS, payload: updatedSeats });
      
      if (validSelectedSeats.length !== state.selectedSeats.length) {
        dispatch({ 
          type: ACTIONS.SET_BOOKING_DATA, 
          payload: { 
            selectedSeats: validSelectedSeats,
            totalPrice,
            totalCapacity
          }
        });
        toast.error('Some selected seats are no longer available');
      }
    });

    return () => unsubscribe();
  }, [state.selectedDate, state.selectedShift]);

  // Actions
  const selectSeat = (seatId) => {
    const seat = state.seats[seatId];
    if (!seat) return;

    if (seat.isBooked) {
      toast.error('This seat is already booked');
      return;
    }

    if (seat.isBlocked) {
      toast.error('This seat is blocked');
      return;
    }

    if (seat.isSelected) {
      dispatch({ type: ACTIONS.DESELECT_SEAT, payload: seatId });
    } else {
      if (state.selectedSeats.length >= 10) {
        toast.error('Maximum 10 seats can be selected at once');
        return;
      }
      dispatch({ type: ACTIONS.SELECT_SEAT, payload: seatId });
    }
  };

  const setDateAndShift = (date, shift) => {
    dispatch({ type: ACTIONS.SET_DATE, payload: date });
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

  // Process booking
  const processBooking = async (paymentDetails) => {
    if (!user) {
      toast.error('Please login to complete booking');
      return false;
    }

    if (state.selectedSeats.length === 0) {
      toast.error('Please select seats to book');
      return false;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const bookingId = `SHOW-${Date.now()}-${user.uid.slice(-4)}`;
      const bookingData = {
        bookingId: bookingId,
        userId: user.uid,
        userEmail: user.email,
        showDetails: {
          date: state.selectedDate,
          time: state.selectedShift,
          selectedSeats: state.selectedSeats.map(seatId => ({
            id: seatId,
            ...state.seats[seatId]
          }))
        },
        userDetails: {
          name: state.bookingData.userDetails?.name || user.displayName || user.email,
          email: user.email,
          phone: state.bookingData.userDetails?.phone || ''
        },
        payment: {
          amount: state.totalPrice,
          method: paymentDetails.method || 'online',
          transactionId: paymentDetails.transactionId || `TXN-${Date.now()}`,
          status: 'completed'
        },
        totalPrice: state.totalPrice,
        totalCapacity: state.totalCapacity,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        type: 'show'
      };

      // Save booking
      await setDoc(doc(db, 'showBookings', bookingId), bookingData);

      // Update seat booking counts
      for (const seatId of state.selectedSeats) {
        const seat = state.seats[seatId];
        const statsDoc = doc(db, 'showSeatStats', `${state.selectedDate}-${state.selectedShift}-${seat.section}`);
        await updateDoc(statsDoc, {
          bookedSeats: increment(1),
          revenue: increment(seat.price),
          lastUpdated: serverTimestamp()
        });
      }

      toast.success('Show seat booking confirmed successfully!');
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true, bookingId };

    } catch (error) {
      console.error('Error processing show seat booking:', error);
      toast.error('Failed to process booking. Please try again.');
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...state,
    SEAT_TYPES,
    selectSeat,
    setDateAndShift,
    setCurrentStep,
    setBookingData,
    clearSelection,
    resetBooking,
    processBooking
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
