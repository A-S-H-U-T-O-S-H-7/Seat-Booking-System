"use client";
import { useEffect } from 'react';

// Simplified Browser Compatibility Wrapper
// Applies basic compatibility fixes without complex imports

const BrowserCompatibilityWrapper = ({ children }) => {
  useEffect(() => {
    // Simple browser detection and compatibility setup
    if (typeof window !== 'undefined') {
      // Add basic browser classes
      const userAgent = navigator.userAgent;
      const html = document.documentElement;
      
      // Detect major browsers
      if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
        html.className += ' ie legacy-browser';
      } else if (userAgent.includes('Edge/')) {
        html.className += ' edge';
      } else if (userAgent.includes('Chrome/')) {
        const version = userAgent.match(/Chrome\/(\d+)/);
        if (version && parseInt(version[1]) < 60) {
          html.className += ' legacy-browser old-chrome';
        }
      } else if (userAgent.includes('Firefox/')) {
        const version = userAgent.match(/Firefox\/(\d+)/);
        if (version && parseInt(version[1]) < 55) {
          html.className += ' legacy-browser old-firefox';
        }
      }
      
      // Add basic polyfills for essential features
      if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement) {
          return this.indexOf(searchElement) !== -1;
        };
      }
      
      if (!Object.entries) {
        Object.entries = function(obj) {
          var result = [];
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              result.push([key, obj[key]]);
            }
          }
          return result;
        };
      }
    }
  }, []);

  return <>{children}</>;
};

export default BrowserCompatibilityWrapper;
