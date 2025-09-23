import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Pagination({
  currentPage,
  totalPages,
  totalBookings,
  bookingsPerPage,
  onPageChange,
  isDarkMode
}) {
  const startIndex = (currentPage - 1) * bookingsPerPage + 1;
  const endIndex = Math.min(currentPage * bookingsPerPage, totalBookings);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
      <div className="px-4 py-4 sm:px-6">
        {/* Mobile pagination */}
        <div className="flex justify-between items-center sm:hidden">
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="font-semibold">{startIndex}</span>-<span className="font-semibold">{endIndex}</span> of <span className="font-semibold">{totalBookings}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            
            <div className={`px-3 py-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
              {currentPage}/{totalPages}
            </div>
            
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop pagination */}
        <div className="hidden sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              📊 Showing{' '}
              <span className="font-semibold text-yellow-600">{startIndex}</span>
              {' '}to{' '}
              <span className="font-semibold text-yellow-600">{endIndex}</span>
              {' '}of{' '}
              <span className="font-semibold text-yellow-600">{totalBookings}</span>
              {' '}registrations
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
              {/* Previous button */}
              <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span className="ml-1 hidden sm:inline">Previous</span>
              </button>

              {/* First page if not in visible range */}
              {getPageNumbers()[0] > 1 && (
                <>
                  <button
                    onClick={() => onPageChange(1)}
                    className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    1
                  </button>
                  {getPageNumbers()[0] > 2 && (
                    <span className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-300 text-gray-500'
                    }`}>
                      ...
                    </span>
                  )}
                </>
              )}

              {/* Page numbers */}
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    currentPage === pageNum
                      ? isDarkMode 
                        ? 'z-10 bg-yellow-700 border-yellow-600 text-yellow-300 shadow-lg' 
                        : 'z-10 bg-yellow-100 border-yellow-500 text-yellow-700 shadow-lg'
                      : isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Last page if not in visible range */}
              {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                <>
                  {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                    <span className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-300 text-gray-500'
                    }`}>
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600' 
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* Next button */}
              <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600'
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1 hidden sm:inline">Next</span>
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
