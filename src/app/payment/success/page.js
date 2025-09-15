"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { getStallEventSettings, getShiftSettings, formatEventDuration, getShiftDisplayInfo } from "@/services/systemSettingsService";

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
  const [eventSettings, setEventSettings] = useState({
    stallEventDuration: '5 Days (Nov 15-20, 2025)',
    shiftSettings: []
  });

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

  // Fetch dynamic event settings
  useEffect(() => {
    const fetchEventSettings = async () => {
      try {
        const [stallSettings, shiftSettings] = await Promise.all([
          getStallEventSettings(),
          getShiftSettings()
        ]);
        
        const stallEventDuration = formatEventDuration(stallSettings.startDate, stallSettings.endDate);
        
        setEventSettings({
          stallEventDuration,
          shiftSettings: shiftSettings.shifts
        });
      } catch (error) {
        console.error('Error fetching event settings for payment success page:', error);
        // Keep default values on error
      }
    };
    
    fetchEventSettings();
  }, []);

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
          } else if (orderId.startsWith('DN')) {
            detectedType = 'donation';
            const bookingRef = doc(db, 'donations', orderId);
            const bookingSnap = await getDoc(bookingRef);
            if (bookingSnap.exists()) bookingData = bookingSnap.data();
          } else if (orderId.startsWith('DELEGATE-')) {
            detectedType = 'delegate';
            const bookingRef = doc(db, 'delegateBookings', orderId);
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
        
        // Note: Email confirmation is now handled in the payment service
        // Fallback email sending is disabled to prevent duplicates
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
      case "cancelled":
        return <XCircle className="w-16 h-16 text-orange-600" />;
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
      case "cancelled":
        return "Payment Cancelled";
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
      case "cancelled":
        return paymentInfo.message || "Your payment was cancelled. No charges have been made to your account.";
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
  const isCancelled = paymentInfo.status === "cancelled";

  return (
    <div
      className={
        isSuccess
          ? "min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center px-4 py-6"
          : isFailure
          ? "min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center px-4 py-6"
          : isCancelled
          ? "min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4 py-6"
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
                : isCancelled
                ? "text-2xl font-bold text-orange-800 mb-2"
                : "text-2xl font-bold text-yellow-800 mb-2"
            }
          >
            {getStatusTitle()}
          </h1>
          <p className="text-gray-600">{getStatusMessage()}</p>
        </div>

        {/* Success Payment and Booking Details */}
        {(paymentInfo.order_id && isSuccess) && (
          <div className="space-y-6 mb-6">
            {/* Booking Details */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">📅</span>
                Reservation Information
              </h3>
              <div className="space-y-3 text-sm">
                {(() => {
                  // Show booking details (for shows/events)
                  if (bookingType === 'show') {
                    return (
                      <>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Selected Seats:</p>
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const selectedSeats = bookingDetails?.showDetails?.selectedSeats || [];
                              if (selectedSeats.length > 0) {
                                return selectedSeats.map((seat, idx) => (
                                  <span key={idx} className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                                    {seat}
                                  </span>
                                ));
                              } else {
                                return <span className="text-gray-500">No seats selected</span>;
                              }
                            })()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="font-medium text-gray-700">Show Name:</p>
                            <p className="text-gray-900 font-semibold">
                              Cultural Show
                            </p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700">Show Date:</p>
                            <p className="text-gray-900">
                              {(() => {
                                try {
                                  if (bookingDetails?.showDetails?.date) {
                                    let date;
                                    if (bookingDetails.showDetails.date.seconds) {
                                      date = new Date(bookingDetails.showDetails.date.seconds * 1000);
                                    } else if (bookingDetails.showDetails.date.toDate) {
                                      date = bookingDetails.showDetails.date.toDate();
                                    } else {
                                      date = new Date(bookingDetails.showDetails.date);
                                    }
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
                              5:00 PM - 10:00 PM
                            </p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700">Total Seats:</p>
                            <p className="text-gray-900 font-semibold">
                              {(() => {
                                const seatCount = bookingDetails?.showDetails?.selectedSeats?.length || 
                                                  bookingDetails?.showDetails?.totalCapacity || 0;
                                return `${seatCount} seat${seatCount !== 1 ? 's' : ''}`;
                              })()}
                            </p>
                          </div>
                        </div>
                      </>
                    );
                  }
                  
                  // Helper function to get business type display name
                  const getBusinessTypeDisplay = (businessType) => {
                    const businessTypes = {
                      food: 'Food & Beverages',
                      handicrafts: 'Handicrafts & Arts',
                      clothing: 'Clothing & Apparel',
                      jewelry: 'Jewelry & Accessories',
                      books: 'Books & Literature',
                      toys: 'Toys & Games',
                      electronics: 'Electronics',
                      general: 'General Merchandise'
                    };
                    return businessTypes[businessType] || businessType || 'General';
                  };
                  
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
                            <p className="font-medium text-gray-700">Event Duration:</p>
                            <p className="text-gray-900">{eventSettings.stallEventDuration}</p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700">Business Type:</p>
                            <p className="text-gray-900 capitalize">
                              {getBusinessTypeDisplay(bookingDetails?.vendorDetails?.businessType)}
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
                        
                        {/* Business Description */}
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Business Description:</p>
                          <p className="text-gray-900 text-sm">
                            {(() => {
                              const businessType = bookingDetails?.vendorDetails?.businessType;
                              const contactPerson = bookingDetails?.vendorDetails?.ownerName;
                              if (businessType && contactPerson) {
                                return `${contactPerson} - ${getBusinessTypeDisplay(businessType)}`;
                              }
                              return getBusinessTypeDisplay(businessType) || 'No description available';
                            })()} 
                          </p>
                        </div>
                        
                        {/* Additional Stall Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="font-medium text-gray-700">Email:</p>
                            <p className="text-gray-900">
                              {bookingDetails?.vendorDetails?.email || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Phone:</p>
                            <p className="text-gray-900">
                              {bookingDetails?.vendorDetails?.phone || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Location Info */}
                        {bookingDetails?.vendorDetails?.address && (
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Address:</p>
                            <p className="text-gray-900 text-sm">
                              {bookingDetails.vendorDetails.address}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  }
                  
                  // Donation details
                  if (bookingType === 'donation') {
                    return (
                      <>
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Donation Type:</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-block bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-semibold">
                              {bookingDetails?.donorDetails?.donorType === 'indian' ? 'Indian Donor' : 'NRI/Foreign Donor'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="font-medium text-gray-700">Donor Name:</p>
                            <p className="text-gray-900 font-semibold">
                              {bookingDetails?.donorDetails?.name || 'N/A'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="font-medium text-gray-700">Email:</p>
                            <p className="text-gray-900">
                              {bookingDetails?.donorDetails?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <p className="font-medium text-gray-700">Mobile:</p>
                            <p className="text-gray-900">
                              {bookingDetails?.donorDetails?.mobile || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Tax Exemption:</p>
                            <p className=" font-semibold text-green-700">
                              ✅ Section 80G Eligible
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-700 mb-1">Address:</p>
                          <p className="text-gray-900 text-sm">
                            {bookingDetails?.donorDetails?.address}, {bookingDetails?.donorDetails?.city}, {bookingDetails?.donorDetails?.state} - {bookingDetails?.donorDetails?.pincode}
                          </p>
                        </div>
                      </>
                  );
                  }
                  
                  // Delegate booking details
                  if (bookingType === 'delegate') {
                    const registrationType = bookingDetails?.eventDetails?.registrationType;
                    const delegateType = bookingDetails?.eventDetails?.delegateType;
                    
                    return (
                      <>
                        <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-green-100 p-4 rounded-lg mb-4 border border-emerald-300">
                          <h4 className="font-bold text-emerald-800 mb-2 flex items-center text-lg">
                            🎓 Delegate Registration Confirmed
                          </h4>
                          <p className="text-emerald-700 text-sm">
                            Registration Type: <span className="font-semibold">{registrationType || 'N/A'}</span>
                          </p>
                        </div>
                        
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-sm">
                            <p className="font-medium text-gray-700 text-sm mb-1">Delegate Name:</p>
                            <p className="text-gray-900 font-semibold">
                              {bookingDetails?.delegateDetails?.name || 'N/A'}
                            </p>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-sm">
                            <p className="font-medium text-gray-700 text-sm mb-1">
                              {registrationType === 'Company' ? 'Company Name:' : 
                               registrationType === 'Temple' ? 'Temple Name:' : 'Organization:'}
                            </p>
                            <p className="text-gray-900">
                              {registrationType === 'Company' ? (bookingDetails?.eventDetails?.companyName || 'N/A') :
                               registrationType === 'Temple' ? (bookingDetails?.eventDetails?.templeName || 'N/A') :
                               (bookingDetails?.delegateDetails?.companyname || 'Individual')}
                            </p>
                          </div>
                        </div>
                        
                        {/* Temple Brief Profile */}
                        {registrationType === 'Temple' && bookingDetails?.eventDetails?.briefProfile && (
                          <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg mb-4">
                            <p className="font-medium text-orange-800 text-sm mb-1">Temple Profile:</p>
                            <p className="text-orange-700 text-sm">
                              {bookingDetails.eventDetails.briefProfile}
                            </p>
                          </div>
                        )}
                        
                        {/* Contact Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div>
                            <p className="font-medium text-gray-700 text-sm">Email:</p>
                            <p className="text-gray-900 text-sm">
                              {bookingDetails?.delegateDetails?.email || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 text-sm">Mobile:</p>
                            <p className="text-gray-900 text-sm">
                              {bookingDetails?.delegateDetails?.mobile || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Delegate Package Information */}
                        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-lg border border-teal-200 mb-4">
                          <h5 className="font-semibold text-teal-800 mb-3">Package Details</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="text-center">
                              <p className="text-teal-600 font-medium text-sm">Package Type</p>
                              <p className="text-teal-800 font-bold">
                                {(() => {
                                  if (delegateType === 'normal') return 'Normal';
                                  if (delegateType === 'withoutAssistance') return 'Without Assistance';
                                  if (delegateType === 'withAssistance') return 'With Assistance';
                                  return delegateType || 'N/A';
                                })()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-teal-600 font-medium text-sm">Duration</p>
                              <p className="text-teal-800 font-bold">
                                {bookingDetails?.eventDetails?.duration || 'N/A'} days
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-teal-600 font-medium text-sm">Persons</p>
                              <p className="text-teal-800 font-bold">
                                {bookingDetails?.eventDetails?.numberOfPersons || 1}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Location & Additional Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div>
                            <p className="font-medium text-gray-700 text-sm mb-1">Location:</p>
                            <p className="text-gray-900 text-sm">
                              {bookingDetails?.delegateDetails?.city}, {bookingDetails?.delegateDetails?.state}, {bookingDetails?.delegateDetails?.country}
                            </p>
                          </div>
                          {bookingDetails?.eventDetails?.designation && (
                            <div>
                              <p className="font-medium text-gray-700 text-sm mb-1">Designation:</p>
                              <p className="text-gray-900 text-sm">
                                {bookingDetails.eventDetails.designation}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* File Upload Status */}
                        {bookingDetails?.delegateDetails?.fileInfo && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                            <p className="text-blue-800 text-sm">
                              📎 Photo {bookingDetails.delegateDetails.fileInfo.fileUploaded ? 'uploaded' : 'not uploaded'}
                              {bookingDetails.delegateDetails.fileInfo.fileUploaded && (
                                <span className="ml-2 text-blue-600">
                                  ({bookingDetails.delegateDetails.fileInfo.fileName})
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                        
                        {/* Welcome Message */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-lg text-white">
                          <p className="font-bold mb-2">🎉 Welcome to Samudayik Vikas Samiti</p>
                          <p className="text-sm opacity-90">
                            Your {registrationType?.toLowerCase()} delegate registration is confirmed. Event details, access credentials, and further instructions will be shared via email.
                          </p>
                          <p className="text-xs mt-2 opacity-80">
                            Please check your email ({bookingDetails?.delegateDetails?.email}) for confirmation and next steps.
                          </p>
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
                                  // DEBUG: Detailed logging for date handling
                                  console.log('🔍 SUCCESS PAGE - Event Date Debug:', {
                                    rawEventDate: bookingDetails.eventDate,
                                    type: typeof bookingDetails.eventDate,
                                    constructor: bookingDetails.eventDate?.constructor?.name,
                                    hasSeconds: bookingDetails.eventDate?.seconds ? true : false,
                                    seconds: bookingDetails.eventDate?.seconds,
                                    hasToDate: typeof bookingDetails.eventDate?.toDate === 'function',
                                    isString: typeof bookingDetails.eventDate === 'string',
                                    isTimestamp: typeof bookingDetails.eventDate === 'number'
                                  });
                                  
                                  let date;
                                  if (bookingDetails.eventDate.seconds) {
                                    date = new Date(bookingDetails.eventDate.seconds * 1000);
                                    console.log('🔍 Created date from seconds:', date, 'ISO:', date.toISOString());
                                  } else if (bookingDetails.eventDate.toDate) {
                                    date = bookingDetails.eventDate.toDate();
                                    console.log('🔍 Created date from toDate():', date, 'ISO:', date.toISOString());
                                  } else if (typeof bookingDetails.eventDate === 'string') {
                                    date = new Date(bookingDetails.eventDate);
                                    console.log('🔍 Created date from string:', date, 'ISO:', date.toISOString());
                                  } else {
                                    date = new Date(bookingDetails.eventDate);
                                    console.log('🔍 Created date from raw value:', date, 'ISO:', date.toISOString());
                                  }
                                  
                                  const formattedDate = date.toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  });
                                  
                                  console.log('🔍 Final formatted date:', formattedDate);
                                  
                                  // Debug alert removed
                                  
                                  return formattedDate;
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
                          <p className="text-gray-900">
                            {(() => {
                              // Check for shift in eventDetails first, then fallback to root level
                              const shift = bookingDetails?.eventDetails?.shift || bookingDetails?.shift;
                              
                              if (!shift) return 'Shift not available';
                              
                              try {
                                const shiftInfo = getShiftDisplayInfo(
                                  shift,
                                  eventSettings.shiftSettings
                                );
                                
                                return `${shiftInfo?.label || shift.charAt(0).toUpperCase() + shift.slice(1) + ' Session'}`;
                              } catch (error) {
                                console.error('Error getting shift display info:', error);
                                // Fallback to basic formatting
                                return shift.charAt(0).toUpperCase() + shift.slice(1) + ' Session';
                              }
                            })()} 
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {(() => {
                              // Show shift time
                              const shift = bookingDetails?.eventDetails?.shift || bookingDetails?.shift;
                              
                              if (!shift) return 'Time not available';
                              
                              try {
                                const shiftInfo = getShiftDisplayInfo(
                                  shift,
                                  eventSettings.shiftSettings
                                );
                                
                                return shiftInfo?.time || 'Time not available';
                              } catch (error) {
                                console.error('Error getting shift time info:', error);
                                // Fallback times based on shift ID
                                if (shift === 'morning') return '9:00 AM - 12:00 PM';
                                if (shift === 'evening') return '4:00 PM - 10:00 PM';
                                if (shift === 'afternoon') return '2:00 PM - 5:00 PM';
                                return 'Time not available';
                              }
                            })()} 
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
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-base font-semibold text-green-800 mb-3 flex items-center">
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
                    <p className="font-medium text-gray-700">Reservation ID:</p>
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
            <h3 className="text-lg font-semibold text-red-800 mb-4">Transaction Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
                <p className="text-gray-900">{new Date().toLocaleString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              {paymentInfo.failure_message && (
                <div className="sm:col-span-2">
                  <p className="font-medium text-gray-700">Failure Reason:</p>
                  <div className="bg-red-100 border border-red-300 rounded p-2 mt-1">
                    <p className="text-red-800 text-sm">{paymentInfo.failure_message}</p>
                  </div>
                </div>
              )}
              {paymentInfo.status_message && (
                <div className="sm:col-span-2">
                  <p className="font-medium text-gray-700">Status Message:</p>
                  <div className="bg-red-100 border border-red-300 rounded p-2 mt-1">
                    <p className="text-red-800 text-sm">{paymentInfo.status_message}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Redirect Notice */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 text-sm">
                💡 <strong>Note:</strong> For better experience with failed payments, we recommend using our dedicated failed payment page.
              </p>
              <button
                onClick={() => {
                  const params = new URLSearchParams({
                    order_id: paymentInfo.order_id,
                    status: paymentInfo.status,
                    ...(paymentInfo.message && { message: paymentInfo.message }),
                    ...(paymentInfo.amount && { amount: paymentInfo.amount }),
                    ...(paymentInfo.tracking_id && { tracking_id: paymentInfo.tracking_id }),
                    ...(paymentInfo.failure_message && { failure_message: paymentInfo.failure_message }),
                    ...(paymentInfo.status_message && { status_message: paymentInfo.status_message })
                  });
                  router.push(`/payment/failed?${params.toString()}`);
                }}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
              >
                View on Failed Payment Page
              </button>
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
                  • You will receive a confirmation email with your reservation details<br/>
                  • Please save your Reservation ID for future reference<br/>
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
          <p>Need assistance? Contact us at <span className="font-semibold text-blue-600">info@svsamiti.com</span></p>
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
