# YouTube Focus Fortress

A Chrome extension to transform YouTube into a distraction-free learning platform.

## Features

### Core Features

- **Total Feed Elimination**
  - Nullifies the homepage (redirects to subscriptions)
  - Eradicates Shorts/Reels/Stories
  - Removes Trending/Explore/Channels sections
- **Recommendation Purge**
  - Removes sidebar recommendations
  - Eliminates endscreen/autoplay suggestions
  - Hides comments and playlist suggestions
  - Removes channel content promotions
- **Search-First Ecosystem**
  - Encourages direct URL access
  - Promotes intentional searching
  - Provides session-based history tracking

### Additional Features

- **Floating Control Center**
  - Focus Timer with Pomodoro functionality
  - Speed Dial for quick playback speed adjustments
- **Channel Whitelist**
  - Highlight trusted educational channels
  - Bypass restrictions for whitelisted channels
- **Focus Statistics**
  - Track videos watched
  - Monitor focus session times
  - Count number of distractions prevented

## Installation

### From Source

1. Clone this repository or download as ZIP
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `src` directory from this project
5. The extension is now installed and active

### From Chrome Web Store

_(Coming soon)_

## Usage

After installing YouTube Focus Fortress, simply navigate to YouTube. The extension will automatically:

1. Remove distracting elements from all YouTube pages
2. Redirect the homepage to your subscription feed
3. Add a floating control panel on video pages for focus timers and speed controls

### Settings

Click the extension icon in your browser toolbar to:

- Toggle specific features on/off
- View your focus statistics
- Manage your channel whitelist
- Reset statistics

### Whitelisting Channels

You can whitelist educational channels to highlight them in search results:

1. Right-click on a channel link on YouTube
2. Select "Add to Whitelist" from the context menu
3. Or manually add channels from the whitelist management page

## Development

### Project Structure

- `manifest.json`: Extension configuration
- `css/focus.css`: Styling for hiding YouTube elements
- `js/observer.polyfill.js`: MutationObserver compatibility layer
- `js/focus-engine.js`: Main content script for YouTube modifications
- `js/background.js`: Background service worker for extension features
- `network-rules.json`: Rules for blocking certain network requests
- `popup.html` & `js/popup.js`: Extension popup interface
- `welcome.html`: Onboarding page for new users
- `whitelist.html` & `js/whitelist.js`: Channel whitelist management
- `assets/`: Contains extension icons and icon generation tools

### Icons

The extension uses custom shield-style icons that represent the "Focus Fortress" concept:

- Blue shield background (protection from distractions)
- YouTube-red circle with a green focus target
- Available in 16px, 48px, and 128px sizes for various Chrome UI contexts

To regenerate icons:

```bash
cd src/assets
npm install
npm run generate
```

### Building for Production

1. Install dependencies: `npm install`
2. Build the extension: `npm run build`
3. The production-ready extension will be in the `dist` directory

## Security & Privacy

YouTube Focus Fortress:

- Does not collect any personal data
- Processes all statistics locally
- Does not transmit any usage information
- Requests only necessary permissions for its functionality

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
