// Modern Live Preview System for COSMOSX IDE
// Completely rebuilt UI/UX with enhanced functionality

import { CosmosUI } from '../cosmosx-engine/core/CosmosUI/index.js';
import { CosmosEngine } from '../cosmosx-engine/core/CosmosEngine/engine.js';
import { parseCosLang } from '../cosmosx-engine/core/CosmosEngine/parser.js';
import { logger } from '../cosmosx-engine/logger.js';

export class ModernLivePreview {
    constructor() {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentStory = null;
        this.engine = null;
        this.history = [];
        this.currentHistoryIndex = -1;
        this.currentPanel = 'stats';
        
        // Preview state tracking
        this.previewState = {
            isPlaying: false,
            currentScene: null,
            storyProgress: 0,
            totalScenes: 0,
            currentSceneIndex: 0
        };
        
        // DOM elements
        this.elements = {};
        
        logger.info('🎮 Modern Live Preview System initialized');
    }

    // Initialize the modern preview system
    init() {
        logger.info('🎮 Modern Live Preview System initializing...');
        this.initializeElements();
        this.setupEventListeners();
        this.initializePanelTabs();
        this.isActive = true;
        logger.info('✅ Modern Live Preview System ready');
    }

    // Initialize DOM element references
    initializeElements() {
        this.elements = {
            // Main content areas
            storyContent: document.getElementById('preview-story-content'),
            choicesArea: document.getElementById('preview-choices-area'),
            
            // Control buttons
            playButton: document.getElementById('play-preview'),
            pauseButton: document.getElementById('pause-preview'),
            resetButton: document.getElementById('reset-preview'),
            stepButton: document.getElementById('step-preview'),
            fullscreenButton: document.getElementById('fullscreen-preview'),
            settingsButton: document.getElementById('preview-settings'),
            
            // Status elements
            currentSceneName: document.getElementById('current-scene-name'),
            progressFill: document.getElementById('story-progress-fill'),
            progressText: document.getElementById('progress-text'),
            
            // Panel elements
            panelTabs: document.querySelectorAll('.panel-tab'),
            panelContents: document.querySelectorAll('.side-panel-content'),
            statsContent: document.getElementById('stats-content'),
            inventoryContent: document.getElementById('inventory-content'),
            variablesContent: document.getElementById('variables-content'),
            logContent: document.getElementById('log-content')
        };
        
        // Validate critical elements
        if (!this.elements.storyContent || !this.elements.choicesArea) {
            console.error('Critical preview elements not found');
            return false;
        }
        
        return true;
    }

    // Setup event listeners for the modern UI
    setupEventListeners() {
        // Control button events
        this.elements.playButton?.addEventListener('click', () => this.playStory());
        this.elements.pauseButton?.addEventListener('click', () => this.pauseStory());
        this.elements.resetButton?.addEventListener('click', () => this.resetStory());
        this.elements.stepButton?.addEventListener('click', () => this.stepStory());
        this.elements.fullscreenButton?.addEventListener('click', () => this.toggleFullscreen());
        this.elements.settingsButton?.addEventListener('click', () => this.showSettings());
        
        logger.info('✅ Event listeners setup complete');
    }

    // Initialize panel tab functionality
    initializePanelTabs() {
        this.elements.panelTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const panelName = tab.dataset.panel;
                this.switchPanel(panelName);
            });
        });
        
        // Set initial active panel
        this.switchPanel('stats');
    }

    // Switch between side panels
    switchPanel(panelName) {
        // Update tab states
        this.elements.panelTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.panel === panelName);
        });
        
        // Update panel content visibility
        this.elements.panelContents.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${panelName}-panel`);
        });
        
        this.currentPanel = panelName;
        logger.info(`📋 Switched to ${panelName} panel`);
    }

    // Play the story
    async playStory() {
        try {
            // Get editor content using the correct API
            let editorContent = '';
            if (window.ide && window.ide.editorManager && typeof window.ide.editorManager.getValue === 'function') {
                editorContent = window.ide.editorManager.getValue();
            } else if (window.editor && typeof window.editor.getValue === 'function') {
                editorContent = window.editor.getValue();
            } else if (window.editor && window.editor.getModel && typeof window.editor.getModel === 'function') {
                const model = window.editor.getModel();
                if (model && typeof model.getValue === 'function') {
                    editorContent = model.getValue();
                }
            }
            
            if (!editorContent.trim()) {
                this.showMessage('Please write some story content in the editor first!', 'warning');
                return;
            }

            this.isPlaying = true;
            this.isPaused = false;
            this.updateControlButtons();
            
            // Parse and initialize the story
            const parsedStory = parseCosLang(editorContent);
            this.currentStory = parsedStory;
            
            // Validate parsed story structure
            if (!parsedStory || typeof parsedStory !== 'object') {
                throw new Error('Failed to parse story - invalid AST structure');
            }
            
            // Ensure meta object exists
            if (!parsedStory.meta) {
                parsedStory.meta = {
                    title: 'Untitled Story',
                    author: 'Unknown',
                    version: '1.0',
                    vars: {},
                    stats: {},
                    inventory: {}
                };
            }
            
            // Initialize the engine
            this.engine = new CosmosEngine(parsedStory);
            
            // Start the engine at the first scene
            const firstSceneId = Object.keys(parsedStory.scenes)[0] || 'start';
            this.engine.start(firstSceneId, { reset: true });
            
            // Process the scene content to make it renderable
            this.engine.autoAdvanceToRenderable();
            
            // Update progress tracking
            this.previewState.totalScenes = parsedStory.scenes?.length || 0;
            this.previewState.currentSceneIndex = 0;
            
            // Start rendering
            this.renderCurrentState();
            
            logger.info('▶️ Story playback started');
            this.showMessage('Story started!', 'success');
            
        } catch (error) {
            logger.error('❌ Error starting story:', error);
            this.showMessage(`Error: ${error.message}`, 'error');
            this.isPlaying = false;
            this.updateControlButtons();
        }
    }

    // Pause the story
    pauseStory() {
        this.isPaused = !this.isPaused;
        this.updateControlButtons();
        
        const status = this.isPaused ? 'paused' : 'resumed';
        logger.info(`⏸️ Story ${status}`);
        this.showMessage(`Story ${status}`, 'info');
    }

    // Reset the story
    resetStory() {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentStory = null;
        this.engine = null;
        this.history = [];
        this.currentHistoryIndex = -1;
        
        // Reset UI state
        this.previewState = {
            isPlaying: false,
            currentScene: null,
            storyProgress: 0,
            totalScenes: 0,
            currentSceneIndex: 0
        };
        
        // Clear content and show welcome screen
        this.showWelcomeScreen();
        this.clearChoices();
        this.clearPanels();
        this.updateProgress();
        this.updateControlButtons();
        
        logger.info('🔄 Story reset');
        this.showMessage('Story reset', 'info');
    }

    // Step through story (for debugging)
    stepStory() {
        if (!this.isPlaying || !this.engine) {
            this.showMessage('Start playing the story first!', 'warning');
            return;
        }
        
        // Implement step functionality here
        logger.info('👣 Story step');
        this.showMessage('Stepped forward', 'info');
    }

    // Toggle fullscreen mode
    toggleFullscreen() {
        const previewContainer = document.querySelector('.modern-preview-container');
        if (!document.fullscreenElement) {
            previewContainer.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // Show settings modal
    showSettings() {
        // Implement settings modal
        this.showMessage('Settings coming soon!', 'info');
    }

    // Render the current story state
    renderCurrentState() {
        if (!this.engine) return;
        
        try {
            // Use CosmosUI to get proper renderable state
            if (!this.cosmosUI) {
                this.cosmosUI = new CosmosUI(this.engine);
            }
            
            const renderableState = this.cosmosUI.getRenderableState();
            
            // Update scene info
            this.updateSceneInfo(renderableState);
            
            // Render story content
            this.renderStoryContent(renderableState);
            
            // Render choices
            this.renderChoices(renderableState);
            
            // Update side panels
            this.updateSidePanels(renderableState);
            
            // Update progress
            this.updateProgress();
            
        } catch (error) {
            logger.error('❌ Error rendering story state:', error);
            this.showMessage(`Render error: ${error.message}`, 'error');
        }
    }

    // Update scene information
    updateSceneInfo(renderableState) {
        const sceneName = renderableState.sceneId || 'Unknown Scene';
        if (this.elements.currentSceneName) {
            this.elements.currentSceneName.textContent = sceneName;
        }
        this.previewState.currentScene = sceneName;
    }

    // Render story content
    renderStoryContent(renderableState) {
        if (!renderableState.text || renderableState.text.length === 0) {
            this.elements.storyContent.innerHTML = '<div class="story-text">No content available</div>';
            return;
        }
        
        const content = renderableState.text.join('<br><br>');
        
        this.elements.storyContent.innerHTML = `
            <div class="story-text">
                ${this.formatStoryText(content)}
            </div>
        `;
    }

    // Format story text with proper styling
    formatStoryText(text) {
        // Basic text formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // Render story choices
    renderChoices(renderableState) {
        if (!renderableState.choices || renderableState.choices.length === 0) {
            this.elements.choicesArea.innerHTML = '<div class="no-choices">No choices available</div>';
            return;
        }
        
        const choicesHTML = renderableState.choices.map((choice, index) => `
            <button class="choice-button" data-index="${choice.index}" data-target="${choice.target}">
                ${choice.text}
            </button>
        `).join('');
        
        this.elements.choicesArea.innerHTML = choicesHTML;
        
        // Add choice event listeners
        this.elements.choicesArea.querySelectorAll('.choice-button').forEach(button => {
            button.addEventListener('click', () => {
                const choiceIndex = parseInt(button.dataset.index);
                this.makeChoice(choiceIndex);
            });
        });
    }

    // Handle choice selection
    makeChoice(choiceIndex) {
        if (!this.engine || !this.cosmosUI) return;
        
        try {
            // Use CosmosUI to make the choice
            const newState = this.cosmosUI.choose(choiceIndex);
            
            // Re-render with the new state
            this.renderCurrentState();
            
            logger.info(`🎯 Choice made: index ${choiceIndex}`);
            
        } catch (error) {
            logger.error('❌ Error making choice:', error);
            this.showMessage(`Choice error: ${error.message}`, 'error');
        }
    }

    // Update side panels with current data
    updateSidePanels(renderableState) {
        this.renderStats(renderableState.stats || {});
        this.renderInventory(renderableState.inventory || {});
        this.renderVariables(renderableState.vars || {});
        this.renderLog(renderableState.log || []);
    }

    // Render stats panel
    renderStats(stats) {
        const statsKeys = Object.keys(stats);
        
        if (statsKeys.length === 0) {
            this.elements.statsContent.innerHTML = `
                <div class="empty-panel">
                    <i class="fas fa-chart-line"></i>
                    <p>No stats yet</p>
                    <small>Statistics will appear as your story progresses</small>
                </div>
            `;
            return;
        }
        
        const statsHTML = statsKeys.map(key => `
            <div class="panel-item">
                <span class="item-name">${key}</span>
                <span class="item-value">${stats[key]}</span>
            </div>
        `).join('');
        
        this.elements.statsContent.innerHTML = statsHTML;
    }

    // Render inventory panel
    renderInventory(inventory) {
        const inventoryKeys = Object.keys(inventory);
        
        if (inventoryKeys.length === 0) {
            this.elements.inventoryContent.innerHTML = `
                <div class="empty-panel">
                    <i class="fas fa-briefcase"></i>
                    <p>Empty inventory</p>
                    <small>Items will appear as you collect them</small>
                </div>
            `;
            return;
        }
        
        const inventoryHTML = inventoryKeys.map(key => `
            <div class="panel-item">
                <span class="item-name">${key}</span>
                <span class="item-value">×${inventory[key]}</span>
            </div>
        `).join('');
        
        this.elements.inventoryContent.innerHTML = inventoryHTML;
    }

    // Render variables panel
    renderVariables(variables) {
        const variableKeys = Object.keys(variables);
        
        if (variableKeys.length === 0) {
            this.elements.variablesContent.innerHTML = `
                <div class="empty-panel">
                    <i class="fas fa-code"></i>
                    <p>No variables</p>
                    <small>Variables will appear as they're defined</small>
                </div>
            `;
            return;
        }
        
        const variablesHTML = variableKeys.map(key => {
            const value = variables[key];
            const valueType = typeof value;
            const valueClass = `value-${valueType}`;
            
            return `
                <div class="panel-item">
                    <span class="item-name">${key}</span>
                    <span class="item-value ${valueClass}">${value}</span>
                </div>
            `;
        }).join('');
        
        this.elements.variablesContent.innerHTML = variablesHTML;
    }

    // Render log panel
    renderLog(logEntries) {
        if (logEntries.length === 0) {
            this.elements.logContent.innerHTML = `
                <div class="empty-panel">
                    <i class="fas fa-history"></i>
                    <p>No activity</p>
                    <small>Actions will be logged here</small>
                </div>
            `;
            return;
        }
        
        const logHTML = logEntries.slice(-8).map(entry => {
            const icon = this.getLogIcon(entry.type);
            return `
                <div class="log-entry">
                    <span class="log-icon">${icon}</span>
                    <span class="log-text">${entry.message}</span>
                </div>
            `;
        }).join('');
        
        this.elements.logContent.innerHTML = logHTML;
    }

    // Get appropriate icon for log entry type
    getLogIcon(type) {
        const icons = {
            choice: '🎯',
            achievement: '🏆',
            event: '⚡',
            log: '📝',
            error: '❌',
            info: 'ℹ️'
        };
        return icons[type] || '📝';
    }

    // Update progress bar
    updateProgress() {
        const progress = this.previewState.totalScenes > 0 
            ? (this.previewState.currentSceneIndex / this.previewState.totalScenes) * 100 
            : 0;
        
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = `${Math.round(progress)}%`;
        
        this.previewState.storyProgress = progress;
    }

    // Update control button states
    updateControlButtons() {
        if (this.elements.playButton && this.elements.pauseButton) {
            if (this.isPlaying && !this.isPaused) {
                this.elements.playButton.style.display = 'none';
                this.elements.pauseButton.style.display = 'flex';
            } else {
                this.elements.playButton.style.display = 'flex';
                this.elements.pauseButton.style.display = 'none';
            }
        }
        
        // Update button states
        const buttons = [this.elements.resetButton, this.elements.stepButton];
        buttons.forEach(button => {
            if (button) {
                button.disabled = !this.isPlaying;
            }
        });
    }

    // Show welcome screen
    showWelcomeScreen() {
        this.elements.storyContent.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <h3>Interactive Story Preview</h3>
                <p>Your story will appear here when you click Play</p>
                <div class="quick-tips">
                    <div class="tip">
                        <i class="fas fa-lightbulb"></i>
                        <span>Write your story in the Editor tab</span>
                    </div>
                    <div class="tip">
                        <i class="fas fa-play"></i>
                        <span>Click Play to test your story</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Clear choices area
    clearChoices() {
        this.elements.choicesArea.innerHTML = '';
    }

    // Clear all panels
    clearPanels() {
        this.renderStats({});
        this.renderInventory({});
        this.renderVariables({});
        this.renderLog([]);
    }

    // Show notification message
    showMessage(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getMessageIcon(type)}"></i>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        // Add to container
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Get icon for message type
    getMessageIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Update preview with new content (called from editor)
    updatePreview(coslangText) {
        if (this.isPlaying) {
            // Auto-refresh if playing
            this.resetStory();
            setTimeout(() => this.playStory(), 100);
        }
    }

    // Cleanup
    destroy() {
        this.isActive = false;
        this.resetStory();
        logger.info('🗑️ Modern Live Preview System destroyed');
    }
}

// Export for use in main IDE
export default ModernLivePreview;
