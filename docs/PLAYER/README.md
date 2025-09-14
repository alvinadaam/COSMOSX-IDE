## DOM Containers

The Player renders into specific DOM containers defined in `player/index.html` and used by `player/scripts/corePlayer.js`:

- `#welcome-screen` — Default landing view before a story is loaded.
- `#story-content` — The main content wrapper toggled when a story is loaded.
- `#story-root` — Story text blocks (paragraphs) are appended here.
- `#choices-root` — Choice buttons are created and appended here.
- `#stats-root` — Stats panel (key/value cards) is rendered here.
- `#inventory-root` — Inventory panel (items and counts) is rendered here.
- `#achievements-root` — Unlocked achievements are listed here.
- `#events-root` — Triggered events are listed here.
- `#log-root` — Story log entries (including achievements) are listed here.
- `#dice-root` — Reserved for dice/rolls UI (not active by default).

# COSMOSX Player Documentation

## Overview

COSMOSX Player is an interactive story player designed to render and play COSLANG stories with a beautiful, responsive interface. It provides a seamless experience for experiencing interactive fiction with dynamic content, choice navigation, and state management.

## Table of Contents

- [Player Features](#player-features)
- [Getting Started](#getting-started)
- [Interface Overview](#interface-overview)
- [Story Playback](#story-playback)
- [UI Components](#ui-components)
- [Advanced Features](#advanced-features)

## Player Features

### Core Capabilities
- **Story Rendering** with dynamic text and variable interpolation
- **Choice Navigation** with smooth transitions between scenes
- **State Management** with persistent game progress
- **Responsive Design** optimized for desktop and mobile
- **File Loading** with drag & drop support for .coslang files
- **Save/Load System** for game progress preservation
- **Achievement Display** with unlock notifications
- **Inventory Management** with visual item tracking
- **Stats Display** with real-time updates

### Interactive Elements
- **Dynamic Text**: Variable interpolation in story content
- **Choice Buttons**: Clickable story choices with conditions
- **Progress Tracking**: Visual story progress indicators
- **State Persistence**: Manual save/load via buttons (stored in browser localStorage)
- **Visual Feedback**: Animations and transitions
- **Accessibility**: Keyboard navigation and screen reader support

## Getting Started

### Loading a Story
1. Open `player/index.html` in your web browser
2. Drag and drop a `.coslang` file onto the player
3. Or click "Load Story" to browse for a file
4. Or click "Try Demo Story" to load a built-in sample
5. The story will automatically start from the first scene

### Player Controls
- **Choice Buttons**: Click to make story decisions
- **Save Button**: Save current game progress
- **Load Button**: Restore previous game progress
- **Open (Load File) Button**: Open a `.coslang` story file
- **Docs Button**: Open COSLANG documentation (F1)

#### Keyboard Shortcuts
- `Ctrl+S` or `Cmd+S`: Save game
- `Ctrl+L` or `Cmd+L`: Load saved game
- `Ctrl+O` or `Cmd+O`: Open story file
- `F1`: Open documentation

### Basic Navigation
```
┌─────────────────────────────────────────┐
│              Story Title                │
├─────────────────────────────────────────┤
│                                         │
│         Story Text Content              │
│                                         │
│  [Choice 1]  [Choice 2]  [Choice 3]    │
│                                         │
├─────────────────────────────────────────┤
│ Stats | Inventory | Save | Load | Menu  │
└─────────────────────────────────────────┘
```

## Interface Overview

### Main Layout
```
┌─────────────────────────────────────────┐
│              Header Bar                 │
│  Title | Controls | Docs | Menu         │
├─────────────────────────────────────────┤
│                                         │
│              Story Content              │
│                                         │
│  • Dynamic text with variables          │
│  • Scene images and media               │
│  • Dialogue and narrative               │
│                                         │
├─────────────────────────────────────────┤
│              Choice Area                │
│  [Choice Button 1]  [Choice Button 2]   │
│                                         │
├─────────────────────────────────────────┤
│              Status Bar                 │
│  Progress | Stats | Inventory | Save    │
└─────────────────────────────────────────┘
```

### Component Descriptions

#### Header Bar
- **Story Title**: Current story name and version
- **Progress Indicator**: Visual story progress
- **Control Buttons**: Load file, save, load, docs
- **Menu Button**: Additional options and settings

#### Story Content Area
- **Dynamic Text**: Story narrative with variable interpolation
- **Scene Images**: Visual content for scenes
- **Dialogue**: Character conversations and interactions
- **Narrative**: Descriptive text and story elements

#### Choice Area
- **Choice Buttons**: Interactive story decisions
- **Conditional Choices**: Choices that appear based on variables
- **Choice Descriptions**: Additional context for choices
- **Choice Tags**: Visual indicators for choice types

#### Status Bar
- **Progress Bar**: Visual story completion indicator
- **Stats Display**: Current character statistics
- **Inventory**: Item collection and management
- **Save Status**: Auto-save indicator

## Story Playback

### Scene Rendering
The player renders scenes by:
1. **Loading Scene**: Parse scene content from COSLANG
2. **Variable Interpolation**: Replace `{variable}` placeholders
3. **Conditional Processing**: Evaluate if/else blocks
4. **Content Display**: Render text, images, and choices
5. **State Update**: Update variables and game state

### Variable Interpolation
Dynamic content updates based on story state:
```coslang
text: "Welcome, {player_name}! You have {health} health and {gold} gold."
```
*Renders as*: "Welcome, Hero! You have 100 health and 50 gold."

### Choice Processing
Interactive choices with conditions:
```coslang
if health > 50 {
    choice "Fight the dragon" -> combat_scene
} else {
    choice "Run away" -> escape_scene
}
```

### State Management
Persistent game state across scenes:
- **Variables**: User-defined story variables
- **Stats**: Numeric game statistics
- **Inventory**: Item collections
- **Achievements**: Unlocked achievements
- **Events**: Triggered story events

## UI Components

### Enhanced Preview System
Professional story presentation:
- **Responsive Layout**: Adapts to different screen sizes
- **Typography**: Optimized fonts and spacing
- **Color Themes**: Consistent visual design
- **Animations**: Smooth transitions and effects

### Scene Container
Organized story content display:
- **Scene Images**: Visual scene representations
- **Text Content**: Formatted story narrative
- **Dialogue System**: Character conversation display
- **Media Support**: Images, audio, and video content

### Choice System
Interactive decision making:
- **Choice Buttons**: Clickable story options
- **Conditional Display**: Choices based on game state
- **Visual Feedback**: Hover and click animations
- **Choice Tags**: Type indicators (combat, dialogue, etc.)

### Stats Panel
Real-time game statistics:
- **Health Display**: Current health with visual bar
- **Resource Tracking**: Gold, experience, etc.
- **Progress Indicators**: Achievement and story progress
- **Status Effects**: Temporary buffs and debuffs

### Inventory Panel
Item management system:
- **Item Display**: Visual item representations
- **Quantity Tracking**: Item counts and limits
- **Item Descriptions**: Detailed item information
- **Usage Interface**: Item interaction options

## Advanced Features

### Save/Load System
Persistent game progress (current implementation):
- **Manual Save/Load**: State is saved and restored from `localStorage` under the key `cosmosx-player-save`
- **Single Save Slot**: One save slot is provided (per browser/profile)
- **Notifications**: In-page notifications confirm save/load actions
Planned enhancements:
- Multiple save slots
- Save metadata (date, progress)
- Optional cloud sync

### Achievement System
Goal tracking and rewards:
- **Achievement Display**: Visual achievement notifications
- **Progress Tracking**: Achievement completion progress
- **Reward System**: Points and unlockables
- **Achievement History**: Completed achievements list

### Event System
Dynamic story triggers:
- **Event Tracking**: Monitor story events
- **Trigger Conditions**: Automatic event activation
- **Event Logging**: Historical event record
- **Event Integration**: Connect events to story logic

### Performance Optimization
Smooth playback experience:
- **Lazy Loading**: Load content as needed
- **Caching**: Cache frequently used content
- **Memory Management**: Efficient memory usage
- **Render Optimization**: Smooth animations and transitions

### Accessibility Features
Inclusive design:
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Screen reader compatibility
- **High Contrast**: High contrast mode support
- **Font Scaling**: Adjustable text size
- **Color Blind Support**: Color blind friendly design

## User Guide

### Playing a Story
1. **Load Story**: Drag & drop or browse for .coslang file
2. **Read Content**: Follow the story narrative
3. **Make Choices**: Click choice buttons to progress
4. **Monitor State**: Check stats and inventory
5. **Save Progress**: Use save button to preserve progress
6. **Continue Later**: Load saved game to continue

### Navigation Tips
- **Choice Selection**: Click any choice button to proceed
- **State Monitoring**: Watch stats panel for updates
- **Progress Tracking**: Use progress bar to see completion
- **Save Frequently**: Save progress regularly
- **Docs**: Press F1 to open the language guide

### Advanced Usage
- **Multiple Playthroughs**: Try different choice paths
- **Achievement Hunting**: Complete all achievements
- **Story Exploration**: Discover all story branches

## Troubleshooting

### Common Issues

**Story Not Loading**
```
Error: Unable to load story file
```
*Solution*: Check file format (.coslang) and file integrity.

**Choices Not Appearing**
```
No choice buttons visible
```
*Solution*: Ensure scene has valid choice definitions.

**Variables Not Updating**
```
Variable values not changing
```
*Solution*: Check variable assignment syntax in story.

**Save Not Working**
```
Progress not saving
```
*Solution*: Check browser storage permissions and space.

### Performance Issues

**Slow Loading**
- Check story file size
- Optimize story content
- Close other browser tabs
- Check internet connection

**Laggy Animations**
- Reduce browser window size
- Disable unnecessary browser extensions
- Check system resources
- Update browser to latest version

**Memory Issues**
- Restart browser periodically
- Clear browser cache
- Monitor memory usage
- Close unused browser tabs

### Browser Compatibility
- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Responsive design support

### File Format Issues
- **Invalid .coslang**: Check file syntax and structure
- **Corrupted File**: Try re-exporting from IDE
- **Encoding Issues**: Ensure UTF-8 encoding
- **Version Mismatch**: Update to compatible story version

## Version History

### v2.9.1
- New welcome screen with quick actions (Load file, Try demo, Docs)
- Keyboard shortcuts: Save (Ctrl/Cmd+S), Load (Ctrl/Cmd+L), Open (Ctrl/Cmd+O), Docs (F1)
- Manual save/load implemented via browser localStorage
- Panels for Stats, Inventory, Achievements, Events, and Log rendering

### v2.9.0
- Complete UI redesign and optimization
- Enhanced save/load system
- Improved performance and responsiveness
- Better accessibility features
- Comprehensive documentation update

### v2.8.3
- Achievement system integration
- Event tracking and logging
- Enhanced choice system
- Improved state management
- Better error handling

### v2.8.0
- Responsive design implementation
- Drag & drop file loading
- Auto-save functionality
- Performance optimizations
- Enhanced UI components

---

For more detailed information, visit the [COSLANG Documentation](../COSLANG/README.md) or explore the [IDE Documentation](../COSMOSX/README.md). 