import { useBooking } from '@/context/BookingContext';

const PricingBreakdown = ({ compact = false }) => {
  const { getPricingBreakdown, selectedSeats, getCurrentDiscountInfo, getNextMilestone } = useBooking();
  
  if (selectedSeats.length === 0) return null;
  
  const breakdown = getPricingBreakdown();
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (compact) {
    const currentDiscount = getCurrentDiscountInfo();
    const nextMilestone = getNextMilestone();
    
    return (
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold text-amber-800">Total Amount</h4>
              <div className="text-sm text-amber-600">
                {breakdown.seatCount} seat{breakdown.seatCount > 1 ? 's' : ''} × {formatCurrency(breakdown.basePrice)}
                {breakdown.discounts.seasonal.applied && (
                  <span className="ml-2 text-orange-700 font-medium">
                    ({breakdown.discounts.seasonal.name})
                  </span>
                )}
              </div>
              {breakdown.totalDiscountPercent > 0 && (
                <div className="text-sm text-green-700 font-medium">
                  {breakdown.discounts.earlyBird.applied && (
                    <span>🎉 Early Bird Discount: {breakdown.earlyBirdDiscount}%</span>
                  )}
                  {breakdown.discounts.bulk.applied && (
                    <span>🎁 Bulk Discount: {breakdown.bulkDiscount}%</span>
                  )}
                </div>
              )}
              {breakdown.taxRate > 0 && (
                <div className="text-sm text-amber-600">
                  Tax: {breakdown.taxRate}% = {formatCurrency(breakdown.taxAmount)}
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-amber-800 bg-white px-6 py-3 rounded-xl shadow-md">
              {formatCurrency(breakdown.totalAmount)}
            </div>
          </div>
        </div>
        
        {/* Current Discount Info for Compact View */}
        {currentDiscount && (
          <div className="bg-green-100 border border-green-300 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-bold text-sm">🎉</span>
              <span className="text-green-800 text-sm font-medium">
                {currentDiscount.percent}% {currentDiscount.label} Applied!
              </span>
            </div>
          </div>
        )}
        
        {/* Next Milestone for Compact View */}
        {nextMilestone && (
          <div className="bg-orange-100 border border-orange-300 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-orange-600 font-bold text-sm">🎯</span>
              <span className="text-orange-800 text-sm font-medium">
                Book {nextMilestone.seatsNeeded} more seat{nextMilestone.seatsNeeded > 1 ? 's' : ''} to get {nextMilestone.discountPercent}% discount!
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Base Pricing */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Pricing Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Price per Seat:</span>
            <span>{formatCurrency(breakdown.basePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Number of Seats:</span>
            <span>{breakdown.seatCount}</span>
          </div>
          {breakdown.discounts.seasonal.applied && (
            <div className="flex justify-between text-orange-700">
              <span>Seasonal Pricing ({breakdown.discounts.seasonal.name}):</span>
              <span>{breakdown.seasonalMultiplier}x</span>
            </div>
          )}
          <div className="flex justify-between font-medium border-t pt-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(breakdown.baseAmount)}</span>
          </div>
        </div>
      </div>

      {/* Discounts */}
      {breakdown.totalDiscountPercent > 0 && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-800 mb-3">Applied Discounts</h4>
          <div className="space-y-2 text-sm">
            {breakdown.discounts.earlyBird.applied && (
              <div className="flex justify-between text-green-700">
                <span>🎉 Early Bird Discount ({breakdown.discounts.earlyBird.daysBeforeEvent}+ days):</span>
                <span>-{breakdown.earlyBirdDiscount}%</span>
              </div>
            )}
            {breakdown.discounts.bulk.applied && (
              <div className="flex justify-between text-green-700">
                <span>🎁 Bulk Discount ({breakdown.discounts.bulk.minSeats}+ seats):</span>
                <span>-{breakdown.bulkDiscount}%</span>
              </div>
            )}
            <div className="flex justify-between font-medium border-t pt-2 text-green-800">
              <span>Total Discount:</span>
              <span>-{formatCurrency(breakdown.discountAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tax */}
      {breakdown.taxRate > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex justify-between text-sm">
            <span>Tax ({breakdown.taxRate}%):</span>
            <span>+{formatCurrency(breakdown.taxAmount)}</span>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-semibold text-amber-800">Final Total</h4>
            {breakdown.discounts.combined.applied && (
              <div className="text-sm text-gray-600 mt-1">
                <span className="line-through text-gray-500">{formatCurrency(breakdown.originalAmount)}</span>
                <span className="ml-2 text-green-600 font-semibold">
                  You saved {formatCurrency(breakdown.discountAmount)}!
                </span>
              </div>
            )}
            <p className="text-sm text-amber-600">All taxes and discounts included</p>
          </div>
          <div className="text-2xl font-bold text-amber-800">
            {formatCurrency(breakdown.totalAmount)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingBreakdown;
