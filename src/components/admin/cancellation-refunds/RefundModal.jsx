import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { 
  XMarkIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function RefundModal({ 
  isOpen, 
  onClose, 
  cancellation, 
  onConfirmRefund, 
  loading 
}) {
  const { isDarkMode } = useTheme();
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [processingFee, setProcessingFee] = useState(0);

  const refundReasons = [
    'Customer cancellation within policy',
    'Event cancelled by organizer', 
    'Duplicate booking',
    'Payment error/duplicate charge',
    'Technical issue during booking',
    'Customer complaint resolution',
    'Other (specify in notes)'
  ];

  // Calculate refund amount based on cancellation policy
  const calculateRefundAmount = () => {
    if (!cancellation) return 0;
    
    const originalAmount = cancellation.originalAmount;
    const cancellationDate = new Date(cancellation.cancellationDate);
    const eventDate = new Date(cancellation.eventDate || Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to week from now if no event date
    const daysUntilEvent = Math.ceil((eventDate - cancellationDate) / (1000 * 60 * 60 * 24));
    
    // Simple refund policy - can be customized
    let refundPercentage = 1.0; // 100% by default
    let fee = 0;
    
    if (daysUntilEvent < 1) {
      refundPercentage = 0.5; // 50% for same day
      fee = 50;
    } else if (daysUntilEvent < 3) {
      refundPercentage = 0.75; // 75% for 1-2 days
      fee = 100;
    } else if (daysUntilEvent < 7) {
      refundPercentage = 0.9; // 90% for 3-6 days
      fee = 150;
    } else {
      fee = 200; // Standard processing fee
    }
    
    const calculatedAmount = Math.max(0, originalAmount * refundPercentage - fee);
    return { amount: calculatedAmount, fee, percentage: refundPercentage * 100 };
  };

  const suggestedRefund = calculateRefundAmount();

  // Initialize refund amount when modal opens
  useState(() => {
    if (cancellation && isOpen) {
      setRefundAmount(suggestedRefund.amount.toString());
      setProcessingFee(suggestedRefund.fee);
    }
  }, [cancellation, isOpen]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleRefundAmountChange = (value) => {
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setRefundAmount(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!refundAmount || !refundReason) {
      return;
    }

    const refundData = {
      cancellationId: cancellation.id,
      refundAmount: Number(refundAmount),
      refundReason,
      processingFee,
      originalAmount: cancellation.originalAmount,
      refundPercentage: ((Number(refundAmount) + processingFee) / cancellation.originalAmount * 100).toFixed(1)
    };

    onConfirmRefund(refundData);
  };

  const isValidRefund = refundAmount && 
                       Number(refundAmount) > 0 && 
                       Number(refundAmount) <= cancellation?.originalAmount &&
                       refundReason;

  if (!isOpen || !cancellation) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Process Refund
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className={`p-2 rounded-md transition-colors ${
              isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Booking Details */}
          <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg border p-4 mb-6`}>
            <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Booking Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Customer:</span>
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{cancellation.customerName}</p>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{cancellation.customerEmail}</p>
              </div>
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Booking ID:</span>
                <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{cancellation.bookingId}</p>
              </div>
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Original Amount:</span>
                <p className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {formatCurrency(cancellation.originalAmount)}
                </p>
              </div>
              <div>
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Booking Type:</span>
                <p className={`capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cancellation.bookingType}</p>
              </div>
            </div>
          </div>

          {/* Refund Calculation */}
          <div className="mb-6">
            <h3 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Suggested Refund Calculation
            </h3>
            <div className={`${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <div className="flex-1">
                  <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'} mb-2`}>
                    Based on our refund policy ({suggestedRefund.percentage}% refund rate):
                  </p>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Original Amount:</span>
                      <span>{formatCurrency(cancellation.originalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Fee:</span>
                      <span>-{formatCurrency(suggestedRefund.fee)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1 mt-2">
                      <span>Suggested Refund:</span>
                      <span>{formatCurrency(suggestedRefund.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

         <div className='grid grid-cols-1 md:grid-cols-2 gap-4 '>
          {/* Refund Amount Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Refund Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyRupeeIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type="text"
                value={refundAmount}
                onChange={(e) => handleRefundAmountChange(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md text-sm transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500'
                } ${!isValidRefund && refundAmount ? 'border-red-500' : ''}`}
                placeholder="Enter refund amount"
                disabled={loading}
              />
            </div>
            {refundAmount && Number(refundAmount) > cancellation.originalAmount && (
              <p className="mt-1 text-sm text-red-600">Refund amount cannot exceed original amount</p>
            )}
          </div>

          {/* Processing Fee */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Processing Fee
            </label>
            <input
              type="number"
              value={processingFee}
              onChange={(e) => setProcessingFee(Number(e.target.value) || 0)}
              className={`block w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500'
              }`}
              min="0"
              disabled={loading}
            />
          </div>
          </div>

          {/* Refund Reason */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Refund Reason *
            </label>
            <select
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
              }`}
              disabled={loading}
            >
              <option value="">Select a reason</option>
              {refundReasons.map((reason, index) => (
                <option key={index} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          {/* Summary */}
          {refundAmount && isValidRefund && (
            <div className={`${isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border rounded-lg p-4 mb-6`}>
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                <div className="flex-1">
                  <p className={`font-medium ${isDarkMode ? 'text-green-200' : 'text-green-700'}`}>
                    Refund Summary
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                    Customer will receive {formatCurrency(Number(refundAmount))} out of {formatCurrency(cancellation.originalAmount)} 
                    ({(((Number(refundAmount) + processingFee) / cancellation.originalAmount) * 100).toFixed(1)}% of original amount)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 border-gray-600 hover:bg-gray-700' 
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              } border`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidRefund || loading}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                !isValidRefund || loading
                  ? (isDarkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed')
                  : (isDarkMode ? 'bg-green-900 text-green-200 hover:bg-green-800' : 'bg-green-600 text-white hover:bg-green-700')
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CurrencyRupeeIcon className="w-4 h-4 mr-2" />
                  Process Refund
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
