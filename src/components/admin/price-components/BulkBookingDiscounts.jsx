"use client";
import { useState } from 'react';
import { UsersIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function BulkBookingDiscounts({ 
  title, 
  subtitle, 
  discounts, 
  onAdd, 
  onRemove, 
  onToggle, 
  isDarkMode 
}) {
  const [newDiscount, setNewDiscount] = useState({ minSeats: '', discountPercent: '' });

  const handleAdd = () => {
    onAdd(newDiscount);
    setNewDiscount({ minSeats: '', discountPercent: '' });
  };

  return (
    <div className={`p-4 sm:p-6 rounded-xl border ${
      isDarkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'
    }`}>
      <h3 className={`text-base sm:text-lg font-semibold mb-2 flex items-center ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </h3>
      
      {subtitle && (
        <p className={`text-xs sm:text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {subtitle}
        </p>
      )}
      
      {/* Discount List */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 max-h-48 overflow-y-auto">
        {discounts.length === 0 ? (
          <div className={`text-center py-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No bulk booking discounts configured
          </div>
        ) : (
          discounts.map((discount, index) => (
            <div key={index} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border ${
              discount.isActive 
                ? isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
                : isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
            }`}>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={discount.isActive}
                  onChange={(e) => onToggle(index, e.target.checked)}
                  className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                />
                <span className={`text-xs sm:text-sm font-medium truncate ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <span className="hidden sm:inline">{discount.minSeats}+ seats: {discount.discountPercent}% off</span>
                  <span className="sm:hidden">{discount.minSeats}+ seats: {discount.discountPercent}%</span>
                </span>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                title="Remove discount"
              >
                <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add New Discount Form */}
      <div className={`border-t pt-3 sm:pt-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <h4 className={`text-xs sm:text-sm font-medium mb-2 sm:mb-3 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          ➕ Add New Bulk Booking Discount
        </h4>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="number"
            placeholder="Min Seats"
            value={newDiscount.minSeats}
            onChange={(e) => setNewDiscount(prev => ({ ...prev, minSeats: e.target.value }))}
            className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <input
            type="number"
            placeholder="Discount %"
            value={newDiscount.discountPercent}
            onChange={(e) => setNewDiscount(prev => ({ ...prev, discountPercent: e.target.value }))}
            className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="ml-1 hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
