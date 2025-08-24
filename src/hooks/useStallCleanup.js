"use client";
import { useEffect } from 'react';
import { cleanupExpiredStalls } from '@/services/stallCleanupService';

/**
 * Hook to automatically clean up expired blocked stalls
 */
export function useStallCleanup() {
  useEffect(() => {
    let cleanupInterval;
    
    // Start cleanup with enhanced safety protections
    const startCleanup = async () => {
      try {
        // Clean up immediately
        await cleanupExpiredStalls();
        
        // Set up interval for automatic cleanup every 2 minutes
        cleanupInterval = setInterval(async () => {
          try {
            await cleanupExpiredStalls();
          } catch (error) {
            console.error('❌ Automatic stall cleanup failed:', error);
          }
        }, 2 * 60 * 1000); // 2 minutes
        
      } catch (error) {
        console.error('❌ Failed to start stall cleanup service:', error);
      }
    };
    
    startCleanup();
    
    // Cleanup interval on component unmount
    return () => {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
        console.log('🛑 Stall cleanup service stopped');
      }
    };
  }, []);
  
  // Manual cleanup function that components can call
  const manualCleanup = async () => {
    try {
      console.log('🧹 Manual stall cleanup triggered...');
      const result = await cleanupExpiredStalls();
      return result;
    } catch (error) {
      console.error('❌ Manual stall cleanup failed:', error);
      return { success: false, error: error.message };
    }
  };
  
  return { manualCleanup };
}
