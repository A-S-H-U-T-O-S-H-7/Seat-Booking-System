"use client";
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import EarlyBirdDiscounts from './EarlyBirdDiscounts';
import BulkBookingDiscounts from './BulkBookingDiscounts';

export default function StallPriceSection({ settings, onUpdate, isDarkMode }) {
  // Stall seat pricing
  const handleSeatPriceChange = (e) => {
    const value = e.target.value;
    onUpdate({ ...settings, seatPrice: value });
  };

  // Early Bird Discount handlers
  const handleEarlyBirdAdd = (newDiscount) => {
    if (!newDiscount.daysBeforeEvent || !newDiscount.discountPercent) return;
    const discount = {
      daysBeforeEvent: parseInt(newDiscount.daysBeforeEvent),
      discountPercent: parseInt(newDiscount.discountPercent),
      isActive: true
    };
    const updatedDiscounts = [...(settings.earlyBirdDiscounts || []), discount];
    onUpdate({ ...settings, earlyBirdDiscounts: updatedDiscounts });
  };

  const handleEarlyBirdRemove = (index) => {
    const updatedDiscounts = settings.earlyBirdDiscounts.filter((_, i) => i !== index);
    onUpdate({ ...settings, earlyBirdDiscounts: updatedDiscounts });
  };

  const handleEarlyBirdToggle = (index, isActive) => {
    const updatedDiscounts = [...settings.earlyBirdDiscounts];
    updatedDiscounts[index].isActive = isActive;
    onUpdate({ ...settings, earlyBirdDiscounts: updatedDiscounts });
  };

  // Bulk Booking Discount handlers
  const handleBulkAdd = (newDiscount) => {
    if (!newDiscount.minSeats || !newDiscount.discountPercent) return;
    const discount = {
      minSeats: parseInt(newDiscount.minSeats),
      discountPercent: parseInt(newDiscount.discountPercent),
      isActive: true
    };
    const updatedDiscounts = [...(settings.bulkBookingDiscounts || []), discount];
    onUpdate({ ...settings, bulkBookingDiscounts: updatedDiscounts });
  };

  const handleBulkRemove = (index) => {
    const updatedDiscounts = settings.bulkBookingDiscounts.filter((_, i) => i !== index);
    onUpdate({ ...settings, bulkBookingDiscounts: updatedDiscounts });
  };

  const handleBulkToggle = (index, isActive) => {
    const updatedDiscounts = [...settings.bulkBookingDiscounts];
    updatedDiscounts[index].isActive = isActive;
    onUpdate({ ...settings, bulkBookingDiscounts: updatedDiscounts });
  };

  return (
    <div className="space-y-6">
      {/* Seat Pricing Section */}
      <div className={`p-4 sm:p-6 rounded-xl border ${
        isDarkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-base sm:text-lg font-semibold mb-4 flex items-center ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <ShoppingBagIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 flex-shrink-0" />
          <span className="truncate">Stall Seat Pricing</span>
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Base Price Per Seat (₹)
            </label>
            <input
              type="number"
              value={settings.seatPrice || ''}
              onChange={handleSeatPriceChange}
              placeholder="Enter price per seat"
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border transition-colors focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Early Bird Discounts */}
      <EarlyBirdDiscounts
        title="Early Bird Discounts"
        subtitle="Offer discounts for bookings made in advance"
        discounts={settings.earlyBirdDiscounts || []}
        onAdd={handleEarlyBirdAdd}
        onRemove={handleEarlyBirdRemove}
        onToggle={handleEarlyBirdToggle}
        isDarkMode={isDarkMode}
      />

      {/* Bulk Booking Discounts */}
      <BulkBookingDiscounts
        title="Bulk Booking Discounts"
        subtitle="Offer discounts for group bookings"
        discounts={settings.bulkBookingDiscounts || []}
        onAdd={handleBulkAdd}
        onRemove={handleBulkRemove}
        onToggle={handleBulkToggle}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
