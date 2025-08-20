"use client";
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = searchParams.get('booking_id');
  const reason = searchParams.get('reason');
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    if (reason) return reason;
    if (error === 'no_response') return 'No payment response received';
    if (error === 'decryption_failed') return 'Payment verification failed';
    if (error === 'server_error') return 'Server error occurred';
    return 'Payment processing failed';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
          <p className="text-red-100">Unfortunately, your payment could not be processed</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Details */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-3">Error Details</h3>
            <div className="space-y-2 text-sm">
              {bookingId && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Booking ID:</span>
                  <span className="text-red-600 font-mono">{bookingId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Reason:</span>
                <span className="text-red-600">{getErrorMessage()}</span>
              </div>
            </div>
          </div>

          {/* What happened */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-r-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              What happened?
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-1">•</span>
                <span>Your payment could not be processed successfully</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-1">•</span>
                <span>Your seats have been released and are available for booking again</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2 mt-1">•</span>
                <span>No amount has been charged from your account</span>
              </li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
              <span className="text-lg mr-2">💡</span>
              What can you do?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1">•</span>
                <span>Try booking again with a different payment method</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1">•</span>
                <span>Check your internet connection and try again</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1">•</span>
                <span>Contact your bank if the issue persists</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2 mt-1">•</span>
                <span>Contact our support team for assistance</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/booking/havan')}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
            >
              Try Booking Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
            >
              Back to Home
            </button>
          </div>

          {/* Support Contact */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
