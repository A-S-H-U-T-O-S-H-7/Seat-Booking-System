// Browser Compatibility Polyfills for Windows 7 Support
// This file provides essential polyfills for older browsers

// Polyfill for CSS Custom Properties (CSS Variables)
if (typeof window !== 'undefined' && !window.CSS?.supports?.('color', 'var(--test)')) {
  console.log('Adding CSS Custom Properties polyfill for older browsers');
  
  // Simple CSS Custom Properties polyfill
  const cssVarsPolyfill = () => {
    const rootStyles = {
      '--background': '#ffffff',
      '--foreground': '#171717',
      '--color-background': '#ffffff',
      '--color-foreground': '#171717'
    };

    // Apply fallback values
    const root = document.documentElement;
    Object.entries(rootStyles).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Handle dark mode manually for older browsers
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.style.setProperty('--background', '#0a0a0a');
      root.style.setProperty('--foreground', '#ededed');
      root.style.setProperty('--color-background', '#0a0a0a');
      root.style.setProperty('--color-foreground', '#ededed');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cssVarsPolyfill);
  } else {
    cssVarsPolyfill();
  }
}

// Polyfill for Object.entries (IE11 doesn't support it)
if (!Object.entries) {
  Object.entries = function(obj) {
    var ownProps = Object.keys(obj),
        i = ownProps.length,
        resArray = new Array(i);
    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]];
    return resArray;
  };
}

// Polyfill for Array.from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    return function from(arrayLike/*, mapFn, thisArg */) {
      var C = this;
      var items = Object(arrayLike);
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }
      var len = toLength(items.length);
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);
      var k = 0;
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  }());
}

// Polyfill for Array.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
      if (this == null) {
        throw TypeError('"this" is null or not defined');
      }
      var o = Object(this);
      var len = parseInt(o.length) || 0;
      if (typeof predicate !== 'function') {
        throw TypeError('predicate must be a function');
      }
      var thisArg = arguments[1];
      var k = 0;
      while (k < len) {
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        k++;
      }
      return undefined;
    },
    configurable: true,
    writable: true
  });
}

// Polyfill for Array.includes
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    function sameValueZero(x, y) {
      return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
    }
    for (;k < len; k++) {
      if (sameValueZero(O[k], searchElement)) {
        return true;
      }
    }
    return false;
  };
}

// Polyfill for String.includes
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// Polyfill for Promise (for very old browsers)
if (typeof window !== 'undefined' && !window.Promise) {
  console.log('Adding Promise polyfill for older browsers');
  // Simple Promise polyfill - you might want to use a more complete one like es6-promise
  window.Promise = function(executor) {
    var self = this;
    self.state = 'pending';
    self.value = undefined;
    self.handlers = [];

    function resolve(result) {
      if (self.state === 'pending') {
        self.state = 'fulfilled';
        self.value = result;
        self.handlers.forEach(handle);
        self.handlers = null;
      }
    }

    function reject(error) {
      if (self.state === 'pending') {
        self.state = 'rejected';
        self.value = error;
        self.handlers.forEach(handle);
        self.handlers = null;
      }
    }

    function handle(handler) {
      if (self.state === 'pending') {
        self.handlers.push(handler);
      } else {
        if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
          handler.onFulfilled(self.value);
        }
        if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
          handler.onRejected(self.value);
        }
      }
    }

    this.then = function(onFulfilled, onRejected) {
      return new Promise(function(resolve, reject) {
        handle({
          onFulfilled: function(result) {
            if (typeof onFulfilled === 'function') {
              try {
                resolve(onFulfilled(result));
              } catch (ex) {
                reject(ex);
              }
            } else {
              resolve(result);
            }
          },
          onRejected: function(error) {
            if (typeof onRejected === 'function') {
              try {
                resolve(onRejected(error));
              } catch (ex) {
                reject(ex);
              }
            } else {
              reject(error);
            }
          }
        });
      });
    };

    this.catch = function(onRejected) {
      return this.then(null, onRejected);
    };

    executor(resolve, reject);
  };
}

// Polyfill for fetch API (for older browsers)
if (typeof window !== 'undefined' && !window.fetch) {
  console.log('Adding fetch polyfill for older browsers');
  // Simple fetch polyfill using XMLHttpRequest
  window.fetch = function(url, options) {
    return new Promise(function(resolve, reject) {
      var request = new XMLHttpRequest();
      var method = (options && options.method) || 'GET';
      var body = (options && options.body) || null;
      var headers = (options && options.headers) || {};

      request.open(method, url, true);

      // Set headers
      Object.keys(headers).forEach(function(key) {
        request.setRequestHeader(key, headers[key]);
      });

      request.onload = function() {
        if (request.status >= 200 && request.status < 300) {
          resolve({
            ok: true,
            status: request.status,
            statusText: request.statusText,
            json: function() {
              return Promise.resolve(JSON.parse(request.responseText));
            },
            text: function() {
              return Promise.resolve(request.responseText);
            }
          });
        } else {
          reject({
            ok: false,
            status: request.status,
            statusText: request.statusText
          });
        }
      };

      request.onerror = function() {
        reject(new Error('Network Error'));
      };

      request.send(body);
    });
  };
}

// Console polyfill for very old browsers
if (typeof window !== 'undefined' && !window.console) {
  window.console = {
    log: function() {},
    warn: function() {},
    error: function() {},
    info: function() {},
    debug: function() {}
  };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
}