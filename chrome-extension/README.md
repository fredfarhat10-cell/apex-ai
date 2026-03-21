# Apex Symbiont Chrome Extension

A private, context-aware AI companion for the web that integrates with your Apex AI Assistant.

## Features

- **Quick Access**: Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac) to summon Apex
- **Page Summarization**: Right-click and select "Summarize with Apex" to analyze any page
- **Interactive Chat**: Ask questions about the current page through the popup interface
- **Context-Aware**: Captures page content and sends it to your AI agents for analysis

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `chrome-extension` folder from this project

## Setup

### Icons
You'll need to add icon files to the `chrome-extension/icons/` folder:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

### API Integration
To connect the extension to your CrewAI backend:

1. Open `background.js`
2. Find the TODO comment in the `ask_apex` message handler
3. Replace the mock response with a real API call to your backend:

\`\`\`javascript
// Replace this:
setTimeout(() => {
  sendResponse({ answer: `Mission received...` });
}, 1000);

// With this:
fetch('http://localhost:3000/api/crewai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: request.prompt,
    context: { /* page context */ }
  })
})
.then(res => res.json())
.then(data => sendResponse({ answer: data.result }))
.catch(err => sendResponse({ answer: 'Error connecting to Apex.' }));
\`\`\`

## Usage

1. **Popup Interface**: Click the extension icon or use the keyboard shortcut
2. **Context Menu**: Right-click on any page and select "Summarize with Apex"
3. **Ask Questions**: Type your query in the popup and press Enter

## Development

The extension uses vanilla JavaScript with React (loaded via CDN) for the popup interface. All files are self-contained and ready to load into Chrome.
