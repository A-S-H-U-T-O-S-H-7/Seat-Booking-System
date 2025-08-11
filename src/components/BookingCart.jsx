"use client";
import { useBooking } from '@/context/BookingContext';
import { format } from 'date-fns';
import { TrashIcon } from '@heroicons/react/24/outline';

const BookingCart = () => {
  const {
    selectedDate,
    selectedShift,
    selectedSeats,
    priceSettings,
    getTotalAmount,
    getDiscountAmount,
    getBaseAmount,
    getTaxAmount,
    removeSeat,
    clearSelection,
  } = useBooking();

  if (selectedSeats.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-600 text-center">
          No seats selected
        </h3>
        <p className="text-gray-500 text-center mt-2">
          Please select seats from the seat map above
        </p>
      </div>
    );
  }

  const baseAmount = getBaseAmount();
  const discountAmount = getDiscountAmount();
  const totalAmount = getTotalAmount();
  const taxAmount = getTaxAmount();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          📋 Booking Summary
        </h3>
        <button
          onClick={clearSelection}
          className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Event Details */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Date:</span>
            <p className="text-blue-700">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : 'Not selected'}
            </p>
          </div>
          <div>
            <span className="font-medium">Shift:</span>
            <p className="text-blue-700 capitalize">
              {selectedShift === 'morning' ? 'Morning (9 AM - 12 PM)' : 
               selectedShift === 'afternoon' ? 'Afternoon (2 PM - 5 PM)' : 'Not selected'}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Seats */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Selected Seats ({selectedSeats.length})</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {selectedSeats.map((seatId) => (
            <div key={seatId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-mono text-sm">{seatId}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">₹{priceSettings.defaultSeatPrice}</span>
                <button
                  onClick={() => removeSeat(seatId)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove seat"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="border-t pt-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Seats ({selectedSeats.length} × ₹{priceSettings.defaultSeatPrice})</span>
            <span>₹{baseAmount}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Multiple booking discount (10%)</span>
              <span>-₹{discountAmount}</span>
            </div>
          )}
          
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {discountAmount > 0 && (
          <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
            🎉 You saved ₹{discountAmount} with multiple booking discount!
          </div>
        )}
      </div>

      {/* Cancellation Policy */}
      <div className="mt-6 p-3 bg-yellow-50 border-l-4 border-yellow-400">
        <p className="text-sm text-yellow-700">
          <strong>Cancellation Policy:</strong> Full refund available if canceled at least 15 days before the event date.
        </p>
      </div>
    </div>
  );
};

export default BookingCart;
