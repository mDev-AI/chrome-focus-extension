# YouTube Focus Fortress

<p align="center">
  <img src="src/assets/icon128.png" alt="YouTube Focus Fortress Logo" width="128" height="128">
</p>

<p align="center">
  Transform YouTube into a distraction-free learning platform by eliminating feeds, recommendations, and other attention-stealing features.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#development">Development</a> •
  <a href="#privacy">Privacy</a> •
  <a href="#license">License</a>
</p>

---

## 🎯 Features

### 🛑 Distraction Elimination

- **Feed Removal**: Redirects homepage to subscriptions
- **Shorts Blocking**: Automatically converts Shorts to regular video view
- **Recommendation Purge**: Removes sidebar and endscreen suggestions
- **Comments Hiding**: Makes videos the exclusive focus of your attention

### ⏱️ Focus Tools

- **Focus Timer**: Built-in Pomodoro timer for productive viewing sessions
- **Speed Controls**: Quick access to playback speed adjustments
- **Session Tracking**: Monitor your time spent on purposeful learning

### 🔧 Customization

- **Channel Whitelist**: Highlight trusted educational channels
- **Granular Controls**: Enable/disable specific features as needed
- **Statistics Dashboard**: Track your productivity improvements

## 💾 Installation

### From Chrome Web Store (Coming Soon)

The extension will be available in the Chrome Web Store for one-click installation.

### Manual Installation

1. Clone this repository or download as ZIP
   ```
   git clone https://github.com/mDev-AI/chrome-focus-extension.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `src` directory from this project
5. The extension is now installed and active

## 📚 Usage

After installing YouTube Focus Fortress, simply navigate to YouTube. The extension automatically:

- Removes distracting elements from all YouTube pages
- Redirects the homepage to your subscription feed
- Adds a floating control panel on video pages for focus timers and speed controls

### Extension Popup

Click the extension icon in your browser toolbar to access:

- Feature toggles for customizing your experience
- Focus session statistics
- Channel whitelist management
- Quick settings for playback speed

### Keyboard Shortcuts

- **Focus Timer**: Start/pause by clicking the timer display
- **Speed Control**: Click speed buttons or use custom slider
- **Toggle Features**: Quick enable/disable through popup

## 🛠️ Development

### Project Structure

```
src/
├── assets/           # Extension icons and resources
├── css/              # Styling for YouTube modifications
├── js/               # JavaScript implementation files
│   ├── focus-engine.js     # Main content script
│   ├── observer.polyfill.js # Compatibility layer
│   ├── popup.js            # Extension popup functionality
│   ├── service-worker.js   # Background processes
│   └── whitelist.js        # Channel whitelist management
├── manifest.json     # Extension configuration
├── network-rules.json # Request blocking rules
├── popup.html        # Extension popup interface
├── welcome.html      # First-run experience
└── whitelist.html    # Channel management interface
```

### Key Technologies

- **Manifest V3**: Built on the latest Chrome extension platform
- **MutationObserver**: Dynamically responds to YouTube's interface changes
- **declarativeNetRequest**: Efficiently blocks unwanted network requests
- **Chrome Storage API**: Syncs your settings across devices

## 🔒 Privacy

YouTube Focus Fortress is designed with privacy in mind:

- **Zero Data Collection**: We don't collect any personal information
- **Local Processing**: All analytics are stored locally on your device
- **Minimal Permissions**: Only requests access necessary for functionality
- **No External Services**: Operates completely within your browser

## 📜 License

MIT License - See LICENSE file for details

---

<p align="center">
  <sub>Made with ❤️ for focused learning</sub>
</p>
