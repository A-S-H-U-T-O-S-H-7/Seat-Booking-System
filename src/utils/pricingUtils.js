/**
 * Pricing utilities for seat and stall booking calculations
 * Handles bulk discounts, early bird discounts, tax calculations
 */

/**
 * Calculate price breakdown with all discounts and taxes
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
  
  if (quantity === 0) {
    return {
      basePrice,
      quantity,
      baseAmount: 0,
      discounts: {
        earlyBird: { percent: 0, applied: false, discount: null, daysUntil: 0 },
        bulk: { percent: 0, applied: false, discount: null },
        best: { percent: 0, type: 'none', discount: null },
        combined: { percent: 0, applied: false }
      },
      discountAmount: 0,
      discountedAmount: 0,
      taxRate,
      taxAmount: 0,
      totalAmount: 0
    };
  }
  
  // Calculate early bird discount
  const earlyBirdResult = calculateEarlyBirdDiscount(selectedDate, earlyBirdDiscounts);
  
  // Calculate bulk discount
  const bulkDiscountResult = calculateBulkDiscount(quantity, bulkDiscounts, quantityKey);
  
  // Calculate combined discounts
  const combinedResult = calculateCombinedDiscount(earlyBirdResult, bulkDiscountResult);
  
  // Keep best discount for backward compatibility
  const bestDiscount = getBestDiscount(earlyBirdResult, bulkDiscountResult);
  
  // Apply combined discount
  const discountAmount = (baseAmount * combinedResult.percent) / 100;
  const discountedAmount = baseAmount - discountAmount;
  
  // Calculate tax
  const taxAmount = (discountedAmount * taxRate) / 100;
  const totalAmount = discountedAmount + taxAmount;
  
  return {
    basePrice,
    quantity,
    baseAmount,
    discounts: {
      earlyBird: earlyBirdResult,
      bulk: bulkDiscountResult,
      best: bestDiscount,
      combined: combinedResult
    },
    discountAmount,
    discountedAmount,
    taxRate,
    taxAmount,
    totalAmount,
    originalAmount: baseAmount // For calculating savings (original price before discounts)
  };
};

/**
 * Calculate early bird discount
 */
export const calculateEarlyBirdDiscount = (selectedDate, earlyBirdDiscounts = []) => {
  if (!selectedDate || !earlyBirdDiscounts.length) {
    return { percent: 0, applied: false, discount: null, daysUntil: 0 };
  }
  
  const today = new Date();
  const eventDate = new Date(selectedDate);
  const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  
  // Find applicable early bird discount
  const applicableDiscount = earlyBirdDiscounts
    .filter(discount => discount.isActive && daysUntilEvent >= discount.daysBeforeEvent)
    .sort((a, b) => b.discountPercent - a.discountPercent)[0]; // Get highest discount
  
  if (applicableDiscount) {
    return {
      percent: applicableDiscount.discountPercent,
      applied: true,
      discount: applicableDiscount,
      daysUntil: daysUntilEvent
    };
  }
  
  return { percent: 0, applied: false, discount: null, daysUntil: daysUntilEvent };
};

/**
 * Calculate bulk discount
 */
export const calculateBulkDiscount = (quantity, bulkDiscounts = [], quantityKey = 'minSeats') => {
  if (quantity === 0 || !bulkDiscounts.length) {
    return { percent: 0, applied: false, discount: null };
  }
  
  // Find applicable bulk discount (highest discount for quantity)
  const applicableDiscount = bulkDiscounts
    .filter(discount => discount.isActive && quantity >= discount[quantityKey])
    .sort((a, b) => b.discountPercent - a.discountPercent)[0];
  
  if (applicableDiscount) {
    return {
      percent: applicableDiscount.discountPercent,
      applied: true,
      discount: applicableDiscount
    };
  }
  
  return { percent: 0, applied: false, discount: null };
};

/**
 * Determine the best discount between early bird and bulk
 */
export const getBestDiscount = (earlyBirdResult, bulkDiscountResult) => {
  if (earlyBirdResult.percent > bulkDiscountResult.percent) {
    return {
      percent: earlyBirdResult.percent,
      type: 'earlyBird',
      discount: earlyBirdResult.discount
    };
  } else if (bulkDiscountResult.percent > 0) {
    return {
      percent: bulkDiscountResult.percent,
      type: 'bulk',
      discount: bulkDiscountResult.discount
    };
  }
  
  return { percent: 0, type: 'none', discount: null };
};

/**
 * Calculate combined discount from both early bird and bulk discounts
 */
export const calculateCombinedDiscount = (earlyBirdResult, bulkDiscountResult) => {
  if (!earlyBirdResult.applied && !bulkDiscountResult.applied) {
    return { percent: 0, applied: false };
  }

  // If both discounts are applicable, combine them
  if (earlyBirdResult.applied && bulkDiscountResult.applied) {
    // Simple addition of discount percentages
    // If early bird is 10% and bulk is 2%, total discount is 12%
    const earlyBirdPercent = earlyBirdResult.percent;
    const bulkPercent = bulkDiscountResult.percent;
    
    // Calculate combined percentage using simple addition
    const combinedPercent = earlyBirdPercent + bulkPercent;
    
    return {
      percent: combinedPercent,
      applied: true,
      earlyBird: earlyBirdResult,
      bulk: bulkDiscountResult
    };
  }
  
  // If only one discount is applicable, return that
  if (earlyBirdResult.applied) {
    return {
      percent: earlyBirdResult.percent,
      applied: true,
      earlyBird: earlyBirdResult,
      bulk: null
    };
  }
  
  if (bulkDiscountResult.applied) {
    return {
      percent: bulkDiscountResult.percent,
      applied: true,
      earlyBird: null,
      bulk: bulkDiscountResult
    };
  }
  
  return { percent: 0, applied: false };
};

/**
 * Get next bulk milestone information
 */
export const getNextBulkMilestone = (currentQuantity, bulkDiscounts = [], quantityKey = 'minSeats') => {
  if (!bulkDiscounts.length) {
    return null;
  }
  
  // Find the next milestone
  const nextMilestone = bulkDiscounts
    .filter(discount => discount.isActive && discount[quantityKey] > currentQuantity)
    .sort((a, b) => a[quantityKey] - b[quantityKey])[0];
  
  if (nextMilestone) {
    return {
      quantity: nextMilestone[quantityKey],
      discountPercent: nextMilestone.discountPercent,
      seatsNeeded: nextMilestone[quantityKey] - currentQuantity,
      title: nextMilestone.title || `${nextMilestone.discountPercent}% off`
    };
  }
  
  return null;
};

/**
 * Format currency with Indian Rupee symbol
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }
  
  return `₹${amount.toLocaleString('en-IN')}`;
};

/**
 * Get discount display information for UI
 */
export const getDiscountDisplayInfo = (discountResult) => {
  if (!discountResult || !discountResult.applied || discountResult.percent === 0) {
    return null;
  }
  
  const { discount, percent, type } = discountResult;
  
  return {
    type,
    percent,
    title: discount?.title || `${percent}% ${type === 'earlyBird' ? 'Early Bird' : type === 'bulk' ? 'Bulk' : 'Combined'} Discount`,
    description: discount?.description || `Save ${percent}% on your booking!`,
    savings: discount?.savings || null
  };
};

/**
 * Calculate savings amount based on original price and discounted price
 */
export const calculateSavings = (originalAmount, discountedAmount) => {
  return originalAmount - discountedAmount;
};

/**
 * Format savings for display
 */
export const formatSavings = (originalAmount, discountedAmount) => {
  const savings = calculateSavings(originalAmount, discountedAmount);
  if (savings <= 0) return null;
  
  return {
    amount: savings,
    formatted: formatCurrency(savings),
    originalFormatted: formatCurrency(originalAmount),
    percentSaved: Math.round((savings / originalAmount) * 100)
  };
};

/**
 * Calculate percentage of a value
 */
export const calculatePercentage = (value, percent) => {
  return (value * percent) / 100;
};

/**
 * Get price per unit (seat/stall)
 */
export const getPricePerUnit = (totalPrice, quantity) => {
  if (quantity === 0) return 0;
  return totalPrice / quantity;
};

/**
 * Check if early bird discount is active
 */
export const isEarlyBirdActive = (selectedDate, earlyBirdDiscounts = []) => {
  if (!selectedDate || !earlyBirdDiscounts.length) return false;
  
  const today = new Date();
  const eventDate = new Date(selectedDate);
  const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
  
  return earlyBirdDiscounts.some(discount => 
    discount.isActive && daysUntilEvent >= discount.daysBeforeEvent
  );
};

/**
 * Check if bulk discount is applicable
 */
export const isBulkDiscountApplicable = (quantity, bulkDiscounts = [], quantityKey = 'minSeats') => {
  if (quantity === 0 || !bulkDiscounts.length) return false;
  
  return bulkDiscounts.some(discount => 
    discount.isActive && quantity >= discount[quantityKey]
  );
};

/**
 * Get all applicable discounts
 */
export const getApplicableDiscounts = (quantity, selectedDate, earlyBirdDiscounts = [], bulkDiscounts = [], quantityKey = 'minSeats') => {
  const earlyBird = calculateEarlyBirdDiscount(selectedDate, earlyBirdDiscounts);
  const bulk = calculateBulkDiscount(quantity, bulkDiscounts, quantityKey);
  const combined = calculateCombinedDiscount(earlyBird, bulk);
  
  return {
    earlyBird,
    bulk,
    hasAnyDiscount: earlyBird.applied || bulk.applied,
    bestDiscount: getBestDiscount(earlyBird, bulk),
    combinedDiscount: combined
  };
};
