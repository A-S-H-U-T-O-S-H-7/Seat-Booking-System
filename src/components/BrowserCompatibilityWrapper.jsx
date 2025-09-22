"use client";
import { useEffect, useState } from 'react';

// Browser Compatibility Wrapper Component
// This component loads polyfills and applies compatibility fixes for older browsers

const BrowserCompatibilityWrapper = ({ children }) => {
  const [isCompatibilityLoaded, setIsCompatibilityLoaded] = useState(false);

  useEffect(() => {
    // Load browser detection and polyfills
    const initCompatibility = async () => {
      try {
        // Import browser detection utility
        const browserUtils = await import('@/utils/browserDetection');
        
        // Initialize browser compatibility features
        browserUtils.initBrowserCompatibility();
        
        // Load polyfills if needed
        browserUtils.loadPolyfills();
        
        // Import and load the polyfills directly
        await import('@/polyfills/browser-compatibility');
        
        setIsCompatibilityLoaded(true);
      } catch (error) {
        console.warn('Failed to load browser compatibility features:', error);
        // Still render children even if compatibility loading fails
        setIsCompatibilityLoaded(true);
      }
    };

    initCompatibility();
  }, []);

  // For older browsers, show a loading state briefly while polyfills load
  if (!isCompatibilityLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #f97316',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <p style={{ color: '#666666', margin: 0 }}>Loading compatibility features...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
};

export default BrowserCompatibilityWrapper;