import React from 'react';
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserIcon,
  CurrencyRupeeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function DelegateTable({
  bookings,
  isDarkMode,
  currentPage = 1,  
  bookingsPerPage = 10,
  isUpdating,
  onViewDetails,
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
    const statusMap = {
      'confirmed': { color: 'green', label: 'Confirmed', icon: '✓' },
      'pending': { color: 'yellow', label: 'Pending', icon: '⏳' },
      'cancelled': { color: 'red', label: 'Cancelled', icon: '✕' },
      'cancellation-requested': { color: 'orange', label: 'Cancel Requested', icon: '⚠️' },
      'refunded': { color: 'purple', label: 'Refunded', icon: '💰' }
    };

    const config = statusMap[status] || statusMap.pending;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
        config.color === 'green' ? (isDarkMode ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200') :
        config.color === 'yellow' ? (isDarkMode ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-700' : 'bg-yellow-100 text-yellow-800 border border-yellow-200') :
        config.color === 'red' ? (isDarkMode ? 'bg-red-900/30 text-red-300 border border-red-700' : 'bg-red-100 text-red-800 border border-red-200') :
        config.color === 'orange' ? (isDarkMode ? 'bg-orange-900/30 text-orange-300 border border-orange-700' : 'bg-orange-100 text-orange-800 border border-orange-200') :
        (isDarkMode ? 'bg-purple-900/30 text-purple-300 border border-purple-700' : 'bg-purple-100 text-purple-800 border border-purple-200')
      }`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getRegistrationTypeIcon = (type) => {
    const icons = {
      'Company': '🏢',
      'Temple': '🕉️',
      'Individual': '👤'
    };
    return icons[type] || '📋';
  };

  const getDelegateTypeDisplay = (type) => {
    const types = {
      'withoutAssistance': 'Without Assistance',
      'withAssistance': 'With Assistance'
    };
    return types[type] || type || 'Standard';
  };

  const renderActionButtons = (booking) => {
    const baseButtonClass = `p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`;
    
    return (
      <div className="flex items-center gap-2">
        {/* View Details Button */}
        <button
          onClick={() => onViewDetails(booking)}
          className={`${baseButtonClass} ${
            isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
          }`}
          title="View Details"
        >
          <EyeIcon className="h-4 w-4" />
        </button>

        {/* Status-specific buttons */}
        {booking.status === 'pending' && (
          <>
            <button
              onClick={() => onConfirm(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-50 hover:bg-green-100 text-green-600 border border-green-200'
              }`}
              title="Confirm Registration"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onCancel(booking)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
              }`}
              title="Cancel Registration"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          </>
        )}

        {booking.status === 'cancellation-requested' && (
          <>
            <button
              onClick={() => onApproveCancellation(booking.id)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-50 hover:bg-green-100 text-green-600 border border-green-200'
              }`}
              title="Approve Cancellation"
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRejectCancellation(booking.id)}
              disabled={isUpdating}
              className={`${baseButtonClass} ${
                isDarkMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
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

  if (bookings.length === 0) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-lg`}>
        <div className="text-center py-16">
          <div className={`mx-auto h-16 w-16 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
            <UserIcon className={`h-8 w-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
            No delegate registrations found
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No delegates match your current search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
      {/* Desktop Table - Simple and clean */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name & Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mobile & Pincode
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aadhar/PAN/Passport
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount & Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {bookings.map((booking, index) => {
              // Extract data based on actual Firestore structure
              const delegate = booking.delegateDetails || {};
              const event = booking.eventDetails || {};
              const payment = booking.payment || {};
              
              return (
                <tr key={booking.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-150`}>
                  {/* Name & Contact */}
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {(delegate.name || 'N').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {delegate.name || 'N/A'}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {delegate.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Mobile & Pincode */}
                  <td className="px-4 py-4">
                    <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      📱 {delegate.mobile || 'N/A'}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      📮 {delegate.pincode || 'N/A'}
                    </div>
                  </td>

                  {/* Documents */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {delegate.aadharno && (
                        <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} font-mono`}>
                          Aadhar: ****{delegate.aadharno.substring(8)}
                        </div>
                      )}
                      {delegate.pan && (
                        <div className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} font-mono`}>
                          PAN: {delegate.pan}
                        </div>
                      )}
                      {delegate.passportno && (
                        <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'} font-mono`}>
                          Passport: {delegate.passportno}
                        </div>
                      )}
                      {!delegate.aadharno && !delegate.pan && !delegate.passportno && (
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                          No documents
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Photo */}
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      {delegate.fileInfo?.fileUploaded ? (
                        <>
                          <span className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✅ Yes</span>
                          {delegate.fileInfo?.imageUrl && (
                            <button 
                              onClick={() => window.open(delegate.fileInfo.imageUrl, '_blank')}
                              className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} transition-colors`}
                            >
                              View
                            </button>
                          )}
                        </>
                      ) : (
                        <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>❌ No</span>
                      )}
                    </div>
                  </td>

                  {/* Amount & Status */}
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      {getStatusBadge(booking.status)}
                      <div className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ₹{(booking.totalAmount || 0).toLocaleString()}
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(booking.createdAt)}
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    {renderActionButtons(booking)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {bookings.map((booking, index) => {
            const delegate = booking.delegateDetails || {};
            const event = booking.eventDetails || {};
            
            return (
              <div key={booking.id} className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'} flex items-center justify-center`}>
                      <span className="text-sm">{getRegistrationTypeIcon(event.registrationType)}</span>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {delegate.name || 'N/A'}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {delegate.email || 'N/A'}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mobile:</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {delegate.mobile || 'N/A'}
                    </span>
                  </div>
                  
                  {/* Identity Documents */}
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Documents:</span>
                    <div className="text-right space-y-1">
                      {delegate.aadharno && (
                        <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} font-mono`}>
                          Aadhar: {delegate.aadharno}
                        </div>
                      )}
                      {delegate.passportno && (
                        <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-700'} font-mono`}>
                          Passport: {delegate.passportno}
                        </div>
                      )}
                      {delegate.pan && (
                        <div className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} font-mono`}>
                          PAN: {delegate.pan}
                        </div>
                      )}
                      {!delegate.aadharno && !delegate.passportno && !delegate.pan && (
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No documents
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Photo:</span>
                    <span className={`text-sm ${
                      delegate.fileInfo?.fileUploaded
                        ? (isDarkMode ? 'text-green-400' : 'text-green-600') 
                        : (isDarkMode ? 'text-red-400' : 'text-red-600')
                    }`}>
                      {delegate.fileInfo?.fileUploaded ? 'Uploaded' : 'Not uploaded'}
                    </span>
                  </div>
                  
                  {/* Payment Details */}
                  {booking.payment && (
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment:</span>
                      <div className="text-right">
                        {booking.payment.method && (
                          <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {booking.payment.method}
                          </div>
                        )}
                        {booking.payment.paymentId && booking.payment.paymentId.indexOf('pending_') === -1 && (
                          <div className={`text-xs font-mono ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                            {booking.payment.paymentId.substring(0, 10)}...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amount:</span>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Date:</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                      {formatDate(booking.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end">
                  {renderActionButtons(booking)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
