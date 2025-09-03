import { format } from 'date-fns';
import { useState } from 'react';
import PassReceiptModal from '../PassReceiptModal';

const HavanBookingCard = ({ booking, getShiftLabel, getShiftTime }) => {
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  return (
    <div className={`border rounded-xl p-3 sm:p-6 transform hover:scale-[1.02] transition-all duration-200 ${
      booking.status === 'cancelled' 
        ? 'border-red-200 bg-red-50 shadow-md' 
        : 'border-gray-200 bg-white shadow-lg hover:shadow-xl'
    }`}>
      <div className="space-y-4">
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
            ID: {booking.id || booking.bookingId || 'N/A'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Event Date</p>
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {booking.eventDetails?.date ? format(booking.eventDetails.date, 'MMM dd, yyyy') : 'N/A'}
            </p>
            <p className="text-xs text-gray-600">
              {booking.eventDetails?.date ? format(booking.eventDetails.date, 'EEEE') : 'N/A'}
            </p>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Session</p>
            <p className="text-sm font-bold text-gray-900">
              {getShiftLabel(booking.eventDetails.shift) || 'N/A'}
            </p>
            <p className="text-xs text-gray-600">
              {getShiftTime(booking.eventDetails.shift) || 'N/A'}
            </p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Seats</p>
            <p className="text-sm font-bold text-gray-900">
              {booking.eventDetails?.seatCount || 0} seat{(booking.eventDetails?.seatCount || 0) > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {(booking.eventDetails?.seats || []).join(', ') || 'No seats specified'}
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Amount Paid</p>
            <p className="text-lg font-bold text-green-600">
              ₹{booking.payment?.amount || 0}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-200 gap-3">
          <div className="text-xs text-gray-500 space-y-1">
            <p>🕐 Reserved: {format(booking.createdAt, 'MMM dd, yyyy \'at\' hh:mm a')}</p>
          </div>
          
          {booking.status === 'confirmed' && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => setIsPassModalOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md min-w-[120px]"
              >
                📄 Pass & Receipt
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Pass & Receipt Modal */}
      <PassReceiptModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        booking={booking}
      />
    </div>
  );
};

export default HavanBookingCard;