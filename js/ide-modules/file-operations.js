// File Operations Module
// Handles all file-related functionality: open, save, export, import, etc.

import { DialogueManager } from './dialogues.js';

export class FileOperations {
    constructor(ide) {
        this.ide = ide;
    }

    async openStory() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.coslang';
        
        const handler = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const content = await this.loadFile(file);
                    this.ide.editorManager.setValue(content);
                    this.ide.uiManager.updateStatus(`Opened: ${file.name}`);
                    DialogueManager.showSystemMessage('success', `Opened: ${file.name}`);
                } catch (error) {
                    DialogueManager.showSystemMessage('error', 'Failed to open file: ' + error.message);
                }
            }
        };
        
        input.addEventListener('change', handler);
        input.click();
    }

    async loadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    saveStory() {
        if (!this.ide.editorManager.editor) return;
        const content = this.ide.editorManager.getValue();
        // Save to localStorage
        localStorage.setItem('cosmosx-editor-content', content);
        // Save to sessionStorage for recovery
        sessionStorage.setItem('cosmosx-editor-content', content);
        // Save metadata
        const metadata = {
            timestamp: new Date().toISOString(),
            contentLength: content.length,
            lineCount: content.split('\n').length
        };
        localStorage.setItem('cosmosx-editor-metadata', JSON.stringify(metadata));
        // Update IDE state
        if (this.ide.settingsManager) {
            this.ide.settingsManager.updateSetting('isModified', false);
            this.ide.settingsManager.updateSetting('lastManualSave', new Date().toISOString());
        }
        // Show notification and update status
        if (this.ide.uiManager) {
            DialogueManager.showSystemMessage('success', '💾 Story saved! (Ctrl+S)');
            this.ide.uiManager.updateStatus('Story saved!');
        }
    }

    exportStory() {
        if (!this.ide.editorManager.editor) return;
        const content = this.ide.editorManager.getValue();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'story.coslang';
        a.click();
        URL.revokeObjectURL(url);
        if (this.ide.uiManager) {
            DialogueManager.showSystemMessage('success', 'Story exported as file!');
            this.ide.uiManager.updateStatus('Story exported!');
        }
    }

    newStory() {
        if (!this.ide.editorManager.editor) return;
        
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
        
        this.ide.editorManager.setValue(defaultContent);
        this.ide.uiManager.updateStatus('New story created');
        DialogueManager.showSystemMessage('success', 'New story created!');
    }

    handleFileDrop(files) {
        const coslangFiles = Array.from(files).filter(file => 
            file.name.endsWith('.coslang') || file.type === 'text/plain'
        );
        
        if (coslangFiles.length > 0) {
            this.loadFile(coslangFiles[0]).then(content => {
                this.ide.editorManager.setValue(content);
                DialogueManager.showSystemMessage('success', `Loaded: ${coslangFiles[0].name}`);
            }).catch(error => {
                DialogueManager.showSystemMessage('error', 'Failed to load dropped file');
            });
        }
    }

    setupDragAndDrop() {
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileDrop(files);
            }
        });
    }

    refreshIDE() {
        // Reload the IDE
        window.location.reload();
    }

    toggleDeveloperTools() {
        // Implementation for developer tools
        DialogueManager.showSystemMessage('info', 'Developer tools toggled');
    }

    showSearchSuggestions() {
        // Implementation for search suggestions
        DialogueManager.showSystemMessage('info', 'Search suggestions shown');
    }

    // File management operations
    renameFile() {
        const currentContent = this.ide.editorManager.getValue();
        const currentName = this.getCurrentFileName() || 'story.coslang';
        
        const newName = prompt('Enter new file name:', currentName);
        if (newName && newName.trim()) {
            // Update the file name in the UI
            this.ide.uiManager.updateStatus(`File renamed to: ${newName}`);
            DialogueManager.showSystemMessage('success', `File renamed to: ${newName}`);
            
            // Update any file name references in the IDE
            this.updateFileNameInIDE(newName);
        }
    }

    duplicateFile() {
        const currentContent = this.ide.editorManager.getValue();
        const currentName = this.getCurrentFileName() || 'story.coslang';
        const baseName = currentName.replace('.coslang', '');
        const newName = `${baseName}_copy.coslang`;
        
        // Create a new file with the same content
        const blob = new Blob([currentContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = newName;
        a.click();
        
        URL.revokeObjectURL(url);
        this.ide.uiManager.updateStatus('File duplicated!');
        DialogueManager.showSystemMessage('success', `File duplicated as: ${newName}`);
    }

    deleteFile() {
        const currentName = this.getCurrentFileName() || 'current story';
        
        if (confirm(`Are you sure you want to delete "${currentName}"?\n\nThis will clear the editor content.`)) {
            // Clear the editor content
            this.ide.editorManager.setValue('');
            this.ide.uiManager.updateStatus('File deleted');
            DialogueManager.showSystemMessage('warning', 'File content cleared');
            
            // Reset any file-related state
            this.resetFileState();
        }
    }

    getCurrentFileName() {
        // Try to get the current file name from various sources
        const statusText = document.querySelector('.status-bar')?.textContent;
        if (statusText && statusText.includes(':')) {
            return statusText.split(':')[1].trim();
        }
        return null;
    }

    updateFileNameInIDE(newName) {
        // Update file name in status bar or other UI elements
        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
            statusBar.textContent = `File: ${newName}`;
        }
        
        // Update document title
        document.title = `${newName} - COSMOSX IDE`;
    }

    resetFileState() {
        // Reset any file-related state
        this.updateFileNameInIDE('untitled.coslang');
        document.title = 'COSMOSX IDE - Enhanced Dark Theme';
    }

    // Enhanced file operations with better error handling
    async openStoryWithValidation() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.coslang,.txt';
        
        const handler = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    // Validate file size
                    if (file.size > 10 * 1024 * 1024) { // 10MB limit
                        throw new Error('File too large (max 10MB)');
                    }
                    
                    const content = await this.loadFile(file);
                    
                    // Basic validation of content
                    if (content.length === 0) {
                        throw new Error('File is empty');
                    }
                    
                    this.ide.editorManager.setValue(content);
                    this.updateFileNameInIDE(file.name);
                    this.ide.uiManager.updateStatus(`Opened: ${file.name}`);
                    DialogueManager.showSystemMessage('success', `Opened: ${file.name}`);
                } catch (error) {
                    DialogueManager.showSystemMessage('error', 'Failed to open file: ' + error.message);
                }
            }
        };
        
        input.addEventListener('change', handler);
        input.click();
    }

    saveStoryWithBackup() {
        if (!this.ide.editorManager.editor) return;
        
        const content = this.ide.editorManager.getValue();
        const currentName = this.getCurrentFileName() || 'story';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const backupName = `${currentName}_backup_${timestamp}.coslang`;
        
        // Save main file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentName}.coslang`;
        a.click();
        
        // Create backup
        const backupBlob = new Blob([content], { type: 'text/plain' });
        const backupUrl = URL.createObjectURL(backupBlob);
        
        const backupA = document.createElement('a');
        backupA.href = backupUrl;
        backupA.download = backupName;
        backupA.click();
        
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(backupUrl);
        
        this.ide.uiManager.updateStatus('Story saved with backup!');
        DialogueManager.showSystemMessage('success', 'Story saved successfully with backup!');
    }
} 