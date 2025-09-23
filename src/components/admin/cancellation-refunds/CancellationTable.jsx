import { useTheme } from '@/context/ThemeContext';
import { 
  EyeIcon, 
  CurrencyRupeeIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

export default function CancellationTable({ 
  cancellations, 
  loading, 
  onRefund, 
  onViewDetails,
  currentSort,
  onSort 
}) {
  const { isDarkMode } = useTheme();

  const getBookingTypeColor = (type) => {
    const colors = {
      havan: isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800',
      stall: isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800',
      show: isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
    };
    return colors[type] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700');
  };

  const getRefundStatusColor = (status) => {
    const colors = {
      pending: isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
      processed: isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800',
      rejected: isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
    };
    return colors[status] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700');
  };

  const getRefundStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const SortableHeader = ({ field, children, className = "" }) => (
    <th 
      className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-50 transition-colors ${
        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-50'
      } ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <ArrowUpIcon className={`w-3 h-3 ${
            currentSort.field === field && currentSort.order === 'asc' 
              ? (isDarkMode ? 'text-purple-400' : 'text-purple-600') 
              : (isDarkMode ? 'text-gray-600' : 'text-gray-400')
          }`} />
          <ArrowDownIcon className={`w-3 h-3 -mt-1 ${
            currentSort.field === field && currentSort.order === 'desc' 
              ? (isDarkMode ? 'text-purple-400' : 'text-purple-600') 
              : (isDarkMode ? 'text-gray-600' : 'text-gray-400')
          }`} />
        </div>
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border`}>
        <div className="animate-pulse">
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} h-16 rounded-t-xl`}></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} h-4 rounded flex-1`}></div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} h-4 rounded w-20`}></div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} h-4 rounded w-24`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cancellations?.length) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-12`}>
        <div className="text-center">
          <BanknotesIcon className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No cancellations found
          </h3>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No cancellations match your current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <SortableHeader field="customerName">Customer</SortableHeader>
              <SortableHeader field="bookingType">Type</SortableHeader>
              <SortableHeader field="originalAmount">Amount</SortableHeader>
              <SortableHeader field="cancellationDate">Cancelled On</SortableHeader>
              <SortableHeader field="refundStatus">Status</SortableHeader>
              <th className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200 dark:divide-gray-700`}>
            {cancellations.map((cancellation) => {
              const cancellationDateTime = formatDate(cancellation.cancellationDate);
              return (
                <tr key={cancellation.id} className={`transition-colors ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {cancellation.customerName}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {cancellation.customerEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getBookingTypeColor(cancellation.bookingType)
                    }`}>
                      {cancellation.bookingType.charAt(0).toUpperCase() + cancellation.bookingType.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(cancellation.originalAmount)}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ID: {cancellation.bookingId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {cancellationDateTime.date}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {cancellationDateTime.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getRefundStatusColor(cancellation.refundStatus)
                    }`}>
                      {getRefundStatusIcon(cancellation.refundStatus)}
                      <span className="ml-1">
                        {cancellation.refundStatus.charAt(0).toUpperCase() + cancellation.refundStatus.slice(1)}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => onViewDetails(cancellation)}
                        className={`inline-flex items-center p-2 rounded-md transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {cancellation.refundStatus === 'pending' && (
                        <button
                          onClick={() => onRefund(cancellation)}
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                            isDarkMode 
                              ? 'bg-green-900 text-green-200 hover:bg-green-800' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          <CurrencyRupeeIcon className="w-3 h-3 mr-1" />
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {cancellations.map((cancellation) => {
          const cancellationDateTime = formatDate(cancellation.cancellationDate);
          return (
            <div key={cancellation.id} className={`border-b border-gray-200 dark:border-gray-700 p-6 ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            } transition-colors`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cancellation.customerName}
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    {cancellation.customerEmail}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getBookingTypeColor(cancellation.bookingType)
                  }`}>
                    {cancellation.bookingType.charAt(0).toUpperCase() + cancellation.bookingType.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                    Amount
                  </p>
                  <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(cancellation.originalAmount)}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                    Status
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    getRefundStatusColor(cancellation.refundStatus)
                  }`}>
                    {getRefundStatusIcon(cancellation.refundStatus)}
                    <span className="ml-1">
                      {cancellation.refundStatus.charAt(0).toUpperCase() + cancellation.refundStatus.slice(1)}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  <p>ID: {cancellation.bookingId}</p>
                  <p>{cancellationDateTime.date} at {cancellationDateTime.time}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewDetails(cancellation)}
                    className={`inline-flex items-center p-2 rounded-md transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-600' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    title="View Details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  {cancellation.refundStatus === 'pending' && (
                    <button
                      onClick={() => onRefund(cancellation)}
                      className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        isDarkMode 
                          ? 'bg-green-900 text-green-200 hover:bg-green-800' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      <CurrencyRupeeIcon className="w-3 h-3 mr-1" />
                      Refund
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
