import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  UserCheck
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
  onRejectCancellation,
  onParticipation
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
        bg: isDarkMode ? 'bg-green-900/30 text-green-300 border-green-600' : 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle,
        label: 'Confirmed'
      },
      pending: {
        bg: isDarkMode ? 'bg-yellow-900/30 text-yellow-300 border-yellow-600' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: Clock,
        label: 'Pending'
      },
      cancelled: {
        bg: isDarkMode ? 'bg-red-900/30 text-red-300 border-red-600' : 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
        label: 'Cancelled'
      },
      'cancellation-requested': {
        bg: isDarkMode ? 'bg-orange-900/30 text-orange-300 border-orange-600' : 'bg-orange-50 text-orange-700 border-orange-200',
        icon: RefreshCw,
        label: 'Cancellation Requested'
      },
      refunded: {
        bg: isDarkMode ? 'bg-purple-900/30 text-purple-300 border-purple-600' : 'bg-purple-50 text-purple-700 border-purple-200',
        icon: AlertCircle,
        label: 'Refunded'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${config.bg}`}>
        <IconComponent className="w-3 h-3 mr-1.5" />
        {config.label}
      </span>
    );
  };

  const renderActionButtons = (booking) => {
    const baseButtonClass = `p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`;
    
    return (
      <div className="flex items-center space-x-2">
        {/* View Details Button */}
        <button
          onClick={() => onViewDetails(booking)}
          className={`${baseButtonClass} ${
            isDarkMode 
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
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
                  ? 'bg-green-700 hover:bg-green-600 text-green-100 border border-green-600' 
                  : 'bg-green-600 hover:bg-green-700 text-white border border-green-600'
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
                  ? 'bg-red-700 hover:bg-red-600 text-red-100 border border-red-600' 
                  : 'bg-red-600 hover:bg-red-700 text-white border border-red-600'
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
              onClick={() => onParticipation(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                booking.participated
                  ? (isDarkMode
                      ? 'bg-green-700 text-green-100 border border-green-600 cursor-default'
                      : 'bg-green-600 text-white border border-green-600 cursor-default')
                  : (isDarkMode
                      ? 'bg-blue-700 hover:bg-blue-600 text-blue-100 border border-blue-600'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600')
              }`}
              title={booking.participated ? 'Already Participated' : 'Mark Participation'}
            >
              <UserCheck className="h-4 w-4" />
            </button>
            <button
              onClick={() => onCancel(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode 
                  ? 'bg-red-700 hover:bg-red-600 text-red-100 border border-red-600' 
                  : 'bg-red-600 hover:bg-red-700 text-white border border-red-600'
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
                  ? 'bg-green-700 hover:bg-green-600 text-green-100 border border-green-600' 
                  : 'bg-green-600 hover:bg-green-700 text-white border border-green-600'
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
                  ? 'bg-red-700 hover:bg-red-600 text-red-100 border border-red-600' 
                  : 'bg-red-600 hover:bg-red-700 text-white border border-red-600'
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
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-12 text-center`}>
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
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
    <div className={`relative ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50/50'}>
            <tr>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                S.No
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Booking Details
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Customer Information
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Event & Seating
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Amount
              </th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Status
              </th>
              <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
            {bookings.map((booking, index) => (
              <tr key={booking.id} className={`transition-colors duration-150 ${
                booking.participated 
                  ? (isDarkMode ? 'bg-green-900/20 hover:bg-green-800/30 border-l-4 border-green-500' : 'bg-green-50 hover:bg-green-100/70 border-l-4 border-green-400')
                  : (isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50/50')
              }`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      #{booking.id}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Created: {formatDateTime(booking.createdAt)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {booking.customerDetails?.name || 'N/A'}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {booking.customerDetails?.email || 'N/A'}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {booking.customerDetails?.phone || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(booking.eventDate)}
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      {booking.shift && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          booking.shift?.toLowerCase() === 'morning' 
                            ? (isDarkMode ? 'bg-amber-900/40 text-amber-300 border border-amber-700' : 'bg-amber-100 text-amber-800 border border-amber-300')
                            : booking.shift?.toLowerCase() === 'evening'
                            ? (isDarkMode ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-700' : 'bg-indigo-100 text-indigo-800 border border-indigo-300')
                            : (isDarkMode ? 'bg-gray-700 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-700 border border-gray-300')
                        }`}>
                          {booking.shift?.toLowerCase() === 'morning' && '☀️'}
                          {booking.shift?.toLowerCase() === 'evening' && '🌙'}
                          {booking.shift || 'N/A'}
                        </span>
                      )}
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {booking.seatCount || booking.seats?.length || 0} seats
                      </span>
                    </div>
                    {booking.seats && booking.seats.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 max-w-xs">
                        {booking.seats.slice(0, 3).map((seat, idx) => (
                          <span key={idx} className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                            isDarkMode ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {seat}
                          </span>
                        ))}
                        {booking.seats.length > 3 && (
                          <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                            isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            +{booking.seats.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(booking.totalAmount)}
                    </div>
                    {booking.priceAdjusted && (
                      <div className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        Original: {formatCurrency(booking.originalAmount)}
                      </div>
                    )}
                    {booking.discountApplied > 0 && (
                      <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Discount: {booking.discountApplied}%
                      </div>
                    )}
                    <button
                      onClick={() => onViewPayment(booking)}
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-purple-900/30 text-purple-300 border border-purple-700/50 hover:bg-purple-800/40' 
                          : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                      }`}
                      title="View Payment Details"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Payment Details
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    {getStatusBadge(booking.status)}
                    {booking.cancellationReason && (
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} max-w-48 break-words`}>
                        <span className="font-medium">Reason:</span> 
                        <span className="block mt-1" title={booking.cancellationReason}>
                          {booking.cancellationReason.length > 50 
                            ? `${booking.cancellationReason.substring(0, 50)}...` 
                            : booking.cancellationReason
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {renderActionButtons(booking)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="animate-spin rounded-full h-6 w-6 border-3 border-blue-500 border-t-transparent"></div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                Processing...
              </span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Please wait while we update the booking
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}