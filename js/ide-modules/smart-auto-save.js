// Smart Auto-Save System for COSMOSX IDE
// Advanced auto-save with intelligent features, feedback, and recovery

import { DialogueManager } from './dialogues.js';

export class SmartAutoSave {
    constructor(ide) {
        this.ide = ide;
        this.isEnabled = true;
        this.autoSaveTimer = null;
        this.lastContent = '';
        this.lastSaveTime = null;
        this.saveHistory = [];
        this.maxHistorySize = 10;
        this.isSaving = false;
        this.saveAttempts = 0;
        this.maxSaveAttempts = 3;
        this.notificationContainer = null;
        this.setupAutoSave();
        this.setupNotifications();
    }

    setupAutoSave() {
        // Get settings
        const settings = this.ide.settingsManager?.getAllSettings() || {};
        this.isEnabled = settings.autoSave !== false;
        this.autoSaveInterval = settings.autoSaveInterval || 30000; // 30 seconds default
        
        if (this.isEnabled) {
            this.startAutoSave();
        }
    }

    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.performSmartAutoSave();
        }, this.autoSaveInterval);
        
        console.log(`🚀 Smart Auto-Save started (${this.autoSaveInterval / 1000}s interval)`);
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        console.log('⏹️ Smart Auto-Save stopped');
    }

    async performSmartAutoSave() {
        if (!this.ide.editorManager?.editor) return;
        
        const content = this.ide.editorManager.getValue();
        
        // Skip if content hasn't changed
        if (content === this.lastContent) {
            return;
        }
        
        // Skip if currently saving
        if (this.isSaving) {
            return;
        }
        
        // Skip if content is empty
        if (!content.trim()) {
            return;
        }

        this.isSaving = true;
        this.saveAttempts = 0;
        
        try {
            // Use file-operations.js for saving
            this.ide.fileOperations.saveStory();
            this.lastContent = content;
            this.lastSaveTime = new Date();
            this.addToHistory(content);
            DialogueManager.showSystemMessage('success', `Auto-saved successfully (${this.getFormattedTime()})`);
            this.updateStatusBar();
            
        } catch (error) {
            console.error('Smart Auto-Save failed:', error);
            DialogueManager.showSystemMessage('error', `Auto-save failed: ${error.message}`);
        } finally {
            this.isSaving = false;
        }
    }

    async saveWithRetry(content) {
        // No longer needed: all saving is handled by fileOperations.saveStory()
        return;
    }

    addToHistory(content) {
        const saveEntry = {
            content: content,
            timestamp: new Date().toISOString(),
            contentLength: content.length,
            lineCount: content.split('\n').length
        };
        
        this.saveHistory.unshift(saveEntry);
        
        // Keep only recent history
        if (this.saveHistory.length > this.maxHistorySize) {
            this.saveHistory = this.saveHistory.slice(0, this.maxHistorySize);
        }
    }

    setupNotifications() {
        // Create notification container if it doesn't exist
        this.notificationContainer = document.getElementById('notification-container') || 
            this.createNotificationContainer();
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    // Replace all notification calls with DialogueManager.showSystemMessage
    // Example: DialogueManager.showSystemMessage('info', 'Auto-saved successfully (HH:MM)');

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-triangle',
            'warning': 'exclamation-circle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getFormattedTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    updateStatusBar() {
        const statusBar = document.getElementById('status');
        if (statusBar && this.lastSaveTime) {
            const timeAgo = this.getTimeAgo(this.lastSaveTime);
            statusBar.innerHTML = `<i class="fas fa-save"></i> Last saved ${timeAgo}`;
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        
        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    // Recovery methods
    async recoverContent() {
        try {
            // Try localStorage first
            let content = localStorage.getItem('cosmosx-editor-content');
            
            if (!content) {
                // Try session storage as backup
                content = sessionStorage.getItem('cosmosx-editor-content');
            }
            
            if (content) {
                DialogueManager.showSystemMessage('success', '📄 Content recovered from auto-save');
                return content;
            } else {
                DialogueManager.showSystemMessage('warning', '⚠️ No auto-save content found');
                return null;
            }
        } catch (error) {
            DialogueManager.showSystemMessage('error', `❌ Recovery failed: ${error.message}`);
            return null;
        }
    }

    getSaveHistory() {
        return this.saveHistory.map(entry => ({
            ...entry,
            formattedTime: new Date(entry.timestamp).toLocaleString(),
            size: this.formatFileSize(entry.contentLength)
        }));
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // Manual save trigger
    async forceSave() {
        // Use file-operations.js for force save
        this.ide.fileOperations.saveStory();
        this.lastContent = this.ide.editorManager.getValue();
        this.lastSaveTime = new Date();
        this.addToHistory(this.lastContent);
        DialogueManager.showSystemMessage('success', `Auto-saved successfully (${this.getFormattedTime()})`);
        this.updateStatusBar();
    }

    // Settings management
    updateSettings(settings) {
        const wasEnabled = this.isEnabled;
        this.isEnabled = settings.autoSave !== false;
        this.autoSaveInterval = settings.autoSaveInterval || 30000;
        
        if (this.isEnabled && !wasEnabled) {
            this.startAutoSave();
        } else if (!this.isEnabled && wasEnabled) {
            this.stopAutoSave();
        } else if (this.isEnabled && wasEnabled) {
            // Restart with new interval
            this.stopAutoSave();
            this.startAutoSave();
        }
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getSaveStats() {
        return {
            isEnabled: this.isEnabled,
            interval: this.autoSaveInterval,
            lastSave: this.lastSaveTime,
            historySize: this.saveHistory.length,
            isSaving: this.isSaving,
            saveAttempts: this.saveAttempts
        };
    }

    // Cleanup
    destroy() {
        this.stopAutoSave();
        this.saveHistory = [];
    }
} 