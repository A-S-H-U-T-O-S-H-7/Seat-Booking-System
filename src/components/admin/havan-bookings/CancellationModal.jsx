import { useState } from 'react';
import { XCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CancellationModal({
  show,
  booking,
  onClose,
  onConfirm,
  isUpdating,
  isDarkMode
}) {
  const [cancellationReason, setCancellationReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  if (!show || !booking) return null;

  const predefinedReasons = [
    'Customer Request',
    'Payment Failed',
    'Event Cancelled',
    'Overbooking',
    'Customer No-Show',
    'Technical Issue',
    'Policy Violation',
    'Other'
  ];

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) {
      return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    if (reason === 'Other') {
      setCancellationReason('');
    } else {
      setCancellationReason(reason);
    }
  };

  const handleConfirm = () => {
    const finalReason = selectedReason === 'Other' ? cancellationReason : selectedReason;
    if (!finalReason.trim()) {
      return;
    }
    console.log('🚀 CancellationModal handleConfirm called with reason:', finalReason);
    console.log('📋 Booking being cancelled:', booking?.id);
    onConfirm(finalReason);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-black/20 bg-opacity-75 backdrop-blur-md"></div>
        </div>
        <div className={`relative max-w-3xl w-full mx-auto rounded-xl shadow-2xl overflow-hidden transform transition-all z-[70] ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-white mr-3" />
              <h3 className="text-xl font-bold text-white">❌ Cancel Booking</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-150 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Warning Message */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-red-900 bg-opacity-30 border border-red-700' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex">
                  <ExclamationTriangleIcon className={`w-6 h-6 ${isDarkMode ? 'text-red-400' : 'text-red-500'} mr-3 flex-shrink-0 mt-0.5`} />
                  <div>
                    <h4 className={`text-md font-semibold mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-900'}`}>
                      ⚠️ Confirm Cancellation
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-800'} mb-2`}>
                      This action cannot be undone and will:
                    </p>
                    <ul className={`text-xs space-y-1 ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                      <li>• Release {booking.seatCount || booking.seats?.length || 0} reserved Havan seats</li>
                      <li>• Make seats available for booking again</li>
                      <li>• Update status to "Cancelled"</li>
                      <li>• May require refund processing</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
              }`}>
                <h4 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  📋 Booking Information
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Booking ID:</span>
                    <span className={`text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-[180px] truncate`}>
                      {booking.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Customer:</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-[180px] truncate`}>
                      {booking.customerDetails?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Seats:</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      🪑 {booking.seatCount || booking.seats?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount:</span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                📝 Reason for Cancellation *
              </label>
              
              {/* Predefined Reasons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                {predefinedReasons.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => handleReasonSelect(reason)}
                    className={`p-3 text-sm rounded-lg border transition-all duration-150 text-left hover:scale-105 transform ${
                      selectedReason === reason
                        ? isDarkMode
                          ? 'border-red-500 bg-red-900 bg-opacity-30 text-red-300 shadow-lg'
                          : 'border-red-500 bg-red-50 text-red-700 shadow-lg'
                        : isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {/* Custom Reason Input */}
              {selectedReason === 'Other' && (
                <div className="mt-3">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Custom Reason
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    rows={3}
                    className={`block w-full px-4 py-3 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Please specify the reason for cancellation..."
                    required
                  />
                </div>
              )}

              {selectedReason && selectedReason !== 'Other' && (
                <div className={`mt-3 p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-900'}`}>
                    <strong>Selected reason:</strong> {selectedReason}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={isUpdating}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={isUpdating || !selectedReason || (selectedReason === 'Other' && !cancellationReason.trim())}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-red-700 hover:bg-red-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
