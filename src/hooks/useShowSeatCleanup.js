"use client";
import { useEffect } from 'react';
import { cleanupExpiredShowSeats } from '@/services/showSeatCleanupService';

/**
 * Hook to automatically clean up expired blocked show seats
 */
export function useShowSeatCleanup() {
  useEffect(() => {
    let cleanupInterval;
    
    // Start cleanup with enhanced safety protections
    const startCleanup = async () => {
      try {
        // Clean up immediately
        await cleanupExpiredShowSeats();
        
        // Set up interval for automatic cleanup every 2 minutes
        cleanupInterval = setInterval(async () => {
          try {
            await cleanupExpiredShowSeats();
          } catch (error) {
            console.error('❌ Automatic show seat cleanup failed:', error);
          }
        }, 2 * 60 * 1000); // 2 minutes
        
      } catch (error) {
        console.error('❌ Failed to start show seat cleanup service:', error);
      }
    };
    
    startCleanup();
    
    // Cleanup interval on component unmount
    return () => {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
        console.log('🛑 Show seat cleanup service stopped');
      }
    };
  }, []);
  
  // Manual cleanup function that components can call
  const manualCleanup = async () => {
    try {
      console.log('🧹 Manual show seat cleanup triggered...');
      const result = await cleanupExpiredShowSeats();
      return result;
    } catch (error) {
      console.error('❌ Manual show seat cleanup failed:', error);
      return { success: false, error: error.message };
    }
  };
  
  return { manualCleanup };
}
