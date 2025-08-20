"use client";
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('booking_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      
      if (bookingDoc.exists()) {
        setBooking(bookingDoc.data());
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-green-100">Your Havan seat booking has been confirmed</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Details */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Order Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Booking ID:</span>
                <p className="text-green-600 font-mono">{bookingId}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Order ID:</span>
                <p className="text-green-600 font-mono">{orderId}</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          {booking && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Customer:</span>
                  <span className="text-blue-600">{booking.customerDetails?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Event Date:</span>
                  <span className="text-blue-600">
                    {booking.eventDate && format(booking.eventDate.toDate(), 'EEEE, MMMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Shift:</span>
                  <span className="text-blue-600">{booking.shift}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Seats:</span>
                  <span className="text-blue-600">{booking.seats?.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Total Amount:</span>
                  <span className="text-blue-600 font-semibold">₹{booking.totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details */}
          {booking?.payment && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Payment ID:</span>
                  <span className="text-purple-600 font-mono">{booking.payment.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Payment Mode:</span>
                  <span className="text-purple-600">{booking.payment.paymentMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="text-green-600 font-semibold">Success</span>
                </div>
              </div>
            </div>
          )}

          {/* Important Information */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-r-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <span className="text-lg mr-2">📧</span>
              Next Steps
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-1">•</span>
                <span>A confirmation email will be sent to your registered email address</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-1">•</span>
                <span>Please arrive at the venue 30 minutes before your shift time</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-1">•</span>
                <span>Carry a valid ID proof for verification</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/profile')}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
            >
              View My Bookings
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
