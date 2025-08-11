"use client";
import { format, differenceInDays } from 'date-fns';

const ShowBookingCard = ({ booking, onCancel }) => {
  const canCancelBooking = (eventDate) => {
    const today = new Date();
    const daysUntilEvent = differenceInDays(eventDate, today);
    return daysUntilEvent >= 15;
  };

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
          </div>
          <span className="text-xs sm:text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            ID: {booking.bookingId}
          </span>
        </div>
        
        {/* Main booking details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Show Date</p>
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {booking.showDetails?.date ? format(booking.showDetails.date, 'MMM dd, yyyy') : 'TBD'}
            </p>
            <p className="text-xs text-gray-600">
              {booking.showDetails?.time || 'TBD'}
            </p>
          </div>
          
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">Seats</p>
            <p className="text-sm font-bold text-gray-900">
              {booking.showDetails.selectedSeats?.length || 0} seat{booking.showDetails.selectedSeats?.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {booking.showDetails?.selectedSeats?.map(s => s.id).join(', ') || 'N/A'}
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Amount Paid</p>
            <p className="text-lg font-bold text-green-600">
              ₹{booking.payment?.amount || 0}
            </p>
          </div>
        </div>

        {/* Footer with booking info and action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-200 gap-3">
          <div className="text-xs text-gray-500 space-y-1">
            <p>🕐 Booked: {booking.createdAt ? format(booking.createdAt, 'MMM dd, yyyy \'at\' hh:mm a') : 'Unknown'}</p>
            {booking.userDetails?.phone && (
              <p>📞 Contact: {booking.userDetails.phone}</p>
            )}
          </div>

          {booking.status === 'confirmed' && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {booking.showDetails?.date && canCancelBooking(booking.showDetails.date) ? (
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
                    {booking.showDetails?.date ? `Only ${differenceInDays(booking.showDetails.date, new Date())} days left` : 'Date not set'}
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

export default ShowBookingCard;
