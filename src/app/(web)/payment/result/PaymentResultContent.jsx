"use client";
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

export default function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('booking_id');
  const orderId = searchParams.get('order_id');
  const status = searchParams.get('status'); // 'success', 'failed', 'cancelled'
  const reason = searchParams.get('reason');
  const error = searchParams.get('error');

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

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
          headerGradient: 'from-green-500 to-emerald-600',
          iconColor: 'text-green-500',
          borderColor: 'border-green-200',
          title: 'Payment Successful!',
          subtitle: 'Your Havan seat booking has been confirmed',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'failed':
        return {
          bgGradient: 'from-red-50 via-pink-50 to-orange-50',
          headerGradient: 'from-red-500 to-pink-600',
          iconColor: 'text-red-500',
          borderColor: 'border-red-200',
          title: 'Payment Failed',
          subtitle: 'Unfortunately, your payment could not be processed',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case 'cancelled':
        return {
          bgGradient: 'from-orange-50 via-yellow-50 to-amber-50',
          headerGradient: 'from-orange-500 to-amber-600',
          iconColor: 'text-orange-500',
          borderColor: 'border-orange-200',
          title: 'Payment Cancelled',
          subtitle: 'You have cancelled the payment process',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.384 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        };
      default:
        return {
          bgGradient: 'from-gray-50 via-slate-50 to-zinc-50',
          headerGradient: 'from-gray-500 to-slate-600',
          iconColor: 'text-gray-500',
          borderColor: 'border-gray-200',
          title: 'Payment Status Unknown',
          subtitle: 'Unable to determine payment status',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const getErrorMessage = () => {
    if (reason) {
      return decodeURIComponent(reason);
    }
    
    switch (error) {
      case 'no_response':
        return 'No response received from payment gateway';
      case 'decryption_failed':
        return 'Payment response could not be processed';
      case 'server_error':
        return 'An internal server error occurred';
      default:
        return 'Payment could not be completed. Please try again.';
    }
  };

  const handleRetryPayment = () => {
    if (booking) {
      router.push(`/booking?retry=${bookingId}`);
    } else {
      router.push('/booking');
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Payment ${status || 'Issue'} - Need Assistance`);
    const body = encodeURIComponent(
      `Hi,\n\nI need assistance with my payment:\n\n` +
      `Booking ID: ${bookingId || 'N/A'}\n` +
      `Order ID: ${orderId || 'N/A'}\n` +
      `Status: ${status || 'Unknown'}\n` +
      `Issue: ${getErrorMessage()}\n` +
      `Timestamp: ${new Date().toISOString()}\n\n` +
      `Please help me resolve this issue.\n\nThank you.`
    );
    
    window.open(`mailto:support@svsamiti.com?subject=${subject}&body=${body}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Loading payment result...</p>
        </div>
      </div>
    );
  }

  const config = getStatusConfig();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex flex-col justify-center items-center px-4 py-8`}>
      <div className="bg-white shadow-xl rounded-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.headerGradient} px-6 py-8 text-center`}>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <div className={config.iconColor}>
              {config.icon}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{config.title}</h1>
          <p className="text-white opacity-90">{config.subtitle}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Status-specific content */}
          {status === 'success' && (
            <>
              {/* Order Details */}
              <div className={`bg-gradient-to-br from-green-50 to-emerald-50 border ${config.borderColor} rounded-lg p-4`}>
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

              {/* Next Steps */}
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
            </>
          )}

          {status === 'failed' && (
            <div className={`bg-red-50 border ${config.borderColor} rounded-lg p-6`}>
              <h3 className="font-semibold text-red-800 mb-2">What happened?</h3>
              <p className="text-red-700 mb-4">{getErrorMessage()}</p>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Important:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your money has not been debited from your account</li>
                  <li>• Your seats are still reserved for a limited time</li>
                  <li>• You can retry the payment or contact support for assistance</li>
                </ul>
              </div>
            </div>
          )}

          {status === 'cancelled' && (
            <div className={`bg-orange-50 border ${config.borderColor} rounded-lg p-6`}>
              <h3 className="font-semibold text-orange-800 mb-2">What happens now?</h3>
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
          )}

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
                {booking.seats && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Seats:</span>
                    <span className="text-blue-600">{booking.seats.join(', ')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Total Amount:</span>
                  <span className="text-blue-600 font-semibold">₹{booking.totalAmount}</span>
                </div>
                {booking.payment && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Payment ID:</span>
                      <span className="text-blue-600 font-mono">{booking.payment.paymentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Payment Mode:</span>
                      <span className="text-blue-600">{booking.payment.paymentMode}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' ? (
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
            ) : (
              <>
                {(status === 'failed' || status === 'cancelled') && booking && (
                  <button
                    onClick={handleRetryPayment}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    Try Payment Again
                  </button>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleContactSupport}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    Contact Support
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    Back to Home
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Support Contact Info */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p>Need help? Contact us at <span className="font-medium">support@svsamiti.com</span></p>
            <p>or call <span className="font-medium">+91 730 339 7090</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
