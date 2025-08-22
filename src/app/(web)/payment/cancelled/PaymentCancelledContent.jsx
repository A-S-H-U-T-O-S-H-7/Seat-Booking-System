"use client";
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export default function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('booking_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setLoading(false);
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

  const handleRetryPayment = () => {
    if (booking) {
      // Redirect back to booking flow with the existing booking
      router.push(`/booking?retry=${bookingId}`);
    } else {
      router.push('/booking');
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Payment Cancelled - Need Assistance');
    const body = encodeURIComponent(
      `Hi,\n\nI cancelled my payment and need assistance with the following booking:\n\n` +
      `Booking ID: ${bookingId || 'N/A'}\n` +
      `Order ID: ${orderId || 'N/A'}\n` +
      `Timestamp: ${new Date().toISOString()}\n\n` +
      `Please help me complete this booking or provide guidance.\n\nThank you.`
    );
    
    window.open(`mailto:support@svsamiti.com?subject=${subject}&body=${body}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.384 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
          <p className="text-orange-100">You have cancelled the payment process</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Information */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-orange-800 mb-3">What happens now?</h3>
            <div className="space-y-2 text-sm text-orange-700">
              <div className="flex items-start">
                <span className="text-orange-600 mr-2 mt-1">•</span>
                <span>Your payment was not processed</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-600 mr-2 mt-1">•</span>
                <span>No money has been debited from your account</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-600 mr-2 mt-1">•</span>
                <span>Your booking is still pending and seats are reserved temporarily</span>
              </div>
              <div className="flex items-start">
                <span className="text-orange-600 mr-2 mt-1">•</span>
                <span>You can retry the payment or start a new booking</span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          {booking && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Pending Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Booking ID:</span>
                  <span className="text-blue-600 font-mono">{bookingId}</span>
                </div>
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
                {booking.seats && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Seats:</span>
                    <span className="text-blue-600">{booking.seats.join(', ')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Amount:</span>
                  <span className="text-blue-600 font-semibold">₹{booking.totalAmount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Time Warning */}
          {booking && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-r-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Time Reminder
              </h4>
              <p className="text-sm text-yellow-700">
                Your selected seats are reserved for a limited time. Please complete your payment soon 
                to avoid losing your seats to other customers.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {booking && (
              <button
                onClick={handleRetryPayment}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
              >
                Complete This Payment
              </button>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/booking')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
              >
                Start New Booking
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 mb-3">
              Having trouble completing your booking? Our support team is here to help.
            </p>
            <button
              onClick={handleContactSupport}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
            >
              Contact Support
            </button>
            <div className="mt-3 text-xs text-gray-500">
              <p>Email: support@svsamiti.com</p>
              <p>Phone: +91 730 339 7090</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
