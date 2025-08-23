"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// Loading component for suspense fallback
function LoadingPaymentResult() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl max-w-md w-full p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Payment Result</h2>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}

// Main payment success component
function PaymentSuccessContent() {
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

      setPaymentInfo({ order_id, status, message, amount, tracking_id });
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
          } else {
            detectedType = "havan";
            const bookingRef = doc(db, "bookings", orderId);
            const bookingSnap = await getDoc(bookingRef);
            if (bookingSnap.exists()) bookingData = bookingSnap.data();
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

  const getStatusIcon = () => {
    if (!paymentInfo)
      return (
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      );

    switch (paymentInfo.status) {
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case "failed":
        return <XCircle className="w-16 h-16 text-red-600" />;
      default:
        return <AlertTriangle className="w-16 h-16 text-yellow-600" />;
    }
  };

  const getStatusTitle = () => {
    if (!paymentInfo) return "Loading...";
    switch (paymentInfo.status) {
      case "success":
        return "Payment Successful!";
      case "failed":
        return "Payment Failed";
      default:
        return "Payment Status Unknown";
    }
  };

  const getStatusMessage = () => {
    if (!paymentInfo) return "Please wait...";
    switch (paymentInfo.status) {
      case "success":
        return "Your payment has been processed successfully. You will receive a confirmation email shortly.";
      case "failed":
        return paymentInfo.message || "Your payment could not be processed. Please try again.";
      default:
        return "We could not determine the status of your payment. Please contact support.";
    }
  };

  const handleGoHome = () => router.push("/");
  const handleTryAgain = () => router.push("/booking");
  const handleViewBookings = () => router.push("/profile");

  if (isLoading || !paymentInfo) {
    return <LoadingPaymentResult />;
  }

  const isSuccess = paymentInfo.status === "success";
  const isFailure = paymentInfo.status === "failed";

  return (
    <div
      className={
        isSuccess
          ? "min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-4 py-6"
          : isFailure
          ? "min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-4 py-6"
          : "min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex items-center justify-center px-4 py-6"
      }
    >
      <div className="bg-white shadow-xl rounded-2xl max-w-5xl w-full p-6">
        {/* Status Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">{getStatusIcon()}</div>
          <h1
            className={
              isSuccess
                ? "text-2xl font-bold text-green-800 mb-2"
                : isFailure
                ? "text-2xl font-bold text-red-800 mb-2"
                : "text-2xl font-bold text-yellow-800 mb-2"
            }
          >
            {getStatusTitle()}
          </h1>
          <p className="text-gray-600">{getStatusMessage()}</p>
        </div>

        {/* Success Payment and Booking Details */}
        {(paymentInfo.order_id && isSuccess) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Booking Details */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Booking Information
              </h3>
              <div className="space-y-4 text-sm">
                {(() => {
                  // Show booking details (for shows/events)
                  if (bookingType === 'show') {
                    return (
                      <>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Selected Seats:</p>
                          <div className="flex flex-wrap gap-2">
                            {bookingDetails?.seats && bookingDetails.seats.length > 0 ? (
                              bookingDetails.seats.map((seat, idx) => (
                                <span key={idx} className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                                  {seat}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500">No seats selected</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="font-medium text-gray-700">Show Name:</p>
                            <p className="text-gray-900 font-semibold">
                              {bookingDetails?.showDetails?.name || 'Cultural Event'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700">Show Date:</p>
                            <p className="text-gray-900">
                              {(() => {
                                try {
                                  if (bookingDetails?.showDetails?.date) {
                                    const date = bookingDetails.showDetails.date.seconds ? 
                                      new Date(bookingDetails.showDetails.date.seconds * 1000) : 
                                      new Date(bookingDetails.showDetails.date);
                                    return date.toLocaleDateString('en-IN', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    });
                                  }
                                  return 'Date not available';
                                } catch (e) {
                                  console.error('Date parsing error:', e);
                                  return 'Date not available';
                                }
                              })()} 
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="font-medium text-gray-700">Show Time:</p>
                            <p className="text-gray-900">
                              {bookingDetails?.showDetails?.time || 'Time not available'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700">Total Seats:</p>
                            <p className="text-gray-900 font-semibold">
                              {bookingDetails?.seats?.length || 0} seat{(bookingDetails?.seats?.length || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </>
                    );
                  }
                  
                  // Stall booking details
                  if (bookingType === 'stall') {
                    return (
                      <>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Selected Stalls:</p>
                          <div className="flex flex-wrap gap-2">
                            {bookingDetails?.stallIds && bookingDetails.stallIds.length > 0 ? (
                              bookingDetails.stallIds.map((stallId, idx) => (
                                <span key={idx} className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                                  Stall {stallId}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500">No stalls selected</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="font-medium text-gray-700">Vendor/Business Name:</p>
                            <p className="text-gray-900 font-semibold">
                              {bookingDetails?.vendorDetails?.businessName || 'N/A'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700">Event Duration:</p>
                            <p className="text-gray-900">5 Days (Nov 15-20, 2025)</p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700">Business Type:</p>
                            <p className="text-gray-900 capitalize">
                              {bookingDetails?.vendorDetails?.businessType || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="font-medium text-gray-700">Contact Person:</p>
                            <p className="text-gray-900 font-semibold">
                              {bookingDetails?.vendorDetails?.ownerName || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Total Stalls:</p>
                            <p className="text-gray-900 font-semibold">
                              {bookingDetails?.numberOfStalls || bookingDetails?.stallIds?.length || 0} stall{(bookingDetails?.numberOfStalls || bookingDetails?.stallIds?.length || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </>
                    );
                  }
                  
                  // Havan booking details (default/fallback)
                  return (
                    <>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Selected Seats:</p>
                        <div className="flex flex-wrap gap-2">
                          {bookingDetails?.seats && bookingDetails.seats.length > 0 ? (
                            bookingDetails.seats.map((seat, idx) => (
                              <span key={idx} className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                                {seat}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No seats selected</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="font-medium text-gray-700">Event Date:</p>
                          <p className="text-gray-900">
                            {(() => {
                              try {
                                if (bookingDetails?.eventDate) {
                                  const date = bookingDetails.eventDate.seconds ? 
                                    new Date(bookingDetails.eventDate.seconds * 1000) : 
                                    new Date(bookingDetails.eventDate);
                                  return date.toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  });
                                }
                                return 'Date not available';
                              } catch (e) {
                                console.error('Date parsing error:', e);
                                return 'Date not available';
                              }
                            })()} 
                          </p>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-700">Shift:</p>
                          <p className="text-gray-900 capitalize">
                            {bookingDetails?.shift ? (
                              bookingDetails.shift === 'morning' ? 'Morning (6:00 AM - 12:00 PM)' :
                              bookingDetails.shift === 'evening' ? 'Evening (6:00 PM - 12:00 AM)' :
                              bookingDetails.shift
                            ) : 'Shift not available'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-700">Total Seats:</p>
                        <p className="text-gray-900 font-semibold">
                          {bookingDetails?.seats?.length || 0} seat{(bookingDetails?.seats?.length || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </>
                  );
                })()
              }
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <span className="mr-2">💳</span>
                Payment Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="font-medium text-gray-700 mb-1">Total Amount Paid:</p>
                  <p className="text-2xl font-bold text-green-800">₹{paymentInfo.amount}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="font-medium text-gray-700">Order ID:</p>
                    <p className="text-gray-900 font-mono text-xs">{paymentInfo.order_id}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-700">Payment Status:</p>
                    <p className="text-green-800 font-semibold capitalize">
                      ✅ {paymentInfo.status}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">Payment Date:</p>
                  <p className="text-gray-900">{new Date().toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Failed Payment Details */}
        {(paymentInfo.order_id && !isSuccess) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Payment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Order ID:</p>
                <p className="text-gray-900 font-mono">{paymentInfo.order_id}</p>
              </div>
              {paymentInfo.amount && (
                <div>
                  <p className="font-medium text-gray-700">Amount:</p>
                  <p className="text-gray-900 text-lg font-semibold">₹{paymentInfo.amount}</p>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-700">Status:</p>
                <p className="text-red-800 font-semibold capitalize">{paymentInfo.status}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Date & Time:</p>
                <p className="text-gray-900">{new Date().toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isSuccess ? (
            <>
              <button
                onClick={handleViewBookings}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <span className="mr-2">📋</span>
                View Your Reservations
              </button>
              <button
                onClick={handleGoHome}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <span className="mr-2">🏠</span>
                Go to Home
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleTryAgain}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <span className="mr-2">🔄</span>
                Try Again
              </button>
              <button
                onClick={handleGoHome}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <span className="mr-2">🏠</span>
                Go to Home
              </button>
            </>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <div className={isSuccess ? 'bg-green-50 border border-green-200 rounded-lg p-4' : 'bg-red-50 border border-red-200 rounded-lg p-4'}>
            {isSuccess ? (
              <div>
                <h4 className="font-semibold text-green-800 mb-2">What's Next?</h4>
                <p className="text-sm text-green-700">
                  • You will receive a confirmation email with your booking details<br/>
                  • Please save your Order ID for future reference<br/>
                  • Contact support if you have any questions
                </p>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Need Help?</h4>
                <p className="text-sm text-red-700">
                  • Please try the payment again with a different card<br/>
                  • Contact your bank if the issue persists<br/>
                  • Reach out to our support team for assistance
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Support Contact */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need assistance? Contact us at <span className="font-semibold text-blue-600">support@svsamiti.com</span></p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingPaymentResult />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
