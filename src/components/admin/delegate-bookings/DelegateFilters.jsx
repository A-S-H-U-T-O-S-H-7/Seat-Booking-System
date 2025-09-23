import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { UserIcon } from 'lucide-react';

export default function DelegateFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  onSearch,
  loading,
  isDarkMode
}) {
  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-6`}>
      {/* Search */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
        </div>
        <input
          type="text"
          placeholder="Search by name, email, mobile, organization or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`block w-full pl-10 pr-3 py-3 text-sm rounded-lg border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500'
          } transition-colors duration-200`}
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-yellow-500 focus:border-yellow-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-yellow-500 focus:border-yellow-500'
            } transition-colors duration-200`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
            <option value="cancellation-requested">Cancellation Requested</option>
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Date Range
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`w-full px-3 py-2.5 text-sm rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-yellow-500 focus:border-yellow-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-yellow-500 focus:border-yellow-500'
            } transition-colors duration-200`}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>

        {/* Export Options */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Export Data
          </label>
          <button
            onClick={() => toast.info('Export feature coming soon')}
            className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              isDarkMode
                ? 'bg-gray-600 hover:bg-gray-500 text-white border border-gray-600'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
            } flex items-center justify-center gap-2`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Refresh Button */}
        <div className="flex items-end">
          <button
            onClick={onSearch}
            disabled={loading}
            className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              isDarkMode
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Refreshing...
              </>
            ) : (
              <>
                <FunnelIcon className="h-4 w-4" />
                Refresh & Filter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
