// Global error handler for chunk loading errors and other runtime issues

/**
 * Initialize global error handling for chunk loading errors
 * Call this in your main app component or _app.js
 */
export const initializeErrorHandling = () => {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections (including chunk loading errors)
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    if (error && (error.name === 'ChunkLoadError' || 
                  error.message?.includes('Loading chunk') ||
                  error.message?.includes('Loading CSS chunk'))) {
      
      console.error('🔄 ChunkLoadError detected in unhandledrejection:', error);
      
      // Prevent the error from being logged to console
      event.preventDefault();
      
      // Show user-friendly message
      handleChunkLoadError(error);
      
      return;
    }
    
    // Log other unhandled rejections
    console.error('Unhandled promise rejection:', error);
  });

  // Handle regular JavaScript errors
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    if (error && (error.name === 'ChunkLoadError' || 
                  error.message?.includes('Loading chunk'))) {
      
      console.error('🔄 ChunkLoadError detected in error event:', error);
      
      // Prevent the error from being logged to console
      event.preventDefault();
      
      // Show user-friendly message
      handleChunkLoadError(error);
      
      return;
    }
  });

  console.log('✅ Global error handling initialized');
};

/**
 * Handle chunk loading errors specifically
 * @param {Error} error - The chunk loading error
 */
const handleChunkLoadError = (error) => {
  console.log('🔄 Handling chunk load error...');
  
  // Try to reload chunks by clearing cache and refreshing
  clearAppCache().then(() => {
    // Show loading message
    showChunkLoadingMessage();
    
    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }).catch((clearError) => {
    console.warn('Could not clear cache:', clearError);
    
    // Fallback: just reload immediately
    showChunkLoadingMessage();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });
};

/**
 * Clear application cache to resolve chunk issues
 */
const clearAppCache = async () => {
  const promises = [];
  
  // Clear service worker registrations
  if ('serviceWorker' in navigator) {
    promises.push(
      navigator.serviceWorker.getRegistrations().then(registrations => {
        return Promise.all(
          registrations.map(registration => registration.unregister())
        );
      })
    );
  }
  
  // Clear caches API
  if ('caches' in window) {
    promises.push(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
  
  // Clear storage
  try {
    localStorage.removeItem('__next_preloadedDataCache__');
    sessionStorage.clear();
    
    // Clear any Next.js specific cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('__next') || key.startsWith('next-')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('Could not clear storage:', e);
  }
  
  return Promise.all(promises);
};

/**
 * Show a user-friendly message during chunk loading recovery
 */
const showChunkLoadingMessage = () => {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'chunk-error-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  // Create message box
  const messageBox = document.createElement('div');
  messageBox.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  `;
  
  // Create spinner
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 48px;
    height: 48px;
    margin: 0 auto 1rem;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  messageBox.innerHTML = `
    <div style="width: 48px; height: 48px; margin: 0 auto 1rem; border: 4px solid #e2e8f0; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    <h2 style="margin: 0 0 1rem; color: #1f2937; font-size: 1.25rem; font-weight: 600;">
      Updating Application...
    </h2>
    <p style="margin: 0 0 1rem; color: #6b7280; font-size: 0.875rem;">
      We're loading the latest version for you. This will only take a moment.
    </p>
    <div style="background: #dbeafe; border-radius: 6px; padding: 0.75rem;">
      <p style="margin: 0; color: #1d4ed8; font-size: 0.75rem;">
        The page will automatically refresh when ready.
      </p>
    </div>
  `;
  
  overlay.appendChild(messageBox);
  document.body.appendChild(overlay);
  
  // Remove any existing overlays first
  const existing = document.getElementById('chunk-error-overlay');
  if (existing && existing !== overlay) {
    existing.remove();
  }
};

/**
 * Handle chunk loading errors in React components
 * Use this in your error boundaries or try-catch blocks
 * @param {Error} error - The error to check and handle
 * @returns {boolean} - True if it was a chunk error and was handled
 */
export const handleReactChunkError = (error) => {
  if (error && (error.name === 'ChunkLoadError' || 
                error.message?.includes('Loading chunk'))) {
    
    console.error('🔄 React ChunkLoadError detected:', error);
    handleChunkLoadError(error);
    return true;
  }
  
  return false;
};

/**
 * Retry function wrapper for handling chunk errors
 * Use this to wrap dynamic imports or other chunk-loading operations
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 */
export const retryChunkLoading = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.name === 'ChunkLoadError' || error.message?.includes('Loading chunk')) {
        console.warn(`Chunk loading failed, retry ${i + 1}/${maxRetries}:`, error.message);
        
        if (i === maxRetries - 1) {
          // Last retry failed, handle the error
          handleChunkLoadError(error);
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Non-chunk error, throw immediately
      throw error;
    }
  }
};

export default {
  initializeErrorHandling,
  handleReactChunkError,
  retryChunkLoading
};