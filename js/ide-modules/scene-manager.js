// Scene Manager Module
// Handles all scene-related functionality: scene sidebar, scene management, etc.

import { parseCosLang } from '../cosmosx-engine/core/CosmosEngine/parser.js';
import { CosmosEngine } from '../cosmosx-engine/core/CosmosEngine/engine.js';
import { getScenesList } from '../cosmosx-engine/core/CosmosUI/components/ScenesList.js';
import { getEngineDiagnostics } from '../cosmosx-engine/utils/engine-diagnostics.js';
import { filterScenes, sortScenes, createSceneQuickActions } from './scenes-advanced.js';
import { DialogueManager } from './dialogues.js';

export class SceneManager {
    constructor(ide) {
        this.ide = ide;
        this.scenes = [];
        this.currentScene = null;
        this.sceneSearchVisible = false;
        this.dialogueManager = new DialogueManager();
    }

    initializeScenesPanel() {
        this.setupScenePanelEvents();
        this.updateSceneSidebar();
    }

    setupScenePanelEvents() {
        // Scene search toggle
        const searchScenesBtn = document.getElementById('search-scenes');
        if (searchScenesBtn) {
            searchScenesBtn.addEventListener('click', () => {
                this.toggleSceneSearch();
            });
        }

        // Refresh scenes button
        const refreshScenesBtn = document.getElementById('refresh-scenes');
        if (refreshScenesBtn) {
            refreshScenesBtn.addEventListener('click', () => {
                this.updateSceneSidebar();
            });
        }

        // Add scene button
        const addSceneBtn = document.getElementById('add-scene');
        if (addSceneBtn) {
            addSceneBtn.addEventListener('click', () => {
                this.addNewScene();
            });
        }

        // Scene search input
        const sceneSearchInput = document.getElementById('scene-search');
        if (sceneSearchInput) {
            sceneSearchInput.addEventListener('input', (e) => {
                this.updateSceneSidebar(e.target.value);
            });
        }
    }

    updateSceneSidebar(searchTerm = '') {
        if (!this.ide.editorManager || !this.ide.editorManager.editor) {
            return;
        }

        try {
            const content = this.ide.editorManager.getValue();
            if (!content.trim()) {
                this.displayEmptyState();
                return;
            }

            // Parse the content to get scenes and metadata
            const ast = parseCosLang(content);
            
            // Use the proper engine components
            const scenesList = getScenesList(ast);
            this.scenes = scenesList;

            console.log('Scenes parsed:', this.scenes.length, 'scenes found');
            console.log('Scene IDs:', this.scenes.map(s => s.id));
            console.log('Metadata:', ast.meta);

            // Display metadata first
            this.displayMetadata(ast.meta);

            // Use the advanced filtering from scenes-advanced.js
            const filteredScenes = filterScenes(this.scenes, searchTerm);
            
            // Sort scenes by ID for better organization
            const sortedScenes = sortScenes(filteredScenes, 'id', true);

            this.displayScenes(sortedScenes);
            
            // Update engine diagnostics
            this.updateEngineDiagnostics(ast);
        } catch (error) {
            console.warn('Error parsing scenes:', error);
            this.displayErrorState();
        }
    }

    displayMetadata(meta) {
        const sceneList = document.getElementById('scene-list');
        if (!sceneList) {
            console.warn('Scene list element not found');
            return;
        }

        // Clear existing content
        sceneList.innerHTML = '';

        // Add metadata section
        if (meta && (meta.title || meta.author || meta.version)) {
            const metadataDiv = document.createElement('div');
            metadataDiv.className = 'metadata-section';
            metadataDiv.innerHTML = `
                <div class="metadata-header">
                    <i class="fas fa-info-circle"></i>
                    <span>Story Info</span>
                </div>
                <div class="metadata-content">
                    ${meta.title ? `<div class="meta-item"><strong>Title:</strong> ${meta.title}</div>` : ''}
                    ${meta.author ? `<div class="meta-item"><strong>Author:</strong> ${meta.author}</div>` : ''}
                    ${meta.version ? `<div class="meta-item"><strong>Version:</strong> ${meta.version}</div>` : ''}
                </div>
            `;
            sceneList.appendChild(metadataDiv);
        }
    }

    displayScenes(scenes) {
        const sceneList = document.getElementById('scene-list');
        if (!sceneList) {
            console.warn('Scene list element not found');
            return;
        }

        console.log('Displaying scenes:', scenes.length);

        // Don't clear the list here since metadata is already added
        // sceneList.innerHTML = '';

        if (scenes.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';
            emptyDiv.innerHTML = `
                <i class="fas fa-search"></i>
                <p>No scenes found</p>
                <small>Try adjusting your search terms</small>
            `;
            sceneList.appendChild(emptyDiv);
            return;
        }

        scenes.forEach(scene => {
            const sceneElement = this.createSceneElement(scene);
            sceneList.appendChild(sceneElement);
        });
    }

    createSceneElement(scene) {
        const sceneDiv = document.createElement('div');
        sceneDiv.className = 'scene-item';
        sceneDiv.dataset.sceneId = scene.id;

        // Extract scene information from the AST structure
        const content = scene.content || [];
        const textBlocks = content.filter(item => item.type === 'text').map(item => item.value);
        const choices = content.filter(item => item.type === 'choice');
        const hasChoices = choices.length > 0;
        const hasText = textBlocks.length > 0;
        const isStartScene = scene.id === 'start';
        const sceneText = textBlocks.join(' ');

        // Use the enhanced styling approach
        sceneDiv.innerHTML = `
            <div class="scene-header">
                <div class="scene-id">
                    <i class="fas ${isStartScene ? 'fa-play-circle' : 'fa-circle'}"></i>
                    ${scene.id}
                    ${isStartScene ? '<span class="start-badge">START</span>' : ''}
                </div>
                <div class="scene-indicators">
                    ${hasText ? '<i class="fas fa-file-alt" title="Has text"></i>' : ''}
                    ${hasChoices ? `<i class="fas fa-list" title="${choices.length} choices"></i>` : ''}
                </div>
            </div>
            ${hasText ? `<div class="scene-preview-text">${this.truncateText(sceneText, 60)}</div>` : ''}
        `;

        // Add click handler to navigate to scene
        sceneDiv.addEventListener('click', () => {
            this.navigateToScene(scene.id);
        });

        // Add context menu
        sceneDiv.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showSceneContextMenu(e, scene);
        });

        return sceneDiv;
    }

    navigateToScene(sceneId) {
        if (!this.ide.editorManager || !this.ide.editorManager.editor) {
            return;
        }

        const content = this.ide.editorManager.getValue();
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim().match(new RegExp(`scene\\s+${sceneId}\\s*\\{`))) {
                this.ide.editorManager.navigateToLine(i + 1);
                // Use DialogueManager instead of uiManager for notifications
                if (window.DialogueManager) {
                    window.DialogueManager.showSystemMessage('info', `Navigated to scene: ${sceneId}`);
                } else {
                    console.log(`Navigated to scene: ${sceneId}`);
                }
                return;
            }
        }

        // Use DialogueManager instead of uiManager for notifications
        if (window.DialogueManager) {
            window.DialogueManager.showSystemMessage('warning', `Scene "${sceneId}" not found in editor`);
        } else {
            console.warn(`Scene "${sceneId}" not found in editor`);
        }
    }

    showSceneContextMenu(e, scene) {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="menu-item" data-action="navigate">
                <i class="fas fa-arrow-right"></i> Go to Scene
            </div>
            <div class="menu-item" data-action="copy">
                <i class="fas fa-copy"></i> Copy Scene ID
            </div>
            <div class="menu-item" data-action="rename">
                <i class="fas fa-edit"></i> Rename Scene
            </div>
            <div class="menu-item" data-action="duplicate">
                <i class="fas fa-clone"></i> Duplicate Scene
            </div>
            <div class="menu-item" data-action="delete">
                <i class="fas fa-trash"></i> Delete Scene
            </div>
        `;

        // Position menu
        menu.style.position = 'fixed';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        menu.style.zIndex = '10000';

        document.body.appendChild(menu);

        // Handle menu actions
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.menu-item')?.dataset.action;
            if (action) {
                this.handleSceneAction(action, scene);
            }
            menu.remove();
        });

        // Remove menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', () => menu.remove(), { once: true });
        }, 100);
    }

    handleSceneAction(action, scene) {
        switch (action) {
            case 'navigate':
                this.navigateToScene(scene.id);
                break;
            case 'copy':
                navigator.clipboard.writeText(scene.id);
                this.ide.uiManager.showNotification('Scene ID copied to clipboard', 'success');
                break;
            case 'rename':
                this.renameScene(scene);
                break;
            case 'delete':
                this.deleteScene(scene);
                break;
            case 'duplicate':
                this.duplicateScene(scene);
                break;
        }
    }

    updateEngineDiagnostics(ast) {
        try {
            const diagnostics = getEngineDiagnostics(ast);
            if (diagnostics.length > 0) {
                console.log('Engine diagnostics:', diagnostics);
                // You can display these in the debug panel or error panel
                if (this.ide.debugManager) {
                    this.ide.debugManager.addDiagnostics(diagnostics);
                }
            }
        } catch (error) {
            console.warn('Error getting engine diagnostics:', error);
        }
    }

    renameScene(scene) {
        this.dialogueManager.showInputDialogue({
            title: 'Rename Scene',
            label: 'New scene name:',
            value: scene.id,
            okText: 'Rename',
            cancelText: 'Cancel',
            onOk: (newName) => {
                if (newName && newName.trim() && newName !== scene.id) {
                    // This would need to be implemented with proper editor integration
                    this.ide.uiManager.showNotification('Scene rename feature coming soon', 'info');
                }
            },
            onCancel: () => {
                // User cancelled
            }
        });
    }

    deleteScene(scene) {
        this.dialogueManager.showConfirmDialogue({
            title: 'Delete Scene',
            message: `Are you sure you want to delete scene "${scene.id}"? This action cannot be undone.`,
            okText: 'Delete',
            cancelText: 'Cancel',
            onOk: () => {
                // This would need to be implemented with proper editor integration
                this.ide.uiManager.showNotification('Scene delete feature coming soon', 'info');
            },
            onCancel: () => {
                // User cancelled
            }
        });
    }

    duplicateScene(scene) {
        this.dialogueManager.showInputDialogue({
            title: 'Duplicate Scene',
            label: 'New scene name:',
            value: scene.id + '_copy',
            okText: 'Duplicate',
            cancelText: 'Cancel',
            onOk: (newName) => {
                if (newName && newName.trim() && newName !== scene.id) {
                    // This would need to be implemented with proper editor integration
                    this.ide.uiManager.showNotification('Scene duplicate feature coming soon', 'info');
                }
            },
            onCancel: () => {
                // User cancelled
            }
        });
    }

    addNewScene() {
        this.dialogueManager.showInputDialogue({
            title: 'Add New Scene',
            label: 'Scene name:',
            value: '',
            okText: 'Add Scene',
            cancelText: 'Cancel',
            onOk: (sceneName) => {
                if (sceneName && sceneName.trim()) {
                    const sceneTemplate = `
scene ${sceneName.trim()} {
    text: "Your story continues here..."
    choice "Continue" -> next_scene
}`;

                    if (this.ide.editorManager && this.ide.editorManager.editor) {
                        const currentContent = this.ide.editorManager.getValue();
                        const newContent = currentContent + '\n\n' + sceneTemplate;
                        this.ide.editorManager.setValue(newContent);
                        this.ide.uiManager.showNotification(`Added new scene: ${sceneName.trim()}`, 'success');
                        this.updateSceneSidebar();
                    }
                }
            },
            onCancel: () => {
                // User cancelled
            }
        });
    }

    toggleSceneSearch() {
        const searchPanel = document.querySelector('.panel-search');
        if (searchPanel) {
            this.sceneSearchVisible = !this.sceneSearchVisible;
            searchPanel.style.display = this.sceneSearchVisible ? 'block' : 'none';
            
            if (this.sceneSearchVisible) {
                const searchInput = document.getElementById('scene-search');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        }
    }

    displayEmptyState() {
        const sceneList = document.getElementById('scene-list');
        if (sceneList) {
            sceneList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <p>No scenes yet</p>
                    <small>Start writing your story to see scenes here</small>
                </div>
            `;
        }
    }

    displayErrorState() {
        const sceneList = document.getElementById('scene-list');
        if (sceneList) {
            sceneList.innerHTML = `
                <div class="empty-state error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error parsing scenes</p>
                    <small>Check your syntax and try again</small>
                </div>
            `;
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
} 