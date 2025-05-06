/**
 * YouTube Focus Fortress
 * Main Content Script - focus-engine.js
 */

(function() {
  'use strict';
  
  // Configuration (can be overridden by storage)
  let config = {
    enableFeedRemoval: true,
    enableShortsRemoval: true,
    enableSidebarCleaning: true,
    enableRelatedVideosRemoval: true,
    enableCommentsRemoval: true,
    enableAutoRedirect: true,
    enableFocusTimer: true,
    enableSpeedDial: true,
    playbackSpeed: 1.0,
    focusSessionTime: 25, // minutes
    whitelistedChannels: []
  };
  
  // Initialize state
  const state = {
    isWatchPage: false,
    isHomePage: false,
    isSearchPage: false,
    isShortsPage: false,
    currentVideoId: null,
    sessionStartTime: Date.now(),
    focusTimerActive: false,
    focusTimerRemaining: 0,
    observersActive: true
  };
  
  // Elements cache for performance
  const elemCache = {};
  
  // Load stored configuration
  function loadConfig() {
    return new Promise(resolve => {
      if (chrome && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get('focusFortressConfig', data => {
          if (data.focusFortressConfig) {
            config = { ...config, ...data.focusFortressConfig };
          }
          resolve(config);
        });
      } else {
        // Fallback to localStorage if Chrome storage API is not available
        try {
          const storedConfig = localStorage.getItem('focusFortressConfig');
          if (storedConfig) {
            config = { ...config, ...JSON.parse(storedConfig) };
          }
        } catch (e) {
          console.error('Could not parse stored config', e);
        }
        resolve(config);
      }
    });
  }
  
  // Save configuration
  function saveConfig() {
    if (chrome && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ focusFortressConfig: config });
    } else {
      // Fallback to localStorage
      localStorage.setItem('focusFortressConfig', JSON.stringify(config));
    }
  }
  
  // URL Pattern Handler
  function handleUrlChange() {
    const url = window.location.href;
    
    // Determine page type
    state.isWatchPage = url.includes('/watch');
    state.isHomePage = url === 'https://www.youtube.com/' || url === 'https://youtube.com/';
    state.isSearchPage = url.includes('/results');
    state.isShortsPage = url.includes('/shorts');
    
    // Set path attribute on body for CSS targeting
    document.body.setAttribute('path', window.location.pathname);
    
    // Extract video ID if on watch page
    if (state.isWatchPage) {
      const urlParams = new URLSearchParams(window.location.search);
      state.currentVideoId = urlParams.get('v');
    }
    
    // Auto-redirect from homepage to search if enabled
    if (state.isHomePage && config.enableAutoRedirect) {
      window.location.href = 'https://www.youtube.com/feed/subscriptions';
    }
    
    // Rewrite shorts URLs to watch URLs
    if (state.isShortsPage && config.enableShortsRemoval) {
      const videoId = window.location.pathname.split('/shorts/')[1];
      if (videoId) {
        window.location.href = `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    // Apply page-specific modifications
    if (state.isWatchPage) {
      applyWatchPageModifications();
    } else if (state.isSearchPage) {
      applySearchPageModifications();
    }
  }
  
  // Watch Page Modifications
  function applyWatchPageModifications() {
    // Disable autoplay
    const autoplayToggle = document.querySelector('.ytp-autonav-toggle-button');
    if (autoplayToggle && autoplayToggle.getAttribute('aria-checked') === 'true') {
      autoplayToggle.click();
    }
    
    // Set playback speed if configured
    if (config.playbackSpeed !== 1.0) {
      const video = document.querySelector('video');
      if (video) {
        video.playbackRate = config.playbackSpeed;
      }
    }
    
    // Remove endscreen recommendations
    removeElements('.ytp-endscreen-content');
    
    // Remove related videos if configured
    if (config.enableRelatedVideosRemoval) {
      removeElements('ytd-watch-next-secondary-results-renderer');
    }
    
    // Remove comments if configured
    if (config.enableCommentsRemoval) {
      removeElements('ytd-comments');
    }
    
    // Add focus timer UI if enabled
    if (config.enableFocusTimer && !document.querySelector('.focus-fortress-control')) {
      createFocusControls();
    }
  }
  
  // Search Page Modifications
  function applySearchPageModifications() {
    // Clean up search results
    const videoRenderers = document.querySelectorAll('ytd-video-renderer');
    videoRenderers.forEach(renderer => {
      // Add focus-approved class to videos from whitelisted channels
      const channelName = renderer.querySelector('#channel-name')?.textContent?.trim();
      if (channelName && config.whitelistedChannels.includes(channelName)) {
        renderer.classList.add('focus-approved');
      }
    });
  }
  
  // Create Focus Control UI
  function createFocusControls() {
    const controlPanel = document.createElement('div');
    controlPanel.className = 'focus-fortress-control';
    controlPanel.innerHTML = `
      <div class="focus-timer">
        <span id="focus-timer-display">25:00</span>
        <button id="focus-timer-toggle">Start</button>
      </div>
      <div class="speed-dial">
        <button data-speed="0.5">0.5x</button>
        <button data-speed="1.0" class="active">1.0x</button>
        <button data-speed="1.5">1.5x</button>
        <button data-speed="2.0">2.0x</button>
      </div>
    `;
    document.body.appendChild(controlPanel);
    
    // Add progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'focus-progress-overlay';
    progressBar.style.transform = 'scaleX(0)';
    document.body.appendChild(progressBar);
    
    // Set up event listeners
    controlPanel.querySelector('#focus-timer-toggle').addEventListener('click', toggleFocusTimer);
    controlPanel.querySelectorAll('.speed-dial button').forEach(btn => {
      btn.addEventListener('click', e => {
        const speed = parseFloat(e.target.dataset.speed);
        setPlaybackSpeed(speed);
        // Update active button
        controlPanel.querySelectorAll('.speed-dial button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
  }
  
  // Focus Timer Functions
  function toggleFocusTimer() {
    const timerDisplay = document.querySelector('#focus-timer-display');
    const timerButton = document.querySelector('#focus-timer-toggle');
    
    if (!state.focusTimerActive) {
      // Start timer
      state.focusTimerActive = true;
      state.focusTimerRemaining = config.focusSessionTime * 60; // Convert to seconds
      timerButton.textContent = 'Pause';
      
      // Update timer display every second
      state.focusTimerInterval = setInterval(() => {
        state.focusTimerRemaining--;
        
        // Update display
        const minutes = Math.floor(state.focusTimerRemaining / 60);
        const seconds = state.focusTimerRemaining % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress bar
        const progressBar = document.querySelector('.focus-progress-overlay');
        if (progressBar) {
          const progress = 1 - (state.focusTimerRemaining / (config.focusSessionTime * 60));
          progressBar.style.transform = `scaleX(${progress})`;
        }
        
        // Check if timer is complete
        if (state.focusTimerRemaining <= 0) {
          clearInterval(state.focusTimerInterval);
          state.focusTimerActive = false;
          timerButton.textContent = 'Start';
          
          // Show notification
          if (Notification.permission === 'granted') {
            new Notification('Focus Session Complete', {
              body: 'Great job! Take a short break before continuing.',
              icon: chrome.runtime.getURL('assets/icon128.png')
            });
          }
        }
      }, 1000);
    } else {
      // Pause timer
      clearInterval(state.focusTimerInterval);
      state.focusTimerActive = false;
      timerButton.textContent = 'Resume';
    }
  }
  
  // Set video playback speed
  function setPlaybackSpeed(speed) {
    const video = document.querySelector('video');
    if (video) {
      video.playbackRate = speed;
    }
    
    // Update config
    config.playbackSpeed = speed;
    saveConfig();
  }
  
  // AJAX Interception
  function setupAPIInterception() {
    // Intercept fetch API
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      // Block recommendation requests
      if (input && typeof input === 'string') {
        // Block next video recommendations API
        if (input.includes('/youtubei/v1/next')) {
          return new Promise((resolve) => {
            resolve({
              json: () => Promise.resolve({ contents: [] }),
              text: () => Promise.resolve('{}'),
              ok: true
            });
          });
        }
      }
      return originalFetch.apply(this, arguments);
    };
    
    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      // Block certain API calls
      if (url && typeof url === 'string') {
        if (url.includes('/youtubei/v1/next') || 
            url.includes('/youtubei/v1/browse') && !url.includes('subscriptions')) {
          // Replace with a dummy URL that will return empty data
          url = 'https://www.youtube.com/empty-focus-fortress';
        }
      }
      return originalXHROpen.call(this, method, url, ...rest);
    };
  }
  
  // Set up MutationObservers for dynamic content
  function setupObservers() {
    // Primary observer for main content
    const primaryObserver = new FocusFortressMutationObserver(mutations => {
      if (!state.observersActive) return;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check for new video elements
          if (state.isWatchPage) {
            applyWatchPageModifications();
          }
          
          // Remove feed items when they appear
          if (config.enableFeedRemoval) {
            removeElements('ytd-rich-grid-renderer', 'ytd-rich-section-renderer', 'ytd-shelf-renderer');
          }
          
          // Remove shorts when they appear
          if (config.enableShortsRemoval) {
            removeElements('ytd-reel-shelf-renderer', 'ytd-reel-item-renderer');
          }
        }
      });
    });
    
    // Observe the main container
    const mainContent = document.querySelector('#content');
    if (mainContent) {
      primaryObserver.observe(mainContent, { childList: true, subtree: true });
    }
    
    // Secondary observer for watch page
    const secondaryObserver = new FocusFortressMutationObserver(mutations => {
      if (!state.observersActive) return;
      
      if (state.isWatchPage) {
        applyWatchPageModifications();
      }
    });
    
    // Observe the video container
    const videoContainer = document.querySelector('#primary-inner');
    if (videoContainer) {
      secondaryObserver.observe(videoContainer, { childList: true, subtree: true });
    }
    
    // Store references for later use
    state.observers = {
      primary: primaryObserver,
      secondary: secondaryObserver
    };
  }
  
  // Helper function to remove elements
  function removeElements(...selectors) {
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.style.display = 'none';
      });
    });
  }
  
  // URL Change Detection
  function detectURLChanges() {
    // Listen for URL changes
    let lastUrl = window.location.href;
    
    // Use requestAnimationFrame for smoother performance
    function checkURLChange() {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        handleUrlChange();
      }
      requestAnimationFrame(checkURLChange);
    }
    
    checkURLChange();
  }
  
  // Init function
  async function init() {
    console.log('[YouTube Focus Fortress] Initializing...');
    
    // Load config
    await loadConfig();
    
    // Initial URL handling
    handleUrlChange();
    
    // Set up mutation observers
    setupObservers();
    
    // Set up API interception
    setupAPIInterception();
    
    // Set up URL change detection
    detectURLChanges();
    
    // Request notification permission for focus timer
    if (config.enableFocusTimer && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    console.log('[YouTube Focus Fortress] Initialization complete');
  }
  
  // Start the extension
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 