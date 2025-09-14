// Theme Manager Module
// Provides multiple themes, custom theme creation, and theme switching

export class ThemeManager {
    constructor(ide) {
        this.ide = ide;
        this.currentTheme = 'cosmosx-dark';
        this.customThemes = new Map();
        this.availableThemes = this.getAvailableThemes();
        this.init();
    }

    // Initialize theme manager
    init() {
        this.loadSavedTheme();
        this.applyTheme(this.currentTheme);
        this.setupThemeSwitcher();
    }

    // Get available themes
    getAvailableThemes() {
        return {
            'cosmosx-dark': {
                name: 'CosmosX Dark',
                description: 'Default dark theme optimized for storytelling',
                colors: {
                    '--primary-bg': '#0d1117',
                    '--secondary-bg': '#161b22',
                    '--tertiary-bg': '#21262d',
                    '--primary-text': '#e6edf3',
                    '--secondary-text': '#8b949e',
                    '--accent-color': '#4dabf7',
                    '--success-color': '#3fb950',
                    '--warning-color': '#d29922',
                    '--error-color': '#f85149',
                    '--border-color': '#30363d',
                    '--highlight-bg': '#1f6feb',
                    '--selection-bg': '#1f6feb40'
                }
            },
            'cosmosx-light': {
                name: 'CosmosX Light',
                description: 'Clean light theme for daytime coding',
                colors: {
                    '--primary-bg': '#ffffff',
                    '--secondary-bg': '#f6f8fa',
                    '--tertiary-bg': '#e1e4e8',
                    '--primary-text': '#24292e',
                    '--secondary-text': '#586069',
                    '--accent-color': '#0366d6',
                    '--success-color': '#28a745',
                    '--warning-color': '#f6a434',
                    '--error-color': '#d73a49',
                    '--border-color': '#e1e4e8',
                    '--highlight-bg': '#0366d6',
                    '--selection-bg': '#0366d620'
                }
            },
            'cosmosx-purple': {
                name: 'CosmosX Purple',
                description: 'Elegant purple theme for creative writing',
                colors: {
                    '--primary-bg': '#1a1a2e',
                    '--secondary-bg': '#16213e',
                    '--tertiary-bg': '#0f3460',
                    '--primary-text': '#e94560',
                    '--secondary-text': '#a8a8a8',
                    '--accent-color': '#e94560',
                    '--success-color': '#00d4aa',
                    '--warning-color': '#ffd700',
                    '--error-color': '#ff4757',
                    '--border-color': '#2d3748',
                    '--highlight-bg': '#e94560',
                    '--selection-bg': '#e9456040'
                }
            },
            'cosmosx-green': {
                name: 'CosmosX Green',
                description: 'Nature-inspired green theme',
                colors: {
                    '--primary-bg': '#0a0f0a',
                    '--secondary-bg': '#1a1f1a',
                    '--tertiary-bg': '#2a2f2a',
                    '--primary-text': '#a8e6cf',
                    '--secondary-text': '#7a9e7a',
                    '--accent-color': '#4ade80',
                    '--success-color': '#22c55e',
                    '--warning-color': '#eab308',
                    '--error-color': '#ef4444',
                    '--border-color': '#374151',
                    '--highlight-bg': '#4ade80',
                    '--selection-bg': '#4ade8040'
                }
            },
            'cosmosx-blue': {
                name: 'CosmosX Blue',
                description: 'Ocean-inspired blue theme',
                colors: {
                    '--primary-bg': '#0f172a',
                    '--secondary-bg': '#1e293b',
                    '--tertiary-bg': '#334155',
                    '--primary-text': '#e2e8f0',
                    '--secondary-text': '#94a3b8',
                    '--accent-color': '#3b82f6',
                    '--success-color': '#10b981',
                    '--warning-color': '#f59e0b',
                    '--error-color': '#ef4444',
                    '--border-color': '#475569',
                    '--highlight-bg': '#3b82f6',
                    '--selection-bg': '#3b82f640'
                }
            }
        };
    }

    // Setup theme switcher
    setupThemeSwitcher() {
        this.createThemeSwitcher();
        this.setupKeyboardShortcuts();
    }

    // Create theme switcher UI
    createThemeSwitcher() {
        const switcher = document.createElement('div');
        switcher.id = 'theme-switcher';
        switcher.className = 'theme-switcher';
        switcher.innerHTML = `
            <div class="theme-switcher-header">
                <h3><i class="fas fa-palette"></i> Themes</h3>
                <button class="close-btn" id="close-theme-switcher">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="theme-grid" id="theme-grid">
                ${this.generateThemeGrid()}
            </div>
            
            <div class="theme-actions">
                <button id="create-theme-btn" class="btn">
                    <i class="fas fa-plus"></i> Create Custom Theme
                </button>
                <button id="export-theme-btn" class="btn">
                    <i class="fas fa-download"></i> Export Theme
                </button>
                <button id="import-theme-btn" class="btn">
                    <i class="fas fa-upload"></i> Import Theme
                </button>
            </div>
        `;

        document.body.appendChild(switcher);
        this.setupThemeSwitcherEvents();
    }

    // Generate theme grid
    generateThemeGrid() {
        return Object.entries(this.availableThemes).map(([id, theme]) => `
            <div class="theme-card ${id === this.currentTheme ? 'active' : ''}" data-theme="${id}">
                <div class="theme-preview" style="background: ${theme.colors['--primary-bg']}; border: 2px solid ${theme.colors['--border-color']};">
                    <div class="preview-header" style="background: ${theme.colors['--secondary-bg']}; color: ${theme.colors['--primary-text']};">
                        <div class="preview-dot" style="background: ${theme.colors['--accent-color']};"></div>
                        <div class="preview-dot" style="background: ${theme.colors['--success-color']};"></div>
                        <div class="preview-dot" style="background: ${theme.colors['--warning-color']};"></div>
                    </div>
                    <div class="preview-content" style="color: ${theme.colors['--secondary-text']};">
                        <div class="preview-line"></div>
                        <div class="preview-line" style="width: 80%;"></div>
                        <div class="preview-line" style="width: 60%;"></div>
                    </div>
                </div>
                <div class="theme-info">
                    <h4>${theme.name}</h4>
                    <p>${theme.description}</p>
                </div>
            </div>
        `).join('');
    }

    // Setup theme switcher events
    setupThemeSwitcherEvents() {
        // Theme card clicks
        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const themeId = card.dataset.theme;
                this.switchTheme(themeId);
            });
        });

        // Action buttons
        document.getElementById('create-theme-btn').addEventListener('click', () => {
            this.showThemeCreator();
        });

        document.getElementById('export-theme-btn').addEventListener('click', () => {
            this.exportCurrentTheme();
        });

        document.getElementById('import-theme-btn').addEventListener('click', () => {
            this.importTheme();
        });

        document.getElementById('close-theme-switcher').addEventListener('click', () => {
            this.hideThemeSwitcher();
        });
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+T to open theme switcher
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                this.showThemeSwitcher();
            }
        });
    }

    // Show theme switcher
    showThemeSwitcher() {
        const switcher = document.getElementById('theme-switcher');
        switcher.style.display = 'block';
        this.updateThemeGrid();
    }

    // Hide theme switcher
    hideThemeSwitcher() {
        const switcher = document.getElementById('theme-switcher');
        switcher.style.display = 'none';
    }

    // Update theme grid
    updateThemeGrid() {
        const grid = document.getElementById('theme-grid');
        grid.innerHTML = this.generateThemeGrid();
        
        // Reattach event listeners
        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const themeId = card.dataset.theme;
                this.switchTheme(themeId);
            });
        });
    }

    // Switch theme
    switchTheme(themeId) {
        if (this.availableThemes[themeId]) {
            this.currentTheme = themeId;
            this.applyTheme(themeId);
            this.saveTheme();
            this.updateThemeGrid();
            this.ide.uiManager.showNotification(`Theme switched to ${this.availableThemes[themeId].name}`, 'success');
        }
    }

    // Apply theme
    applyTheme(themeId) {
        const theme = this.availableThemes[themeId];
        if (!theme) return;

        const root = document.documentElement;
        
        // Apply CSS variables
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Apply Monaco editor theme
        if (window.monaco) {
            this.applyMonacoTheme(themeId);
        }

        // Update UI elements
        this.updateUIElements(theme);
    }

    // Apply Monaco editor theme
    applyMonacoTheme(themeId) {
        const theme = this.availableThemes[themeId];
        if (!theme) return;

        const monacoTheme = {
            base: themeId.includes('light') ? 'vs' : 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: theme.colors['--accent-color'] },
                { token: 'string', foreground: theme.colors['--success-color'] },
                { token: 'comment', foreground: theme.colors['--secondary-text'] },
                { token: 'variable', foreground: theme.colors['--primary-text'] },
                { token: 'number', foreground: theme.colors['--warning-color'] }
            ],
            colors: {
                'editor.background': theme.colors['--primary-bg'],
                'editor.foreground': theme.colors['--primary-text'],
                'editor.lineHighlightBackground': theme.colors['--secondary-bg'],
                'editor.selectionBackground': theme.colors['--selection-bg'],
                'editor.inactiveSelectionBackground': theme.colors['--selection-bg'] + '40',
                'editor.findMatchBackground': theme.colors['--highlight-bg'] + '40',
                'editor.findMatchHighlightBackground': theme.colors['--highlight-bg'] + '20',
                'editorCursor.foreground': theme.colors['--accent-color'],
                'editorWhitespace.foreground': theme.colors['--secondary-text'] + '40',
                'editorIndentGuide.background': theme.colors['--border-color'],
                'editorIndentGuide.activeBackground': theme.colors['--accent-color'],
                'sideBar.background': theme.colors['--secondary-bg'],
                'sideBar.foreground': theme.colors['--primary-text'],
                'sideBarTitle.foreground': theme.colors['--accent-color'],
                'statusBar.background': theme.colors['--tertiary-bg'],
                'statusBar.foreground': theme.colors['--primary-text'],
                'titleBar.activeBackground': theme.colors['--secondary-bg'],
                'titleBar.activeForeground': theme.colors['--primary-text']
            }
        };

        monaco.editor.defineTheme(`cosmosx-${themeId}`, monacoTheme);
        monaco.editor.setTheme(`cosmosx-${themeId}`);
    }

    // Update UI elements
    updateUIElements(theme) {
        // Update scrollbars
        if (this.ide.scrollbarSystem) {
            this.ide.scrollbarSystem.updateTheme(theme);
        }

        // Update panels
        const panels = document.querySelectorAll('.panel, .sidebar, .right-sidebar');
        panels.forEach(panel => {
            panel.style.backgroundColor = theme.colors['--secondary-bg'];
            panel.style.color = theme.colors['--primary-text'];
        });

        // Update buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            if (!button.classList.contains('primary')) {
                button.style.backgroundColor = theme.colors['--tertiary-bg'];
                button.style.color = theme.colors['--primary-text'];
                button.style.borderColor = theme.colors['--border-color'];
            }
        });
    }

    // Show theme creator
    showThemeCreator() {
        const creator = document.createElement('div');
        creator.id = 'theme-creator';
        creator.className = 'theme-creator';
        creator.innerHTML = `
            <div class="creator-header">
                <h3><i class="fas fa-palette"></i> Create Custom Theme</h3>
                <button class="close-btn" id="close-theme-creator">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="creator-content">
                <div class="theme-form">
                    <div class="form-group">
                        <label>Theme Name</label>
                        <input type="text" id="theme-name" placeholder="My Custom Theme">
                    </div>
                    
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" id="theme-description" placeholder="A custom theme for my stories">
                    </div>
                    
                    <div class="color-grid">
                        <div class="color-item">
                            <label>Primary Background</label>
                            <input type="color" id="primary-bg" value="#0d1117">
                        </div>
                        <div class="color-item">
                            <label>Secondary Background</label>
                            <input type="color" id="secondary-bg" value="#161b22">
                        </div>
                        <div class="color-item">
                            <label>Primary Text</label>
                            <input type="color" id="primary-text" value="#e6edf3">
                        </div>
                        <div class="color-item">
                            <label>Accent Color</label>
                            <input type="color" id="accent-color" value="#4dabf7">
                        </div>
                        <div class="color-item">
                            <label>Success Color</label>
                            <input type="color" id="success-color" value="#3fb950">
                        </div>
                        <div class="color-item">
                            <label>Warning Color</label>
                            <input type="color" id="warning-color" value="#d29922">
                        </div>
                        <div class="color-item">
                            <label>Error Color</label>
                            <input type="color" id="error-color" value="#f85149">
                        </div>
                        <div class="color-item">
                            <label>Border Color</label>
                            <input type="color" id="border-color" value="#30363d">
                        </div>
                    </div>
                </div>
                
                <div class="theme-preview">
                    <h4>Preview</h4>
                    <div id="theme-preview" class="preview-container">
                        <!-- Preview will be updated dynamically -->
                    </div>
                </div>
            </div>
            
            <div class="creator-actions">
                <button id="save-theme-btn" class="btn primary">Save Theme</button>
                <button id="cancel-theme-btn" class="btn">Cancel</button>
            </div>
        `;

        document.body.appendChild(creator);
        this.setupThemeCreatorEvents();
        this.updateThemePreview();
    }

    // Setup theme creator events
    setupThemeCreatorEvents() {
        document.getElementById('close-theme-creator').addEventListener('click', () => {
            this.hideThemeCreator();
        });

        document.getElementById('cancel-theme-btn').addEventListener('click', () => {
            this.hideThemeCreator();
        });

        document.getElementById('save-theme-btn').addEventListener('click', () => {
            this.saveCustomTheme();
        });

        // Color input changes
        document.querySelectorAll('#theme-creator input[type="color"]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateThemePreview();
            });
        });
    }

    // Update theme preview
    updateThemePreview() {
        const preview = document.getElementById('theme-preview');
        const colors = this.getThemeCreatorColors();
        
        preview.innerHTML = `
            <div class="preview-editor" style="background: ${colors['--primary-bg']}; color: ${colors['--primary-text']};">
                <div class="preview-header" style="background: ${colors['--secondary-bg']}; border-bottom: 1px solid ${colors['--border-color']};">
                    <span style="color: ${colors['--accent-color']};">●</span>
                    <span style="color: ${colors['--success-color']};">●</span>
                    <span style="color: ${colors['--warning-color']};">●</span>
                </div>
                <div class="preview-content">
                    <div style="color: ${colors['--primary-text']};">scene start {</div>
                    <div style="color: ${colors['--secondary-text']};">&nbsp;&nbsp;text: "Hello, world!"</div>
                    <div style="color: ${colors['--accent-color']};">&nbsp;&nbsp;choice "Continue" -> next</div>
                    <div style="color: ${colors['--primary-text']};">}</div>
                </div>
            </div>
        `;
    }

    // Get theme creator colors
    getThemeCreatorColors() {
        return {
            '--primary-bg': document.getElementById('primary-bg').value,
            '--secondary-bg': document.getElementById('secondary-bg').value,
            '--primary-text': document.getElementById('primary-text').value,
            '--accent-color': document.getElementById('accent-color').value,
            '--success-color': document.getElementById('success-color').value,
            '--warning-color': document.getElementById('warning-color').value,
            '--error-color': document.getElementById('error-color').value,
            '--border-color': document.getElementById('border-color').value
        };
    }

    // Save custom theme
    saveCustomTheme() {
        const name = document.getElementById('theme-name').value;
        const description = document.getElementById('theme-description').value;
        
        if (!name.trim()) {
            this.ide.uiManager.showNotification('Please enter a theme name', 'error');
            return;
        }

        const themeId = `custom-${Date.now()}`;
        const colors = this.getThemeCreatorColors();
        
        const customTheme = {
            name: name,
            description: description,
            colors: {
                ...colors,
                '--tertiary-bg': this.adjustColor(colors['--secondary-bg'], -20),
                '--secondary-text': this.adjustColor(colors['--primary-text'], -40),
                '--highlight-bg': colors['--accent-color'],
                '--selection-bg': colors['--accent-color'] + '40'
            }
        };

        this.availableThemes[themeId] = customTheme;
        this.customThemes.set(themeId, customTheme);
        this.saveCustomThemes();
        
        this.switchTheme(themeId);
        this.hideThemeCreator();
        this.ide.uiManager.showNotification(`Theme "${name}" saved successfully`, 'success');
    }

    // Adjust color brightness
    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Hide theme creator
    hideThemeCreator() {
        const creator = document.getElementById('theme-creator');
        if (creator) {
            creator.remove();
        }
    }

    // Export current theme
    exportCurrentTheme() {
        const theme = this.availableThemes[this.currentTheme];
        if (!theme) return;

        const themeData = {
            id: this.currentTheme,
            ...theme
        };

        const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentTheme}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import theme
    importTheme() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const themeData = JSON.parse(e.target.result);
                        this.availableThemes[themeData.id] = {
                            name: themeData.name,
                            description: themeData.description,
                            colors: themeData.colors
                        };
                        this.customThemes.set(themeData.id, themeData);
                        this.saveCustomThemes();
                        this.updateThemeGrid();
                        this.ide.uiManager.showNotification(`Theme "${themeData.name}" imported successfully`, 'success');
                    } catch (error) {
                        this.ide.uiManager.showNotification('Invalid theme file', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    // Save theme preference
    saveTheme() {
        localStorage.setItem('cosmosx-theme', this.currentTheme);
    }

    // Load saved theme
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('cosmosx-theme');
        if (savedTheme && this.availableThemes[savedTheme]) {
            this.currentTheme = savedTheme;
        }
    }

    // Save custom themes
    saveCustomThemes() {
        const customThemesData = {};
        this.customThemes.forEach((theme, id) => {
            customThemesData[id] = theme;
        });
        localStorage.setItem('cosmosx-custom-themes', JSON.stringify(customThemesData));
    }

    // Load custom themes
    loadCustomThemes() {
        const saved = localStorage.getItem('cosmosx-custom-themes');
        if (saved) {
            try {
                const customThemesData = JSON.parse(saved);
                Object.entries(customThemesData).forEach(([id, theme]) => {
                    this.availableThemes[id] = theme;
                    this.customThemes.set(id, theme);
                });
            } catch (error) {
                console.warn('Failed to load custom themes:', error);
            }
        }
    }
}

// Export to global scope
window.ThemeManager = ThemeManager; 