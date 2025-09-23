"use client";
import { TvIcon } from '@heroicons/react/24/outline';
import EarlyBirdDiscounts from './EarlyBirdDiscounts';
import BulkBookingDiscounts from './BulkBookingDiscounts';

export default function ShowPriceSection({ settings, onUpdate, isDarkMode }) {
  // State to track Block A Premium price for synced display
  const blockAPremiumPrice = settings.seatTypes?.blockA?.price || '';
  // Seat Type price handlers
  const handleSeatTypeChange = (seatType, field, value) => {
    const updatedSeatTypes = { ...settings.seatTypes };
    if (!updatedSeatTypes[seatType]) {
      updatedSeatTypes[seatType] = { price: '', label: '' };
    }
    updatedSeatTypes[seatType][field] = value;
    onUpdate({ ...settings, seatTypes: updatedSeatTypes });
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

  // Define seat types with their characteristics
  const seatTypes = [
    { key: 'blockA', label: 'Block A Premium', color: 'purple' },
    { key: 'blockB', label: 'Block B Premium', color: 'blue' },
    { key: 'blockC', label: 'Block C Regular', color: 'green' },
    { key: 'blockD', label: 'Block D Regular', color: 'yellow' }
  ];

  return (
    <div className="space-y-6">
      {/* Seat Type Pricing Section */}
      <div className={`p-4 sm:p-6 rounded-xl border ${
        isDarkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-base sm:text-lg font-semibold mb-4 flex items-center ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <TvIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500 flex-shrink-0" />
          <span className="truncate">Show Seat Pricing by Block</span>
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {seatTypes.map((seatType) => (
            <div key={seatType.key} className={`p-3 sm:p-4 rounded-lg border-2 ${
              seatType.color === 'purple' ? 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700' :
              seatType.color === 'blue' ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' :
              seatType.color === 'green' ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700' :
              'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700'
            }`}>
              <label className={`block text-xs sm:text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {seatType.label} (₹)
              </label>
              <input
                type="number"
                value={
                  seatType.key === 'blockB' 
                    ? blockAPremiumPrice // Block B shows Block A's price
                    : settings.seatTypes?.[seatType.key]?.price || ''
                }
                onChange={(e) => {
                  if (seatType.key !== 'blockB') { // Block B is not editable
                    handleSeatTypeChange(seatType.key, 'price', e.target.value)
                  }
                }}
                readOnly={seatType.key === 'blockB'}
                disabled={seatType.key === 'blockB'}
                placeholder={`Enter ${seatType.label.toLowerCase()} price`}
                className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:ring-2 focus:border-transparent ${
                  seatType.key === 'blockB' 
                    ? 'cursor-not-allowed ' + (isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-600')
                    : (seatType.color === 'purple' ? 'focus:ring-purple-500' :
                       seatType.color === 'blue' ? 'focus:ring-blue-500' :
                       seatType.color === 'green' ? 'focus:ring-green-500' :
                       'focus:ring-yellow-500') + ' ' + 
                      (isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500')
                }`}
              />
            </div>
          ))}
        </div>
        
        <div className={`mt-4 p-3 rounded-lg border ${
          isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
        }`}>
          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            💡 Note: Early bird and bulk booking discounts will apply universally to all seat types.
          </p>
        </div>
      </div>

      {/* Early Bird Discounts */}
      <EarlyBirdDiscounts
        title="Early Bird Discounts"
        subtitle="Offer discounts for bookings made in advance - applies to all seat types"
        discounts={settings.earlyBirdDiscounts || []}
        onAdd={handleEarlyBirdAdd}
        onRemove={handleEarlyBirdRemove}
        onToggle={handleEarlyBirdToggle}
        isDarkMode={isDarkMode}
      />

      {/* Bulk Booking Discounts */}
      <BulkBookingDiscounts
        title="Bulk Booking Discounts"
        subtitle="Offer discounts for group bookings - applies to all seat types"
        discounts={settings.bulkBookingDiscounts || []}
        onAdd={handleBulkAdd}
        onRemove={handleBulkRemove}
        onToggle={handleBulkToggle}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
