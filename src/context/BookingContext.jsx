"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { calculatePriceBreakdown, getNextBulkMilestone, formatCurrency, getDiscountDisplayInfo } from '@/utils/pricingUtils';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [priceSettings, setPriceSettings] = useState({
    defaultSeatPrice: 500,
    taxRate: 0,
    bulkDiscounts: [],
    earlyBirdDiscount: { isActive: false, discountPercent: 0, daysBeforeEvent: 7 },
    seasonalPricing: []
  });
  const [loading, setLoading] = useState(false);
  
  // Real-time sync with admin pricing settings (Havan booking)
  useEffect(() => {
    const havanPricingRef = doc(db, 'settings', 'havanPricing');
    
    // Set up real-time listener for havan pricing changes
    const unsubscribeHavanPricing = onSnapshot(havanPricingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newPriceSettings = {
          defaultSeatPrice: data.seatPrice || 500,
          taxRate: 0, // No tax as per admin requirements
          bulkDiscounts: data.bulkBookingDiscounts || [],
          earlyBirdDiscounts: data.earlyBirdDiscounts || [],
          seasonalPricing: [] // Not implemented for havan yet
        };
        
        setPriceSettings(newPriceSettings);
        
        // Pricing updated silently - no toast needed
      } else {
        // Fallback to general settings for backward compatibility
        const generalRef = doc(db, 'settings', 'general');
        const unsubscribeGeneral = onSnapshot(generalRef, (generalSnap) => {
          if (generalSnap.exists()) {
            setPriceSettings(prev => ({
              ...prev,
              defaultSeatPrice: generalSnap.data().seatPrice || 500
            }));
            
            // Pricing updated silently - no toast needed
          }
        }, (error) => {
          console.error('Error listening to general settings:', error);
        });
        
        return unsubscribeGeneral;
      }
    }, (error) => {
      console.error('Error listening to havan price settings:', error);
      // Set default values on error
      setPriceSettings({
        defaultSeatPrice: 500,
        taxRate: 0,
        bulkDiscounts: [],
        earlyBirdDiscounts: [],
        seasonalPricing: []
      });
    });

    // Cleanup function
    return () => {
      unsubscribeHavanPricing();
    };
  }, [selectedSeats.length]); // Re-run when selectedSeats changes to properly handle notifications

  const addSeat = (seatId) => {
    if (!selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => [...prev, seatId]);
      toast.success(`Seat ${seatId} added to cart`);
    }
  };

  const removeSeat = (seatId) => {
    setSelectedSeats(prev => prev.filter(id => id !== seatId));
    toast.success(`Seat ${seatId} removed from cart`);
  };

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      removeSeat(seatId);
    } else {
      addSeat(seatId);
    }
  };

  const clearSelection = () => {
    setSelectedSeats([]);
    setSelectedDate(null);
    setSelectedShift(null);
  };

  // Calculate seasonal pricing multiplier
  const getSeasonalMultiplier = () => {
    if (!selectedDate) return 1;
    
    const eventDate = new Date(selectedDate);
    const activeSeasonalPricing = priceSettings.seasonalPricing.find(pricing => {
      if (!pricing.isActive || !pricing.startDate || !pricing.endDate) return false;
      
      const startDate = new Date(pricing.startDate);
      const endDate = new Date(pricing.endDate);
      
      return eventDate >= startDate && eventDate <= endDate;
    });
    
    return activeSeasonalPricing ? activeSeasonalPricing.multiplier : 1;
  };
  
  // Get complete pricing breakdown using new utility functions
  const getPricingBreakdown = () => {
    if (selectedSeats.length === 0) {
      return {
        basePrice: priceSettings.defaultSeatPrice || 0,
        quantity: 0,
        baseAmount: 0,
        discounts: {
          earlyBird: { percent: 0, applied: false, discount: null, daysUntil: 0 },
          bulk: { percent: 0, applied: false, discount: null },
          best: { percent: 0, type: 'none', discount: null }
        },
        discountAmount: 0,
        discountedAmount: 0,
        taxRate: priceSettings.taxRate || 0,
        taxAmount: 0,
        totalAmount: 0
      };
    }
    
    const basePrice = priceSettings.defaultSeatPrice || 0;
    const seasonalMultiplier = getSeasonalMultiplier();
    const adjustedBasePrice = basePrice * seasonalMultiplier;
    
    return calculatePriceBreakdown({
      basePrice: adjustedBasePrice,
      quantity: selectedSeats.length,
      selectedDate,
      earlyBirdDiscounts: priceSettings.earlyBirdDiscounts || [],
      bulkDiscounts: priceSettings.bulkDiscounts || [],
      quantityKey: 'minSeats',
      taxRate: priceSettings.taxRate || 0
    });
  };
  
  // Individual helper functions using the breakdown
  const getEarlyBirdDiscount = () => {
    return getPricingBreakdown().discounts.earlyBird.percent;
  };
  
  const getBulkDiscount = () => {
    return getPricingBreakdown().discounts.bulk.percent;
  };
  
  const getBaseAmount = () => {
    return getPricingBreakdown().baseAmount;
  };
  
  const getTotalDiscountPercent = () => {
    return getPricingBreakdown().discounts.combined.percent;
  };
  
  const getDiscountedAmount = () => {
    return getPricingBreakdown().discountedAmount;
  };
  
  const getTaxAmount = () => {
    return getPricingBreakdown().taxAmount;
  };
  
  const getTotalAmount = () => {
    return getPricingBreakdown().totalAmount;
  };

  const getDiscountAmount = () => {
    return getPricingBreakdown().discountAmount;
  };
  
  // Get next milestone discount information
  const getNextMilestone = () => {
    return getNextBulkMilestone(
      selectedSeats.length,
      priceSettings.bulkDiscounts || [],
      'minSeats'
    );
  };
  
  // Get current discount info for display
  const getCurrentDiscountInfo = () => {
    const breakdown = getPricingBreakdown();
    const combinedDiscount = breakdown.discounts.combined;
    
    if (!combinedDiscount.applied || combinedDiscount.percent === 0) {
      return null;
    }

    // If both discounts are applied
    if (combinedDiscount.earlyBird && combinedDiscount.bulk) {
      return {
        type: 'combined',
        percent: combinedDiscount.percent,
        label: 'Early Bird + Bulk Discount',
        earlyBird: {
          percent: combinedDiscount.earlyBird.percent,
          label: 'Early Bird'
        },
        bulk: {
          percent: combinedDiscount.bulk.percent,
          label: 'Bulk Discount'
        }
      };
    }
    
    // If only early bird is applied
    if (combinedDiscount.earlyBird) {
      return {
        type: 'earlyBird',
        percent: combinedDiscount.percent,
        label: 'Early Bird Discount'
      };
    }
    
    // If only bulk discount is applied
    if (combinedDiscount.bulk) {
      const seatCount = selectedSeats.length;
      const appliedDiscount = priceSettings.bulkDiscounts.find(
        d => d.isActive && seatCount >= d.minSeats && d.discountPercent === combinedDiscount.bulk.percent
      );
      return {
        type: 'bulk',
        percent: combinedDiscount.percent,
        label: 'Bulk Discount',
        minSeats: appliedDiscount?.minSeats
      };
    }
    
    return null;
  };

  // Get enhanced pricing breakdown for display
  const getEnhancedPricingBreakdown = () => {
    const breakdown = getPricingBreakdown();
    const seasonalMultiplier = getSeasonalMultiplier();
    
    return {
      ...breakdown,
      seasonalMultiplier,
    // Enhanced discount details for display
    discounts: {
      ...breakdown.discounts,
      seasonal: {
        applied: seasonalMultiplier !== 1,
        multiplier: seasonalMultiplier,
        name: priceSettings.seasonalPricing.find(p => p.isActive)?.name
      }
    },
    // Add savings information for UI
    savings: {
      amount: breakdown.originalAmount - breakdown.discountedAmount,
      percentage: breakdown.discounts.combined.percent,
      applied: breakdown.discounts.combined.applied
    }
    };
  };

  const isBookingComplete = () => {
    return selectedDate && selectedShift && selectedSeats.length > 0;
  };

  const value = {
    // State
    selectedDate,
    selectedShift,
    selectedSeats,
    priceSettings,
    loading,
    
    // Actions
    setSelectedDate,
    setSelectedShift,
    addSeat,
    removeSeat,
    toggleSeat,
    clearSelection,
    setLoading,
    
    // Pricing calculations
    getTotalAmount,
    getDiscountAmount,
    getBaseAmount,
    getTaxAmount,
    getPricingBreakdown,
    getSeasonalMultiplier,
    getEarlyBirdDiscount,
    getBulkDiscount,
    getNextMilestone,
    getCurrentDiscountInfo,
    
    // Computed values
    isBookingComplete,
    
    // Booking details (enhanced)
    bookingDetails: {
      date: selectedDate,
      shift: selectedShift,
      seats: selectedSeats,
      seatCount: selectedSeats.length,
      pricePerSeat: priceSettings.defaultSeatPrice,
      totalAmount: getTotalAmount(),
      discountAmount: getDiscountAmount(),
      taxAmount: getTaxAmount(),
      baseAmount: getBaseAmount(),
      pricingBreakdown: getPricingBreakdown()
    }
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
