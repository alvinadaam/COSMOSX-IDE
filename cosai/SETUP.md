# CosAI Setup Guide

## Quick Start

### 1. Install Ollama
Download and install Ollama from: https://ollama.ai/

### 2. Install Phi-1.5B Model
Open a terminal/command prompt and run:
```bash
ollama pull phi1.5
```

### 3. Start Ollama
```bash
ollama serve
```

### 4. Test CosAI
1. Start the local server: `python -m http.server 8000`
2. Open: `http://localhost:8000/cosai/`
3. Ask questions about Coslang!

## Hardware Optimization

CosAI is optimized for your PC specs:
- **CPU**: i5-6500T (4 cores, 4 threads)
- **RAM**: 16GB
- **Optimizations**: Memory monitoring, request throttling, UI optimizations

## Features

### Real Coslang Support
- Teaches the actual Coslang interactive fiction language
- Scene structure and navigation
- Variables (`vars`, `stats`, `inventory`)
- Text with variable interpolation `{hp}`
- Choices with scene targeting `-> scene_name`
- Conditional logic (`if/else`)
- Set operations with tags `[LOG: message]`

### Performance Features
- **Smart Scrollbars**: Enhanced scrollbar system from the IDE
- **Memory Monitoring**: Automatic cleanup when memory usage is high
- **Request Throttling**: Limits concurrent requests to prevent CPU overload
- **UI Optimizations**: Hardware-specific optimizations for i5-6500T
- **Caching**: In-memory cache for repeated requests

### AI Features
- **Phi-1.5B**: Optimized for your hardware
- **Real-time Chat**: Instant responses
- **Code Highlighting**: Syntax highlighting for Coslang
- **Copy Code**: One-click code copying
- **Topic Suggestions**: Quick example topics

## Troubleshooting

### Ollama Connection Issues
1. Make sure Ollama is running: `ollama serve`
2. Check if model is installed: `ollama list`
3. Test connection: `curl http://localhost:11434/api/tags`

### Performance Issues
- CosAI automatically optimizes for your i5-6500T
- Memory usage is monitored and cleaned automatically
- Request throttling prevents CPU overload

### Model Issues
If Phi-1.5B is too slow, try:
```bash
# Install a smaller model
ollama pull phi1.5:1b
```

## Development

### File Structure
```
cosai/
├── index.html          # Main interface
├── scripts/
│   ├── main.js         # Core application
│   ├── chat.js         # Chat functionality
│   ├── ollama.js       # AI integration
│   ├── scrollbar-system.js  # Enhanced scrollbars
│   ├── performance.js  # Hardware optimizations
│   ├── ui.js          # UI utilities
│   └── utils.js       # Helper functions
├── css/
│   ├── main.css       # Main styles
│   ├── chat.css       # Chat interface
│   ├── components.css # UI components
│   ├── animations.css # Animations
│   └── responsive.css # Mobile responsive
└── SETUP.md           # This file
```

### Customization
- Edit `scripts/ollama.js` to change AI model
- Modify `scripts/performance.js` for different hardware
- Update `scripts/chat.js` for different chat behavior

## Next Steps

1. **Test the AI**: Ask questions about Coslang
2. **Optimize Further**: Monitor performance metrics
3. **Integrate with IDE**: Connect to the main COSMOSX IDE
4. **Add More Models**: Try different Ollama models

## Performance Metrics

CosAI includes built-in performance monitoring:
- Memory usage tracking
- Response time measurement
- Request queue monitoring
- Cache hit rates

Check browser console for performance logs. 