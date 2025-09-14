// Legacy Live Preview System - Backup for compatibility
// This is a simplified version that works with the modern preview HTML structure

import { CosmosUI } from '../cosmosx-engine/core/CosmosUI/index.js';
import { CosmosEngine } from '../cosmosx-engine/core/CosmosEngine/engine.js';
import { parseCosLang } from '../cosmosx-engine/core/CosmosEngine/parser.js';
import { logger } from '../cosmosx-engine/logger.js';

export class LivePreview {
    constructor() {
        this.isPlaying = false;
        this.currentStory = null;
        this.engine = null;
        this.history = [];
        this.currentHistoryIndex = -1;
        this.previewState = {
            isPlaying: false,
            currentScene: null,
            storyProgress: 0,
            totalChoices: 0,
            choicesMade: 0
        };
    }

    // Initialize the preview system
    init() {
        logger.info('🎮 Live Preview System initializing...');
        this.setupPreviewContainer();
        this.setupPreviewEvents();
        this.setupRealTimeUpdates();
        this.isActive = true;
        logger.info('✅ Live Preview System ready');
    }

    // Setup the preview container - now works with modern HTML structure
    setupPreviewContainer() {
        // The modern preview container is already in the HTML
        // Just initialize references to the elements
        this.previewFrame = document.getElementById('preview-story-content');
        this.choicesArea = document.getElementById('preview-choices-area');
        this.currentSceneName = document.getElementById('current-scene-name');
        this.progressFill = document.getElementById('story-progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        if (!this.previewFrame) {
            console.error('Preview frame not found');
            return;
        }

        console.log('Setting up modern preview container...');
    }

    // Setup preview event listeners
    setupPreviewEvents() {
        const playBtn = document.getElementById('play-preview');
        const resetBtn = document.getElementById('reset-preview');
        const fullscreenBtn = document.getElementById('fullscreen-preview');

        if (playBtn) {
            playBtn.addEventListener('click', () => this.playStory());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetStory());
        }
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        logger.info('✅ Preview event listeners setup');
    }

    // Setup real-time updates
    setupRealTimeUpdates() {
        // Listen for editor changes
        if (window.editor) {
            window.editor.onDidChangeModelContent(() => {
                if (this.isPlaying) {
                    this.updatePreviewFromEditor();
                }
            });
        }
    }

    // Play the story
    async playStory() {
        try {
            const editorContent = window.editor?.getValue() || '';
            if (!editorContent.trim()) {
                this.showNotification('Please write some story content in the editor first!', 'warning');
                return;
            }

            this.isPlaying = true;
            
            // Parse and initialize the story
            const parsedStory = parseCosLang(editorContent);
            this.currentStory = parsedStory;
            
            // Initialize the engine
            this.engine = new CosmosEngine();
            await this.engine.loadStory(parsedStory);
            
            // Start rendering
            this.renderPreview();
            
            logger.info('▶️ Story playback started');
            this.showNotification('Story started!', 'success');
            
        } catch (error) {
            logger.error('❌ Error starting story:', error);
            this.showNotification(`Error: ${error.message}`, 'error');
            this.isPlaying = false;
        }
    }

    // Reset the story
    resetStory() {
        this.isPlaying = false;
        this.currentStory = null;
        this.engine = null;
        this.history = [];
        this.currentHistoryIndex = -1;
        
        // Reset UI state
        this.previewState = {
            isPlaying: false,
            currentScene: null,
            storyProgress: 0,
            totalChoices: 0,
            choicesMade: 0
        };
        
        // Clear content and show welcome screen
        this.showWelcomeScreen();
        this.clearChoices();
        this.clearPanels();
        this.updateProgress();
        
        logger.info('🔄 Story reset');
        this.showNotification('Story reset', 'info');
    }

    // Toggle fullscreen mode
    toggleFullscreen() {
        const previewContainer = document.querySelector('.modern-preview-container');
        if (!document.fullscreenElement) {
            previewContainer?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    // Render the current preview state
    renderPreview() {
        if (!this.engine) return;
        
        try {
            const currentState = this.engine.getCurrentState();
            
            // Update scene info
            this.updateSceneInfo(currentState);
            
            // Render story content
            this.renderStoryContent(currentState);
            
            // Render choices
            this.renderChoices(currentState);
            
            // Update side panels
            this.renderStats(currentState.stats || {});
            this.renderInventory(currentState.inventory || {});
            this.renderVariables(currentState.variables || {});
            this.renderLog(currentState.log || []);
            
            // Update progress
            this.updateProgress();
            
        } catch (error) {
            logger.error('❌ Error rendering preview:', error);
            this.showNotification(`Render error: ${error.message}`, 'error');
        }
    }

    // Update scene information
    updateSceneInfo(state) {
        const sceneName = state.currentScene?.name || 'Unknown Scene';
        if (this.currentSceneName) {
            this.currentSceneName.textContent = sceneName;
        }
        this.previewState.currentScene = sceneName;
    }

    // Render story content
    renderStoryContent(state) {
        const content = state.currentText || 'No content available';
        
        if (this.previewFrame) {
            this.previewFrame.innerHTML = `
                <div class="story-text">
                    ${this.formatStoryText(content)}
                </div>
            `;
        }
    }

    // Format story text with proper styling
    formatStoryText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // Render story choices
    renderChoices(state) {
        const choices = state.choices || [];
        
        if (!this.choicesArea) return;
        
        if (choices.length === 0) {
            this.choicesArea.innerHTML = '<div class="no-choices">No choices available</div>';
            return;
        }
        
        const choicesHTML = choices.map((choice, index) => `
            <button class="choice-button" data-choice="${index}">
                ${choice.text}
            </button>
        `).join('');
        
        this.choicesArea.innerHTML = choicesHTML;
        
        // Add choice event listeners
        this.choicesArea.querySelectorAll('.choice-button').forEach(button => {
            button.addEventListener('click', () => {
                const choiceIndex = parseInt(button.dataset.choice);
                this.makeChoice(choiceIndex);
            });
        });
    }

    // Handle choice selection
    makeChoice(choiceIndex) {
        if (!this.engine) return;
        
        try {
            this.engine.makeChoice(choiceIndex);
            this.renderPreview();
            
            logger.info(`🎯 Choice made: ${choiceIndex}`);
            
        } catch (error) {
            logger.error('❌ Error making choice:', error);
            this.showNotification(`Choice error: ${error.message}`, 'error');
        }
    }

    // Render stats panel
    renderStats(stats) {
        const statsContent = document.getElementById('stats-content');
        if (!statsContent) return;
        
        const statsKeys = Object.keys(stats);
        
        if (statsKeys.length === 0) {
            statsContent.innerHTML = `
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
        
        statsContent.innerHTML = statsHTML;
    }

    // Render inventory panel
    renderInventory(inventory) {
        const inventoryContent = document.getElementById('inventory-content');
        if (!inventoryContent) return;
        
        const inventoryKeys = Object.keys(inventory);
        
        if (inventoryKeys.length === 0) {
            inventoryContent.innerHTML = `
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
        
        inventoryContent.innerHTML = inventoryHTML;
    }

    // Render variables panel
    renderVariables(variables) {
        const variablesContent = document.getElementById('variables-content');
        if (!variablesContent) return;
        
        const variableKeys = Object.keys(variables);
        
        if (variableKeys.length === 0) {
            variablesContent.innerHTML = `
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
        
        variablesContent.innerHTML = variablesHTML;
    }

    // Render log panel
    renderLog(logEntries) {
        const logContent = document.getElementById('log-content');
        if (!logContent) return;
        
        if (logEntries.length === 0) {
            logContent.innerHTML = `
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
        
        logContent.innerHTML = logHTML;
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
        const progress = this.previewState.totalChoices > 0 
            ? (this.previewState.choicesMade / this.previewState.totalChoices) * 100 
            : 0;
        
        if (this.progressFill) {
            this.progressFill.style.width = `${progress}%`;
        }
        if (this.progressText) {
            this.progressText.textContent = `${Math.round(progress)}%`;
        }
        
        this.previewState.storyProgress = progress;
    }

    // Show welcome screen
    showWelcomeScreen() {
        if (this.previewFrame) {
            this.previewFrame.innerHTML = `
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
    }

    // Clear choices area
    clearChoices() {
        if (this.choicesArea) {
            this.choicesArea.innerHTML = '';
        }
    }

    // Clear all panels
    clearPanels() {
        this.renderStats({});
        this.renderInventory({});
        this.renderVariables({});
        this.renderLog([]);
    }

    // Show notification message
    showNotification(message, type = 'info') {
        console.log(`${type.toUpperCase()}: ${message}`);
        // Could integrate with existing notification system
    }

    // Update preview from editor (called from main IDE)
    updatePreviewFromEditor() {
        if (this.isPlaying) {
            // Auto-refresh if playing
            this.resetStory();
            setTimeout(() => this.playStory(), 100);
        }
    }

    // Update preview with new content (compatibility method)
    updatePreview(coslangText) {
        this.updatePreviewFromEditor();
    }

    // Cleanup
    destroy() {
        this.isActive = false;
        this.resetStory();
        logger.info('🗑️ Live Preview System destroyed');
    }
}

// Export for use in main IDE
export default LivePreview;
