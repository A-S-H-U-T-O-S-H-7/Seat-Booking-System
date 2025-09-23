import { XMarkIcon, CurrencyRupeeIcon, TagIcon, DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function PriceAdjustmentModal({
  show,
  priceAdjustment,
  setPriceAdjustment,
  onClose,
  onSubmit,
  isUpdating,
  isDarkMode
}) {
  if (!show) return null;

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDiscountChange = (discount) => {
    const discountPercent = Math.max(0, Math.min(100, discount));
    const originalPrice = priceAdjustment.originalPrice || priceAdjustment.newPrice || 0;
    const discountAmount = (originalPrice * discountPercent) / 100;
    const newPrice = originalPrice - discountAmount;
    
    setPriceAdjustment({
      ...priceAdjustment,
      discount: discountPercent,
      newPrice: Math.max(0, newPrice)
    });
  };

  const handlePriceChange = (newPrice) => {
    const price = Math.max(0, newPrice);
    const originalPrice = priceAdjustment.originalPrice || price;
    const discountAmount = originalPrice - price;
    const discountPercent = originalPrice > 0 ? (discountAmount / originalPrice) * 100 : 0;
    
    setPriceAdjustment({
      ...priceAdjustment,
      newPrice: price,
      discount: Math.max(0, Math.min(100, discountPercent))
    });
  };

  const savings = (priceAdjustment.originalPrice || priceAdjustment.newPrice) - priceAdjustment.newPrice;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-50 transition-opacity" 
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`relative max-w-md w-full rounded-lg shadow-xl transform transition-all ${
          isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'
        }`}>
          
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-2">
              <CurrencyRupeeIcon className="w-5 h-5 text-orange-500" />
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Price Adjustment
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-md hover:bg-gray-100 ${
                isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500'
              }`}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            
            {/* Price Summary - Horizontal Layout */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg text-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-blue-50'
              }`}>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Original
                </div>
                <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {formatCurrency(priceAdjustment.originalPrice || priceAdjustment.newPrice)}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg text-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-green-50'
              }`}>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  New Price
                </div>
                <div className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {formatCurrency(priceAdjustment.newPrice)}
                </div>
              </div>
            </div>

            {/* Savings Indicator */}
            {savings > 0 && (
              <div className={`p-2 rounded-md text-center text-sm ${
                isDarkMode ? 'bg-orange-900 bg-opacity-30 text-orange-300' : 'bg-orange-50 text-orange-800'
              }`}>
                <TagIcon className="w-4 h-4 inline mr-1" />
                Save {formatCurrency(savings)} ({priceAdjustment.discount.toFixed(1)}% off)
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
              
              {/* Price and Discount - Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    New Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceAdjustment.newPrice}
                    onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 text-sm rounded-md border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={priceAdjustment.discount}
                    onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 text-sm rounded-md border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {/* Reason - Compact */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <DocumentTextIcon className="w-3 h-3 inline mr-1" />
                  Reason (optional)
                </label>
                <textarea
                  value={priceAdjustment.reason}
                  onChange={(e) => setPriceAdjustment({ ...priceAdjustment, reason: e.target.value })}
                  rows={2}
                  className={`w-full px-3 py-2 text-sm rounded-md border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Brief reason for adjustment..."
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className={`flex space-x-3 p-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              disabled={isUpdating}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            
            <button
              onClick={onSubmit}
              disabled={isUpdating || priceAdjustment.newPrice <= 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-medium rounded-md transition-all disabled:opacity-50 hover:from-orange-700 hover:to-red-700 flex items-center justify-center space-x-1"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Apply</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}