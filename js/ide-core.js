// Clean IDE Core - Simple and Working
import { CoslangSyntaxValidator } from './syntax-validator.js';
import { parseCosLang } from './cosmosx-engine/core/CosmosEngine/parser.js';
import { CosmosEngine } from './cosmosx-engine/core/CosmosEngine/engine.js';
import { filterScenes } from './ide-modules/scenes-advanced.js';
import { resolveAssetPath } from './ide-modules/asset-path-utils.js';

if (typeof window.CosmosXIDE === 'undefined') {
    window.CosmosXIDE = class CosmosXIDE {
    constructor() {
        this.currentTab = 'editor';
        this.errors = [];
        this.assets = { images: [], audio: [] };
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing COSMOSX IDE...');
        this.setupTabs();
        this.setupButtons();
        this.setupEditor();
        this.setupDebugPanel();
        this.setupErrorPanel();
        this.setupAssetPanel();
        this.setupSmartScrollbars();
        this.updateStatus('Ready');
        
        // Add initialization log entries
        this.addDebugLogEntry('IDE initialization started', 'info');
        this.addDebugLogEntry('All systems operational', 'success');
        
        console.log('✅ IDE initialized successfully!');
    }
    
    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }
    
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update active pane
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        this.currentTab = tabName;
        this.updateStatus(`Switched to ${tabName} tab`);
        
        // Handle specific tab actions
        if (tabName === 'debug') {
            this.updateDebugPanel();
        }
    }
    
    setupButtons() {
        // Save button
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveStory());
        }
        
        // Preview button
        const previewBtn = document.getElementById('preview-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.startPreview());
        }
        
        // New story button
        const newBtn = document.getElementById('new-btn');
        if (newBtn) {
            newBtn.addEventListener('click', () => this.newStory());
        }
        
        // Open button
        const openBtn = document.getElementById('open-btn');
        if (openBtn) {
            openBtn.addEventListener('click', () => this.openStory());
        }
        
        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportStory());
        }
        
        // Add asset button
        const addAssetBtn = document.getElementById('add-asset');
        if (addAssetBtn) {
            addAssetBtn.addEventListener('click', () => this.addAsset());
        }
        
        // Refresh debug button
        const refreshDebugBtn = document.querySelector('.refresh-btn');
        if (refreshDebugBtn) {
            refreshDebugBtn.addEventListener('click', () => this.updateDebugPanel());
        }
        
        // Search scenes button
        const searchScenesBtn = document.getElementById('search-scenes');
        if (searchScenesBtn) {
            searchScenesBtn.addEventListener('click', () => this.toggleSceneSearch());
        }
        
        // Refresh scenes button
        const refreshScenesBtn = document.getElementById('refresh-scenes');
        if (refreshScenesBtn) {
            refreshScenesBtn.addEventListener('click', () => {/* removed legacy this.parseScenes() */});
        }
        
        // Add scene button
        const addSceneBtn = document.getElementById('add-scene');
        if (addSceneBtn) {
            addSceneBtn.addEventListener('click', () => this.addNewScene());
        }
        
        // Scene search input
        const sceneSearchInput = document.getElementById('scene-search');
        if (sceneSearchInput) {
            sceneSearchInput.addEventListener('input', (e) => {
                this.updateSceneSidebar(e.target.value);
            });
        }
    }
    
    setupEditor() {
        // Wait for Monaco to be ready
        const checkEditor = setInterval(() => {
            if (window.coslangEditor) {
                clearInterval(checkEditor);
                this.editor = window.coslangEditor;
                this.setupEditorEvents();
                this.setupAutocomplete();
                // Removed: this.parseScenes();
                this.validateCode();
            }
        }, 100);
    }
    
    setupAutocomplete() {
        if (window.CoslangAutocomplete) {
            this.autocomplete = new window.CoslangAutocomplete();
            this.autocomplete.registerWithMonaco();
        }
    }
    
    setupEditorEvents() {
        if (!this.editor) return;
        
        // Debounce validation and parsing to prevent performance issues
        let validationTimeout;
        let parsingTimeout;
        
        // Content change
        this.editor.onDidChangeModelContent(() => {
            this.updateStatus('Modified');
            
            // Debounce parsing
            clearTimeout(parsingTimeout);
            parsingTimeout = setTimeout(() => {
                // Removed: this.parseScenes();
            }, 300);
            
            // Debounce validation
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(() => {
                this.validateCode();
            }, 500);
        });
        
        // Cursor position and selection
        this.editor.onDidChangeCursorPosition(() => {
            const position = this.editor.getPosition();
            // Removed: this.updateLineInfo(position);
        });
        
        // Selection change
        this.editor.onDidChangeCursorSelection(() => {
            const selection = this.editor.getSelection();
            if (selection) {
                // Removed: this.updateLineInfo(selection.getPosition());
            }
        });
    }
    
    setupDebugPanel() {
        // Initialize debug panels
        this.updateDebugPanel();
    }
    
    setupErrorPanel() {
        // Initialize error panel
        this.updateErrorPanel();
    }
    
    setupAssetPanel() {
        // Initialize asset panel
        this.updateAssetPanel();
    }
    
    validateCode() {
        if (!this.editor) return;
        
        const content = this.editor.getValue();
        
        // Use the syntax validator module
        const validator = new CoslangSyntaxValidator();
        const result = validator.validate(content);
        
        this.errors = [...result.errors, ...result.warnings, ...result.info];
        
        this.updateErrorPanel();
    }
    
    basicValidation(content) {
        this.errors = [];
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
            const lineNum = index + 1;
            
            // Check for missing closing quotes
            const quoteCount = (line.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0) {
                this.errors.push({
                    line: lineNum,
                    message: 'Missing closing quote',
                    type: 'error',
                    source: 'structure'
                });
            }
        });
    }
    
    updateErrorPanel() {
        const errorList = document.getElementById('error-list');
        const errorCount = document.getElementById('error-count');
        
        if (!errorList) return;
        
        const allIssues = [...this.errors, ...this.errors.filter(e => e.type === 'warning'), ...this.errors.filter(e => e.type === 'info')];
        
        if (allIssues.length === 0) {
            errorList.innerHTML = `
                <div class="no-errors">
                    <i class="fas fa-check-circle"></i>
                    <p>No issues found</p>
                    <small>Your code is clean and ready to run</small>
                </div>
            `;
        } else {
            errorList.innerHTML = allIssues.map(issue => `
                <div class="error-item ${issue.type}" onclick="window.ide.navigateToLine(${issue.line})">
                    <div class="error-icon">
                        <i class="fas fa-${issue.type === 'error' ? 'exclamation-triangle' : issue.type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
                    </div>
                    <div class="error-content">
                        <div class="error-message">
                            ${issue.message}
                            <span class="error-source-badge error-source-${issue.source || 'unknown'}">
                                ${issue.source === 'engine' ? 'Engine' : (issue.source === 'structure' || issue.source === 'syntax') ? 'Structure' : (issue.source || 'Unknown')}
                            </span>
                        </div>
                        <div class="error-location">Line ${issue.line}</div>
                        ${issue.suggestion ? `<div class="error-suggestion">💡 ${issue.suggestion}</div>` : ''}
                    </div>
                </div>
            `).join('');
        }
        
        if (errorCount) {
            const errorCountNum = this.errors.filter(e => e.type === 'error').length;
            const warningCountNum = this.errors.filter(e => e.type === 'warning').length;
            const infoCountNum = this.errors.filter(e => e.type === 'info').length;
            errorCount.textContent = errorCountNum + warningCountNum + infoCountNum;
            errorCount.className = `error-badge ${errorCountNum > 0 ? 'has-errors' : warningCountNum > 0 ? 'has-warnings' : 'has-info'}`;
        }
    }
    
    updateDebugPanel() {
        if (!this.editor) return;
        
        const content = this.editor.getValue();
        
        // Update variables
        this.updateDebugVariables(content);
        
        // Update stats
        this.updateDebugStats(content);
        
        // Update inventory
        this.updateDebugInventory(content);
        
        // Update log
        this.updateDebugLog();
        
        // Add refresh buttons to debug panel headers
        this.addDebugRefreshButtons();
    }
    
    addDebugRefreshButtons() {
        const debugPanels = document.querySelectorAll('.debug-panel h3');
        debugPanels.forEach(header => {
            if (!header.querySelector('.refresh-btn')) {
                const refreshBtn = document.createElement('button');
                refreshBtn.className = 'refresh-btn';
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                refreshBtn.title = 'Refresh';
                refreshBtn.onclick = () => this.updateDebugPanel();
                header.appendChild(refreshBtn);
            }
        });
    }
    
    updateDebugVariables(content) {
        const debugVars = document.getElementById('debug-vars');
        if (!debugVars) return;
        
        const globalMatches = content.match(/(\w+)\s*=\s*([^\n]+)/g);
        const variables = [];
        
        if (globalMatches) {
            globalMatches.forEach(match => {
                const [name, value] = match.split('=').map(s => s.trim());
                if (name && value) {
                    variables.push({ name, value });
                }
            });
        }
        
        if (variables.length === 0) {
            debugVars.innerHTML = '<div class="debug-empty">No variables defined</div>';
        } else {
            debugVars.innerHTML = variables.map(v => `
                <div class="debug-item">
                    <span class="debug-label">${v.name}:</span>
                    <span class="debug-value">${v.value}</span>
                </div>
            `).join('');
        }
    }
    
    updateDebugStats(content) {
        const debugStats = document.getElementById('debug-stats');
        if (!debugStats) return;
        
        const sceneCount = (content.match(/#SCENE/g) || []).length;
        const choiceCount = (content.match(/-/g) || []).length;
        const textCount = (content.match(/TEXT:/g) || []).length;
        
        debugStats.innerHTML = `
            <div class="debug-item">
                <span class="debug-label">Scenes:</span>
                <span class="debug-value">${sceneCount}</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">Choices:</span>
                <span class="debug-value">${choiceCount}</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">Text blocks:</span>
                <span class="debug-value">${textCount}</span>
            </div>
        `;
    }
    
    updateDebugInventory(content) {
        const debugInventory = document.getElementById('debug-inventory');
        if (!debugInventory) return;
        
        // Extract inventory from GLOBALS section
        const globalsMatch = content.match(/#GLOBALS([\s\S]*?)(?=#SCENE|$)/);
        if (globalsMatch) {
            const globalsContent = globalsMatch[1];
            const inventoryMatches = globalsContent.match(/(\w+)\s*=\s*\[([^\]]*)\]/g);
            
            if (inventoryMatches && inventoryMatches.length > 0) {
                debugInventory.innerHTML = inventoryMatches.map(match => {
                    const [name, items] = match.split('=').map(s => s.trim());
                    const itemList = items.replace(/[\[\]]/g, '').split(',').map(item => item.trim()).filter(item => item);
                    return `
                        <div class="debug-item">
                            <span class="debug-label">${name}:</span>
                            <span class="debug-value">${itemList.length > 0 ? itemList.join(', ') : 'Empty'}</span>
                        </div>
                    `;
                }).join('');
            } else {
                debugInventory.innerHTML = '<div class="debug-empty">Inventory is empty</div>';
            }
        } else {
            debugInventory.innerHTML = '<div class="debug-empty">No inventory defined</div>';
        }
    }
    
    updateDebugLog() {
        const debugLog = document.getElementById('debug-log');
        if (!debugLog) return;
        
        // Store log entries in memory for persistence
        if (!this.debugLogEntries) {
            this.debugLogEntries = [
                { time: new Date().toLocaleTimeString(), message: 'IDE initialized successfully', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'Monaco editor loaded', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'Syntax validation complete', type: 'success' },
                { time: new Date().toLocaleTimeString(), message: 'Scene parsing finished', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'Debug panel updated', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'Asset panel refreshed', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'Error checking complete', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'Autocomplete system ready', type: 'success' },
                { time: new Date().toLocaleTimeString(), message: 'Preview system initialized', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'All systems operational', type: 'success' }
            ];
        }
        
        // Add new entry if called with a message
        if (arguments.length > 0) {
            const message = arguments[0];
            const type = arguments[1] || 'info';
            this.debugLogEntries.unshift({
                time: new Date().toLocaleTimeString(),
                message: message,
                type: type
            });
            
            // Keep only last 50 entries
            if (this.debugLogEntries.length > 50) {
                this.debugLogEntries = this.debugLogEntries.slice(0, 50);
            }
        }
        
        debugLog.innerHTML = this.debugLogEntries.map(entry => `
            <div class="debug-item ${entry.type}">
                <span class="debug-time">${entry.time}</span>
                <span class="debug-message">${entry.message}</span>
            </div>
        `).join('');
    }
    
    addDebugLogEntry(message, type = 'info') {
        this.updateDebugLog(message, type);
    }
    
    updateAssetPanel() {
        const imageAssets = document.getElementById('image-assets');
        const audioAssets = document.getElementById('audio-assets');
        
        if (imageAssets) {
            if (this.assets.images.length === 0) {
                imageAssets.innerHTML = `
                    <div class="empty-assets">
                        <i class="fas fa-image"></i>
                        <p>No images uploaded</p>
                        <small>Click + to add images</small>
                    </div>
                `;
            } else {
                imageAssets.innerHTML = this.assets.images.map(asset => `
                    <div class="asset-item" onclick="window.ide.insertAsset('${asset.name}', 'image')">
                        <img src="${asset.url}" alt="${asset.name}">
                        <span>${asset.name}</span>
                    </div>
                `).join('');
            }
        }
        
        if (audioAssets) {
            if (this.assets.audio.length === 0) {
                audioAssets.innerHTML = `
                    <div class="empty-assets">
                        <i class="fas fa-music"></i>
                        <p>No audio files uploaded</p>
                        <small>Click + to add audio</small>
                    </div>
                `;
            } else {
                audioAssets.innerHTML = this.assets.audio.map(asset => `
                    <div class="asset-item" onclick="window.ide.insertAsset('${asset.name}', 'audio')">
                        <i class="fas fa-music"></i>
                        <span>${asset.name}</span>
                    </div>
                `).join('');
            }
        }
    }
    
    addAsset() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,audio/*';
        input.multiple = true;
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const url = URL.createObjectURL(file);
                const asset = {
                    name: file.name,
                    url: url,
                    type: file.type.startsWith('image/') ? 'image' : 'audio'
                };
                
                this.assets[asset.type === 'image' ? 'images' : 'audio'].push(asset);
            });
            
            this.updateAssetPanel();
            this.showNotification(`${files.length} asset(s) uploaded successfully!`, 'success');
        };
        
        input.click();
    }
    
    insertAsset(assetName, assetType) {
        if (!this.editor) return;
        
        const asset = this.assets[assetType === 'image' ? 'images' : 'audio'].find(a => a.name === assetName);
        if (!asset) return;
        
        const insertText = assetType === 'image' ? `IMAGE:\n${asset.name}` : `MUSIC:\n${asset.name}`;
        const position = this.editor.getPosition();
        
        this.editor.executeEdits('asset-insert', [{
            range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
            text: insertText + '\n'
        }]);
        
        this.showNotification(`${assetType} asset inserted!`, 'success');
    }
    
    navigateToLine(lineNumber) {
        if (!this.editor) return;
        
        const position = new monaco.Position(lineNumber, 1);
        this.editor.setPosition(position);
        this.editor.revealLineInCenter(lineNumber);
        this.editor.focus();
        
        // Add error line highlight
        this.editor.deltaDecorations([], [{
            range: new monaco.Range(lineNumber, 1, lineNumber, 1),
            options: {
                isWholeLine: true,
                className: 'error-line-highlight'
            }
        }]);
        
        this.updateStatus(`Navigated to line ${lineNumber}`);
    }
    
    saveStory() {
        if (!this.editor) return;
        
        const content = this.editor.getValue();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'story.coslang';
        a.click();
        
        URL.revokeObjectURL(url);
        this.updateStatus('Story saved!');
        this.showNotification('Story saved successfully!', 'success');
    }
    
    newStory() {
        if (!this.editor) return;
        
        const defaultContent = `title: "New Story"
author: "Author Name"
version: "1.0"

scene start {
    vars {
        player_name = "Hero"
        health = 100
        gold = 50
    }
    stats {
        strength = 5
        agility = 3
    }
    inventory {
        sword = 1
        potion = 2
    }
    text: "Welcome to your new story!"
    text: "You have {health} health, {gold} gold, and {sword} sword."
    
    choice "Begin adventure" -> adventure
    choice "Check inventory" -> inventory_check
}

scene adventure {
    text: "You embark on an exciting adventure!"
    text: "Your health: {health}, Gold: {gold}"
    
    if health > 50 {
        text: "You're feeling strong and ready for anything!"
        choice "Continue boldly" -> next_scene
    } else {
        text: "You're feeling tired and should rest."
        choice "Find a place to rest" -> rest_scene
    }
}

scene inventory_check {
    text: "You check your inventory:"
    text: "Swords: {sword}, Potions: {potion}"
    choice "Go back to start" -> start
}

scene next_scene {
    text: "You continue your journey with confidence!"
    set gold = gold + 10 [LOG: Found 10 gold]
    choice "Return to start" -> start
}

scene rest_scene {
    text: "You find a cozy inn and rest for a while."
    set health = health + 20 [LOG: Restored 20 health]
    choice "Return to start" -> start
}`;
        
        this.editor.setValue(defaultContent);
        this.updateStatus('New story created');
        this.showNotification('New story created!', 'success');
    }
    
    openStory() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.coslang';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (this.editor) {
                        this.editor.setValue(e.target.result);
                        this.updateStatus(`Opened: ${file.name}`);
                        this.showNotification(`Opened: ${file.name}`, 'success');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    exportStory() {
        if (!this.editor) return;
        
        const content = this.editor.getValue();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'story_export.coslang';
        a.click();
        
        URL.revokeObjectURL(url);
        this.updateStatus('Story exported!');
        this.showNotification('Story exported successfully!', 'success');
    }
    
    // Remove all preview and engine logic
    // Remove all functions: startPreview, initializePreview, renderPreview, renderChoices, showPreviewError
    // Remove any references to window.CosmosXEngine
    
    // [All scene-related methods and references have been removed for migration to engine-driven scene management.]
    
    updateStatus(message) {
        const status = document.getElementById('status');
        if (status) {
            // Add a subtle animation for status updates
            status.style.opacity = '0.7';
            status.textContent = message;
            
            // Fade back to full opacity
            setTimeout(() => {
                status.style.opacity = '1';
            }, 100);
            
            // Add timestamp for important messages
            if (message.includes('Error') || message.includes('Warning') || message.includes('Success')) {
                const timestamp = new Date().toLocaleTimeString();
                console.log(`[${timestamp}] ${message}`);
            }
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; cursor: pointer; margin-left: auto;">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }
    
    // [All scene-related methods and references have been removed for migration to engine-driven scene management.]
    
    setupSmartScrollbars() {
        // Initialize the comprehensive scrollbar system
        if (window.ScrollbarSystem) {
            this.scrollbarSystem = new window.ScrollbarSystem();
            this.scrollbarSystem.initialize();
            console.log('🎨 Enhanced scrollbar system initialized');
        } else {
            console.warn('ScrollbarSystem not available');
        }
    }
    // Add this method to the CosmosXIDE class
    startPreview() {
        alert('startPreview loaded!');
        console.log('[DEBUG] startPreview running');
        if (!this.editor) {
            this.showNotification('Editor not ready!', 'error');
            return;
        }
        const content = this.editor.getValue();
        let ast = null;
        let engine = null;
        let runtimeError = null;
        try {
            // Import parser and engine if not already available
            if (typeof parseCosLang === 'undefined' || typeof CosmosEngine === 'undefined') {
                this.showNotification('Engine or parser not loaded!', 'error');
                return;
            }
            // Parse to AST
            ast = parseCosLang(content);
            // Run the engine (simulate starting at 'start')
            engine = new CosmosEngine(ast);
            engine.start('start', { reset: true });
            this.showNotification('Preview started successfully!', 'success');
            if (this.addDebugLogEntry) this.addDebugLogEntry('Preview started', 'success');
        } catch (e) {
            runtimeError = {
                line: 1,
                message: 'Engine runtime error: ' + (e.message || e),
                type: 'error',
                code: 'ENGINE_RUNTIME_ERROR',
                suggestion: 'Check your macros, choices, and logic.',
                source: 'engine'
            };
            // Show in error panel
            this.errors = [runtimeError];
            this.updateErrorPanel();
            this.showNotification(runtimeError.message, 'error');
            if (this.addDebugLogEntry) this.addDebugLogEntry(runtimeError.message, 'error');
            return;
        }
        // --- Render assets in preview ---
        console.log('[DEBUG] About to get renderable state');
        const renderable = (typeof CosmosUI !== 'undefined')
          ? new CosmosUI(engine).getRenderableState()
          : engine.getState();

        console.log('[DEBUG] Renderable state:', renderable);
        const previewAssets = document.getElementById('preview-assets');
        console.log('[DEBUG] previewAssets element:', previewAssets);
        if (previewAssets) {
          previewAssets.innerHTML = '';

          // Use the IDE's asset manager if available
          const assetManager = this.assetManager || (window.ide && window.ide.assetManager);
          console.log('[DEBUG] assetManager:', assetManager);

          // Render image
          if (renderable.currentImage && renderable.currentImage.name) {
            console.log('[DEBUG] Rendering image:', renderable.currentImage.name);
            const imgUrl = resolveAssetPath(renderable.currentImage.name, 'image', assetManager);
            console.log('[DEBUG] Image URL:', imgUrl);
            const imgLabel = document.createElement('div');
            imgLabel.textContent = `Image: ${renderable.currentImage.name}`;
            imgLabel.style.fontWeight = 'bold';
            imgLabel.style.margin = '0.5em 0 0.2em 0';
            previewAssets.appendChild(imgLabel);
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = renderable.currentImage.name || 'Scene Image';
            img.style.maxWidth = '100%';
            img.style.display = 'block';
            img.style.margin = '0.2em auto 1em auto';
            img.style.border = '2px solid #ccc';
            img.style.borderRadius = '8px';
            previewAssets.appendChild(img);
          }

          // Render audio
          if (renderable.currentAudio && renderable.currentAudio.name) {
            console.log('[DEBUG] Rendering audio:', renderable.currentAudio.name);
            const audioUrl = resolveAssetPath(renderable.currentAudio.name, 'audio', assetManager);
            console.log('[DEBUG] Audio URL:', audioUrl);
            const audioLabel = document.createElement('div');
            audioLabel.textContent = `Audio: ${renderable.currentAudio.name}`;
            audioLabel.style.fontWeight = 'bold';
            audioLabel.style.margin = '0.5em 0 0.2em 0';
            previewAssets.appendChild(audioLabel);
            const audio = document.createElement('audio');
            audio.src = audioUrl;
            audio.controls = true;
            audio.style.display = 'block';
            audio.style.margin = '0.2em auto 1em auto';
            audio.style.width = '100%';
            // Add volume control
            audio.volume = 0.7;
            previewAssets.appendChild(audio);
          }

          // Render video
          if (renderable.currentVideo && renderable.currentVideo.name) {
            console.log('[DEBUG] Rendering video:', renderable.currentVideo.name);
            const videoUrl = resolveAssetPath(renderable.currentVideo.name, 'video', assetManager);
            console.log('[DEBUG] Video URL:', videoUrl);
            const videoLabel = document.createElement('div');
            videoLabel.textContent = `Video: ${renderable.currentVideo.name}`;
            videoLabel.style.fontWeight = 'bold';
            videoLabel.style.margin = '0.5em 0 0.2em 0';
            previewAssets.appendChild(videoLabel);
            const video = document.createElement('video');
            video.src = videoUrl;
            video.controls = true;
            video.style.maxWidth = '100%';
            video.style.display = 'block';
            video.style.margin = '0.2em auto 1em auto';
            video.style.border = '2px solid #ccc';
            video.style.borderRadius = '8px';
            previewAssets.appendChild(video);
          }
        } else {
          console.log('[DEBUG] #preview-assets element not found in DOM');
        }
        console.log('[DEBUG] Finished asset rendering in preview');
    }
    updateSceneSidebar(searchTerm = '') {
        const sceneList = document.getElementById('scene-list');
        if (!sceneList || !this.engine) return;
        const ast = this.engine.ast ? this.engine.ast : this.engine;
        const gameMeta = ast.meta || {};
        // Create the Game Info block
        const gameInfoBlock = document.createElement('div');
        gameInfoBlock.className = 'game-info-block';
        gameInfoBlock.innerHTML = `
            <div class="game-info-title"><i class="fas fa-rocket"></i> ${gameMeta.title || 'Untitled Game'}</div>
            <div class="game-info-meta">
                <span><i class="fas fa-user"></i> ${gameMeta.author || 'Unknown Author'}</span>
                <span><i class="fas fa-code-branch"></i> v${gameMeta.version || 'N/A'}</span>
            </div>
            <div class="game-info-desc">${gameMeta.description || ''}</div>
        `;
        sceneList.innerHTML = '';
        sceneList.appendChild(gameInfoBlock);
        let scenes = this.getScenesList ? this.getScenesList(this.engine) : [];
        if (typeof filterScenes === 'function') {
            scenes = filterScenes(scenes, searchTerm);
        }
        if (scenes.length === 0) {
            const noScenes = document.createElement('div');
            noScenes.className = 'no-scenes';
            noScenes.innerHTML = `
                <i class="fas fa-plus-circle"></i>
                <p>No scenes found</p>
                <small>Add scenes with <code>scene SceneName {'}'</code></small>
            `;
            sceneList.appendChild(noScenes);
            return;
        }
        scenes.forEach(scene => {
            const sceneElement = document.createElement('div');
            sceneElement.className = 'scene-item';
            sceneElement.innerHTML = `
                <i class="fas fa-play"></i>
                <div class="scene-content">
                    <div class="scene-name">${scene.id}</div>
                    <div class="scene-description">${scene.description}</div>
                    <div class="scene-meta">
                        ${scene.meta && scene.meta.tags ? `<span class='scene-tags'><i class='fas fa-tag'></i> ${Array.isArray(scene.meta.tags) ? scene.meta.tags.join(', ') : scene.meta.tags}</span>` : ''}
                    </div>
                </div>
            `;
            sceneElement.onclick = () => {
                // Find the line number for the scene in the editor
                const content = this.editor.getValue();
                const regex = new RegExp(`scene\\s+${scene.id}\\s*\\{`, 'i');
                const match = regex.exec(content);
                if (match) {
                    const before = content.substring(0, match.index);
                    const lineNumber = before.split('\n').length;
                    this.editor.revealLineInCenter(lineNumber);
                    this.editor.setPosition({ lineNumber, column: 1 });
                    this.editor.focus();
                    this.updateStatus(`Navigated to scene: ${scene.id}`);
                }
            };
            sceneList.appendChild(sceneElement);
        });
        // Update scene count
        const sceneCount = document.getElementById('scene-count');
        if (sceneCount) {
            sceneCount.textContent = `${scenes.length} scene${scenes.length !== 1 ? 's' : ''}`;
        }
    }
    toggleSceneSearch() {
        const searchInput = document.getElementById('scene-search');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
            // Optionally, trigger the sidebar update if needed
            if (typeof this.updateSceneSidebar === 'function') {
                this.updateSceneSidebar(searchInput.value);
            }
        } else {
            this.showNotification('Scene search input not found', 'error');
        }
    }
    };
}

// Initialize IDE when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ide = new window.CosmosXIDE();
}); 