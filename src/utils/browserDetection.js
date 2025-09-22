// Browser Detection Utility for Windows 7 Compatibility
// This utility helps identify older browsers and apply appropriate fixes

/**
 * Detects browser information and version
 * @returns {Object} Browser information
 */
export function getBrowserInfo() {
  if (typeof window === 'undefined') {
    return { name: 'unknown', version: '0', isOldBrowser: false };
  }

  const userAgent = navigator.userAgent;
  const browserInfo = {
    name: 'unknown',
    version: '0',
    isOldBrowser: false,
    isIE: false,
    isEdge: false,
    isChrome: false,
    isFirefox: false,
    isSafari: false,
    isOpera: false
  };

  // Internet Explorer detection
  if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident/') !== -1) {
    browserInfo.isIE = true;
    browserInfo.name = 'Internet Explorer';
    
    const version = userAgent.match(/(?:MSIE |rv:)(\d+(\.\d+)?)/);
    if (version) {
      browserInfo.version = version[1];
      // IE 11 and below are considered old browsers
      browserInfo.isOldBrowser = parseInt(version[1]) <= 11;
    } else {
      browserInfo.isOldBrowser = true;
    }
  }
  
  // Microsoft Edge (Legacy) detection
  else if (userAgent.indexOf('Edge/') !== -1) {
    browserInfo.isEdge = true;
    browserInfo.name = 'Microsoft Edge Legacy';
    
    const version = userAgent.match(/Edge\/(\d+(\.\d+)?)/);
    if (version) {
      browserInfo.version = version[1];
      // Legacy Edge versions are considered old
      browserInfo.isOldBrowser = parseInt(version[1]) < 79;
    }
  }
  
  // Chrome detection
  else if (userAgent.indexOf('Chrome/') !== -1 && userAgent.indexOf('Edg/') === -1) {
    browserInfo.isChrome = true;
    browserInfo.name = 'Chrome';
    
    const version = userAgent.match(/Chrome\/(\d+(\.\d+)?)/);
    if (version) {
      browserInfo.version = version[1];
      // Chrome versions below 60 are considered old for modern web features
      browserInfo.isOldBrowser = parseInt(version[1]) < 60;
    }
  }
  
  // Firefox detection
  else if (userAgent.indexOf('Firefox/') !== -1) {
    browserInfo.isFirefox = true;
    browserInfo.name = 'Firefox';
    
    const version = userAgent.match(/Firefox\/(\d+(\.\d+)?)/);
    if (version) {
      browserInfo.version = version[1];
      // Firefox versions below 55 are considered old
      browserInfo.isOldBrowser = parseInt(version[1]) < 55;
    }
  }
  
  // Safari detection
  else if (userAgent.indexOf('Safari/') !== -1 && userAgent.indexOf('Chrome/') === -1) {
    browserInfo.isSafari = true;
    browserInfo.name = 'Safari';
    
    const version = userAgent.match(/Version\/(\d+(\.\d+)?)/);
    if (version) {
      browserInfo.version = version[1];
      // Safari versions below 12 are considered old
      browserInfo.isOldBrowser = parseInt(version[1]) < 12;
    }
  }
  
  // Opera detection
  else if (userAgent.indexOf('Opera/') !== -1 || userAgent.indexOf('OPR/') !== -1) {
    browserInfo.isOpera = true;
    browserInfo.name = 'Opera';
    
    const version = userAgent.match(/(?:Opera\/|OPR\/)(\d+(\.\d+)?)/);
    if (version) {
      browserInfo.version = version[1];
      // Opera versions below 50 are considered old
      browserInfo.isOldBrowser = parseInt(version[1]) < 50;
    }
  }

  return browserInfo;
}

/**
 * Checks if the current browser is a legacy browser that needs polyfills
 * @returns {boolean} True if browser is legacy
 */
export function isLegacyBrowser() {
  const browserInfo = getBrowserInfo();
  return browserInfo.isOldBrowser;
}

/**
 * Checks if the browser supports modern JavaScript features
 * @returns {boolean} True if browser supports modern JS
 */
export function supportsModernJS() {
  try {
    // Check for arrow functions
    eval('() => {}');
    
    // Check for const/let
    eval('const x = 1;');
    
    // Check for template literals
    eval('`template`');
    
    // Check for destructuring
    eval('const {a} = {a: 1};');
    
    // Check for Promise
    return typeof Promise !== 'undefined';
  } catch (e) {
    return false;
  }
}

/**
 * Checks if the browser supports modern CSS features
 * @returns {Object} Object with supported CSS features
 */
export function supportedCSSFeatures() {
  if (typeof window === 'undefined' || !window.CSS) {
    return {
      customProperties: false,
      flexbox: false,
      grid: false,
      transforms: false,
      transitions: false,
      animations: false
    };
  }

  const features = {
    customProperties: CSS.supports && CSS.supports('color', 'var(--test)'),
    flexbox: CSS.supports && CSS.supports('display', 'flex'),
    grid: CSS.supports && CSS.supports('display', 'grid'),
    transforms: CSS.supports && CSS.supports('transform', 'translateX(1px)'),
    transitions: CSS.supports && CSS.supports('transition', 'opacity 1s'),
    animations: CSS.supports && CSS.supports('animation', 'none')
  };

  return features;
}

/**
 * Applies CSS classes based on browser capabilities
 */
export function applyBrowserClasses() {
  if (typeof document === 'undefined') return;

  const browserInfo = getBrowserInfo();
  const cssFeatures = supportedCSSFeatures();
  const documentElement = document.documentElement;

  // Add browser-specific classes
  documentElement.className += ` browser-${browserInfo.name.toLowerCase().replace(/\s+/g, '-')}`;
  documentElement.className += ` browser-version-${browserInfo.version.split('.')[0]}`;

  if (browserInfo.isOldBrowser) {
    documentElement.className += ' legacy-browser';
  }

  if (browserInfo.isIE) {
    documentElement.className += ' ie';
    if (parseInt(browserInfo.version) <= 8) {
      documentElement.className += ' ie8-and-below';
    }
    if (parseInt(browserInfo.version) <= 9) {
      documentElement.className += ' ie9-and-below';
    }
    if (parseInt(browserInfo.version) <= 11) {
      documentElement.className += ' ie11-and-below';
    }
  }

  // Add feature support classes
  Object.keys(cssFeatures).forEach(feature => {
    if (cssFeatures[feature]) {
      documentElement.className += ` supports-${feature}`;
    } else {
      documentElement.className += ` no-${feature}`;
    }
  });

  // Add JavaScript support class
  if (!supportsModernJS()) {
    documentElement.className += ' no-modern-js';
  }
}

/**
 * Shows a browser compatibility warning for very old browsers
 */
export function showBrowserWarning() {
  const browserInfo = getBrowserInfo();
  
  // Show warning for IE 10 and below, very old Chrome/Firefox versions
  const shouldShowWarning = 
    (browserInfo.isIE && parseInt(browserInfo.version) <= 10) ||
    (browserInfo.isChrome && parseInt(browserInfo.version) < 50) ||
    (browserInfo.isFirefox && parseInt(browserInfo.version) < 50) ||
    (browserInfo.name === 'unknown');

  if (shouldShowWarning && typeof document !== 'undefined') {
    const warningDiv = document.createElement('div');
    warningDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff6b35;
        color: white;
        text-align: center;
        padding: 10px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
      ">
        <strong>Browser Compatibility Notice:</strong> 
        You are using an older browser. Some features may not work properly. 
        For the best experience, please update to a modern browser.
        <button onclick="this.parentElement.parentElement.remove()" style="
          margin-left: 10px;
          background: rgba(255,255,255,0.3);
          border: 1px solid white;
          color: white;
          padding: 2px 8px;
          cursor: pointer;
          border-radius: 3px;
        ">×</button>
      </div>
    `;
    
    document.body.insertBefore(warningDiv, document.body.firstChild);
  }
}

/**
 * Initializes browser compatibility features
 */
export function initBrowserCompatibility() {
  // Apply browser classes for CSS targeting
  applyBrowserClasses();
  
  // Show warning for very old browsers
  showBrowserWarning();
  
  // Log browser info for debugging
  if (typeof console !== 'undefined' && console.log) {
    const browserInfo = getBrowserInfo();
    console.log('Browser Compatibility Info:', {
      ...browserInfo,
      modernJSSupport: supportsModernJS(),
      cssFeatures: supportedCSSFeatures()
    });
  }
}

/**
 * Loads polyfills dynamically based on browser needs
 */
export function loadPolyfills() {
  const browserInfo = getBrowserInfo();
  
  if (browserInfo.isOldBrowser) {
    console.log('Loading polyfills for older browser...');
    
    // Load the browser compatibility polyfills
    try {
      import('../polyfills/browser-compatibility.js');
    } catch (error) {
      console.warn('Could not load polyfills:', error);
    }
  }
}

// Auto-initialize when script loads
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBrowserCompatibility);
  } else {
    initBrowserCompatibility();
  }
}

export default {
  getBrowserInfo,
  isLegacyBrowser,
  supportsModernJS,
  supportedCSSFeatures,
  applyBrowserClasses,
  showBrowserWarning,
  initBrowserCompatibility,
  loadPolyfills
};