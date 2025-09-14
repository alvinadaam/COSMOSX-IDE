# COSMOSX: Interactive Storytelling Ecosystem

Welcome to COSMOSX — a modern, open-source platform for creating, editing, and playing interactive stories using the COSLANG scripting language.

---

## 🌌 What is COSMOSX?
COSMOSX is a complete ecosystem for interactive fiction, combining:
- **COSMOSX IDE**: A powerful, user-friendly editor for writing and testing stories
- **COSLANG**: A simple, readable scripting language for branching narratives
- **COSMOSX Player**: A beautiful, responsive player for experiencing stories

Whether you’re a writer, developer, or player, COSMOSX makes interactive storytelling accessible and fun.

---

## 📁 Repository Structure

```
COSMOSX IDE/
├── css/                # Main stylesheets for IDE and modules
├── js/                 # IDE logic, engine, modules, and utilities
│   └── cosmosx-engine/ # Core Coslang engine and UI components
├── player/             # Standalone story player (UI, scripts, styles)
├── docs/               # Documentation and learn pages
│   ├── COSLANG/        # Coslang language docs & learn page
│   ├── COSMOSX/        # IDE docs & learn page
│   └── PLAYER/         # Player docs & learn page
├── assets/             # Images, audio, and other assets
└── README.md           # This file
```

---

## 🚀 Quick Start

### 1. Launch the IDE
- Open `index.html` in your browser
- Start writing your story in Coslang
- Use the scene panel, autocomplete, and debug tools
- Save or export your `.coslang` file when ready

### 2. Play a Story
- Open `player/index.html` in your browser
- Drag & drop a `.coslang` file or use the load button
- Make choices, track your progress, and enjoy the story!

---

## 🧩 Core Concepts

### Coslang Language
- Human-readable scripting for interactive fiction
- Scene-based structure, variables, choices, and logic
- Supports macros, achievements, inventory, and more

### Workflow
1. **Write** your story in the IDE using Coslang
2. **Test** and debug with built-in tools
3. **Export** your `.coslang` file
4. **Play** your story in the Player or share with others

### Story Structure
- **Metadata**: Title, author, version
- **Scenes**: Each with unique ID and content
- **Choices**: Branching paths for player decisions
- **Variables**: Track state, stats, and inventory

---

## ✨ Feature Highlights

- **Modern IDE**: Monaco editor, syntax highlighting, autocomplete, error panel, scene management
- **Powerful Player**: Responsive UI, save/load, achievements, inventory, mobile support
- **Rich Language**: Easy branching, variables, macros, events, and more
- **Documentation**: Beautiful learn pages for Coslang, IDE, and Player

---

## 📚 Documentation

- [COSLANG Language Guide](docs/COSLANG/README.md)
- [COSMOSX IDE Guide](docs/COSMOSX/README.md)
- [COSMOSX Player Guide](docs/PLAYER/README.md)
- [Engine Developer Guide](docs/ENGINE/README.md)

### Related Tools (high-level)
- BigDebugger: Experimental UI shell for future deep-dive debugging views. Not part of the main IDE/Player workflow yet.
- COSAI: A separate experimental assistant UI. Not required for writing or playing COSLANG stories.

---

## 🤝 Contributing

We welcome contributions! To report bugs, suggest features, or submit pull requests:
- Open an issue or PR on GitHub
- Follow the code style and documentation guidelines
- Be kind and constructive — this is a creative community!

---

## 📝 License

This project is open source under the MIT License.

---

**Made with ❤️ for interactive storytellers everywhere.** 