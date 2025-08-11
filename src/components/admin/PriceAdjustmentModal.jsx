import { PencilIcon, XMarkIcon, CheckCircleIcon, CurrencyRupeeIcon, TagIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

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
    if (!amount || isNaN(amount)) {
      return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDiscountChange = (discount) => {
    const discountPercent = Math.max(0, Math.min(100, discount)); // Ensure 0-100%
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

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-md transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className={`relative max-w-3xl w-full mx-auto rounded-2xl shadow-2xl transform transition-all z-[70] ${
          isDarkMode 
            ? 'bg-gray-900 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          
          {/* Header */}
          <div className={`relative px-8 py-6 border-b ${
            isDarkMode 
              ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900' 
              : 'border-gray-200 bg-gradient-to-r from-orange-50 to-red-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-orange-900 bg-opacity-50' : 'bg-orange-100'
                }`}>
                  <CurrencyRupeeIcon className={`w-6 h-6 ${
                    isDarkMode ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                </div>
                <h3 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Price Adjustment
                </h3>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column - Price Summary */}
              <div className="space-y-6">
                <h4 className={`text-lg font-semibold flex items-center space-x-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <TagIcon className="w-5 h-5" />
                  <span>Price Summary</span>
                </h4>
                
                {/* Price Cards */}
                <div className="space-y-4">
                  {/* Original Price Card */}
                  <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                      : 'bg-blue-50 border-blue-200 hover:border-blue-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Original Price
                      </span>
                      <span className={`text-xl font-bold ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {formatCurrency(priceAdjustment.originalPrice || priceAdjustment.newPrice)}
                      </span>
                    </div>
                  </div>

                  {/* New Price Card */}
                  <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                      : 'bg-green-50 border-green-200 hover:border-green-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        New Price
                      </span>
                      <span className={`text-2xl font-bold ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {formatCurrency(priceAdjustment.newPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Discount Card */}
                  {priceAdjustment.discount > 0 && (
                    <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                        : 'bg-red-50 border-red-200 hover:border-red-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Discount Applied
                        </span>
                        <span className={`text-lg font-bold ${
                          isDarkMode ? 'text-red-400' : 'text-red-600'
                        }`}>
                          -{priceAdjustment.discount.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Savings Summary */}
                {priceAdjustment.newPrice !== (priceAdjustment.originalPrice || priceAdjustment.newPrice) && (
                  <div className={`p-4 rounded-xl border-l-4 ${
                    isDarkMode 
                      ? 'bg-orange-900 bg-opacity-30 border-orange-500 text-orange-300' 
                      : 'bg-orange-50 border-orange-400 text-orange-800'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold">Adjustment Summary</p>
                        <p className="mt-1">
                          Price changing from{' '}
                          <span className="font-bold">
                            {formatCurrency(priceAdjustment.originalPrice || priceAdjustment.newPrice)}
                          </span>
                          {' '}to{' '}
                          <span className="font-bold">
                            {formatCurrency(priceAdjustment.newPrice)}
                          </span>
                          {priceAdjustment.discount > 0 && (
                            <span className="block mt-1">
                              Discount: {priceAdjustment.discount.toFixed(1)}%
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Input Form */}
              <div className="space-y-6">
                <h4 className={`text-lg font-semibold flex items-center space-x-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <PencilIcon className="w-5 h-5" />
                  <span>Adjustment Details</span>
                </h4>

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
                  {/* New Price Input */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <CurrencyRupeeIcon className="w-4 h-4 inline mr-1" />
                      New Price (INR)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceAdjustment.newPrice}
                        onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                        className={`w-full px-4 py-4 text-lg rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-500 focus:ring-opacity-25 focus:border-orange-500 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-750' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-gray-50'
                        }`}
                        placeholder="0.00"
                        required
                      />
                      <span className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-lg font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        ₹
                      </span>
                    </div>
                  </div>

                  {/* Discount Input */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <TagIcon className="w-4 h-4 inline mr-1" />
                      Discount Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={priceAdjustment.discount}
                        onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                        className={`w-full px-4 py-4 text-lg rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-500 focus:ring-opacity-25 focus:border-orange-500 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-750' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-gray-50'
                        }`}
                        placeholder="0.0"
                      />
                      <span className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-lg font-medium ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        %
                      </span>
                    </div>
                  </div>

                  {/* Reason Input */}
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                      Reason for Adjustment
                    </label>
                    <textarea
                      value={priceAdjustment.reason}
                      onChange={(e) => setPriceAdjustment({ ...priceAdjustment, reason: e.target.value })}
                      rows={4}
                      className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-orange-500 focus:ring-opacity-25 focus:border-orange-500 resize-none ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-750' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-gray-50'
                      }`}
                      placeholder="Enter the reason for this price adjustment (optional)..."
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`px-8 py-6 border-t flex items-center justify-end space-x-4 ${
            isDarkMode 
              ? 'border-gray-700 bg-gray-800 bg-opacity-50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <button
              onClick={onClose}
              disabled={isUpdating}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
              }`}
            >
              Cancel
            </button>
            
            <button
              onClick={onSubmit}
              disabled={isUpdating || priceAdjustment.newPrice <= 0}
              className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:from-orange-700 hover:to-red-700 shadow-lg"
            >
              {isUpdating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Apply Adjustment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
