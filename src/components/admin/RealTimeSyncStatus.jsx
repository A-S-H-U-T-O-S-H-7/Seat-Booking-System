"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';
import { 
  WifiIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

export default function RealTimeSyncStatus() {
  const { isDarkMode } = useTheme();
  const [syncStatus, setSyncStatus] = useState('connected');
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    const pricingRef = doc(db, 'settings', 'pricing');
    
    // Set up real-time listener to track sync status
    const unsubscribe = onSnapshot(pricingRef, 
      (doc) => {
        if (doc.exists()) {
          setSyncStatus('connected');
          setLastSync(new Date());
        }
      },
      (error) => {
        console.error('Sync status error:', error);
        setSyncStatus('error');
      }
    );

    return () => unsubscribe();
  }, []);

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'connected':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <WifiIcon className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <WifiIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'connected':
        return 'Real-time sync active';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Sync error';
      default:
        return 'Offline';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'connected':
        return isDarkMode ? 'text-green-400' : 'text-green-600';
      case 'connecting':
        return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'error':
        return isDarkMode ? 'text-red-400' : 'text-red-600';
      default:
        return isDarkMode ? 'text-gray-400' : 'text-gray-500';
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      {getStatusIcon()}
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {lastSync && syncStatus === 'connected' && (
          <span className={`text-xs ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Last sync: {lastSync.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
