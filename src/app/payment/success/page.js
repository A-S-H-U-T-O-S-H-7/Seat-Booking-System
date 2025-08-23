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

        {/* Payment + Booking Info blocks remain same... */}
        {/* ...KEEP YOUR BOOKING DETAILS JSX AND PAYMENT DETAILS JSX AS THEY ARE... */}

        {/* Support */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Need assistance? Contact us at{" "}
            <span className="font-semibold text-blue-600">
              support@svsamiti.com
            </span>
          </p>
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
