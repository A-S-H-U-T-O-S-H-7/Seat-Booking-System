import { useTheme } from '@/context/ThemeContext';
import { 
  ExclamationTriangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

export default function Sidebar({ 
  isDarkMode, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  activeTab, 
  setActiveTab, 
  navigationItems, 
  hasPermission, 
  adminUser, 
  handleLogout 
}) {
  const { toggleTheme } = useTheme();

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col
      lg:translate-x-0
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className={`flex items-center justify-center h-20 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Panel</h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Havan Booking System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto admin-sidebar-nav">
        {(() => {
          const visibleItems = navigationItems.filter(item => 
            !item.permission || hasPermission(item.permission)
          );
          
          // If no visible items, show a message
          if (visibleItems.length === 0) {
            return (
              <div className={`text-center p-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No permissions assigned</p>
                <p className="text-xs mt-1">Contact your Super Admin</p>
              </div>
            );
          }
          
          return visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                ${activeTab === item.id
                  ? (isDarkMode 
                    ? 'bg-purple-900 text-purple-300 border-r-2 border-purple-400' 
                    : 'bg-purple-100 text-purple-700 border-r-2 border-purple-600')
                  : (isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          ));
        })()} 
      </nav>

      {/* Theme toggle */}
      <div className="px-4 py-2">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150
            ${isDarkMode 
              ? 'text-yellow-400 bg-gray-700 hover:bg-gray-600' 
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
        >
          {isDarkMode ? (
            <>
              <SunIcon className="w-4 h-4 mr-2" />
              Light Mode
            </>
          ) : (
            <>
              <MoonIcon className="w-4 h-4 mr-2" />
              Dark Mode
            </>
          )}
        </button>
      </div>

      {/* User info and logout */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {adminUser.name?.charAt(0) || adminUser.email.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {adminUser.name || 'Admin'}
            </p>
            <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{adminUser.email}</p>
            <p className="text-xs text-purple-400 capitalize">{adminUser.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-150"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}