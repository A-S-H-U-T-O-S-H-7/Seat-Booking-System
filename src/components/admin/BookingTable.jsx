import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon
} from 'lucide-react';

export default function BookingTable({
  bookings,
  isDarkMode,
  isUpdating,
  onViewDetails,
  onViewPayment,
  onAdjustPrice,
  onConfirm,
  onCancel,
  onApproveCancellation,
  onRejectCancellation
}) {
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

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    try {
      let date;
      
      // Handle Firebase Timestamp
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      }
      // Handle seconds timestamp
      else if (dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
      }
      // Handle regular Date object
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      // Handle date string or number
      else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      
      if (date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
    }
    
    return 'N/A';
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    try {
      let date;
      
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      }
      else if (dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
      }
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      
      if (date && !isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    } catch (error) {
      console.error('Error formatting datetime:', error, dateValue);
    }
    
    return 'N/A';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        bg: isDarkMode ? 'bg-green-900 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200',
        icon: '✅',
        label: 'Confirmed'
      },
      pending: {
        bg: isDarkMode ? 'bg-yellow-900 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⏳',
        label: 'Pending'
      },
      cancelled: {
        bg: isDarkMode ? 'bg-red-900 text-red-300 border-red-700' : 'bg-red-100 text-red-800 border-red-200',
        icon: '❌',
        label: 'Cancelled'
      },
      'cancellation-requested': {
        bg: isDarkMode ? 'bg-orange-900 text-orange-300 border-orange-700' : 'bg-orange-100 text-orange-800 border-orange-200',
        icon: '🔄',
        label: 'Cancellation Requested'
      },
      refunded: {
        bg: isDarkMode ? 'bg-purple-900 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '💸',
        label: 'Refunded'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const renderActionButtons = (booking) => {
    const baseButtonClass = `p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;
    
    return (
      <div className="flex items-center space-x-2">
        {/* View Details Button */}
        <button
          onClick={() => onViewDetails(booking)}
          className={`${baseButtonClass} ${
            isDarkMode 
              ? 'bg-blue-700 hover:bg-blue-600 text-blue-200' 
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
          }`}
          title="View Details"
        >
          <EyeIcon className="h-4 w-4" />
        </button>

        {/* Status-specific action buttons */}
        {booking.status === 'pending' && (
          <>
            <button
              onClick={() => onConfirm(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode 
                  ? 'bg-green-700 hover:bg-green-600 text-green-200' 
                  : 'bg-green-100 hover:bg-green-200 text-green-700'
              }`}
              title="Confirm Booking"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onCancel(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode 
                  ? 'bg-red-700 hover:bg-red-600 text-red-200' 
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
              title="Cancel Booking"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </>
        )}

        {booking.status === 'confirmed' && (
          <>
            <button
              onClick={() => onAdjustPrice(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode 
                  ? 'bg-purple-700 hover:bg-purple-600 text-purple-200' 
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
              }`}
              title="Adjust Price"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onCancel(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode 
                  ? 'bg-red-700 hover:bg-red-600 text-red-200' 
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
              title="Cancel Booking"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </>
        )}

        {booking.status === 'cancellation-requested' && (
          <>
            <button
              onClick={() => onApproveCancellation(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode 
                  ? 'bg-green-700 hover:bg-green-600 text-green-200' 
                  : 'bg-green-100 hover:bg-green-200 text-green-700'
              }`}
              title="Approve Cancellation"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRejectCancellation(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode 
                  ? 'bg-red-700 hover:bg-red-600 text-red-200' 
                  : 'bg-red-100 hover:bg-red-200 text-red-700'
              }`}
              title="Reject Cancellation"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    );
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-12 text-center`}>
        <div className="text-6xl mb-4">📋</div>
        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          No Bookings Found
        </h3>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          There are no bookings to display at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                📋 Booking Details
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                👤 Customer
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                🎫 Event & Seats
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                💰 Amount
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                📊 Status
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                ⚡ Actions
              </th>
            </tr>
          </thead>
          <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
            {bookings.map((booking) => (
              <tr key={booking.id} className={`transition-colors duration-150 ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {booking.id}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      📅 {formatDateTime(booking.createdAt)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                        booking.status === 'confirmed' ? 'bg-green-500' : 
                        booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {booking.customerDetails?.name?.charAt(0) || '?'}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {booking.customerDetails?.name || 'N/A'}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        📧 {booking.customerDetails?.email || 'N/A'}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        📱 {booking.customerDetails?.phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      🗓️ {formatDate(booking.eventDate)}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      🌅 {booking.shift || 'N/A'} • 🪑 {booking.seatCount || booking.seats?.length || 0} seats
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} max-w-xs`}>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {booking.seats?.slice(0, 3).map((seat, index) => (
                          <span key={index} className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {seat}
                          </span>
                        )) || []}
                        {(booking.seats?.length || 0) > 3 && (
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            +{(booking.seats?.length || 0) - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(booking.totalAmount)}
                    </div>
                    {booking.priceAdjusted && (
                      <div className="text-xs text-blue-600">
                        📝 Original: {formatCurrency(booking.originalAmount)}
                      </div>
                    )}
                    {booking.discountApplied > 0 && (
                      <div className="text-xs text-green-600">
                        🎯 Discount: {booking.discountApplied}%
                      </div>
                    )}
                    <button
                      onClick={() => onViewPayment(booking)}
                      className="text-xs text-purple-600 hover:text-purple-800 underline mt-1 block"
                      title="View Payment Details"
                    >
                      💳 Payment Details
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(booking.status)}
                  {booking.cancellationReason && (
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Reason: {booking.cancellationReason}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderActionButtons(booking)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Updating...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}