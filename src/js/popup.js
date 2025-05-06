/**
 * YouTube Focus Fortress
 * Popup Script - popup.js
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Get references to UI elements
  const feedRemovalToggle = document.getElementById('feed-removal');
  const shortsRemovalToggle = document.getElementById('shorts-removal');
  const sidebarCleaningToggle = document.getElementById('sidebar-cleaning');
  const relatedRemovalToggle = document.getElementById('related-removal');
  const commentsRemovalToggle = document.getElementById('comments-removal');
  const autoRedirectToggle = document.getElementById('auto-redirect');
  const focusTimerToggle = document.getElementById('focus-timer');
  const resetStatsButton = document.getElementById('reset-stats');
  const manageWhitelistButton = document.getElementById('manage-whitelist');
  
  // Stats elements
  const videosWatchedElement = document.getElementById('videos-watched');
  const searchesPerformedElement = document.getElementById('searches-performed');
  const shortsPresentedElement = document.getElementById('shorts-prevented');
  const focusTimeElement = document.getElementById('focus-time');
  const focusSessionActiveElement = document.getElementById('focus-session-active');
  const focusTimerDisplayElement = document.getElementById('focus-timer-display');
  
  // Initialize preferences
  let preferences = {
    enableFeedRemoval: true,
    enableShortsRemoval: true,
    enableSidebarCleaning: true,
    enableRelatedVideosRemoval: true,
    enableCommentsRemoval: true,
    enableAutoRedirect: true,
    enableFocusTimer: true,
    enableSpeedDial: true,
    playbackSpeed: 1.0,
    focusSessionTime: 25,
    whitelistedChannels: []
  };
  
  // Stats data
  let stats = {
    videosWatched: 0,
    searchesPerformed: 0,
    shortsPrevented: 0,
    totalFocusTime: 0
  };
  
  // Focus session state
  let focusSessionInfo = {
    active: false,
    remainingTime: 0
  };
  
  // Load preferences from storage
  async function loadPreferences() {
    return new Promise(resolve => {
      chrome.storage.sync.get('focusFortressConfig', data => {
        if (data.focusFortressConfig) {
          preferences = { ...preferences, ...data.focusFortressConfig };
        }
        resolve();
      });
    });
  }
  
  // Load stats from storage
  async function loadStats() {
    return new Promise(resolve => {
      chrome.storage.local.get('focusFortressStats', data => {
        if (data.focusFortressStats) {
          stats = { ...stats, ...data.focusFortressStats };
        }
        resolve();
      });
    });
  }
  
  // Save preferences to storage
  function savePreferences() {
    return new Promise(resolve => {
      chrome.storage.sync.set({ focusFortressConfig: preferences }, resolve);
      
      // Send message to background script to update rules
      chrome.runtime.sendMessage({
        type: 'updatePreferences',
        preferences: preferences
      });
    });
  }
  
  // Reset stats
  function resetStats() {
    stats = {
      videosWatched: 0,
      searchesPerformed: 0,
      shortsPrevented: 0,
      totalFocusTime: 0
    };
    
    chrome.storage.local.set({ focusFortressStats: stats });
    updateStatsDisplay();
  }
  
  // Update UI based on preferences
  function updateUI() {
    feedRemovalToggle.checked = preferences.enableFeedRemoval;
    shortsRemovalToggle.checked = preferences.enableShortsRemoval;
    sidebarCleaningToggle.checked = preferences.enableSidebarCleaning;
    relatedRemovalToggle.checked = preferences.enableRelatedVideosRemoval;
    commentsRemovalToggle.checked = preferences.enableCommentsRemoval;
    autoRedirectToggle.checked = preferences.enableAutoRedirect;
    focusTimerToggle.checked = preferences.enableFocusTimer;
  }
  
  // Update stats display
  function updateStatsDisplay() {
    videosWatchedElement.textContent = stats.videosWatched.toString();
    searchesPerformedElement.textContent = stats.searchesPerformed.toString();
    shortsPresentedElement.textContent = stats.shortsPrevented.toString();
    
    // Format focus time (minutes to hours and minutes)
    const focusTimeMinutes = Math.floor(stats.totalFocusTime / 60);
    if (focusTimeMinutes < 60) {
      focusTimeElement.textContent = `${focusTimeMinutes} min`;
    } else {
      const hours = Math.floor(focusTimeMinutes / 60);
      const minutes = focusTimeMinutes % 60;
      focusTimeElement.textContent = `${hours}h ${minutes}m`;
    }
  }
  
  // Check if a focus session is active on the current tab
  async function checkActiveFocusSession() {
    return new Promise(resolve => {
      // Query for active YouTube tabs
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs.length > 0 && tabs[0].url && tabs[0].url.includes('youtube.com')) {
          // Send message to content script to check focus session status
          chrome.tabs.sendMessage(tabs[0].id, { type: 'getFocusSessionStatus' }, response => {
            if (response && response.active) {
              focusSessionInfo = {
                active: true,
                remainingTime: response.remainingTime
              };
              
              // Display focus session UI
              focusSessionActiveElement.style.display = 'flex';
              
              // Format time display
              const minutes = Math.floor(response.remainingTime / 60);
              const seconds = response.remainingTime % 60;
              focusTimerDisplayElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
              
              // Start timer update
              startTimerUpdate();
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }
  
  // Update timer display
  let timerInterval;
  function startTimerUpdate() {
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
      focusSessionInfo.remainingTime--;
      
      if (focusSessionInfo.remainingTime <= 0) {
        clearInterval(timerInterval);
        focusSessionActiveElement.style.display = 'none';
        return;
      }
      
      const minutes = Math.floor(focusSessionInfo.remainingTime / 60);
      const seconds = focusSessionInfo.remainingTime % 60;
      focusTimerDisplayElement.textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Toggle switches
    feedRemovalToggle.addEventListener('change', () => {
      preferences.enableFeedRemoval = feedRemovalToggle.checked;
      savePreferences();
    });
    
    shortsRemovalToggle.addEventListener('change', () => {
      preferences.enableShortsRemoval = shortsRemovalToggle.checked;
      savePreferences();
    });
    
    sidebarCleaningToggle.addEventListener('change', () => {
      preferences.enableSidebarCleaning = sidebarCleaningToggle.checked;
      savePreferences();
    });
    
    relatedRemovalToggle.addEventListener('change', () => {
      preferences.enableRelatedVideosRemoval = relatedRemovalToggle.checked;
      savePreferences();
    });
    
    commentsRemovalToggle.addEventListener('change', () => {
      preferences.enableCommentsRemoval = commentsRemovalToggle.checked;
      savePreferences();
    });
    
    autoRedirectToggle.addEventListener('change', () => {
      preferences.enableAutoRedirect = autoRedirectToggle.checked;
      savePreferences();
    });
    
    focusTimerToggle.addEventListener('change', () => {
      preferences.enableFocusTimer = focusTimerToggle.checked;
      savePreferences();
    });
    
    // Buttons
    resetStatsButton.addEventListener('click', resetStats);
    
    manageWhitelistButton.addEventListener('click', () => {
      // Open whitelist management page
      chrome.tabs.create({ url: chrome.runtime.getURL('whitelist.html') });
    });
  }
  
  // Initialize popup
  async function init() {
    // Load settings and stats
    await Promise.all([loadPreferences(), loadStats()]);
    
    // Update UI with loaded settings
    updateUI();
    updateStatsDisplay();
    
    // Check for active focus session
    await checkActiveFocusSession();
    
    // Set up event listeners
    setupEventListeners();
  }
  
  // Start initialization
  init();
}); 