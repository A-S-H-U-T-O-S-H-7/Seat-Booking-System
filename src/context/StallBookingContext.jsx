"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const StallBookingContext = createContext();

export const StallBookingProvider = ({ children }) => {
  const [selectedStalls, setSelectedStalls] = useState([]); // Changed to array for multiple stalls
  const [priceSettings, setPriceSettings] = useState({
    defaultStallPrice: 5000,
    taxRate: 0,
    discountPercent: 0,
    earlyBirdDiscount: { isActive: false, discountPercent: 0, daysBeforeEvent: 7 }
  });
  const [loading, setLoading] = useState(false);
  
  // Real-time sync with admin pricing settings for stalls
  useEffect(() => {
    const pricingRef = doc(db, 'settings', 'stallPricing');
    
    // Set up real-time listener for stall pricing changes
    const unsubscribePricing = onSnapshot(pricingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newPriceSettings = {
          defaultStallPrice: data.defaultStallPrice || 5000,
          taxRate: data.taxRate || 0,
          discountPercent: data.discountPercent || 0,
          earlyBirdDiscount: data.earlyBirdDiscount || { isActive: false, discountPercent: 0, daysBeforeEvent: 7 }
        };
        
        setPriceSettings(newPriceSettings);
      } else {
        // Set default values if document doesn't exist
        setPriceSettings({
          defaultStallPrice: 5000,
          taxRate: 0,
          discountPercent: 0,
          earlyBirdDiscount: { isActive: false, discountPercent: 0, daysBeforeEvent: 7 }
        });
      }
    }, (error) => {
      console.error('Error listening to stall price settings:', error);
      // Set default values on error
      setPriceSettings({
        defaultStallPrice: 5000,
        taxRate: 0,
        discountPercent: 0,
        earlyBirdDiscount: { isActive: false, discountPercent: 0, daysBeforeEvent: 7 }
      });
    });

    // Cleanup function
    return () => {
      unsubscribePricing();
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

  // Calculate early bird discount
  const getEarlyBirdDiscount = () => {
    if (!priceSettings.earlyBirdDiscount.isActive) return 0;
    
    const today = new Date();
    const eventStart = new Date('2025-11-15'); // Adjust event start date as needed
    const daysUntilEvent = Math.ceil((eventStart - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent >= priceSettings.earlyBirdDiscount.daysBeforeEvent) {
      return priceSettings.earlyBirdDiscount.discountPercent;
    }
    
    return 0;
  };

  // Calculate base amount for all selected stalls
  const getBaseAmount = () => {
    return selectedStalls.length * priceSettings.defaultStallPrice;
  };
  
  // Calculate total discount percentage
  const getTotalDiscountPercent = () => {
    const earlyBirdDiscount = getEarlyBirdDiscount();
    const regularDiscount = priceSettings.discountPercent || 0;
    
    // Apply the higher discount
    return Math.max(earlyBirdDiscount, regularDiscount);
  };
  
  // Calculate discounted amount
  const getDiscountedAmount = () => {
    const baseAmount = getBaseAmount();
    const discountPercent = getTotalDiscountPercent();
    const discountAmount = (baseAmount * discountPercent) / 100;
    return baseAmount - discountAmount;
  };
  
  // Calculate tax amount
  const getTaxAmount = () => {
    const discountedAmount = getDiscountedAmount();
    return (discountedAmount * priceSettings.taxRate) / 100;
  };
  
  // Calculate final total amount
  const getTotalAmount = () => {
    const discountedAmount = getDiscountedAmount();
    const taxAmount = getTaxAmount();
    return Math.round(discountedAmount + taxAmount);
  };

  // Calculate total discount amount
  const getDiscountAmount = () => {
    const baseAmount = getBaseAmount();
    const discountedAmount = getDiscountedAmount();
    return Math.round(baseAmount - discountedAmount);
  };

  const isBookingComplete = () => {
    return selectedStalls.length > 0;
  };

  const value = {
    // State
    selectedStalls, // Changed from selectedStall
    priceSettings,
    loading,
    
    // Actions
    setSelectedStalls,
    addStall,
    removeStall,
    toggleStall,
    clearSelection,
    setLoading,
    
    // Pricing calculations
    getTotalAmount,
    getDiscountAmount,
    getBaseAmount,
    getTaxAmount,
    getEarlyBirdDiscount,
    
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
      baseAmount: getBaseAmount()
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