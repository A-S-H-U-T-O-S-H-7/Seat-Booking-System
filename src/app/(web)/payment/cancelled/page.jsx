import { Suspense } from 'react';
import PaymentCancelledContent from './PaymentCancelledContent';

export default function PaymentCancelled() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-600">Loading booking details...</p>
        </div>
      </div>
    }>
      <PaymentCancelledContent />
    </Suspense>
  );
}
