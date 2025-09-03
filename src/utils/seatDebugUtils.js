/**
 * Debug utility functions for seat management issues
 * Use these functions in browser console to diagnose seat visibility problems
 */

/**
 * Test seat ID compatibility between old and new formats
 * @param {Object} seatAvailability - The seat availability object from Firestore
 * @param {string[]} seatIds - Array of seat IDs to test
 */
export function testSeatIdCompatibility(seatAvailability, seatIds) {
  const results = [];
  
  seatIds.forEach(seatId => {
    const result = {
      seatId,
      exactMatch: !!seatAvailability[seatId],
      oldFormatMatch: false,
      newFormatMatch: false,
      foundData: null
    };
    
    let availability = seatAvailability[seatId];
    
    if (!availability) {
      // Test old format conversion
      const oldFormatId = seatId.replace(/^([A-Z])(\d+)-/, '$1-$2-');
      availability = seatAvailability[oldFormatId];
      if (availability) {
        result.oldFormatMatch = true;
        result.foundData = availability;
        result.oldFormatId = oldFormatId;
      }
    }
    
    if (!availability) {
      // Test new format conversion
      const newFormatId = seatId.replace(/^([A-Z])-(\d+)-/, '$1$2-');
      availability = seatAvailability[newFormatId];
      if (availability) {
        result.newFormatMatch = true;
        result.foundData = availability;
        result.newFormatId = newFormatId;
      }
    }
    
    if (availability) {
      result.foundData = availability;
    }
    
    results.push(result);
  });
  
  return results;
}

/**
 * Analyze seat availability data structure
 * @param {Object} seatAvailability - The seat availability object from Firestore
 */
export function analyzeSeatAvailabilityData(seatAvailability) {
  const analysis = {
    totalSeats: Object.keys(seatAvailability).length,
    seatFormats: {
      newFormat: [], // A1-K1-S1
      oldFormat: [], // A-1-K1-S1
      unknown: []
    },
    statuses: {
      available: 0,
      booked: 0,
      blocked: 0,
      adminBlocked: 0,
      paymentBlocked: 0
    },
    bookingInfo: []
  };
  
  Object.entries(seatAvailability).forEach(([seatId, data]) => {
    // Analyze seat ID format
    if (/^[A-Z]\d+-K\d+-S\d+$/.test(seatId)) {
      analysis.seatFormats.newFormat.push(seatId);
    } else if (/^[A-Z]-\d+-K\d+-S\d+$/.test(seatId)) {
      analysis.seatFormats.oldFormat.push(seatId);
    } else {
      analysis.seatFormats.unknown.push(seatId);
    }
    
    // Analyze seat status
    if (data.booked) {
      analysis.statuses.booked++;
      analysis.bookingInfo.push({
        seatId,
        customerName: data.customerName,
        bookingId: data.bookingId,
        bookedAt: data.bookedAt
      });
    } else if (data.blocked) {
      analysis.statuses.blocked++;
      if (data.blockedReason === 'Blocked by admin') {
        analysis.statuses.adminBlocked++;
      } else {
        analysis.statuses.paymentBlocked++;
      }
    } else {
      analysis.statuses.available++;
    }
  });
  
  return analysis;
}

/**
 * Get seat status using the same logic as components
 * @param {string} seatId - The seat ID to check
 * @param {Object} seatAvailability - The seat availability object
 */
export function getSeatStatusDebug(seatId, seatAvailability) {
  // First try the exact seat ID
  let availability = seatAvailability[seatId];
  const debug = { seatId, steps: [] };
  
  debug.steps.push({ step: 'exact_match', tried: seatId, found: !!availability });
  
  // If not found, try the old format (backward compatibility)
  if (!availability) {
    const oldFormatId = seatId.replace(/^([A-Z])(\d+)-/, '$1-$2-');
    availability = seatAvailability[oldFormatId];
    debug.steps.push({ step: 'old_format', tried: oldFormatId, found: !!availability });
  }
  
  // If still not found, try the new format
  if (!availability) {
    const newFormatId = seatId.replace(/^([A-Z])-(\d+)-/, '$1$2-');
    availability = seatAvailability[newFormatId];
    debug.steps.push({ step: 'new_format', tried: newFormatId, found: !!availability });
  }
  
  debug.availability = availability;
  
  if (!availability) {
    debug.status = 'available';
  } else if (availability.blocked) {
    debug.status = 'blocked';
    debug.blockedReason = availability.blockedReason;
  } else if (availability.booked) {
    debug.status = 'booked';
    debug.customerName = availability.customerName;
    debug.bookingId = availability.bookingId;
  } else {
    debug.status = 'available';
  }
  
  return debug;
}

/**
 * Test admin vs user seat visibility
 * @param {Object} seatAvailability - The seat availability object
 * @param {string[]} testSeatIds - Array of seat IDs to test
 */
export function testSeatVisibility(seatAvailability, testSeatIds) {
  const results = testSeatIds.map(seatId => {
    const adminDebug = getSeatStatusDebug(seatId, seatAvailability);
    
    // Simulate the old buggy getSeatInfo (admin side before fix)
    const buggyAdminInfo = seatAvailability[seatId] || null;
    
    return {
      seatId,
      adminStatus: adminDebug.status,
      adminInfo: adminDebug.availability,
      adminDebug,
      buggyAdminInfo, // This would be null for incompatible formats
      hasBug: adminDebug.availability !== null && buggyAdminInfo === null
    };
  });
  
  const bugged = results.filter(r => r.hasBug);
  
  return {
    results,
    summary: {
      total: results.length,
      buggedSeats: bugged.length,
      buggedSeatIds: bugged.map(r => r.seatId)
    }
  };
}

// Console helper functions - can be used in browser dev tools
if (typeof window !== 'undefined') {
  window.seatDebugUtils = {
    testSeatIdCompatibility,
    analyzeSeatAvailabilityData,
    getSeatStatusDebug,
    testSeatVisibility,
    
    // Quick test function for browser console
    quickTest: (seatAvailability) => {
      console.log('🔍 Seat Availability Analysis:');
      console.log(analyzeSeatAvailabilityData(seatAvailability));
      
      // Test some common seat IDs
      const testIds = ['A1-K1-S1', 'A-1-K1-S1', 'B2-K3-S2', 'B-2-K3-S2'];
      console.log('🧪 Compatibility Test:');
      console.log(testSeatIdCompatibility(seatAvailability, testIds));
      
      console.log('👁️ Visibility Test:');
      console.log(testSeatVisibility(seatAvailability, testIds));
    }
  };
}
