"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, AlertTriangle, RefreshCw, Home, Phone, Mail } from "lucide-react";

// Loading component for suspense fallback
function LoadingPaymentFailed() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl max-w-md w-full p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Payment Details</h2>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}

// Main payment failed component
function PaymentFailedContent() {
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [bookingType, setBookingType] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    try {
      const order_id = searchParams.get("order_id");
      const status = searchParams.get("status");
      const message = searchParams.get("message");
      const amount = searchParams.get("amount");
      const tracking_id = searchParams.get("tracking_id");
      const failure_message = searchParams.get("failure_message");
      const bank_ref_no = searchParams.get("bank_ref_no");
      const status_message = searchParams.get("status_message");
      const payment_method = searchParams.get("payment_method");

      setPaymentInfo({ 
        order_id, 
        status, 
        message, 
        amount, 
        tracking_id, 
        failure_message, 
        bank_ref_no,
        status_message,
        payment_method
      });
    } catch (error) {
      console.error("Error processing payment params:", error);
      setPaymentInfo({
        order_id: "error",
        status: "error",
        message: "Failed to load payment information",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (paymentInfo?.order_id && paymentInfo.order_id !== "error") {
        try {
          const { db } = await import("@/lib/firebase");
          const { doc, getDoc } = await import("firebase/firestore");

          let bookingData = null;
          let detectedType = null;
          const orderId = String(paymentInfo.order_id);

          if (orderId.startsWith("SHOW-")) {
            detectedType = "show";
            const bookingRef = doc(db, "showBookings", orderId);
            const bookingSnap = await getDoc(bookingRef);
            if (bookingSnap.exists()) bookingData = bookingSnap.data();
          } else if (orderId.startsWith("STALL-")) {
            detectedType = "stall";
            const bookingRef = doc(db, "stallBookings", orderId);
            const bookingSnap = await getDoc(bookingRef);
            if (bookingSnap.exists()) bookingData = bookingSnap.data();
          } else if (orderId.startsWith("DN")) {
            detectedType = "donation";
            const bookingRef = doc(db, "donations", orderId);
            const bookingSnap = await getDoc(bookingRef);
            if (bookingSnap.exists()) bookingData = bookingSnap.data();
          } else {
            // Try show booking first (Firebase auto-generated IDs)
            const showBookingRef = doc(db, "showBookings", orderId);
            const showBookingSnap = await getDoc(showBookingRef);
            if (showBookingSnap.exists()) {
              detectedType = "show";
              bookingData = showBookingSnap.data();
            } else {
              // Default to havan booking
              detectedType = "havan";
              const bookingRef = doc(db, "bookings", orderId);
              const bookingSnap = await getDoc(bookingRef);
              if (bookingSnap.exists()) bookingData = bookingSnap.data();
            }
          }

          setBookingType(detectedType);
          setBookingDetails(bookingData || {});
        } catch (error) {
          console.error("Error fetching booking details:", error);
          setBookingType("havan");
          setBookingDetails({});
        }
      }
    };

    fetchBookingDetails();
  }, [paymentInfo]);

  const handleTryAgain = () => router.push("/booking");
  const handleGoHome = () => router.push("/");
  const handleContactSupport = () => {
    window.open("mailto:support@svsamiti.com?subject=Payment Failed - Order ID: " + (paymentInfo?.order_id || 'Unknown'), "_blank");
  };

  if (isLoading || !paymentInfo) {
    return <LoadingPaymentFailed />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-4 py-6">
      <div className="bg-white shadow-xl rounded-2xl max-w-4xl w-full p-6">
        {/* Status Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-red-800 mb-2">Payment Failed</h1>
          <p className="text-gray-600 text-lg">
            Unfortunately, your payment could not be processed successfully.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Don't worry - no amount has been charged to your account.
          </p>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment Failure Details */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              Transaction Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white rounded-lg p-3 border border-red-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="font-medium text-gray-700">Order ID:</p>
                    <p className="text-gray-900 font-mono text-xs break-all">{paymentInfo.order_id}</p>
                  </div>
                  {paymentInfo.tracking_id && (
                    <div>
                      <p className="font-medium text-gray-700">Tracking ID:</p>
                      <p className="text-gray-900 font-mono text-xs">{paymentInfo.tracking_id}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="font-medium text-gray-700">Amount:</p>
                  <p className="text-red-800 font-bold text-lg">₹{paymentInfo.amount || '2.00'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Status:</p>
                  <p className="text-red-800 font-semibold">❌ Failed</p>
                </div>
              </div>

              {paymentInfo.payment_method && (
                <div>
                  <p className="font-medium text-gray-700">Payment Method:</p>
                  <p className="text-gray-900">{paymentInfo.payment_method}</p>
                </div>
              )}

              <div>
                <p className="font-medium text-gray-700">Transaction Date:</p>
                <p className="text-gray-900">{new Date().toLocaleString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}</p>
              </div>

              {paymentInfo.failure_message && (
                <div>
                  <p className="font-medium text-gray-700">Failure Reason:</p>
                  <div className="bg-red-50 border border-red-200 rounded p-2 mt-1">
                    <p className="text-red-800 text-sm">{paymentInfo.failure_message}</p>
                  </div>
                </div>
              )}

              {paymentInfo.status_message && (
                <div>
                  <p className="font-medium text-gray-700">Status Message:</p>
                  <div className="bg-red-50 border border-red-200 rounded p-2 mt-1">
                    <p className="text-red-800 text-sm">{paymentInfo.status_message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer & Booking Info */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Booking Information
            </h3>
            <div className="space-y-3 text-sm">
              {bookingDetails?.customerDetails && (
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <p className="font-medium text-gray-700 mb-2">Customer Details:</p>
                  <div className="space-y-1">
                    <p><span className="font-medium">Name:</span> {bookingDetails.customerDetails.name || 'Ashutosh Mohanty'}</p>
                    <p><span className="font-medium">Email:</span> {bookingDetails.customerDetails.email || 'ashtoshmohanty13703@gmail.com'}</p>
                    <p><span className="font-medium">Phone:</span> {bookingDetails.customerDetails.phone || '9556508941'}</p>
                    {(bookingDetails.customerDetails.address || 'At/Po-Iswarpur, Via Bahanga, Dist-Balasore, Odisha, PIN 756042, India') && (
                      <p><span className="font-medium">Address:</span> {bookingDetails.customerDetails.address || 'At/Po-Iswarpur, Via Bahanga, Dist-Balasore, Odisha, PIN 756042, India'}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Booking Type Specific Details */}
              {(() => {
                if (bookingType === 'havan' && bookingDetails?.seats) {
                  return (
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <p className="font-medium text-gray-700 mb-2">Havan Booking:</p>
                      <div className="space-y-1">
                        <div>
                          <p><span className="font-medium">Seats:</span></p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {bookingDetails.seats.map((seat, idx) => (
                              <span key={idx} className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                {seat}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p><span className="font-medium">Date:</span> {
                          bookingDetails.eventDate ? 
                            new Date(bookingDetails.eventDate.seconds ? 
                              bookingDetails.eventDate.seconds * 1000 : 
                              bookingDetails.eventDate
                            ).toLocaleDateString('en-IN') : 
                            'Not available'
                        }</p>
                        <p><span className="font-medium">Shift:</span> {bookingDetails.shift || 'Not specified'}</p>
                        <p><span className="font-medium">Status:</span> <span className="text-red-600 font-semibold">Seats not confirmed due to payment failure</span></p>
                      </div>
                    </div>
                  );
                }

                if (bookingType === 'show' && bookingDetails?.showDetails) {
                  return (
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <p className="font-medium text-gray-700 mb-2">Show Booking:</p>
                      <div className="space-y-1">
                        <p><span className="font-medium">Selected Seats:</span> {
                          bookingDetails.showDetails.selectedSeats ? 
                            bookingDetails.showDetails.selectedSeats.join(', ') : 
                            'Not available'
                        }</p>
                        <p><span className="font-medium">Show Date:</span> {
                          bookingDetails.showDetails.date ? 
                            new Date(bookingDetails.showDetails.date.seconds ? 
                              bookingDetails.showDetails.date.seconds * 1000 : 
                              bookingDetails.showDetails.date
                            ).toLocaleDateString('en-IN') : 
                            'Not available'
                        }</p>
                        <p><span className="font-medium">Status:</span> <span className="text-red-600 font-semibold">Booking not confirmed</span></p>
                      </div>
                    </div>
                  );
                }

                if (bookingType === 'stall' && bookingDetails?.stallIds) {
                  return (
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <p className="font-medium text-gray-700 mb-2">Stall Booking:</p>
                      <div className="space-y-1">
                        <p><span className="font-medium">Stalls:</span> {bookingDetails.stallIds.join(', ')}</p>
                        <p><span className="font-medium">Business Type:</span> {
                          bookingDetails.vendorDetails?.businessType || 'Not specified'
                        }</p>
                        <p><span className="font-medium">Status:</span> <span className="text-red-600 font-semibold">Stalls not reserved</span></p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="bg-white rounded-lg p-3 border border-orange-200">
                    <p className="text-gray-600 text-sm">
                      Your booking selection is temporarily held and can be completed with a successful payment.
                    </p>
                    <p className="text-red-600 font-semibold text-sm mt-1">
                      Since the payment failed, no reservation has been confirmed.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Why Payment Failed */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-5 mb-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Common Reasons for Payment Failure
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                Insufficient balance in your account
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                Daily/monthly transaction limit exceeded
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                Incorrect OTP or transaction PIN
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                Card expired or blocked
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                Network connectivity issues during payment
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                Bank server temporarily unavailable
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                Transaction session timeout
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                Online transactions disabled by bank
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={handleTryAgain}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Payment Again
          </button>
          
          <button
            onClick={handleContactSupport}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center"
          >
            <Mail className="w-5 h-5 mr-2" />
            Email Support
          </button>

          <button
            onClick={handleGoHome}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Home
          </button>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-800 mb-2">What can you do now?</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>Try Again:</strong> Use a different payment method or card</p>
            <p>• <strong>Check Your Bank:</strong> Ensure sufficient balance and online transactions are enabled</p>
            <p>• <strong>Contact Support:</strong> Our team will help resolve payment issues and complete your booking</p>
            <p>• <strong>No Retry Attempted:</strong> This was the first payment attempt for this transaction</p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Important Notice
          </h4>
          <p className="text-sm text-red-700">
            Since the seats were not confirmed due to payment failure, the transaction was unsuccessful. 
            Your selected seats are temporarily held but will be released if payment is not completed within the timeout period.
          </p>
        </div>

        {/* Support Contact */}
        <div className="text-center text-sm text-gray-600">
          <p>Need immediate assistance?</p>
          <div className="mt-2 space-y-1">
            <p>
              <Mail className="w-4 h-4 inline mr-1" />
              Email: <span className="font-semibold text-blue-600">support@svsamiti.com</span>
            </p>
            <p>
              <Phone className="w-4 h-4 inline mr-1" />
              Phone: <span className="font-semibold text-blue-600">+91-XXXX-XXXX</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<LoadingPaymentFailed />}>
      <PaymentFailedContent />
    </Suspense>
  );
}
