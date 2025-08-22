import { Suspense } from 'react';
import PaymentResultContent from './PaymentResultContent';

export default function PaymentResult() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">Loading payment result...</p>
        </div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
