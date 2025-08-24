"use client";
import { useEffect } from 'react';
import { cleanupExpiredSeats } from '@/services/seatCleanupService';

/**
 * Hook to automatically clean up expired blocked seats
 */
export function useSeatCleanup() {
  useEffect(() => {
    let cleanupInterval;
    
    // TEMPORARILY DISABLED automatic cleanup to prevent damaging paid seats
    // Only manual cleanup is allowed for now
    console.log('⚠️ Automatic seat cleanup is DISABLED for safety');
    console.log('🔧 Only manual cleanup via button is available');
    
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
