# CosAI - Coslang Learning Assistant 🤖

A beautiful, interactive AI-powered learning assistant for the Coslang programming language, built with modern web technologies and optimized for Phi-1.5B.

## ✨ Features

- **🤖 AI-Powered Learning** - Powered by Phi-1.5B via Ollama
- **💬 Interactive Chat Interface** - Real-time conversations with syntax highlighting
- **📚 Educational Content** - Structured learning topics and examples
- **🎨 Beautiful UI** - Modern, responsive design with dark theme
- **📱 Mobile Responsive** - Works perfectly on all devices
- **⚡ Fast & Efficient** - Optimized for local AI processing
- **🔧 Modular Architecture** - Clean, maintainable code structure

## 🚀 Quick Start

### Prerequisites

1. **Ollama** - Install from [ollama.ai](https://ollama.ai)
2. **Phi-1.5B Model** - Run: `ollama pull phi1.5`

### Installation

1. **Clone or download** the CosAI folder
2. **Start Ollama** with Phi-1.5B model
3. **Open** `cosai/index.html` in your browser
4. **Start learning** Coslang! 🎉

## 📁 Project Structure

```
cosai/
├── index.html              # Main application
├── styles/
│   ├── main.css           # Base styles and variables
│   ├── chat.css           # Chat interface styles
│   ├── components.css     # UI components (buttons, modals, etc.)
│   ├── animations.css     # Animations and transitions
│   └── responsive.css     # Mobile and tablet layouts
├── scripts/
│   ├── main.js           # Core application logic
│   ├── chat.js           # Chat functionality
│   ├── ollama.js         # Ollama API integration
│   ├── ui.js             # UI utilities and components
│   └── utils.js          # Helper functions
└── assets/               # Images and icons
```

## 🎯 How It Works

### AI Integration
- **Local Processing** - Uses Ollama for privacy and speed
- **Phi-1.5B Optimization** - Specifically tuned for educational content
- **Real-time Responses** - Instant feedback and explanations
- **Code Examples** - Syntax-highlighted Coslang code

### Learning Features
- **Interactive Topics** - Click sidebar items to ask questions
- **Quick Examples** - Pre-built learning prompts
- **Code Copy** - One-click code copying with syntax highlighting
- **Chat History** - Persistent conversation history

### UI/UX
- **Modern Design** - Clean, professional interface
- **Dark Theme** - Easy on the eyes
- **Responsive** - Works on desktop, tablet, and mobile
- **Accessible** - Keyboard shortcuts and screen reader support

## 🛠️ Technical Details

### Architecture
- **Modular JavaScript** - Clean separation of concerns
- **CSS Variables** - Consistent theming system
- **Progressive Enhancement** - Works without JavaScript
- **Error Handling** - Graceful degradation

### Performance
- **Debounced Input** - Prevents excessive API calls
- **Lazy Loading** - Components load as needed
- **Efficient Rendering** - Optimized DOM updates
- **Memory Management** - Proper cleanup and garbage collection

### Browser Support
- **Modern Browsers** - Chrome, Firefox, Safari, Edge
- **ES6+ Features** - Async/await, template literals, etc.
- **CSS Grid & Flexbox** - Modern layout techniques
- **Web APIs** - Fetch, localStorage, etc.

## 🎨 Customization

### Themes
The app uses CSS variables for easy theming:

```css
:root {
    --primary: #4dabf7;
    --background: #0d1117;
    --surface: #161b22;
    --text-primary: #e6edf3;
    /* ... more variables */
}
```

### Adding New Features
1. **New UI Components** - Add to `components.css`
2. **New Animations** - Add to `animations.css`
3. **New Functionality** - Add to appropriate JS module
4. **New Learning Topics** - Update sidebar in `index.html`

## 🔧 Configuration

### Ollama Settings
```javascript
MODEL_CONFIG: {
    name: 'phi1.5',
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 1000,
    stream: false
}
```

### System Prompt
The AI is configured with a specialized system prompt for Coslang tutoring, focusing on:
- Clear explanations
- Working code examples
- Best practices
- Educational approach

## 📱 Mobile Features

- **Touch Optimized** - Large touch targets
- **Responsive Sidebar** - Collapsible on mobile
- **Gesture Support** - Swipe to navigate
- **Keyboard Handling** - Virtual keyboard support

## 🔒 Privacy & Security

- **Local Processing** - No data sent to external servers
- **No Tracking** - No analytics or tracking
- **Offline Capable** - Works without internet
- **Data Control** - Chat history stored locally

## 🚀 Future Enhancements

- **Voice Input** - Speech-to-text for questions
- **Code Execution** - Run Coslang code in browser
- **Collaborative Learning** - Share conversations
- **Advanced Analytics** - Learning progress tracking
- **Plugin System** - Extensible architecture

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Microsoft** - For Phi-1.5B model
- **Ollama** - For local AI inference
- **Font Awesome** - For beautiful icons
- **Highlight.js** - For syntax highlighting

---

**Made with ❤️ for the Coslang community**

*CosAI - Your personal Coslang tutor powered by AI* 