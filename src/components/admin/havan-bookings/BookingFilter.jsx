import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export default function BookingFilters({
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
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div>
          <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
            Search Bookings
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`block w-full h-12 pl-4 pr-10 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <MagnifyingGlassIcon className={`absolute right-3 top-3.5 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <FunnelIcon className="w-5 h-5 inline mr-2" />
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`block w-full h-12 px-4 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">🔍 All Status</option>
            <option value="confirmed">✅ Confirmed</option>
            <option value="cancelled">❌ Cancelled</option>
                      </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <CalendarDaysIcon className="w-5 h-5 inline mr-2" />
            Filter by Date
          </label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`block w-full h-12 px-4 rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">📅 All Time</option>
            <option value="today">🌅 Today</option>
            <option value="week">📊 Last Week</option>
            <option value="month">🗓️ Last Month</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter('all');
            }}
            disabled={loading}
            className={`w-full h-12 inline-flex items-center justify-center px-6 py-3 border text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}