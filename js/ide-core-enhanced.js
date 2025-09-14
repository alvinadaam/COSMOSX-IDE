// COSMOSX IDE Modular Orchestrator
// This file only wires up the modules and delegates all logic.

import { UIManager } from './ide-modules/ui-manager.js';
import { EditorManager } from './ide-modules/editor-manager.js';
import { FileOperations } from './ide-modules/file-operations.js';
import { SceneManager } from './ide-modules/scene-manager.js';
import { AssetManager } from './ide-modules/asset-manager.js';
import { DebugManager } from './ide-modules/debug-manager.js';
import { PerformanceMonitor } from './ide-modules/performance-monitor.js';
import { SettingsManager } from './ide-modules/settings-manager.js';
import { EventSystem } from './ide-modules/event-system.js';
import { ScrollbarSystem } from './ide-modules/scrollbar-system.js';
import { ModernLivePreview } from './ide-modules/live-preview-modern.js';
import { ErrorManager } from './ide-modules/error-manager.js';
import { SmartAutoSave } from './ide-modules/smart-auto-save.js';
import { parseCosLang } from './cosmosx-engine/core/CosmosEngine/parser.js';
import { CosmosEngine } from './cosmosx-engine/core/CosmosEngine/engine.js';
import { DialogueManager } from './ide-modules/dialogues.js';

if (typeof window.CosmosXIDE === 'undefined') {
    window.CosmosXIDE = class CosmosXIDE {
        constructor() {
            // Instantiate all managers
            this.settingsManager = new SettingsManager(this);
            this.eventSystem = new EventSystem(this);
            this.uiManager = new UIManager(this);
            this.editorManager = new EditorManager(this);
            this.fileOperations = new FileOperations(this);
            this.sceneManager = new SceneManager(this);
            this.assetManager = new AssetManager(this);
            this.debugManager = new DebugManager(this);
            this.performanceMonitor = new PerformanceMonitor(this);
            this.scrollbarSystem = new ScrollbarSystem(this);
            this.livePreview = new ModernLivePreview();
            this.errorManager = new ErrorManager(this);
            this.smartAutoSave = new SmartAutoSave(this);
            this.errors = [];
            this.engine = null;
            this.init();
        }

        init() {
            // Setup all modules
            this.uiManager.setupTabs();
            this.uiManager.setupButtons();
            this.uiManager.setupKeyboardShortcuts();
            this.uiManager.setupContextMenus();
            this.editorManager.setupEditor();
            this.editorManager.setupEditorFeatures();
            this.editorManager.setupAutoSave();
            this.fileOperations.setupDragAndDrop();
            this.sceneManager.initializeScenesPanel();
            this.assetManager.setupAssetPanel();
            this.debugManager.setupDebugPanel();
            this.debugManager.setupErrorPanel();
            this.performanceMonitor.setupPerformanceMonitoring();
            this.scrollbarSystem.initialize();
            this.livePreview.init();
            
            // Initial scene update
            setTimeout(() => {
                if (this.sceneManager) {
                    this.sceneManager.updateSceneSidebar();
                }
            }, 1000);
            
            DialogueManager.showSystemMessage('info', 'COSMOSX IDE Ready!');
        }

        // Essential methods that need to be in the main orchestrator
        startPreview() {
            if (!this.editorManager.editor) {
                DialogueManager.showSystemMessage('error', 'Editor not ready!');
                return;
            }
            
            // Switch to preview tab first
            this.uiManager.switchTab('preview');
            
            // Use the Modern LivePreview module
            const content = this.editorManager.getValue();
            this.livePreview.updatePreview(content);
            DialogueManager.showSystemMessage('success', 'Preview started successfully!');
            this.debugManager.addDebugLogEntry('Preview started', 'success');
        }

        updateDebugPanel() {
            this.debugManager.updateDebugPanel();
        }

        navigateToLine(lineNumber) {
            this.editorManager.navigateToLine(lineNumber);
        }

        addNewScene() {
            this.sceneManager.addNewScene();
        }

        toggleSceneSearch() {
            this.sceneManager.toggleSceneSearch();
        }

        updateSceneSidebar(searchTerm = '') {
            this.sceneManager.updateSceneSidebar(searchTerm);
        }

        addAsset() {
            this.assetManager.addAsset();
        }

        insertAsset(assetName, assetType) {
            this.assetManager.insertAsset(assetName, assetType);
        }

        saveStory() {
            this.fileOperations.saveStory();
        }

        newStory() {
            this.fileOperations.newStory();
        }

        openStory() {
            this.fileOperations.openStory();
        }

        exportStory() {
            this.fileOperations.exportStory();
        }

        showNotification(message, type = 'info') {
            DialogueManager.showSystemMessage(type, message);
        }

        updateStatus(message) {
            this.uiManager.updateStatus(message);
        }

        addDebugLogEntry(message, type = 'info') {
            this.debugManager.addDebugLogEntry(message, type);
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // Prevent duplicate initialization
    if (!window.ide) {
        window.ide = new window.CosmosXIDE();
    }
});

// Initialize debug panel manager
if (window.DebugPanelManager) {
    window.debugPanelManager = new window.DebugPanelManager();
    window.debugPanelManager.initialize();
}