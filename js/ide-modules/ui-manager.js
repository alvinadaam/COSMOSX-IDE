// UI Manager Module
// Handles all UI-related functionality: tabs, buttons, notifications, status updates

import { DialogueManager } from './dialogues.js';

export class UIManager {
    constructor(ide) {
        this.ide = ide;
        this.currentTab = 'editor';
        // this.notificationContainer = null; // Removed as per edit hint
        this.statusBar = null;
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
            this.ide.updateDebugPanel();
        }
    }

    setupButtons() {
        const buttonConfigs = [
            { id: 'save-btn', action: () => this.ide.saveStory(), tooltip: 'Save Story (Ctrl+S)' },
            { id: 'preview-btn', action: () => this.ide.startPreview(), tooltip: 'Preview Story (Ctrl+P)' },
            { id: 'new-btn', action: () => this.ide.newStory(), tooltip: 'New Story (Ctrl+N)' },
            { id: 'open-btn', action: () => this.ide.openStory(), tooltip: 'Open Story (Ctrl+O)' },
            { id: 'export-btn', action: () => this.ide.exportStory(), tooltip: 'Export Story (Ctrl+E)' },
            { id: 'rename-btn', action: () => this.ide.fileOperations?.renameFile(), tooltip: 'Rename File (Ctrl+R)' },
            { id: 'duplicate-btn', action: () => this.ide.fileOperations?.duplicateFile(), tooltip: 'Duplicate File (Ctrl+D)' },
            { id: 'delete-btn', action: () => this.ide.fileOperations?.deleteFile(), tooltip: 'Delete File (Del)' },
            { id: 'add-asset', action: () => this.ide.addAsset(), tooltip: 'Add Asset' },
            { id: 'search-scenes', action: () => this.ide.toggleSceneSearch(), tooltip: 'Search Scenes (Ctrl+F)' },
            { id: 'refresh-scenes', action: () => {/* removed legacy this.parseScenes() */}, tooltip: 'Refresh Scenes' },
            { id: 'add-scene', action: () => this.ide.addNewScene(), tooltip: 'Add New Scene' }
        ];
        
        buttonConfigs.forEach(config => {
            const button = document.getElementById(config.id);
            if (button) {
                // Add tooltip
                button.setAttribute('data-tooltip', config.tooltip);
                
                // Add loading state support
                button.addEventListener('click', async (e) => {
                    e.preventDefault();
                    
                    if (button.classList.contains('loading')) return;
                    
                    button.classList.add('loading');
                    button.disabled = true;
                    
                    try {
                        await config.action();
                    } catch (error) {
                        console.error(`Error in ${config.id}:`, error);
                        DialogueManager.showSystemMessage(`Error: ${error.message}`, 'error');
                    } finally {
                        button.classList.remove('loading');
                        button.disabled = false;
                    }
                });
                
                // Add hover effects
                button.addEventListener('mouseenter', () => {
                    if (!button.disabled) {
                        button.style.transform = 'translateY(-1px)';
                    }
                });
                
                button.addEventListener('mouseleave', () => {
                    button.style.transform = '';
                });
            }
        });
        
        // Scene search input with enhanced functionality
        const sceneSearchInput = document.getElementById('scene-search');
        if (sceneSearchInput) {
            let searchTimeout;
            
            sceneSearchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.ide.updateSceneSidebar(e.target.value);
                }, 300);
            });
            
            // Add search suggestions
            sceneSearchInput.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });
        }
    }

    // Remove showNotification and notificationContainer logic
    // Replace all showNotification calls with DialogueManager.showSystemMessage
    // Example: DialogueManager.showSystemMessage('info', message);

    // getNotificationIcon(type) { // Removed as per edit hint
    //     switch (type) {
    //         case 'success': return 'check-circle';
    //         case 'error': return 'exclamation-triangle';
    //         case 'warning': return 'exclamation-circle';
    //         default: return 'info-circle';
    //     }
    // }

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

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S: Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.ide.saveStory();
            }
            
            // Ctrl/Cmd + N: New story
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.ide.newStory();
            }
            
            // Ctrl/Cmd + O: Open story
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                this.ide.openStory();
            }
            
            // Ctrl/Cmd + P: Preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.ide.startPreview();
            }
            
            // Ctrl/Cmd + R: Rename file
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.ide.fileOperations?.renameFile();
            }
            
            // Ctrl/Cmd + D: Duplicate file
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.ide.fileOperations?.duplicateFile();
            }
            
            // Delete: Delete file
            if (e.key === 'Delete' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.ide.fileOperations?.deleteFile();
            }
            
            // F12: Developer tools
            if (e.key === 'F12') {
                e.preventDefault();
                this.ide.fileOperations.toggleDeveloperTools();
            }
        });
    }

    setupContextMenus() {
        // Scene context menu
        document.addEventListener('contextmenu', (e) => {
            const sceneItem = e.target.closest('.scene-item');
            if (sceneItem) {
                e.preventDefault();
                this.showSceneContextMenu(e, sceneItem);
            }
        });
    }

    showSceneContextMenu(e, sceneItem) {
        const sceneName = sceneItem.querySelector('.scene-name')?.textContent;
        if (!sceneName) return;

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="menu-item" onclick="window.ide.handleSceneAction('edit', '${sceneName}')">
                <i class="fas fa-edit"></i> Edit Scene
            </div>
            <div class="menu-item" onclick="window.ide.handleSceneAction('duplicate', '${sceneName}')">
                <i class="fas fa-copy"></i> Duplicate Scene
            </div>
            <div class="menu-item" onclick="window.ide.handleSceneAction('delete', '${sceneName}')">
                <i class="fas fa-trash"></i> Delete Scene
            </div>
        `;
        
        menu.style.cssText = `
            position: fixed;
            left: ${e.pageX}px;
            top: ${e.pageY}px;
            background: var(--bg-elevated);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            min-width: 150px;
        `;
        
        document.body.appendChild(menu);
        
        // Remove menu when clicking outside
        const removeMenu = () => {
            menu.remove();
            document.removeEventListener('click', removeMenu);
        };
        
        setTimeout(() => {
            document.addEventListener('click', removeMenu);
        }, 100);
    }

    showSearchSuggestions() {
        // Implementation for search suggestions
        DialogueManager.showSystemMessage('Search suggestions shown', 'info');
    }
} 