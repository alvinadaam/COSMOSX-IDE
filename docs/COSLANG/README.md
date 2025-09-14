# COSLANG Language Reference

## Overview

COSLANG is a simple, human-readable scripting language designed specifically for creating interactive stories and games in the CosmosX ecosystem. It provides an intuitive syntax that allows both writers and developers to create complex branching narratives with ease.

## Table of Contents

- [Language Features](#language-features)
- [Quick Start](#quick-start)
- [Syntax Reference](#syntax-reference)
- [Advanced Features](#advanced-features)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Language Features

### Core Capabilities
- **Scene-based storytelling** with unique scene IDs
- **Variable system** with global state persistence
- **Conditional logic** for branching story paths
- **Choice navigation** with target scene linking
- **Variable interpolation** in text content
- **Mathematical expressions** and operations
- **Macro system** for reusable functions
- **Achievement tracking** and unlockable goals
- **Event system** for trigger-based actions
- **Inventory management** with item collections
- **Tags** for logging, achievements, and metadata
- **Assets** (images, audio, video) for multimedia stories

### Data Types
- **Strings**: Text values with interpolation support
- **Numbers**: Integer and floating-point values
- **Booleans**: True/false values for logic
- **Expressions**: Mathematical and logical operations

## Quick Start

### Basic Story Structure
```coslang
# --- Metadata ---
title: "The Lost Artifact"
author: "Jane Doe"
version: "1.0"

# --- Assets Block ---
assets {
  image logo = "logo.png"
  audio introMusic = "intro.mp3"
}

# --- Start Scene ---
scene start {
  # Scene-level variables
  vars {
    playerHealth = 10
    artifactFound = false
  }

  # Show the logo and play intro music
  show image logo
  play audio introMusic

  # Main intro text with variable interpolation
  text: "Welcome, adventurer! Your health is {playerHealth}."

  # Present choices to the player
  choice "Search the ruins" -> ruins
  choice "Return to camp" -> camp
}

# --- Ruins Scene ---
scene ruins {
  text: "You enter the ancient ruins. It's dark and cold."

  # Use an if block to branch based on artifactFound
  if artifactFound == false {
    text: "You spot a mysterious artifact on a pedestal."
    set artifactFound = true
    text: "You carefully take the artifact. [ACHIEVEMENT:Found Artifact]"
    # Tag will log achievement
  } else {
    text: "The pedestal is empty. You've already taken the artifact."
  }

  # Health check with macro usage
  set playerHealth = min(playerHealth, 10) # Clamp health to max 10

  # Choices
  choice "Leave the ruins" -> camp
}

# --- Camp Scene ---
scene camp {
  text: "You return to camp, tired but safe."

  # If the artifact was found, show a special message
  if artifactFound == true {
    text: "You show the artifact to your companions. They cheer!"
  } else {
    text: "You rest by the fire, wondering what you missed in the ruins."
  }

  # End of demo
  text: "THE END"
}

# --- Macro Example ---
macro min(a, b) {
  # Returns the minimum of two values
  set result = (a < b) ? a : b
  text: "Minimum value is {result}"
}
```

### Key Concepts
1. **Metadata**: Story information at the top
2. **Assets**: Images, audio, and video for multimedia
3. **Scenes**: Story sections with unique IDs
4. **Content**: Text, variables, and choices within scenes
5. **Logic**: Conditional blocks for branching
6. **Macros**: Reusable logic blocks
7. **Tags**: Inline metadata for logging, achievements, and more

## Syntax Reference

### Story Metadata
```coslang
# Story metadata at the top
title: "Story Title"
author: "Author Name"
version: "1.0.0"
```

### Asset Block
```coslang
assets {
  image logo = "logo.png"
  audio introMusic = "intro.mp3"
}
```

### Scene Definition
```coslang
scene scene_id {
  # Scene content here
  text: "Scene narrative text"
  set variable = value
  if condition {
    text: "Conditional text"
    choice "Choice text" -> target_scene
  }
  choice "Choice text" -> target_scene
}
```

### Variable Assignment
```coslang
set player_name = "Hero"
set health = 100
set gold = gold + 10
set has_key = true
```

### Conditional Logic
```coslang
if health > 50 {
  text: "You're healthy!"
  choice "Continue" -> next_scene
} else {
  text: "You need to rest."
  choice "Rest" -> rest_scene
}
```

### Choice Navigation
```coslang
choice "Enter the cave" -> cave_scene
choice "Return to town" -> town_scene
choice "Fight the dragon" -> combat_scene
```

### Variable Interpolation
```coslang
text: "Welcome, {player_name}! You have {health} health and {gold} gold."
text: "Current Status: Health {health}, Gold {gold}, Has Key: {has_key}"
```

### Tags
```coslang
text: "You found a secret! [LOG:Found secret room]"
choice "Take the sword" -> next_scene [ACHIEVEMENT:First Sword]
```

Supported special tags (consumed by the engine/UI):
- `LOG:<message>` — Append a message to the runtime log.
- `ACHIEVEMENT:<name>` — Unlock an achievement named `<name>`.
- `EVENT:<name>` — Mark an event named `<name>` as triggered.
- `inventory ++ <item>` — Increment `<item>` quantity in inventory.
- `inventory -- <item>` — Decrement `<item>` quantity in inventory (not below 0).
- `RESET` — Player-only helper tag for choices. If present on a choice (e.g., `choice "Restart" -> start [RESET]`), the Player performs a true game restart and jumps to the target scene.

## Advanced Features

### Macros
```coslang
# Define a macro with arguments
macro heal(target, amount) {
  set {target}_health = {target}_health + {amount}
  text: "Healed {target} for {amount} points!"
}

# Call a macro in a set statement
set playerHealth = min(playerHealth, 10)
```

### Achievements
```coslang
# Unlock achievements with tags
choice "Find the artifact" -> artifact_scene [ACHIEVEMENT:Found Artifact]
```

### Events
```coslang
# Trigger events with tags
choice "Trigger alarm" -> alert_scene [EVENT:AlarmTriggered]
```

### Inventory System
```coslang
# Add or remove items with tags
choice "Pick up sword" -> next_scene [inventory ++ sword]
choice "Drop sword" -> next_scene [inventory -- sword]

# Check inventory in logic
if sword > 0 {
  text: "You wield your sword."
}
```

## Examples

### Complete Story Example
```coslang
# --- Metadata ---
title: "The Lost Artifact"
author: "Jane Doe"
version: "1.0"

# --- Assets Block ---
assets {
  image logo = "logo.png"
  audio introMusic = "intro.mp3"
}

# --- Start Scene ---
scene start {
  # Scene-level variables
  vars {
    playerHealth = 10
    artifactFound = false
  }

  # Show the logo and play intro music
  show image logo
  play audio introMusic

  # Main intro text with variable interpolation
  text: "Welcome, adventurer! Your health is {playerHealth}."

  # Present choices to the player
  choice "Search the ruins" -> ruins
  choice "Return to camp" -> camp
}

# --- Ruins Scene ---
scene ruins {
  text: "You enter the ancient ruins. It's dark and cold."

  # Use an if block to branch based on artifactFound
  if artifactFound == false {
    text: "You spot a mysterious artifact on a pedestal."
    set artifactFound = true
    text: "You carefully take the artifact. [ACHIEVEMENT:Found Artifact]"
    # Tag will log achievement
  } else {
    text: "The pedestal is empty. You've already taken the artifact."
  }

  # Health check with macro usage
  set playerHealth = min(playerHealth, 10) # Clamp health to max 10

  # Choices
  choice "Leave the ruins" -> camp
}

# --- Camp Scene ---
scene camp {
  text: "You return to camp, tired but safe."

  # If the artifact was found, show a special message
  if artifactFound == true {
    text: "You show the artifact to your companions. They cheer!"
  } else {
    text: "You rest by the fire, wondering what you missed in the ruins."
  }

  # End of demo
  text: "THE END"
}

# --- Macro Example ---
macro min(a, b) {
  # Returns the minimum of two values
  set result = (a < b) ? a : b
  text: "Minimum value is {result}"
}
```

## Best Practices

### Story Structure
- Use descriptive scene IDs (e.g., `town_square`, `cave_entrance`)
- Always include at least one choice in each scene
- Test your story flow to ensure all scenes are reachable
- Use variable interpolation to make text dynamic

### Variable Management
- Initialize important variables early in your story
- Use meaningful variable names (e.g., `player_health` instead of `h`)
- Group related variables together
- Use expressions for dynamic calculations

### Performance Tips
- Keep scene content concise for better loading
- Use macros for repeated logic
- Minimize complex conditional nesting
- Test with various variable states

### Code Organization
- Group related scenes together
- Use consistent indentation and formatting
- Add comments for complex logic
- Maintain a clear story flow

## Troubleshooting

### Common Issues

**Scene Not Found Error**
```
Error: Scene 'missing_scene' not found
```
*Solution*: Ensure all choice targets point to existing scenes.

**Variable Interpolation Issue**
```
Text: "Hello {undefined_variable}!"
```
*Solution*: Initialize variables before using them in text.

**Syntax Error in Conditional**
```
if health > 50 {  # Missing closing brace
```
*Solution*: Check for matching braces and proper syntax.

### Debug Tips
- Use the IDE's error panel to identify issues
- Test your story in the player frequently
- Check variable values in the debug panel
- Validate scene connections before publishing

### Performance Issues
- Large stories may load slowly - consider breaking into chapters
- Complex conditionals can impact performance
- Monitor memory usage with many variables

## Version History

### v1.0.0
- Initial language specification
- Basic scene and choice system
- Variable support with interpolation
- Conditional logic implementation

### v1.1.0
- Added macro system
- Achievement tracking
- Event system
- Enhanced error handling

### v1.2.0
- Inventory management
- Improved performance
- Better debugging tools
- Enhanced documentation

---

For more detailed information, visit the [COSLANG Learn Page](learn.html) or explore the [IDE Documentation](../COSMOSX/README.md). 