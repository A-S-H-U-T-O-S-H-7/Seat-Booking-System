/**
 * Shared pricing calculation utilities
 * Used across Havan, Stall, and Show booking contexts
 */

/**
 * Calculate early bird discount based on event date and discount rules
 * @param {Date|string} selectedDate - The selected event date
 * @param {Array} earlyBirdDiscounts - Array of early bird discount rules
 * @returns {Object} - { percent: number, appliedDiscount: object|null, daysUntil: number }
 */
export const calculateEarlyBirdDiscount = (selectedDate, earlyBirdDiscounts = []) => {
  if (!selectedDate || !Array.isArray(earlyBirdDiscounts) || earlyBirdDiscounts.length === 0) {
    return { percent: 0, appliedDiscount: null, daysUntil: 0 };
  }

  const eventDate = new Date(selectedDate);
  const today = new Date();
  
  // Validate dates
  if (isNaN(eventDate.getTime()) || isNaN(today.getTime())) {
    console.warn('Invalid dates for early bird calculation:', { selectedDate, today });
    return { percent: 0, appliedDiscount: null, daysUntil: 0 };
  }
  
  const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

  // Find applicable early bird discounts (within timeframe)
  const applicableDiscounts = earlyBirdDiscounts
    .filter(discount => {
      // Validate discount object structure
      if (!discount || 
          typeof discount.daysBeforeEvent !== 'number' || 
          typeof discount.discountPercent !== 'number' ||
          discount.daysBeforeEvent < 0 ||
          discount.discountPercent < 0) {
        console.warn('Invalid early bird discount object:', discount);
        return false;
      }
      return daysUntilEvent >= discount.daysBeforeEvent;
    })
    .sort((a, b) => b.discountPercent - a.discountPercent); // Sort by highest discount first

  const appliedDiscount = applicableDiscounts.length > 0 ? applicableDiscounts[0] : null;

  return {
    percent: appliedDiscount ? appliedDiscount.discountPercent : 0,
    appliedDiscount,
    daysUntil: daysUntilEvent
  };
};

/**
 * Calculate bulk discount based on quantity and discount rules
 * @param {number} quantity - Number of seats/stalls
 * @param {Array} bulkDiscounts - Array of bulk discount rules
 * @param {string} quantityKey - Key for quantity field ('minSeats' or 'minStalls')
 * @returns {Object} - { percent: number, appliedDiscount: object|null }
 */
export const calculateBulkDiscount = (quantity, bulkDiscounts = [], quantityKey = 'minSeats') => {
  if (!quantity || !Array.isArray(bulkDiscounts) || bulkDiscounts.length === 0) {
    return { percent: 0, appliedDiscount: null };
  }

  // Find applicable bulk discounts (meets minimum quantity)
  const applicableDiscounts = bulkDiscounts
    .filter(discount => {
      // Validate discount object structure
      if (!discount || 
          typeof discount[quantityKey] !== 'number' || 
          typeof discount.discountPercent !== 'number' ||
          discount[quantityKey] < 0 ||
          discount.discountPercent < 0) {
        console.warn('Invalid bulk discount object:', discount);
        return false;
      }
      return quantity >= discount[quantityKey];
    })
    .sort((a, b) => b.discountPercent - a.discountPercent); // Sort by highest discount first

  const appliedDiscount = applicableDiscounts.length > 0 ? applicableDiscounts[0] : null;

  return {
    percent: appliedDiscount ? appliedDiscount.discountPercent : 0,
    appliedDiscount
  };
};

/**
 * Calculate the best discount (early bird vs bulk)
 * @param {number} earlyBirdPercent - Early bird discount percentage
 * @param {number} bulkPercent - Bulk discount percentage
 * @param {Object} earlyBirdDiscount - Early bird discount object
 * @param {Object} bulkDiscount - Bulk discount object
 * @returns {Object} - { percent: number, type: string, discount: object|null }
 */
export const getBestDiscount = (earlyBirdPercent, bulkPercent, earlyBirdDiscount, bulkDiscount) => {
  if (earlyBirdPercent >= bulkPercent && earlyBirdPercent > 0) {
    return {
      percent: earlyBirdPercent,
      type: 'earlyBird',
      discount: earlyBirdDiscount
    };
  } else if (bulkPercent > 0) {
    return {
      percent: bulkPercent,
      type: 'bulk',
      discount: bulkDiscount
    };
  } else {
    return {
      percent: 0,
      type: 'none',
      discount: null
    };
  }
};

/**
 * Calculate price breakdown for any booking type
 * @param {Object} params - Calculation parameters
 * @param {number} params.basePrice - Base price per unit
 * @param {number} params.quantity - Number of units (seats/stalls)
 * @param {Date|string} params.selectedDate - Selected event date
 * @param {Array} params.earlyBirdDiscounts - Early bird discount rules
 * @param {Array} params.bulkDiscounts - Bulk discount rules
 * @param {string} params.quantityKey - Key for bulk discount quantity ('minSeats' or 'minStalls')
 * @param {number} params.taxRate - Tax rate percentage (optional, defaults to 0)
 * @returns {Object} - Complete pricing breakdown
 */
export const calculatePriceBreakdown = ({
  basePrice,
  quantity,
  selectedDate,
  earlyBirdDiscounts = [],
  bulkDiscounts = [],
  quantityKey = 'minSeats',
  taxRate = 0
}) => {
  // Base calculations
  const baseAmount = basePrice * quantity;

  // Calculate discounts
  const earlyBird = calculateEarlyBirdDiscount(selectedDate, earlyBirdDiscounts);
  const bulk = calculateBulkDiscount(quantity, bulkDiscounts, quantityKey);
  const bestDiscount = getBestDiscount(
    earlyBird.percent, 
    bulk.percent, 
    earlyBird.appliedDiscount, 
    bulk.appliedDiscount
  );

  // Apply discount
  const discountAmount = Math.round((baseAmount * bestDiscount.percent) / 100);
  const discountedAmount = baseAmount - discountAmount;

  // Calculate tax
  const taxAmount = Math.round((discountedAmount * taxRate) / 100);

  // Final total
  const totalAmount = discountedAmount + taxAmount;

  return {
    basePrice,
    quantity,
    baseAmount,
    discounts: {
      earlyBird: {
        percent: earlyBird.percent,
        applied: earlyBird.percent > 0,
        discount: earlyBird.appliedDiscount,
        daysUntil: earlyBird.daysUntil
      },
      bulk: {
        percent: bulk.percent,
        applied: bulk.percent > 0,
        discount: bulk.appliedDiscount
      },
      best: bestDiscount
    },
    discountAmount,
    discountedAmount,
    taxRate,
    taxAmount,
    totalAmount
  };
};

/**
 * Get next milestone for bulk discount
 * @param {number} currentQuantity - Current quantity
 * @param {Array} bulkDiscounts - Array of bulk discount rules
 * @param {string} quantityKey - Key for quantity field
 * @returns {Object|null} - Next milestone info or null
 */
export const getNextBulkMilestone = (currentQuantity, bulkDiscounts = [], quantityKey = 'minSeats') => {
  if (!currentQuantity || !Array.isArray(bulkDiscounts) || bulkDiscounts.length === 0) {
    return null;
  }

  // Find valid bulk discounts sorted by minimum quantity
  const validBulkDiscounts = bulkDiscounts
    .filter(discount => {
      // Validate discount object structure
      if (!discount || 
          typeof discount[quantityKey] !== 'number' || 
          typeof discount.discountPercent !== 'number' ||
          discount[quantityKey] < 0 ||
          discount.discountPercent < 0) {
        console.warn('Invalid bulk discount object in milestone calculation:', discount);
        return false;
      }
      return true;
    })
    .sort((a, b) => a[quantityKey] - b[quantityKey]);

  if (validBulkDiscounts.length === 0) return null;

  // Find the next milestone
  const nextMilestone = validBulkDiscounts.find(discount => 
    currentQuantity < discount[quantityKey]
  );

  if (nextMilestone) {
    const quantityNeeded = nextMilestone[quantityKey] - currentQuantity;
    return {
      quantityNeeded,
      discountPercent: nextMilestone.discountPercent,
      minQuantity: nextMilestone[quantityKey],
      quantityKey
    };
  }

  return null;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default 'INR')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

/**
 * Get discount info for display
 * @param {Object} priceBreakdown - Result from calculatePriceBreakdown
 * @returns {Object|null} - Display-ready discount info
 */
export const getDiscountDisplayInfo = (priceBreakdown) => {
  const { discounts } = priceBreakdown;
  
  if (discounts.best.type === 'earlyBird') {
    return {
      type: 'Early Bird Discount',
      percent: discounts.best.percent,
      amount: priceBreakdown.discountAmount,
      details: `${discounts.earlyBird.daysUntil} days before event`,
      color: 'text-green-600'
    };
  } else if (discounts.best.type === 'bulk') {
    const minQuantity = discounts.bulk.discount?.[
      priceBreakdown.quantity > 1 && discounts.bulk.discount?.minStalls ? 'minStalls' : 'minSeats'
    ];
    const quantityType = discounts.bulk.discount?.minStalls ? 'stalls' : 'seats';
    
    return {
      type: 'Bulk Booking Discount',
      percent: discounts.best.percent,
      amount: priceBreakdown.discountAmount,
      details: `${minQuantity}+ ${quantityType}`,
      color: 'text-blue-600'
    };
  }
  
  return null;
};
