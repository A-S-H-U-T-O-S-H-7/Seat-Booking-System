"use client";
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Handle ChunkLoadError specifically
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.error('🔄 ChunkLoadError detected, attempting page reload...');
      // Clear any cached resources and reload
      if (typeof window !== 'undefined') {
        // Clear service worker cache if it exists
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => registration.unregister());
          });
        }
        
        // Clear localStorage cache
        try {
          localStorage.removeItem('__next_preloadedDataCache__');
          sessionStorage.clear();
        } catch (e) {
          console.warn('Could not clear storage:', e);
        }
        
        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return;
      }
    }

    // Log other errors
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.name === 'ChunkLoadError' || 
                          this.state.error?.message?.includes('Loading chunk');
      
      if (isChunkError) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Updating Application...
              </h2>
              <p className="text-gray-600 mb-4">
                We're loading the latest version for you. This will only take a moment.
              </p>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  The page will automatically refresh when ready.
                </p>
              </div>
            </div>
          </div>
        );
      }

      // Fallback UI for other errors
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-sm">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  Technical Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded border text-xs font-mono overflow-auto">
                  <div className="text-red-600 mb-2">
                    {this.state.error && this.state.error.toString()}
                  </div>
                  <div className="text-gray-600">
                    {this.state.errorInfo.componentStack}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;