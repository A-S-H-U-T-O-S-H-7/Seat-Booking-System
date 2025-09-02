import { MagnifyingGlassIcon as SearchIcon, FunnelIcon as FilterIcon, CalendarDaysIcon as CalendarIcon } from '@heroicons/react/24/outline';

export default function StallBookingFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  participationFilter,
  setParticipationFilter,
  dateFilter,
  setDateFilter,
  onSearch,
  loading,
  isDarkMode
}) {
  return (
    <div className={`rounded-xl p-4 mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookings by ID, vendor name, email or stall..."
            className={`block w-full pl-10 pr-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`appearance-none pl-10 pr-8 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="relative">
            <select
              value={participationFilter}
              onChange={(e) => setParticipationFilter(e.target.value)}
              className={`appearance-none pl-10 pr-8 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Participation</option>
              <option value="yes">Participated</option>
              <option value="no">Not Participated</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FilterIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`appearance-none pl-10 pr-8 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <button
            onClick={onSearch}
            disabled={loading}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors duration-150 ${
              isDarkMode 
                ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Searching...
              </>
            ) : (
              'Apply Filters'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}