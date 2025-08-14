"use client";
import { format, differenceInDays } from 'date-fns';

const StallBookingCard = ({ booking, onCancel }) => {
  const canCancelBooking = (eventDate) => {
    const today = new Date();
    const daysUntilEvent = differenceInDays(eventDate, today);
    return daysUntilEvent >= 15;
  };

  // Helper function to get business type display name
  const getBusinessTypeDisplay = (businessType) => {
    const businessTypes = {
      food: 'Food & Beverages',
      handicrafts: 'Handicrafts & Arts',
      clothing: 'Clothing & Apparel',
      jewelry: 'Jewelry & Accessories',
      books: 'Books & Literature',
      toys: 'Toys & Games',
      electronics: 'Electronics',
      general: 'General Merchandise'
    };
    return businessTypes[businessType] || businessType || 'General';
  };

  const eventStartDate = booking.eventDetails?.startDate || new Date('2025-11-15');
  const eventEndDate = booking.eventDetails?.endDate || new Date('2025-11-20');

  return (
    <div 
      key={booking.id} 
      className={`border rounded-xl p-3 sm:p-6 transform hover:scale-[1.02] transition-all duration-200 ${
        booking.status === 'cancelled' 
          ? 'border-red-200 bg-red-50 shadow-md' 
          : 'border-gray-200 bg-white shadow-lg hover:shadow-xl'
      }`}
    >
      {/* Mobile-first layout */}
      <div className="space-y-4">
        {/* Status and ID Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
              booking.status === 'confirmed' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : booking.status === 'cancelled'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              {booking.status === 'confirmed' ? '✓ Confirmed' : 
               booking.status === 'cancelled' ? '✗ Cancelled' : 
               booking.status}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              🏪 {booking.stallIds && booking.stallIds.length > 1 ? 'Multi-Stall Booking' : 'Stall Booking'}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            ID: {booking.bookingId || 'N/A'}
          </span>
        </div>
        
        {/* Main booking details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">EVENT PERIOD</p>
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {format(eventStartDate, 'MMM dd')} - {format(eventEndDate, 'MMM dd, yyyy')}
            </p>
            <p className="text-xs text-gray-600">
              5 days
            </p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">STALL DETAILS</p>
            <p className="text-sm font-bold text-gray-900">
              {booking.stallIds && booking.stallIds.length > 0 
                ? `${booking.stallIds.length} Stall${booking.stallIds.length > 1 ? 's' : ''}`
                : booking.stallId 
                  ? `Stall ${booking.stallId}`
                  : 'N/A'
              }
            </p>
            <p className="text-xs text-gray-600 truncate">
              {booking.stallIds && booking.stallIds.length > 0 
                ? booking.stallIds.slice(0, 3).join(', ') + (booking.stallIds.length > 3 ? ` +${booking.stallIds.length - 3} more` : '')
                : booking.stallDetails?.size || 'Standard size'
              }
            </p>
          </div>
          
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">BUSINESS TYPE</p>
            <p className="text-sm font-bold text-gray-900">
              {getBusinessTypeDisplay(booking.vendorDetails?.businessType || booking.businessType)}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {booking.vendorDetails?.businessName || 'No description'}
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">TOTAL AMOUNT</p>
            <p className="text-lg font-bold text-green-600">
              ₹{(booking.totalAmount || booking.payment?.amount || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Stall IDs Details - Show when multiple stalls */}
        {booking.stallIds && booking.stallIds.length > 1 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">BOOKED STALLS</p>
            <div className="flex flex-wrap gap-2">
              {booking.stallIds.map((stallId, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-300"
                >
                  {stallId}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer with booking info and action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-200 gap-3">
          <div className="text-xs text-gray-500 space-y-1">
            <p>🕐 Booked: {booking.createdAt ? format(booking.createdAt, 'MMM dd, yyyy \'at\' hh:mm a') : 'Unknown'}</p>
            {booking.vendorDetails?.phone && (
              <p>📞 Contact: {booking.vendorDetails.phone}</p>
            )}
          </div>

          {booking.status === 'confirmed' && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {canCancelBooking(eventStartDate) ? (
                <div className="text-center">
                  <button
                    onClick={() => onCancel(booking)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md min-w-[100px]"
                  >
                    Cancel Booking
                  </button>
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    ✓ Free cancellation
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    disabled
                    className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed min-w-[100px]"
                  >
                    Cannot Cancel
                  </button>
                  <p className="text-xs text-red-500 mt-1">
                    Only {differenceInDays(eventStartDate, new Date())} days left
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StallBookingCard;
