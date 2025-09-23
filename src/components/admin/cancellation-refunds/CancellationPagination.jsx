import { useTheme } from '@/context/ThemeContext';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

export default function CancellationPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  loading
}) {
  const { isDarkMode } = useTheme();

  const itemsPerPageOptions = [10, 25, 50, 100];
  
  // Calculate the range of items being displayed
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipses
      if (currentPage <= 4) {
        // Show first pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show last pages
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (!loading) {
      onItemsPerPageChange(Number(newItemsPerPage));
    }
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Results Info and Items Per Page */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Results Info */}
          <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> cancellations
          </div>

          {/* Items Per Page */}
          <div className="flex items-center gap-2">
            <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Show:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              disabled={loading}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              per page
            </span>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || loading}
              className={`p-2 rounded-md transition-colors ${
                currentPage === 1 || loading
                  ? (isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed')
                  : (isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100')
              }`}
              title="First page"
            >
              <ChevronDoubleLeftIcon className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className={`p-2 rounded-md transition-colors ${
                currentPage === 1 || loading
                  ? (isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed')
                  : (isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100')
              }`}
              title="Previous page"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((page, index) => {
                if (page === 'ellipsis') {
                  return (
                    <span key={`ellipsis-${index}`} className={`px-2 py-1 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      page === currentPage
                        ? (isDarkMode ? 'bg-purple-900 text-purple-200 border border-purple-700' : 'bg-purple-100 text-purple-700 border border-purple-200')
                        : loading
                        ? (isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed')
                        : (isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100')
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className={`p-2 rounded-md transition-colors ${
                currentPage === totalPages || loading
                  ? (isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed')
                  : (isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100')
              }`}
              title="Next page"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || loading}
              className={`p-2 rounded-md transition-colors ${
                currentPage === totalPages || loading
                  ? (isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed')
                  : (isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100')
              }`}
              title="Last page"
            >
              <ChevronDoubleRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile-specific pagination info */}
      <div className="sm:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Page {currentPage} of {totalPages}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentPage === 1 || loading
                    ? (isDarkMode ? 'text-gray-600 bg-gray-700 cursor-not-allowed' : 'text-gray-400 bg-gray-100 cursor-not-allowed')
                    : (isDarkMode ? 'text-white bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200')
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentPage === totalPages || loading
                    ? (isDarkMode ? 'text-gray-600 bg-gray-700 cursor-not-allowed' : 'text-gray-400 bg-gray-100 cursor-not-allowed')
                    : (isDarkMode ? 'text-white bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-100 hover:bg-gray-200')
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
