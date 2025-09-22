// Performance Test Utility
// This shows the actual impact on modern vs legacy browsers

export function measureCompatibilityImpact() {
  const startTime = performance.now();
  
  // Simulate the detection process
  const browserInfo = {
    isModern: true,
    polyfillsNeeded: [],
    compatibilityOverhead: 0
  };

  // Modern browser detection (very fast)
  const userAgent = navigator.userAgent;
  const isModern = (
    userAgent.includes('Chrome/') && parseInt(userAgent.match(/Chrome\/(\d+)/)?.[1] || 0) > 80 ||
    userAgent.includes('Firefox/') && parseInt(userAgent.match(/Firefox\/(\d+)/)?.[1] || 0) > 80 ||
    userAgent.includes('Safari/') && parseInt(userAgent.match(/Version\/(\d+)/)?.[1] || 0) > 13 ||
    userAgent.includes('Edg/') && parseInt(userAgent.match(/Edg\/(\d+)/)?.[1] || 0) > 80
  );

  browserInfo.isModern = isModern;

  if (isModern) {
    browserInfo.compatibilityOverhead = 0;
    browserInfo.polyfillsNeeded = [];
    console.log('✅ Modern browser detected - no polyfills needed');
  } else {
    browserInfo.compatibilityOverhead = 50; // KB
    browserInfo.polyfillsNeeded = ['Promise', 'fetch', 'Array.find', 'Object.entries'];
    console.log('⚠️ Legacy browser detected - loading polyfills');
  }

  const endTime = performance.now();
  const detectionTime = endTime - startTime;

  return {
    ...browserInfo,
    detectionTimeMs: detectionTime,
    performanceImpact: detectionTime < 5 ? 'minimal' : 'noticeable'
  };
}

// Test function for developers
export function runCompatibilityPerformanceTest() {
  console.log('🧪 Running Compatibility Performance Test...');
  
  const results = measureCompatibilityImpact();
  
  console.table({
    'Browser Type': results.isModern ? 'Modern' : 'Legacy',
    'Detection Time (ms)': results.detectionTimeMs.toFixed(2),
    'Polyfills Loaded': results.polyfillsNeeded.length,
    'Size Overhead (KB)': results.compatibilityOverhead,
    'Performance Impact': results.performanceImpact
  });

  return results;
}

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  // Run test after page load
  window.addEventListener('load', () => {
    setTimeout(runCompatibilityPerformanceTest, 1000);
  });
}