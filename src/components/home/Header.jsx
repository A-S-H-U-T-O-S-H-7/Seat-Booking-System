"use client";
import Link from 'next/link';
import { useState } from 'react';
import { 
  ChevronDown, 
  User, 
  ChevronRight, 
  Layout, 
  Settings, 
  LogOut 
} from 'lucide-react';

function Header({ user, handleLogout, onShowEventLayout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-orange-100">
      <div className="px-2 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center pr-2">
              <a href="https://svsamiti.com" target="_blank" rel="noopener noreferrer">

            <img 
              src="/header-logo.png" 
              alt="Havan Logo" 
              
            />
             </a>
            
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <div className="relative">
                {/* User Dropdown */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-150 hover:to-amber-150 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-xs sm:text-sm text-white font-bold">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 text-left">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Welcome</span>
                    <span className="text-xs sm:text-sm font-semibold text-orange-700 truncate max-w-20 sm:max-w-32 lg:max-w-none">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-orange-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-50 backdrop-blur-sm">
                    {/* User Info Header */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-sm text-white font-bold">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                          <p className="text-xs text-gray-500">Account Menu</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Profile Link */}
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors duration-200">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">My Profile</p>
                          <p className="text-xs text-gray-500">View Profile</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                      </Link>

                      {/* Event Layout Button */}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onShowEventLayout && onShowEventLayout();
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-700 transition-all duration-200 group w-full text-left"
                      >
                        <div className="w-8 h-8 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors duration-200">
                          <Layout className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Event Layout</p>
                        </div>
                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors duration-200" />
                      </button>

                      <div className="border-t border-gray-100 my-2"></div>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:text-red-700 transition-all duration-200 group w-full text-left"
                      >
                        <div className="w-8 h-8 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200">
                          <LogOut className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Sign Out</p>
                          <p className="text-xs text-gray-500">Logout from account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-3 py-2 sm:px-4 text-xs sm:text-sm rounded-lg transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-3 py-2 sm:px-4 text-xs sm:text-sm rounded-lg transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;