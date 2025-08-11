"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

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
  
  // Real-time sync with admin pricing settings
  useEffect(() => {
    const pricingRef = doc(db, 'settings', 'pricing');
    
    // Set up real-time listener for pricing changes
    const unsubscribePricing = onSnapshot(pricingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newPriceSettings = {
          defaultSeatPrice: data.defaultSeatPrice || 500,
          taxRate: data.taxRate || 0,
          bulkDiscounts: data.bulkDiscounts || [],
          earlyBirdDiscount: data.earlyBirdDiscount || { isActive: false, discountPercent: 0, daysBeforeEvent: 7 },
          seasonalPricing: data.seasonalPricing || []
        };
        
        setPriceSettings(newPriceSettings);
      } else {
        // Fallback to general settings for backward compatibility
        const generalRef = doc(db, 'settings', 'general');
        const unsubscribeGeneral = onSnapshot(generalRef, (generalSnap) => {
          if (generalSnap.exists()) {
            setPriceSettings(prev => ({
              ...prev,
              defaultSeatPrice: generalSnap.data().seatPrice || 500
            }));
            
            if (selectedSeats.length > 0) {
              toast.success('🔄 Seat price updated! Your total has been recalculated.', {
                duration: 4000,
                position: 'top-right'
              });
            }
          }
        }, (error) => {
          console.error('Error listening to general settings:', error);
        });
        
        return unsubscribeGeneral;
      }
    }, (error) => {
      console.error('Error listening to price settings:', error);
      // Set default values on error
      setPriceSettings({
        defaultSeatPrice: 500,
        taxRate: 0,
        bulkDiscounts: [],
        earlyBirdDiscount: { isActive: false, discountPercent: 0, daysBeforeEvent: 7 },
        seasonalPricing: []
      });
    });

    // Cleanup function
    return () => {
      unsubscribePricing();
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
  
  // Calculate early bird discount
  const getEarlyBirdDiscount = () => {
    if (!selectedDate || !priceSettings.earlyBirdDiscount.isActive) return 0;
    
    const eventDate = new Date(selectedDate);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent >= priceSettings.earlyBirdDiscount.daysBeforeEvent) {
      return priceSettings.earlyBirdDiscount.discountPercent;
    }
    
    return 0;
  };
  
  // Calculate bulk discount
  const getBulkDiscount = () => {
    const seatCount = selectedSeats.length;
    
    // Find the highest applicable bulk discount
    const applicableDiscounts = priceSettings.bulkDiscounts
      .filter(discount => discount.isActive && seatCount >= discount.minSeats)
      .sort((a, b) => b.discountPercent - a.discountPercent); // Sort by highest discount first
    
    return applicableDiscounts.length > 0 ? applicableDiscounts[0].discountPercent : 0;
  };
  
  // Calculate base amount with seasonal pricing
  const getBaseAmount = () => {
    const basePrice = priceSettings.defaultSeatPrice;
    const seasonalMultiplier = getSeasonalMultiplier();
    return selectedSeats.length * basePrice * seasonalMultiplier;
  };
  
  // Calculate total discount percentage (early bird + bulk, but not compounded)
  const getTotalDiscountPercent = () => {
    const earlyBirdDiscount = getEarlyBirdDiscount();
    const bulkDiscount = getBulkDiscount();
    
    // Apply the higher discount, not both (to prevent over-discounting)
    return Math.max(earlyBirdDiscount, bulkDiscount);
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
  
  // Get next milestone discount information
  const getNextMilestone = () => {
    const seatCount = selectedSeats.length;
    
    if (seatCount < 2 || !priceSettings.bulkDiscounts?.length) return null;
    
    // Get active bulk discounts sorted by minimum seats
    const activeBulkDiscounts = priceSettings.bulkDiscounts
      .filter(discount => discount.isActive)
      .sort((a, b) => a.minSeats - b.minSeats);
    
    if (activeBulkDiscounts.length === 0) return null;
    
    // Find the next milestone
    const nextMilestone = activeBulkDiscounts.find(discount => seatCount < discount.minSeats);
    
    if (nextMilestone) {
      const seatsNeeded = nextMilestone.minSeats - seatCount;
      return {
        seatsNeeded,
        discountPercent: nextMilestone.discountPercent,
        minSeats: nextMilestone.minSeats
      };
    }
    
    return null;
  };
  
  // Get current discount info for display
  const getCurrentDiscountInfo = () => {
    const seatCount = selectedSeats.length;
    const earlyBirdDiscount = getEarlyBirdDiscount();
    const bulkDiscount = getBulkDiscount();
    
    // Determine which discount is being applied (the higher one)
    if (earlyBirdDiscount > 0 && earlyBirdDiscount >= bulkDiscount) {
      return {
        type: 'earlyBird',
        percent: earlyBirdDiscount,
        label: 'Early Bird Discount'
      };
    } else if (bulkDiscount > 0) {
      const appliedDiscount = priceSettings.bulkDiscounts.find(
        d => d.isActive && seatCount >= d.minSeats && d.discountPercent === bulkDiscount
      );
      return {
        type: 'bulk',
        percent: bulkDiscount,
        label: 'Bulk Discount',
        minSeats: appliedDiscount?.minSeats
      };
    }
    
    return null;
  };

  // Get detailed pricing breakdown
  const getPricingBreakdown = () => {
    const basePrice = priceSettings.defaultSeatPrice;
    const seatCount = selectedSeats.length;
    const seasonalMultiplier = getSeasonalMultiplier();
    const baseAmount = getBaseAmount();
    const earlyBirdDiscount = getEarlyBirdDiscount();
    const bulkDiscount = getBulkDiscount();
    const totalDiscountPercent = getTotalDiscountPercent();
    const discountAmount = getDiscountAmount();
    const discountedAmount = getDiscountedAmount();
    const taxAmount = getTaxAmount();
    const totalAmount = getTotalAmount();
    
    return {
      basePrice,
      seatCount,
      seasonalMultiplier,
      baseAmount,
      earlyBirdDiscount,
      bulkDiscount,
      totalDiscountPercent,
      discountAmount,
      discountedAmount,
      taxRate: priceSettings.taxRate,
      taxAmount,
      totalAmount,
      // Discount details for display
      discounts: {
        earlyBird: {
          applied: earlyBirdDiscount > 0,
          percent: earlyBirdDiscount,
          daysBeforeEvent: priceSettings.earlyBirdDiscount.daysBeforeEvent
        },
        bulk: {
          applied: bulkDiscount > 0,
          percent: bulkDiscount,
          minSeats: priceSettings.bulkDiscounts.find(d => d.isActive && seatCount >= d.minSeats)?.minSeats
        },
        seasonal: {
          applied: seasonalMultiplier !== 1,
          multiplier: seasonalMultiplier,
          name: priceSettings.seasonalPricing.find(p => p.isActive)?.name
        }
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
