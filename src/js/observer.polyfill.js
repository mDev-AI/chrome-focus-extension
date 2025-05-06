/**
 * YouTube Focus Fortress
 * MutationObserver compatibility polyfill
 */

(function() {
  // Make sure MutationObserver is available in all browsers
  if (!window.MutationObserver) {
    window.MutationObserver = (function() {
      function MutationObserver(callback) {
        this._callback = callback;
        this._observers = [];
      }
      
      MutationObserver.prototype.observe = function(target, config) {
        const observer = {
          target: target,
          config: config,
          observer: this
        };
        
        this._observers.push(observer);
        
        if (config.childList) {
          this._watchChildList(observer);
        }
        
        if (config.attributes) {
          this._watchAttributes(observer);
        }
      };
      
      MutationObserver.prototype.disconnect = function() {
        this._observers = [];
      };
      
      MutationObserver.prototype._watchChildList = function(observer) {
        const target = observer.target;
        const handleMutation = () => {
          const records = [{
            type: 'childList',
            target: target,
            addedNodes: Array.from(target.childNodes),
            removedNodes: [],
            previousSibling: null,
            nextSibling: null
          }];
          this._callback(records, this);
        };
        
        // Use DOM events for older browsers
        target.addEventListener('DOMNodeInserted', handleMutation, true);
        target.addEventListener('DOMNodeRemoved', handleMutation, true);
      };
      
      MutationObserver.prototype._watchAttributes = function(observer) {
        const target = observer.target;
        const config = observer.config;
        
        const handleAttrChange = (event) => {
          const records = [{
            type: 'attributes',
            target: target,
            attributeName: event.attrName,
            oldValue: config.attributeOldValue ? event.prevValue : null,
            addedNodes: [],
            removedNodes: []
          }];
          this._callback(records, this);
        };
        
        target.addEventListener('DOMAttrModified', handleAttrChange, true);
      };
      
      return MutationObserver;
    })();
  }
  
  // Create a performant wrapper for MutationObserver
  window.FocusFortressMutationObserver = class extends MutationObserver {
    constructor(callback) {
      // Debounce the callback for performance
      const debouncedCallback = (function() {
        let timeout;
        return function(mutations, observer) {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            callback(mutations, observer);
          }, 50);
        };
      })();
      
      super(debouncedCallback);
      
      this.active = true;
      this.originalCallback = callback;
    }
    
    // Add pause/resume functionality
    pause() {
      this.active = false;
    }
    
    resume() {
      this.active = true;
    }
    
    observe(target, config) {
      // Object pooling for better performance
      if (!this._targets) this._targets = new Set();
      this._targets.add(target);
      
      super.observe(target, config);
    }
    
    disconnect() {
      if (this._targets) this._targets.clear();
      super.disconnect();
    }
  };
  
  // Enhanced performance via requestIdleCallback
  window.requestIdleCallback = window.requestIdleCallback || function(cb) {
    return setTimeout(function() {
      const start = Date.now();
      cb({
        didTimeout: false,
        timeRemaining: function() {
          return Math.max(0, 50 - (Date.now() - start));
        }
      });
    }, 1);
  };
  
  console.log('[YouTube Focus Fortress] Observer polyfill initialized');
})(); 