"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, AlertTriangle } from 'lucide-react';

// Loading component for suspense fallback
function LoadingCancellation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl max-w-md w-full p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Cancellation</h2>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}

// Main payment cancellation component
function PaymentCancelContent() {
  const [processing, setProcessing] = useState(true);
  const [cancellationData, setCancellationData] = useState(null);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    handleCancellation();
  }, []);

  const handleCancellation = async () => {
    try {
      // Get encrypted response if available (CCAvenue might send this)
      const encResp = searchParams.get('encResp');
      const order_id = searchParams.get('order_id') || 'unknown';
      const message = searchParams.get('message') || 'Payment was cancelled by user';

      console.log('Processing payment cancellation...');

      // If we have encrypted response, process it
      if (encResp) {
        const response = await fetch('/api/payment/ccavenue-cancel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ encResp })
        });

        const data = await response.json();
        console.log('Cancellation response data:', data);

        if (data.status && data.data) {
          setCancellationData(data.data);
        } else {
          // Fallback data
          setCancellationData({
            order_id: order_id,
            order_status: 'Cancelled',
            failure_message: message
          });
        }
      } else {
        // Direct cancellation without encrypted response
        setCancellationData({
          order_id: order_id,
          order_status: 'Cancelled',
          failure_message: message
        });
      }

      // Auto-redirect to success page with cancellation status
      setTimeout(() => {
        const params = new URLSearchParams({
          order_id: order_id,
          status: 'cancelled',
          message: message
        });
        router.push(`/payment/success?${params.toString()}`);
      }, 3000);

    } catch (error) {
      console.error('Cancellation processing error:', error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryPayment = () => {
    router.push('/booking');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl max-w-2xl w-full p-8">
        {processing && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Cancellation</h2>
            <p className="text-gray-600">Please wait while we process your cancellation...</p>
          </div>
        )}

        {!processing && !error && (
          <>
            {/* Cancellation Icon and Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-red-800 mb-2">
                Payment Cancelled
              </h1>
              <p className="text-gray-600 text-lg">
                Your payment has been cancelled. No charges have been made to your account.
              </p>
            </div>

            {/* Cancellation Details */}
            {cancellationData && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-red-800 mb-4">Cancellation Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Order ID:</p>
                    <p className="text-gray-900 font-mono">{cancellationData.order_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Status:</p>
                    <p className="text-red-800 font-semibold">Cancelled</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="font-medium text-gray-700">Reason:</p>
                    <p className="text-gray-900">{cancellationData.failure_message || 'Payment was cancelled by user'}</p>
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
              <button
                onClick={handleRetryPayment}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                Try Payment Again
              </button>
              <button
                onClick={handleGoHome}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300"
              >
                Go to Home
              </button>
            </div>

            {/* Information */}
            <div className="mt-8 text-center">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">What Happened?</h4>
                <p className="text-sm text-orange-700">
                  • Your payment was cancelled before completion<br/>
                  • No amount has been charged to your account<br/>
                  • You can retry the payment at any time<br/>
                  • If you need help, please contact our support team
                </p>
              </div>
            </div>

            {/* Auto-redirect message */}
            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Redirecting to confirmation page in a few seconds...</p>
            </div>
          </>
        )}

        {!processing && error && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-16 h-16 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-yellow-800 mb-2">Processing Error</h2>
            <p className="text-gray-600 mb-4">
              There was an error processing your cancellation: {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetryPayment}
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
            </div>
          </div>
        )}

        {/* Support Contact */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need assistance? Contact us at <span className="font-semibold text-blue-600">support@svsamiti.com</span></p>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<LoadingCancellation />}>
      <PaymentCancelContent />
    </Suspense>
  );
}
