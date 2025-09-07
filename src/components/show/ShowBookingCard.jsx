"use client";
import { format, differenceInDays } from 'date-fns';
import { useState } from 'react';
import { cancelBooking } from '@/utils/cancellationUtils';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import PassReceiptModal from '../PassReceiptModal';

const ShowBookingCard = ({ booking, onCancel }) => {
  const { user } = useAuth();
  const [isCancelling, setIsCancelling] = useState(false);
    const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  
  const canCancelBooking = (eventDate) => {
    const today = new Date();
    const daysUntilEvent = differenceInDays(eventDate, today);
    return daysUntilEvent >= 15;
  };

  const getSeatCategory = (seat) => {
    const seatString = typeof seat === 'string' ? seat : 
                      typeof seat === 'object' ? (seat.seatId || seat.id || seat.number || '') : 
                      String(seat || '');
    
    if (!seatString) return 'Standard';
    
    const upperSeat = seatString.toUpperCase();
    if (upperSeat.startsWith('A') || upperSeat.startsWith('B')) return 'VIP';
    if (upperSeat.startsWith('C')) return 'Premium';
    return 'Standard';
  };

  const getSeatPrice = (seat) => {
    const seatString = typeof seat === 'string' ? seat : 
                      typeof seat === 'object' ? (seat.seatId || seat.id || seat.number || '') : 
                      String(seat || '');
    
    return booking.showDetails?.seats?.find(s => 
             (s.seatId === seat || s.seatId === seatString || s.id === seat || s.number === seat)
           )?.price || 
           booking.showDetails?.seatPrices?.[seatString] || 
           booking.showDetails?.seatPrices?.[seat] ||
           (getSeatCategory(seat) === 'VIP' ? 1500 : getSeatCategory(seat) === 'Premium' ? 1000 : 750);
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
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
              🎭 Show Booking
            </span>
          </div>
          <span className="text-xs sm:text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
            ID: {booking.id || booking.bookingId || 'N/A'}
          </span>
        </div> 
        
        {/* Main booking details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">SHOW DATE</p>
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {booking.showDetails?.date ? format(booking.showDetails.date, 'MMM dd, yyyy') : 'TBD'}
            </p>
            <p className="text-xs text-gray-600">
              {booking.showDetails?.time || 'Time TBD'}
            </p>
          </div>
          
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">SEAT DETAILS</p>
            <p className="text-sm font-bold text-gray-900">
              {booking.showDetails?.selectedSeats?.length || 0} seat{booking.showDetails?.selectedSeats?.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {booking.showDetails?.selectedSeats?.length > 0 
                ? booking.showDetails.selectedSeats.slice(0, 3).map(seat => {
                    const displaySeat = typeof seat === 'string' ? seat : 
                                      typeof seat === 'object' ? (seat.seatId || seat.id || seat.number || '') : 
                                      String(seat || '');
                    return displaySeat;
                  }).join(', ') + (booking.showDetails.selectedSeats.length > 3 ? ` +${booking.showDetails.selectedSeats.length - 3} more` : '')
                : 'No seats selected'
              }
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">TOTAL AMOUNT</p>
            <p className="text-lg font-bold text-green-600">
              ₹{(booking.showDetails?.totalPrice || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Seat IDs Details - Show when multiple seats */}
        {booking.showDetails?.selectedSeats?.length > 3 && (
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">SELECTED SEATS</p>
            <div className="flex flex-wrap gap-1">
              {booking.showDetails.selectedSeats.slice(0, 10).map((seat, index) => {
                const displaySeat = typeof seat === 'string' ? seat : 
                                  typeof seat === 'object' ? (seat.seatId || seat.id || seat.number || `S${index + 1}`) : 
                                  String(seat || `S${index + 1}`);
                return (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium border border-indigo-300"
                  >
                    {displaySeat}
                  </span>
                );
              })}
              {booking.showDetails.selectedSeats.length > 10 && (
                <span className="px-2 py-1 bg-indigo-200 text-indigo-900 rounded text-xs font-medium">
                  +{booking.showDetails.selectedSeats.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer with booking info and action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-200 gap-3">
          <div className="text-xs text-gray-500 space-y-1">
            <p>🕐 Booked: {booking.createdAt ? format(booking.createdAt, 'MMM dd, yyyy \'at\' hh:mm a') : 'Unknown'}</p>
            {/* {booking.userDetails?.phone && (
              <p>📞 Contact: {booking.userDetails.phone}</p>
            )} */}
          </div>

          {/* {booking.status === 'confirmed' && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {booking.showDetails?.date && canCancelBooking(booking.showDetails.date) ? (
                <div className="text-center">
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to cancel this booking?')) {
                        setIsCancelling(true);
                        try {
                          // Prepare booking data for cancellation with proper show structure
                          const bookingForCancellation = {
                            ...booking,
                            // Ensure we have the proper structure for show bookings
                            showDetails: {
                              ...booking.showDetails,
                              selectedSeats: booking.showDetails?.selectedSeats || [],
                              date: booking.showDetails?.date || booking.eventDate,
                              time: booking.showDetails?.time,
                              shift: booking.showDetails?.shift
                            }
                          };
                          
                          const result = await cancelBooking(
                            bookingForCancellation,
                            'User requested cancellation - 15+ days before event',
                            { uid: user?.uid, name: user?.displayName || user?.email, email: user?.email, isAdmin: false },
                            true // Release seats
                          );
                          
                          if (result.success) {
                            toast.success('Show booking cancelled successfully! Seats have been released.');
                            if (onCancel) onCancel(booking); // Notify parent to refresh
                          } else {
                            toast.error(result.error || 'Failed to cancel show booking');
                          }
                        } catch (error) {
                          toast.error('Error cancelling booking');
                          console.error('Cancellation error:', error);
                        } finally {
                          setIsCancelling(false);
                        }
                      }
                    }}
                    disabled={isCancelling}
                    className={`${isCancelling ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'} bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md min-w-[100px]`}
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
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
          )} */}
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

export default ShowBookingCard;
