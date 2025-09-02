import { MagnifyingGlassIcon as SearchIcon, FunnelIcon as FilterIcon, CalendarDaysIcon as CalendarIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function ShowBookingFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  participationFilter,
  setParticipationFilter,
  dateFilter,
  setDateFilter,
  selectedDate,
  setSelectedDate,
  bookingDate,
  setBookingDate,
  onSearch,
  loading,
  isDarkMode
}) {
  
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };
  
  const handleDateChange = (value) => {
    setSelectedDate(value ? new Date(value) : null);
  };
  
  const handleBookingDateChange = (value) => {
    setBookingDate(value ? new Date(value) : null);
  };
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
            placeholder="Search bookings by ID, customer name, email or seat..."
            className={`block w-full pl-10 pr-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        
        <div className="flex flex-wrap gap-3 items-end">
          {/* Status Filter */}
          <div className="flex flex-col">
            <label className={`text-xs font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Status
            </label>
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
          </div>
          
          {/* Participation Filter */}
          <div className="flex flex-col">
            <label className={`text-xs font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Participation
            </label>
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
                <option value="all">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FilterIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div className="flex flex-col">
            <label className={`text-xs font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Date Range
            </label>
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
                <option value="week">Past 7 Days</option>
                <option value="month">Past 30 Days</option>
                <option value="3months">Past 3 Months</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Show Date Filter */}
          <div className="flex flex-col">
            <label className={`text-xs font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Show Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={(e) => handleDateChange(e.target.value)}
                className={`pl-10 pr-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                title="Filter by show date"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Clear show date filter"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          {/* Booking Date Filter */}
          <div className="flex flex-col">
            <label className={`text-xs font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Booking Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={formatDateForInput(bookingDate)}
                onChange={(e) => handleBookingDateChange(e.target.value)}
                className={`pl-10 pr-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                title="Filter by booking date"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              {bookingDate && (
                <button
                  onClick={() => setBookingDate(null)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Clear booking date filter"
                >
                  ×
                </button>
              )}
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
      
      {/* Show selected filters info */}
      {(selectedDate || bookingDate) && (
        <div className={`mt-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {selectedDate && (
            <span className="mr-4">
              Show date: <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
            </span>
          )}
          {bookingDate && (
            <span>
              Booking date: <span className="font-medium">{bookingDate.toLocaleDateString()}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}