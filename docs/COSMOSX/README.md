## Module Map

Key IDE modules in `js/ide-modules/`:

- `ui-manager.js` — Tabs, buttons, keyboard shortcuts, status updates.
- `editor-manager.js` — Monaco wiring, validation triggers, navigation, restore last saved.
- `scene-manager.js` — Parses scenes via `parseCosLang`, populates scene sidebar, context menu actions.
- `live-preview-modern.js` — Modern preview wiring invoked by `CosmosXIDE.startPreview()`.
- `live-preview.js` — Legacy preview module kept for compatibility.
- `smart-auto-save.js` — Interval-based auto-save with notifications and history.
- `debug-panels.js` — Accordion debug panels and refresh behavior.
- `file-operations.js` — Open, save, export, drag & drop handling.
- `advanced-search.js` — Regex-aware search & replace, highlights and navigation.
- `code-formatting.js` — Formatting rules and commands, options panel.
- `error-manager.js` — Centralized validation/errors surfaced into Monaco markers.
- `performance-monitor.js` — FPS/memory/perf stats.
- `event-system.js` — Internal event utilities.

# COSMOSX IDE Documentation

## Overview

COSMOSX IDE is a comprehensive development environment designed specifically for creating interactive stories using the COSLANG language. It provides a professional-grade editor with advanced features for story development, debugging, and testing.

## Table of Contents

- [IDE Features](#ide-features)
- [Getting Started](#getting-started)
- [Interface Overview](#interface-overview)
- [Editor Features](#editor-features)
- [Debug Tools](#debug-tools)
- [Advanced Features](#advanced-features)
- [Workflow Guide](#workflow-guide)
- [Troubleshooting](#troubleshooting)

## IDE Features

### Core Capabilities
- **Monaco Editor Integration** with COSLANG syntax highlighting
- **Scene Management** with visual scene tree and navigation
- **Real-time Syntax Validation** and error detection
- **Variable Inspector** for debugging story state
- **Performance Monitoring** with FPS and memory tracking
- **File Operations** with save, load, and export functionality
- **Advanced Search** with regex support and replace functionality
- **Code Formatting** with customizable formatting options
- **Auto-save** with local storage backup
- **Drag & Drop** file import support

### Development Tools
- **Scene Parser**: Automatically detects and lists all scenes
- **Scene Navigation**: Click-to-jump scene navigation
- **Scene Search**: Filter scenes by name or content
- **Scene Operations**: Duplicate, delete, and validate scenes
- **Error Panel**: Real-time error reporting with suggestions
- **Debug Console**: Execution logging and debugging
- **Achievement Manager**: Define and track story achievements
- **Event System**: Create trigger-based story events

## Getting Started

### First Launch
1. Open `index.html` in your web browser
2. The IDE will load with a default empty story
3. Start typing in the editor to create your first scene
4. Use the scene panel to navigate between scenes

### Creating Your First Story
```coslang
title: "My First Story"
author: "Your Name"
version: "1.0.0"

scene start {
    text: "Welcome to your first COSLANG story!"
    
    set player_name = "Hero"
    set health = 100
    
    choice "Begin your adventure" -> adventure
}
```

### Key Interface Elements
- **Left Sidebar**: Scene navigation and management
- **Center Editor**: Monaco editor with syntax highlighting
- **Right Sidebar**: Debug panels and tools
- **Bottom Panel**: Error display and performance metrics

## Interface Overview

### Main Layout
```
┌─────────────────┬─────────────────┬─────────────────┐
│   Scene Panel   │   Monaco Editor │  Debug Panels   │
│                 │                 │                 │
│ • Scene List    │ • Syntax High   │ • Variables     │
│ • Scene Search  │ • Auto-complete │ • Performance   │
│ • Scene Ops     │ • Error Detect  │ • Achievements  │
└─────────────────┴─────────────────┴─────────────────┘
```

### Panel Descriptions

#### Scene Panel (Left)
- **Scene List**: All detected scenes with descriptions
- **Scene Search**: Filter scenes by name or content
- **Scene Operations**: Context menu for scene management
- **Scene Tags**: Visual indicators for scene types

#### Monaco Editor (Center)
- **Syntax Highlighting**: Color-coded COSLANG syntax
- **Auto-complete**: Context-aware suggestions
- **Error Detection**: Real-time syntax validation
- **Code Formatting**: Automatic indentation and spacing
- **Keyboard Shortcuts**: Professional editor shortcuts

#### Debug Panels (Right)
- **Variables Panel**: Real-time variable state monitoring
- **Performance Panel**: FPS and memory usage tracking
- **Achievements Panel**: Achievement definitions and tracking
- **Error Panel**: Detailed error reporting with line numbers

## Editor Features

### Monaco Editor Integration
The IDE uses Monaco Editor (same as VS Code) for professional-grade editing:

#### Syntax Highlighting
- **Keywords**: `scene`, `set`, `if`, `choice`, `macro`
- **Strings**: Quoted text values
- **Variables**: `{variable_name}` interpolation
- **Comments**: `#` for single-line comments
- **Operators**: Mathematical and logical operators

#### Auto-complete
- **Scene Suggestions**: Available scene IDs
- **Variable Suggestions**: Defined variables
- **Keyword Completion**: COSLANG syntax keywords
- **Function Suggestions**: Available macros and functions

#### Error Detection
- **Syntax Errors**: Real-time parsing validation
- **Scene References**: Missing scene target detection
- **Variable Issues**: Undefined variable warnings
- **Logic Errors**: Conditional statement validation

### Keyboard Shortcuts
- `Ctrl+S`: Save story
- `Ctrl+F`: Find in editor
- `Ctrl+H`: Replace text
- `Ctrl+/`: Toggle comment
- `Ctrl+Z`: Undo
- `Ctrl+Y`: Redo
- `F12`: Open developer tools

## Debug Tools

### Variable Inspector
Monitor all story variables in real-time:
- **Global Variables**: User-defined variables
- **Stats**: Numeric game state (health, gold, etc.)
- **Inventory**: Item collections with quantities
- **Events**: Triggered events and their data
- **Achievements**: Unlocked achievements

### Performance Monitor
Track IDE and story performance:
- **FPS Counter**: Real-time frames per second
- **Memory Usage**: Current memory consumption
- **Load Times**: Scene loading performance
- **Render Times**: UI update performance

### Error Panel
Comprehensive error reporting:
- **Syntax Errors**: Line-by-line error details
- **Scene Errors**: Missing or invalid scene references
- **Variable Errors**: Undefined variable warnings
- **Logic Errors**: Conditional statement issues
- **Suggestions**: Automatic fix suggestions

### Debug Console
Execution logging and debugging:
- **Scene Transitions**: Track scene navigation
- **Variable Changes**: Monitor variable updates
- **Choice Selections**: Track player choices
- **Error Logs**: Detailed error information
- **Performance Logs**: Performance metrics

### Engine Diagnostics
Additional engine-level checks are surfaced in the IDE using `js/cosmosx-engine/utils/engine-diagnostics.js`.
- **Scene Graph Checks**: Cross-references scene targets and flags unreachable or missing scenes.
- **Parser/Engine Hints**: Surfaces structural issues detected during parsing.
- **Display**: Diagnostics are appended into the debug/error panels for review.

## Advanced Features

### Advanced Search
Powerful search and replace functionality:
- **Regex Support**: Advanced pattern matching
- **Case Sensitivity**: Optional case-sensitive search
- **Whole Word**: Match complete words only
- **Replace All**: Batch replace operations
- **Search History**: Previous search queries
- **Highlight Results**: Visual search result highlighting

### Code Formatting
Automatic code beautification:
- **Indentation**: Consistent spacing and indentation
- **Line Breaks**: Proper line break placement
- **Spacing**: Consistent spacing around operators
- **Brace Placement**: Standard brace formatting
- **Customizable**: Configurable formatting options

### Achievement System
Define and manage story achievements:
- **Achievement Definition**: Create achievement objects
- **Trigger Conditions**: Set achievement unlock conditions
- **Point System**: Assign points to achievements
- **Progress Tracking**: Monitor achievement progress
- **Visual Display**: Achievement status indicators

### Event System
Create trigger-based story events:
- **Event Definition**: Define custom events
- **Trigger Conditions**: Set event trigger logic
- **Data Storage**: Store event-related data
- **Event Logging**: Track event occurrences
- **Integration**: Connect events to story logic

### File Operations
Comprehensive file management:
- **Auto-save**: Automatic backup every 30 seconds
- **Local Storage**: Persistent story storage in browser
- **Export Options**: Save as .coslang file
- **File Import**: Drag & drop or file picker
- **Version Control**: Track changes and restore versions

#### Smart Auto-Save Details
Backed by `js/ide-modules/smart-auto-save.js`:
- Saves the current editor content at an interval (default 30s) if changes are detected.
- Stores content and lightweight metadata in `localStorage` (e.g., timestamp, content length).
- Shows in-IDE notifications and status updates when a save occurs.

## Workflow Guide

### Development Workflow
1. **Plan Your Story**: Outline scenes and story flow
2. **Create Scenes**: Write scene content and choices
3. **Add Variables**: Define story state variables
4. **Implement Logic**: Add conditional branching
5. **Test Story**: Use debug tools to validate
6. **Refine Content**: Iterate and improve
7. **Export Story**: Save final .coslang file

### Debugging Workflow
1. **Check Error Panel**: Review any syntax errors
2. **Validate Scenes**: Ensure all scenes are reachable
3. **Test Variables**: Use variable inspector to check state
4. **Monitor Performance**: Check performance panel
5. **Test Choices**: Verify all choice targets work
6. **Check Logic**: Validate conditional statements

### Testing Workflow
1. **Syntax Check**: Ensure no syntax errors
2. **Scene Navigation**: Test all scene transitions
3. **Variable Testing**: Verify variable updates
4. **Choice Testing**: Test all player choices
5. **Logic Testing**: Validate conditional branches
6. **Performance Testing**: Check loading times

### Live Preview
Use the modern preview system wired by `js/ide-core-enhanced.js` with `js/ide-modules/live-preview-modern.js`:
- **Start Preview**: Use the UI's Preview tab action (wired via `CosmosXIDE.startPreview()`).
- **Real-time Updates**: Edits can be reflected during a session via the live preview flow.
- **Panels**: Preview surfaces current text, choices, and simple side-panels for stats/inventory/log per the preview UI.

## Troubleshooting

### Common Issues

**Editor Not Loading**
```
Error: Monaco Editor failed to load
```
*Solution*: Check internet connection for CDN resources.

**Scene Panel Empty**
```
No scenes detected in story
```
*Solution*: Ensure story has valid scene definitions.

**Syntax Errors Not Showing**
```
Errors not appearing in error panel
```
*Solution*: Check if error panel is expanded and visible.

**Auto-save Not Working**
```
Story not saving automatically
```
*Solution*: Check browser local storage permissions.

### Performance Issues

**Slow Editor Response**
- Reduce story size or break into chapters
- Close unnecessary browser tabs
- Check available system memory

**High Memory Usage**
- Monitor performance panel
- Restart browser if needed
- Consider story optimization

**Slow Scene Loading**
- Optimize scene content
- Reduce complex conditionals
- Check for infinite loops

### Debug Tips
- Use the error panel to identify issues quickly
- Test your story frequently during development
- Use the variable inspector to track state changes
- Monitor performance metrics for optimization
- Export and test in the player regularly

### Browser Compatibility
- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Limited support (desktop recommended)

## Version History

### v2.9.0
- Complete CSS cleanup and optimization
- Enhanced Monaco editor integration
- Improved error detection and reporting
- Better performance monitoring
- Comprehensive documentation update

### v2.8.3
- Advanced search and replace functionality
- Code formatting improvements
- Achievement system integration
- Event system implementation
- Enhanced debug tools

### v2.8.0
- Monaco editor integration
- Real-time syntax validation
- Scene management improvements
- Variable inspector enhancements
- Performance monitoring tools

---

For more detailed information, visit the [COSLANG Documentation](../COSLANG/README.md) or explore the [Player Documentation](../PLAYER/README.md). 