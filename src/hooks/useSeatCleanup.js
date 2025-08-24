"use client";
import { useEffect } from 'react';
import { cleanupExpiredSeats } from '@/services/seatCleanupService';

/**
 * Hook to automatically clean up expired blocked seats
 */
export function useSeatCleanup() {
  useEffect(() => {
    let cleanupInterval;
    
    // Start cleanup with enhanced safety protections
    const startCleanup = async () => {
      try {
        console.log('🧹 Initializing SAFE seat cleanup service...');
        console.log('🚫 Admin-blocked seats are PROTECTED from cleanup');
        console.log('🔒 Only expired payment-blocked seats will be cleaned');
        
        // Clean up immediately
        await cleanupExpiredSeats();
        
        // Set up interval for automatic cleanup every 2 minutes
        cleanupInterval = setInterval(async () => {
          try {
            await cleanupExpiredSeats();
          } catch (error) {
            console.error('❌ Automatic seat cleanup failed:', error);
          }
        }, 2 * 60 * 1000); // 2 minutes
        
        console.log('✅ SAFE seat cleanup service started');
        
      } catch (error) {
        console.error('❌ Failed to start seat cleanup service:', error);
      }
    };
    
    startCleanup();
    
    // Cleanup interval on component unmount
    return () => {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
        console.log('🛑 Seat cleanup service stopped');
      }
    };
  }, []);
  
  // Manual cleanup function that components can call
  const manualCleanup = async () => {
    try {
      console.log('🧹 Manual seat cleanup triggered...');
      const result = await cleanupExpiredSeats();
      return result;
    } catch (error) {
      console.error('❌ Manual seat cleanup failed:', error);
      return { success: false, error: error.message };
    }
  };
  
  return { manualCleanup };
}
