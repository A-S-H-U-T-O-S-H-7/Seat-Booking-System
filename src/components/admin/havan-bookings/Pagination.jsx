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
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} px-4 py-3 flex items-center justify-between border-t rounded-b-xl sm:px-6`}>
      {/* Mobile pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode 
              ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode 
              ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          Next
          <ChevronRightIcon className="w-5 h-5 ml-1" />
        </button>
      </div>

      {/* Desktop pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            📊 Showing{' '}
            <span className="font-semibold">{startIndex}</span>
            {' '}to{' '}
            <span className="font-semibold">{endIndex}</span>
            {' '}of{' '}
            <span className="font-semibold">{totalBookings}</span>
            {' '}results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {/* Previous button */}
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            {/* First page if not in visible range */}
            {getPageNumbers()[0] > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-150 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600' 
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  1
                </button>
                {getPageNumbers()[0] > 2 && (
                  <span className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
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
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-150 ${
                  currentPage === pageNum
                    ? isDarkMode 
                      ? 'z-10 bg-purple-800 border-purple-600 text-purple-300' 
                      : 'z-10 bg-purple-50 border-purple-500 text-purple-600'
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
                  <span className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    ...
                  </span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-150 ${
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
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-gray-400 hover:bg-gray-600'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}