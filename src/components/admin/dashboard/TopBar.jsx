import Link from 'next/link';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function TopBar({ isDarkMode, setIsSidebarOpen, activeTab, navigationItems }) {
  return (
    <div className={`shadow-sm border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-colors duration-150
                ${isDarkMode 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className={`ml-4 lg:ml-0 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {navigationItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <ClockIcon className="w-4 h-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <Link
              href="/"
              className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium transition-colors duration-150
                ${isDarkMode
                  ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}