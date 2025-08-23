"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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

// Main payment success component that uses useSearchParams
function PaymentSuccessContent() {
  const [paymentInfo, setPaymentInfo] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Get payment details from URL params
    const order_id = searchParams.get('order_id');
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const amount = searchParams.get('amount');
    const tracking_id = searchParams.get('tracking_id');

    setPaymentInfo({
      order_id,
      status,
      message,
      amount,
      tracking_id
    });
  }, [searchParams]);

  const getStatusIcon = () => {
    if (!paymentInfo) return <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>;
    
    switch (paymentInfo.status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-600" />;
      default:
        return <AlertTriangle className="w-16 h-16 text-yellow-600" />;
    }
  };

  const getStatusTitle = () => {
    if (!paymentInfo) return 'Loading...';
    
    switch (paymentInfo.status) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Payment Status Unknown';
    }
  };

  const getStatusMessage = () => {
    if (!paymentInfo) return 'Please wait...';
    
    switch (paymentInfo.status) {
      case 'success':
        return 'Your payment has been processed successfully. You will receive a confirmation email shortly.';
      case 'failed':
        return paymentInfo.message || 'Your payment could not be processed. Please try again.';
      default:
        return 'We could not determine the status of your payment. Please contact support.';
    }
  };

  const getStatusColor = () => {
    if (!paymentInfo) return 'blue';
    
    switch (paymentInfo.status) {
      case 'success':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'yellow';
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleTryAgain = () => {
    router.push('/booking');
  };

  const handleViewBookings = () => {
    router.push('/profile');
  };

  if (!paymentInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center items-center px-4 py-8">
        <div className="bg-white shadow-xl rounded-2xl max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Payment Status</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-${getStatusColor()}-50 via-white to-${getStatusColor()}-100 flex flex-col justify-center items-center px-4 py-8`}>
      <div className="bg-white shadow-xl rounded-2xl max-w-2xl w-full p-8">
        {/* Status Icon and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h1 className={`text-3xl font-bold text-${getStatusColor()}-800 mb-2`}>
            {getStatusTitle()}
          </h1>
          <p className="text-gray-600 text-lg">
            {getStatusMessage()}
          </p>
        </div>

        {/* Payment Details */}
        {paymentInfo.order_id && (
          <div className={`bg-${getStatusColor()}-50 border border-${getStatusColor()}-200 rounded-lg p-6 mb-8`}>
            <h3 className={`text-lg font-semibold text-${getStatusColor()}-800 mb-4`}>Payment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Order ID:</p>
                <p className="text-gray-900 font-mono">{paymentInfo.order_id}</p>
              </div>
              {paymentInfo.tracking_id && (
                <div>
                  <p className="font-medium text-gray-700">Tracking ID:</p>
                  <p className="text-gray-900 font-mono">{paymentInfo.tracking_id}</p>
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
                <p className={`text-${getStatusColor()}-800 font-semibold capitalize`}>
                  {paymentInfo.status}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="font-medium text-gray-700">Date & Time:</p>
                <p className="text-gray-900">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {paymentInfo.status === 'success' ? (
            <>
              <button
                onClick={handleViewBookings}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                View My Bookings
              </button>
              <button
                onClick={handleGoHome}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                Go to Home
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleTryAgain}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                Try Again
              </button>
              <button
                onClick={handleGoHome}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                Go to Home
              </button>
            </>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <div className={`bg-${getStatusColor()}-50 border border-${getStatusColor()}-200 rounded-lg p-4`}>
            {paymentInfo.status === 'success' ? (
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

// Main export with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingPaymentResult />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
