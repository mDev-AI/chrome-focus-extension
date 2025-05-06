/**
 * YouTube Focus Fortress
 * Background Service Worker - background.js
 */

console.log('[RECOVERY] Background service worker execution started');

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
async function loadPreferences() {
  try {
    const result = await chrome.storage.sync.get('focusFortressConfig');
    if (result.focusFortressConfig) {
      userPreferences = { ...userPreferences, ...result.focusFortressConfig };
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
}

// Save preferences
async function savePreferences() {
  try {
    await chrome.storage.sync.set({ focusFortressConfig: userPreferences });
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
}

// Update session stats
async function saveSessionStats() {
  try {
    await chrome.storage.local.set({ focusFortressStats: sessionStats });
  } catch (error) {
    console.error('Error saving session stats:', error);
  }
}

// IMPORTANT: We're not managing dynamic rules anymore due to Chrome API inconsistencies
// Instead, we rely only on the static rules defined in network-rules.json
async function updateRules() {
  console.log('[RECOVERY] updateRules called - we now rely on static rules only');
  // Intentionally empty - no dynamic rules management
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getPreferences') {
    // Send preferences to content script
    sendResponse({ preferences: userPreferences });
    return true;
  } 
  else if (message.type === 'updatePreferences') {
    // Update preferences from content script
    userPreferences = { ...userPreferences, ...message.preferences };
    savePreferences();
    // We don't call updateRules() anymore
    sendResponse({ success: true });
    return true;
  }
  else if (message.type === 'trackEvent') {
    // Track usage events
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
    saveSessionStats();
    sendResponse({ success: true });
    return true;
  }
});

// Context menu integration
async function setupContextMenu() {
  try {
    // Make sure the contextMenus API is available before using it
    if (!chrome.contextMenus) {
      console.error('Context Menus API not available');
      return;
    }

    // First, remove all existing menus
    await new Promise((resolve) => {
      chrome.contextMenus.removeAll(() => {
        if (chrome.runtime.lastError) {
          console.log('Note when removing context menus:', chrome.runtime.lastError);
        }
        resolve();
      });
    });
    
    // Create search menu item
    try {
      chrome.contextMenus.create({
        id: 'searchYouTubeFocused',
        title: 'Search YouTube Focused',
        contexts: ['selection']
      });
    } catch (e) {
      console.error('Error creating search menu:', e);
    }
    
    // Create whitelist menu item
    try {
      chrome.contextMenus.create({
        id: 'addToWhitelist',
        title: 'Add Channel to Whitelist',
        contexts: ['link'],
        documentUrlPatterns: ['*://*.youtube.com/*']
      });
    } catch (e) {
      console.error('Error creating whitelist menu:', e);
    }

    // Only set up the listener if it hasn't been set up already
    if (!chrome.contextMenus.onClicked.hasListeners()) {
      chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === 'searchYouTubeFocused' && info.selectionText) {
          // Open YouTube search in a new tab
          chrome.tabs.create({
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(info.selectionText)}`
          });
        }
        else if (info.menuItemId === 'addToWhitelist' && info.linkUrl) {
          // Extract channel name from URL
          const channelMatch = info.linkUrl.match(/youtube\.com\/(channel|user)\/([^\/]+)/);
          if (channelMatch && channelMatch[2]) {
            const channelId = channelMatch[2];
            // Add to whitelist if not already present
            if (!userPreferences.whitelistedChannels.includes(channelId)) {
              userPreferences.whitelistedChannels.push(channelId);
              savePreferences();
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error in setupContextMenu:', error);
  }
}

// Extension installation and update handling
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[RECOVERY] onInstalled event fired');
  
  // Use a setTimeout to defer initialization, potentially avoiding timing issues
  setTimeout(() => {
    if (details.reason === 'install') {
      console.log('[RECOVERY] Install reason: performing initial setup');
      
      // Safe initialization of preferences
      savePreferences().then(() => {
        console.log('[RECOVERY] Preferences saved');
        
        // Set up context menu
        setupContextMenu().then(() => {
          console.log('[RECOVERY] Context menu setup completed');
        }).catch(err => {
          console.error('[RECOVERY] Context menu setup error:', err);
        });
        
        // Show welcome page
        chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
      }).catch(err => {
        console.error('[RECOVERY] Save preferences error:', err);
      });
    } 
    else if (details.reason === 'update') {
      console.log('[RECOVERY] Update reason: performing update');
      
      // Load existing preferences
      loadPreferences().then(() => {
        console.log('[RECOVERY] Preferences loaded');
        
        // Set up context menu
        setupContextMenu().then(() => {
          console.log('[RECOVERY] Context menu setup completed');
        }).catch(err => {
          console.error('[RECOVERY] Context menu setup error:', err);
        });
      }).catch(err => {
        console.error('[RECOVERY] Load preferences error:', err);
      });
    }
  }, 500); // 500ms delay to ensure Chrome's internal state is ready
});

// Initialize the extension
function initialize() {
  console.log('[RECOVERY] Initializing extension...');
  
  // Load saved preferences 
  loadPreferences().then(() => {
    console.log('[RECOVERY] Preferences loaded');
    
    // Set up context menu if API is available
    if (chrome.contextMenus) {
      setupContextMenu().then(() => {
        console.log('[RECOVERY] Context menu setup completed');
      }).catch(err => {
        console.error('[RECOVERY] Context menu setup error:', err);
      });
    } else {
      console.warn('[RECOVERY] Context Menus API not available');
    }
    
    console.log('[RECOVERY] Initialization complete');
  }).catch(err => {
    console.error('[RECOVERY] Initialization error:', err);
  });
}

// Calling initialize directly - with no top-level await
console.log('[RECOVERY] Starting initialization');
initialize(); 