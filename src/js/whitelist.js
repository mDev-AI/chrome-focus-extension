/**
 * YouTube Focus Fortress
 * Whitelist Management Script - whitelist.js
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Get references to UI elements
  const channelInput = document.getElementById('channel-input');
  const addChannelButton = document.getElementById('add-channel');
  const clearAllButton = document.getElementById('clear-all');
  const whitelistContainer = document.getElementById('whitelist');
  const emptyMessage = document.getElementById('empty-message');
  const backToSettingsLink = document.getElementById('back-to-settings');
  
  // Initialize preferences
  let preferences = {
    whitelistedChannels: []
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
  
  // Save preferences to storage
  function savePreferences() {
    return new Promise(resolve => {
      chrome.storage.sync.set({ focusFortressConfig: preferences }, resolve);
      
      // Send message to background script to update
      chrome.runtime.sendMessage({
        type: 'updatePreferences',
        preferences: preferences
      });
    });
  }
  
  // Add channel to whitelist
  function addChannel(channel) {
    if (!channel || channel.trim() === '') return;
    
    // Normalize channel name
    const normalizedChannel = channel.trim();
    
    // Check if already in list
    if (preferences.whitelistedChannels.includes(normalizedChannel)) {
      showToast('Channel is already in your whitelist');
      return;
    }
    
    // Add to list
    preferences.whitelistedChannels.push(normalizedChannel);
    savePreferences();
    
    // Update UI
    renderWhitelist();
    
    // Clear input
    channelInput.value = '';
  }
  
  // Remove channel from whitelist
  function removeChannel(channel) {
    const index = preferences.whitelistedChannels.indexOf(channel);
    if (index !== -1) {
      preferences.whitelistedChannels.splice(index, 1);
      savePreferences();
      renderWhitelist();
    }
  }
  
  // Clear all whitelisted channels
  function clearWhitelist() {
    if (preferences.whitelistedChannels.length === 0) return;
    
    if (confirm('Are you sure you want to remove all whitelisted channels?')) {
      preferences.whitelistedChannels = [];
      savePreferences();
      renderWhitelist();
    }
  }
  
  // Render whitelist
  function renderWhitelist() {
    // Clear previous items
    while (whitelistContainer.firstChild) {
      whitelistContainer.removeChild(whitelistContainer.firstChild);
    }
    
    // Show/hide empty message
    if (preferences.whitelistedChannels.length === 0) {
      whitelistContainer.appendChild(emptyMessage);
      return;
    }
    
    // Add whitelist items
    preferences.whitelistedChannels.forEach(channel => {
      const item = document.createElement('div');
      item.className = 'whitelist-item';
      
      const channelName = document.createElement('span');
      channelName.textContent = channel;
      
      const removeButton = document.createElement('button');
      removeButton.className = 'remove-btn';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => removeChannel(channel));
      
      item.appendChild(channelName);
      item.appendChild(removeButton);
      whitelistContainer.appendChild(item);
    });
  }
  
  // Show toast message
  function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.fontSize = '14px';
    toast.style.zIndex = '1000';
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Add channel button
    addChannelButton.addEventListener('click', () => {
      addChannel(channelInput.value);
    });
    
    // Add channel on Enter key
    channelInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        addChannel(channelInput.value);
      }
    });
    
    // Clear all button
    clearAllButton.addEventListener('click', clearWhitelist);
    
    // Back to settings link
    backToSettingsLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.close();
    });
  }
  
  // Initialize whitelist page
  async function init() {
    // Load settings
    await loadPreferences();
    
    // Render whitelist
    renderWhitelist();
    
    // Set up event listeners
    setupEventListeners();
  }
  
  // Start initialization
  init();
}); 