/**
 * YouTube Focus Fortress
 * Service Worker
 */

console.log('YouTube Focus Fortress: Service worker starting...');

// Initialize extension data
let userPreferences = {
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

// Track session stats
let sessionStats = {
  startTime: Date.now(),
  videosWatched: 0,
  searchesPerformed: 0,
  totalFocusTime: 0,
  shortsPrevented: 0
};

// Load stored preferences
function loadPreferences() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('focusFortressConfig', (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error loading preferences:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      
      if (result.focusFortressConfig) {
        userPreferences = { ...userPreferences, ...result.focusFortressConfig };
      }
      resolve();
    });
  });
}

// Save preferences
function savePreferences() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ focusFortressConfig: userPreferences }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving preferences:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

// Save session stats
function saveSessionStats() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ focusFortressStats: sessionStats }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving session stats:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

// Set up context menus
function setupContextMenus() {
  // Clean up any existing menus
  chrome.contextMenus.removeAll(() => {
    // Create search menu
    chrome.contextMenus.create({
      id: 'searchYouTubeFocused',
      title: 'Search YouTube Focused',
      contexts: ['selection']
    });
    
    // Create whitelist menu
    chrome.contextMenus.create({
      id: 'addToWhitelist',
      title: 'Add Channel to Whitelist',
      contexts: ['link'],
      documentUrlPatterns: ['*://*.youtube.com/*']
    });
  });
  
  // Set up menu click handler (only if not already listening)
  if (!chrome.contextMenus.onClicked.hasListeners()) {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'searchYouTubeFocused' && info.selectionText) {
        chrome.tabs.create({
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(info.selectionText)}`
        });
      }
      else if (info.menuItemId === 'addToWhitelist' && info.linkUrl) {
        const channelMatch = info.linkUrl.match(/youtube\.com\/(channel|user)\/([^\/]+)/);
        if (channelMatch && channelMatch[2]) {
          const channelId = channelMatch[2];
          if (!userPreferences.whitelistedChannels.includes(channelId)) {
            userPreferences.whitelistedChannels.push(channelId);
            savePreferences();
          }
        }
      }
    });
  }
}

// Handle extension messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getPreferences') {
    sendResponse({ preferences: userPreferences });
    return true;
  } 
  else if (message.type === 'updatePreferences') {
    userPreferences = { ...userPreferences, ...message.preferences };
    savePreferences()
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }
  else if (message.type === 'trackEvent') {
    switch (message.event) {
      case 'videoWatched':
        sessionStats.videosWatched++;
        break;
      case 'searchPerformed':
        sessionStats.searchesPerformed++;
        break;
      case 'shortPrevented':
        sessionStats.shortsPrevented++;
        break;
      case 'focusSession':
        sessionStats.totalFocusTime += message.duration || 0;
        break;
    }
    saveSessionStats()
      .then(() => sendResponse({ success: true }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }
});

// Initialize extension on install/update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('YouTube Focus Fortress: Extension installed/updated', details.reason);
  
  // On fresh install
  if (details.reason === 'install') {
    // Set default preferences
    savePreferences().then(() => {
      console.log('Preferences saved successfully.');
      
      // Set up context menus
      setupContextMenus();
      
      // Show welcome page
      chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
    });
  }
  // On update
  else if (details.reason === 'update') {
    // Load existing preferences
    loadPreferences().then(() => {
      console.log('Preferences loaded successfully.');
      
      // Set up context menus
      setupContextMenus();
    });
  }
});

// Initialize on startup
function initialize() {
  console.log('YouTube Focus Fortress: Initializing...');
  
  // Load preferences
  loadPreferences().then(() => {
    console.log('Preferences loaded successfully.');
    
    // Set up context menus if API is available
    if (chrome.contextMenus) {
      setupContextMenus();
    }
    
    console.log('YouTube Focus Fortress: Initialization complete.');
  }).catch(error => {
    console.error('Error during initialization:', error);
  });
}

// Start initialization
initialize(); 