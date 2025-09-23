import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

export default function CancellationFilters({ filters, onFilterChange, totalItems, loading }) {
  const { isDarkMode } = useTheme();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const bookingTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'havan', label: 'Havan Bookings' },
    { value: 'stall', label: 'Stall Bookings' },
    { value: 'show', label: 'Show Bookings' }
  ];

  const refundStatuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processed', label: 'Processed' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const sortOptions = [
    { value: 'cancellationDate', label: 'Cancellation Date' },
    { value: 'originalAmount', label: 'Amount' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'refundStatus', label: 'Status' }
  ];

  const handleFilterChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      bookingType: 'all',
      refundStatus: 'all',
      dateRange: 'all',
      searchQuery: '',
      customStartDate: '',
      customEndDate: '',
      sortBy: 'cancellationDate',
      sortOrder: 'desc'
    });
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = filters.bookingType !== 'all' || 
                          filters.refundStatus !== 'all' || 
                          filters.dateRange !== 'all' || 
                          filters.searchQuery !== '';

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Search and quick filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, booking ID..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border rounded-md text-sm transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500'
              }`}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.bookingType}
              onChange={(e) => handleFilterChange('bookingType', e.target.value)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
              }`}
            >
              {bookingTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={filters.refundStatus}
              onChange={(e) => handleFilterChange('refundStatus', e.target.value)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
              }`}
            >
              {refundStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Results Count */}
          {!loading && (
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {totalItems} cancellation{totalItems !== 1 ? 's' : ''}
            </span>
          )}

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              showAdvancedFilters
                ? (isDarkMode ? 'bg-purple-900 text-purple-200 border-purple-700' : 'bg-purple-100 text-purple-700 border-purple-200')
                : (isDarkMode ? 'text-gray-300 border-gray-600 hover:bg-gray-700' : 'text-gray-700 border-gray-300 hover:bg-gray-50')
            } border`}
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
            Advanced
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isDarkMode 
                  ? 'text-red-400 border-red-700 hover:bg-red-900/20' 
                  : 'text-red-600 border-red-300 hover:bg-red-50'
              } border`}
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                }`}
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                }`}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                }`}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* Empty column for spacing */}
            <div></div>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.customStartDate}
                    onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.customEndDate}
                    onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
                    className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.bookingType !== 'all' && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
            }`}>
              Type: {bookingTypes.find(t => t.value === filters.bookingType)?.label}
            </span>
          )}
          {filters.refundStatus !== 'all' && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
            }`}>
              Status: {refundStatuses.find(s => s.value === filters.refundStatus)?.label}
            </span>
          )}
          {filters.dateRange !== 'all' && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
            }`}>
              Date: {dateRanges.find(d => d.value === filters.dateRange)?.label}
            </span>
          )}
          {filters.searchQuery && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
            }`}>
              Search: "{filters.searchQuery}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}
