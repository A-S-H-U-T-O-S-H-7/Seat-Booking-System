import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PassReceiptModal from '../PassReceiptModal';

const HavanBookingCard = ({ booking, getShiftLabel, getShiftTime, onStatusUpdate }) => {
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(booking.status);
  const [isLoading, setIsLoading] = useState(false);

  // Monitor real-time status changes for pending bookings
  useEffect(() => {
    if (!booking.id || booking.status !== 'pending_payment') {
      return;
    }

    console.log(`🔄 Setting up real-time monitoring for booking ${booking.id}`);
    
    const unsubscribe = onSnapshot(
      doc(db, 'bookings', booking.id),
      (doc) => {
        if (doc.exists()) {
          const updatedBooking = doc.data();
          console.log(`📊 Status update for booking ${booking.id}: ${booking.status} -> ${updatedBooking.status}`);
          
          if (updatedBooking.status !== currentStatus) {
            setCurrentStatus(updatedBooking.status);
            
            // Notify parent component if status changed to cancelled
            if (updatedBooking.status === 'cancelled' && onStatusUpdate) {
              console.log(`🔄 Notifying parent about cancellation: ${booking.id}`);
              onStatusUpdate(booking.id, updatedBooking.status);
            }
          }
        }
      },
      (error) => {
        console.error(`❌ Error monitoring booking ${booking.id}:`, error);
      }
    );

    return () => {
      console.log(`🛑 Stopping monitoring for booking ${booking.id}`);
      unsubscribe();
    };
  }, [booking.id, booking.status, currentStatus, onStatusUpdate]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    if (onStatusUpdate) {
      setIsLoading(true);
      try {
        console.log(`🔄 Manual refresh triggered for booking ${booking.id}`);
        await onStatusUpdate(booking.id, 'refresh');
      } finally {
        setIsLoading(false);
      }
    }
  };
  return (
    <div className={`border rounded-xl p-3 sm:p-6 transform hover:scale-[1.02] transition-all duration-200 ${
      currentStatus === 'cancelled' 
        ? 'border-red-200 bg-red-50 shadow-md' 
        : 'border-gray-200 bg-white shadow-lg hover:shadow-xl'
    }`}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
              currentStatus === 'confirmed' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : currentStatus === 'cancelled'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              {currentStatus === 'confirmed' ? '✓ Confirmed' : 
                currentStatus === 'cancelled' ? '✗ Cancelled' : 
                currentStatus}
            </span>
            
            {/* Show refresh button for pending payments */}
            {currentStatus === 'pending_payment' && (
              <button
                onClick={handleManualRefresh}
                disabled={isLoading}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  isLoading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                }`}
                title="Refresh status"
              >
                {isLoading ? '⟳' : '🔄'} Refresh
              </button>
            )}
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
          
          {currentStatus === 'confirmed' && (
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