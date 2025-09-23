"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, limit, startAfter, where, Timestamp } from 'firebase/firestore';
import { format, isToday, isYesterday, subDays, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAdmin } from '@/context/AdminContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function ActivityLogs() {
  const { adminUser, hasPermission } = useAdmin();
  const { isDarkMode } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, today, yesterday, week, month
  const [actionFilter, setActionFilter] = useState('all'); // all, create, read, update, delete
  const [adminFilter, setAdminFilter] = useState('all'); // all, specific admin
  const [currentPage, setCurrentPage] = useState(1);
  const [admins, setAdmins] = useState([]);
  const [cursors, setCursors] = useState([]); // Stack of document cursors for each page
  const [hasNextPage, setHasNextPage] = useState(false);
  const logsPerPage = 50;

  useEffect(() => {
    if (hasPermission('view_logs') || adminUser?.role === 'super_admin') {
      fetchAdmins();
      fetchLogs();
    } else {
      setError('You do not have permission to view activity logs');
      setLoading(false);
    }
  }, [currentPage, filterBy, actionFilter, adminFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setCursors([]);
    setHasNextPage(false);
  }, [filterBy, actionFilter, adminFilter]);

  const fetchAdmins = async () => {
    try {
      const adminsRef = collection(db, 'admins');
      const snapshot = await getDocs(adminsRef);
      const adminsData = [];
      
      snapshot.forEach(doc => {
        adminsData.push({ id: doc.id, ...doc.data() });
      });
      
      setAdmins(adminsData);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let logsQuery = collection(db, 'adminLogs');
      const queryConstraints = [];

      // Apply date filter
      if (filterBy !== 'all') {
        const now = new Date();
        let startDate, endDate;

        switch (filterBy) {
          case 'today':
            startDate = startOfDay(now);
            endDate = endOfDay(now);
            break;
          case 'yesterday':
            const yesterday = subDays(now, 1);
            startDate = startOfDay(yesterday);
            endDate = endOfDay(yesterday);
            break;
          case 'week':
            startDate = subDays(now, 7);
            endDate = now;
            break;
          case 'month':
            startDate = subDays(now, 30);
            endDate = now;
            break;
        }

        if (startDate && endDate) {
          queryConstraints.push(where('timestamp', '>=', Timestamp.fromDate(startDate)));
          queryConstraints.push(where('timestamp', '<=', Timestamp.fromDate(endDate)));
        }
      }

      // Apply action filter
      if (actionFilter !== 'all') {
        queryConstraints.push(where('action', '==', actionFilter));
      }

      // Apply admin filter
      if (adminFilter !== 'all') {
        queryConstraints.push(where('adminId', '==', adminFilter));
      }

      // Add ordering
      queryConstraints.push(orderBy('timestamp', 'desc'));
      
      // Apply pagination using cursor stack
      if (currentPage > 1) {
        const cursorIndex = currentPage - 2; // Index for the cursor we need
        if (cursors[cursorIndex]) {
          queryConstraints.push(startAfter(cursors[cursorIndex]));
        }
      }
      
      // Fetch one extra to detect if there are more pages
      queryConstraints.push(limit(logsPerPage + 1));

      logsQuery = query(logsQuery, ...queryConstraints);
      const snapshot = await getDocs(logsQuery);
      
      const logsData = [];
      const docs = snapshot.docs;
      
      // Check if we have more data than the page size
      const hasMore = docs.length > logsPerPage;
      const docsToDisplay = hasMore ? docs.slice(0, logsPerPage) : docs;
      
      docsToDisplay.forEach(doc => {
        logsData.push({ id: doc.id, ...doc.data() });
      });

      // Update cursor stack for forward navigation
      if (docsToDisplay.length > 0) {
        const lastDoc = docsToDisplay[docsToDisplay.length - 1];
        
        // Update cursors array - store the last document of current page for next page
        const newCursors = [...cursors];
        if (currentPage === 1 && hasMore) {
          // Starting from page 1, add cursor for page 2
          newCursors[0] = lastDoc;
        } else if (currentPage > 1 && hasMore) {
          // Add cursor for next page
          newCursors[currentPage - 1] = lastDoc;
        }
        setCursors(newCursors);
      }
      
      setHasNextPage(hasMore);
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(`Failed to load activity logs: ${error.message}`);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action.toLowerCase()) {
      case 'create':
        return PlusIcon;
      case 'read':
      case 'view':
        return EyeIcon;
      case 'update':
      case 'edit':
        return PencilIcon;
      case 'delete':
        return TrashIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getActionColor = (action) => {
    switch (action.toLowerCase()) {
      case 'create':
        return isDarkMode ? 'text-green-400 bg-green-900/50' : 'text-green-600 bg-green-100';
      case 'read':
      case 'view':
        return isDarkMode ? 'text-blue-400 bg-blue-900/50' : 'text-blue-600 bg-blue-100';
      case 'update':
      case 'edit':
        return isDarkMode ? 'text-yellow-400 bg-yellow-900/50' : 'text-yellow-600 bg-yellow-100';
      case 'delete':
        return isDarkMode ? 'text-red-400 bg-red-900/50' : 'text-red-600 bg-red-100';
      default:
        return isDarkMode ? 'text-gray-400 bg-gray-900/50' : 'text-gray-600 bg-gray-100';
    }
  };

  const getTimeDisplay = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM dd, yyyy h:mm a');
    }
  };

  const getAdminName = (adminId) => {
    const admin = admins.find(a => a.id === adminId);
    return admin ? admin.name : 'Unknown Admin';
  };

  const getAdminRole = (adminId) => {
    const admin = admins.find(a => a.id === adminId);
    return admin ? admin.role : 'unknown';
  };

  const formatDescription = (log) => {
    const { action, entityType, entityId, details } = log;
    
    let description = `${action.charAt(0).toUpperCase() + action.slice(1)}d `;
    
    if (entityType) {
      description += `${entityType.toLowerCase().replace('_', ' ')} `;
    }
    
    if (entityId) {
      description += `(ID: ${entityId.substring(0, 8)}...)`;
    }
    
    if (details) {
      if (typeof details === 'string') {
        description += ` - ${details}`;
      } else if (typeof details === 'object') {
        const detailsStr = Object.entries(details)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        if (detailsStr) {
          description += ` - ${detailsStr}`;
        }
      }
    }
    
    return description;
  };

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Timestamp,Admin,Role,Action,Entity Type,Entity ID,Description,IP Address\n" +
      logs.map(log => [
        getTimeDisplay(log.timestamp),
        getAdminName(log.adminId),
        getAdminRole(log.adminId),
        log.action,
        log.entityType || '',
        log.entityId || '',
        `"${formatDescription(log)}"`,
        log.ipAddress || ''
      ].join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_activity_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Logs exported successfully');
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const adminName = getAdminName(log.adminId).toLowerCase();
    const description = formatDescription(log).toLowerCase();
    const action = (log.action || '').toLowerCase();
    const entityType = (log.entityType || '').toLowerCase();
    
    return adminName.includes(searchLower) || 
           description.includes(searchLower) || 
           action.includes(searchLower) ||
           entityType.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-8 text-center`}>
        <ExclamationTriangleIcon className={`w-12 h-12 ${isDarkMode ? 'text-red-400' : 'text-red-500'} mx-auto mb-4`} />
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Access Error</h3>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Activity Logs</h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Track all admin activities and system changes ({logs.length} entries)
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
        >
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Search and Filters */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 rounded-md border shadow-sm transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                }`}
              />
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={filterBy}
              onChange={(e) => {
                setFilterBy(e.target.value);
                setCurrentPage(1);
              }}
              className={`block w-full px-3 py-2 rounded-md border shadow-sm transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`block w-full px-3 py-2 rounded-md border shadow-sm transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
              }`}
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>
          </div>

          {/* Admin Filter */}
          <div>
            <select
              value={adminFilter}
              onChange={(e) => {
                setAdminFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`block w-full px-3 py-2 rounded-md border shadow-sm transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
              }`}
            >
              <option value="all">All Admins</option>
              {admins.map(admin => (
                <option key={admin.id} value={admin.id}>{admin.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.map((log, index) => {
              const ActionIcon = getActionIcon(log.action);
              const actionColor = getActionColor(log.action);
              const adminRole = getAdminRole(log.adminId);
              
              return (
                <div key={log.id} className={`p-6 ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors duration-150`}>
                  <div className="flex items-start space-x-4">
                    {/* Action Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-lg ${actionColor}`}>
                      <ActionIcon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {/* Admin Info */}
                          <div className={`w-8 h-8 ${isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'} rounded-full flex items-center justify-center font-bold text-xs`}>
                            {getAdminName(log.adminId).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {getAdminName(log.adminId)}
                            </span>
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              adminRole === 'super_admin' 
                                ? (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                                : (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')
                            }`}>
                              {adminRole === 'super_admin' ? 'Super Admin' : 'Admin'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Timestamp */}
                        <div className={`flex items-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {getTimeDisplay(log.timestamp)}
                        </div>
                      </div>

                      {/* Description */}
                      <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatDescription(log)}
                      </div>

                      {/* Additional Details */}
                      {(log.ipAddress || log.userAgent) && (
                        <div className={`mt-2 flex items-center space-x-4 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {log.ipAddress && (
                            <span>IP: {log.ipAddress}</span>
                          )}
                          {log.userAgent && (
                            <span>Browser: {log.userAgent.substring(0, 50)}...</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              No activity logs found
            </p>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm ? 'Try adjusting your search or filters' : 'Activity logs will appear here as admins perform actions'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {(hasNextPage || currentPage > 1) && (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-4`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              Page {currentPage}{hasNextPage ? ` (more available)` : ''}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!hasNextPage}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Next
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
