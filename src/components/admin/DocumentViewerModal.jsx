"use client";
import { useState } from 'react';
import { X } from 'lucide-react';
import MemberPass from '@/components/MemberPass';
import DonationReceipt from '@/components/Receipt';

export default function DocumentViewerModal({ 
  isOpen, 
  onClose, 
  booking, 
  isDarkMode 
}) {
  const [activeTab, setActiveTab] = useState('pass');

  if (!isOpen || !booking) return null;
  
  // Don't show documents for cancelled bookings
  if (booking.status === 'cancelled' || booking.status === 'cancellation-requested') {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 overflow-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] my-auto ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border overflow-hidden flex flex-col`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Booking Documents
            </h2>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Booking ID: {booking.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all hover:scale-105 ${
              isDarkMode 
                ? 'hover:bg-gray-600 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 border-b">
          <button
            onClick={() => setActiveTab('pass')}
            className={`flex-1 px-6 py-3 font-medium transition-all ${
              activeTab === 'pass'
                ? (isDarkMode ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white')
                : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100')
            }`}
          >
            🎟️ Member Pass
          </button>
          {(booking.totalAmount > 0 || booking.amount > 0) && (
            <button
              onClick={() => setActiveTab('receipt')}
              className={`flex-1 px-6 py-3 font-medium transition-all ${
                activeTab === 'receipt'
                  ? (isDarkMode ? 'bg-green-700 text-white' : 'bg-green-600 text-white')
                  : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100')
              }`}
            >
              📄 Receipt
            </button>
          )}
        </div>

        {/* Content */}
        <div className={`p-6 flex-1 overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Member Pass Tab */}
          {activeTab === 'pass' && (
            <div>
              <MemberPass booking={booking} />
            </div>
          )}

          {/* Receipt Tab */}
          {activeTab === 'receipt' && (booking.totalAmount > 0 || booking.amount > 0) && (
            <div>
              <DonationReceipt booking={booking} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 flex justify-end border-t ${
          isDarkMode ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
