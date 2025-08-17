"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { calculatePriceBreakdown, getNextBulkMilestone, formatCurrency, getDiscountDisplayInfo } from '@/utils/pricingUtils';

const StallBookingContext = createContext();

export const StallBookingProvider = ({ children }) => {
  const [selectedStalls, setSelectedStalls] = useState([]); // Changed to array for multiple stalls
  const [priceSettings, setPriceSettings] = useState({
    defaultStallPrice: 5000,
    taxRate: 0,
    earlyBirdDiscounts: [],
    bulkBookingDiscounts: []
  });
  const [selectedEventDate, setSelectedEventDate] = useState(null);
  const [eventSettings, setEventSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Real-time sync with admin pricing settings for stalls
  useEffect(() => {
    const pricingRef = doc(db, 'settings', 'stallPricing');
    
    // Set up real-time listener for stall pricing changes
    const unsubscribePricing = onSnapshot(pricingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newPriceSettings = {
          defaultStallPrice: data.seatPrice || 5000, // Admin uses seatPrice field
          taxRate: 0, // No tax as per requirements
          earlyBirdDiscounts: data.earlyBirdDiscounts || [],
          bulkBookingDiscounts: data.bulkBookingDiscounts || []
        };
        
        setPriceSettings(newPriceSettings);
        
        // Notify user if they have stalls selected
        if (selectedStalls.length > 0) {
          toast.success('💰 Stall pricing updated! Your total has been recalculated.', {
            duration: 4000,
            position: 'top-right'
          });
        }
      } else {
        // Set default values if document doesn't exist
        setPriceSettings({
          defaultStallPrice: 5000,
          taxRate: 0,
          earlyBirdDiscounts: [],
          bulkBookingDiscounts: []
        });
      }
    }, (error) => {
      console.error('Error listening to stall price settings:', error);
      // Set default values on error
      setPriceSettings({
        defaultStallPrice: 5000,
        taxRate: 0,
        earlyBirdDiscounts: [],
        bulkBookingDiscounts: []
      });
    });

    // Cleanup function
    return () => {
      unsubscribePricing();
    };
  }, []);

  // Real-time sync with stall event settings to get event dates
  useEffect(() => {
    const stallSettingsRef = doc(db, 'settings', 'stalls');
    
    const unsubscribeStallSettings = onSnapshot(stallSettingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEventSettings(data);
        
        // Set the event date for discount calculations
        // Use the start date of the event for early bird calculations
        if (data.eventDates?.startDate) {
          // Convert the date string to a proper Date object
          const eventDate = new Date(data.eventDates.startDate);
          if (!isNaN(eventDate.getTime())) {
            setSelectedEventDate(eventDate);
            console.log('StallBookingContext: Set event date for early bird calculation:', eventDate);
          }
        } else {
          // Fallback to default event date if not set in Firebase
          const defaultEventDate = new Date('2025-11-15');
          setSelectedEventDate(defaultEventDate);
          console.log('StallBookingContext: Using default event date:', defaultEventDate);
        }
      } else {
        // Use default event date if document doesn't exist
        const defaultEventDate = new Date('2025-11-15');
        setSelectedEventDate(defaultEventDate);
        console.log('StallBookingContext: No stall settings found, using default event date:', defaultEventDate);
      }
    }, (error) => {
      console.error('Error listening to stall settings:', error);
      // Use default event date on error
      const defaultEventDate = new Date('2025-11-15');
      setSelectedEventDate(defaultEventDate);
    });

    return () => {
      unsubscribeStallSettings();
    };
  }, []);

  const clearSelection = () => {
    setSelectedStalls([]);
  };

  const addStall = (stallId) => {
    if (!selectedStalls.includes(stallId)) {
      setSelectedStalls(prev => [...prev, stallId]);
    }
  };

  const removeStall = (stallId) => {
    setSelectedStalls(prev => prev.filter(id => id !== stallId));
  };

  const toggleStall = (stallId) => {
    if (selectedStalls.includes(stallId)) {
      removeStall(stallId);
    } else {
      addStall(stallId);
    }
  };

  // Use new pricing utility functions for calculations
  const getPricingBreakdown = () => {
    return calculatePriceBreakdown({
      basePrice: priceSettings.defaultStallPrice,
      quantity: selectedStalls.length,
      selectedDate: selectedEventDate,
      earlyBirdDiscounts: priceSettings.earlyBirdDiscounts,
      bulkDiscounts: priceSettings.bulkBookingDiscounts,
      quantityKey: 'minSeats', // Admin uses minSeats for stalls too
      taxRate: priceSettings.taxRate
    });
  };
  
  const getBaseAmount = () => {
    const breakdown = getPricingBreakdown();
    return breakdown.baseAmount;
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
      selectedStalls.length,
      priceSettings.bulkBookingDiscounts,
      'minSeats'
    );
  };

  const isBookingComplete = () => {
    return selectedStalls.length > 0;
  };

  const value = {
    // State
    selectedStalls, // Changed from selectedStall
    priceSettings,
    loading,
    selectedEventDate,
    eventSettings,
    
    // Actions
    setSelectedStalls,
    addStall,
    removeStall,
    toggleStall,
    clearSelection,
    setLoading,
    setSelectedEventDate,
    
    // Pricing calculations
    getTotalAmount,
    getDiscountAmount,
    getBaseAmount,
    getTaxAmount,
    getEarlyBirdDiscount,
    getBulkDiscount,
    getPricingBreakdown,
    getNextMilestone,
    
    // Computed values
    isBookingComplete,
    
    // Booking details
    bookingDetails: {
      stalls: selectedStalls, // Changed from stall
      price: priceSettings.defaultStallPrice,
      stallCount: selectedStalls.length,
      totalAmount: getTotalAmount(),
      discountAmount: getDiscountAmount(),
      taxAmount: getTaxAmount(),
      baseAmount: getBaseAmount(),
      eventDate: selectedEventDate
    }
  };

  return (
    <StallBookingContext.Provider value={value}>
      {children}
    </StallBookingContext.Provider>
  );
};

export const useStallBooking = () => {
  const context = useContext(StallBookingContext);
  if (!context) {
    throw new Error('useStallBooking must be used within a StallBookingProvider');
  }
  return context;
};