// Editor Manager Module
// Handles all editor-related functionality: Monaco setup, events, formatting, etc.

import { CoslangSyntaxValidator } from '../syntax-validator.js';
import { parseCosLang } from '../cosmosx-engine/core/CosmosEngine/parser.js';
import { CosmosEngine } from '../cosmosx-engine/core/CosmosEngine/engine.js';
import { lintCoslang } from './coslang-linter.js';
import { getEngineDiagnostics } from '../cosmosx-engine/utils/engine-diagnostics.js';
import { getSmartAutocorrections } from './coslang-autocorrect.js';
import { DialogueManager } from './dialogues.js';

export class EditorManager {
    constructor(ide) {
        this.ide = ide;
        this.editor = null;
        this.autocomplete = null;
        this.autoSaveTimer = null;
    }

    setupEditor() {
        // Wait for Monaco to be ready
        const checkEditor = setInterval(() => {
            if (window.coslangEditor) {
                clearInterval(checkEditor);
                this.editor = window.coslangEditor;
                this.setupEditorEvents();
                this.setupAutocomplete();
                this.validateCode();
                this.restoreLastSavedContent(); // Restore from localStorage after editor is ready
            }
        }, 100);
    }

    setupEditorFeatures() {
        if (!this.editor) return;

        // Apply editor settings
        this.applyEditorSettings();
        
        // Setup editor events
        this.setupEditorEvents();
        
        // Setup autocomplete
        this.setupAutocomplete();
    }

    setupAutocomplete() {
        // Autocomplete is now handled by monaco-setup.js to prevent double registration
        // This method is kept for compatibility but doesn't register again
        if (window.CoslangAutocomplete && !window.CoslangAutocomplete.isRegistered) {
            this.autocomplete = new window.CoslangAutocomplete();
            this.autocomplete.registerWithMonaco();
        }
    }

    applyEditorSettings() {
        if (!this.editor) return;

        const settings = this.ide.settingsManager.getAllSettings();
        
        // Apply font size
        this.editor.updateOptions({
            fontSize: settings.fontSize,
            wordWrap: settings.wordWrap ? 'on' : 'off',
            minimap: {
                enabled: settings.minimap
            }
        });
    }

    setupEditorEvents() {
        if (!this.editor) return;
        
        // Debounce validation and parsing to prevent performance issues
        let validationTimeout;
        let parsingTimeout;
        
        // Content change
        this.editor.onDidChangeModelContent(() => {
            this.ide.settingsManager.updateSetting('isModified', true);
            this.ide.uiManager.updateStatus('Modified');
            
            // Debounce parsing
            clearTimeout(parsingTimeout);
            parsingTimeout = setTimeout(() => {
                try {
                    const content = this.getValue();
                    
                    // Parse to AST and assign engine
                    const ast = parseCosLang(content);
                    
                    this.ide.engine = new CosmosEngine(ast);
                    
                    // Update scene sidebar
                    if (this.ide.sceneManager) {
                        this.ide.sceneManager.updateSceneSidebar();
                    }
                } catch (e) {
                    // If parsing fails, still update sidebar to show empty state
                    this.ide.engine = null;
                    if (this.ide.sceneManager) {
                        this.ide.sceneManager.updateSceneSidebar();
                    }
                }
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

    setupAutoSave() {
        // Use the new Smart Auto-Save system
        if (!this.ide.smartAutoSave) {
            import('./smart-auto-save.js').then(module => {
                this.ide.smartAutoSave = new module.SmartAutoSave(this.ide);
            });
        }
    }

    async autoSave() {
        // Delegate to smart auto-save system
        if (this.ide.smartAutoSave) {
            await this.ide.smartAutoSave.forceSave();
        }
    }

    formatCode() {
        if (!this.editor) return;
        
        const content = this.editor.getValue();
        const formatted = this.formatCoslangCode(content);
        this.editor.setValue(formatted);
        this.ide.uiManager.showNotification('Code formatted!', 'success');
    }

    formatCoslangCode(code) {
        // Basic Coslang formatting
        let formatted = code;
        
        // Add proper spacing around scene definitions
        formatted = formatted.replace(/scene\s+(\w+)\s*\{/g, 'scene $1 {\n');
        
        // Add proper spacing around choices
        formatted = formatted.replace(/\s*choice\s+/g, '\n    choice ');
        
        // Add proper spacing around text blocks
        formatted = formatted.replace(/\s*text:\s*/g, '\n    text: ');
        
        // Add proper spacing around variable assignments
        formatted = formatted.replace(/\s*=\s*/g, ' = ');
        
        // Clean up multiple newlines
        formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        return formatted;
    }

    toggleComment() {
        if (!this.editor) return;
        
        const selection = this.editor.getSelection();
        const model = this.editor.getModel();
        
        if (!selection || !model) return;
        
        const startLine = selection.startLineNumber;
        const endLine = selection.endLineNumber;
        
        if (this.areLinesCommented(model, startLine, endLine)) {
            this.uncommentLines(model, startLine, endLine);
        } else {
            this.commentLines(model, startLine, endLine);
        }
    }

    areLinesCommented(model, startLine, endLine) {
        for (let line = startLine; line <= endLine; line++) {
            const lineContent = model.getLineContent(line).trim();
            if (lineContent && !lineContent.startsWith('//')) {
                return false;
            }
        }
        return true;
    }

    commentLines(model, startLine, endLine) {
        const edits = [];
        for (let line = startLine; line <= endLine; line++) {
            const lineContent = model.getLineContent(line);
            if (lineContent.trim()) {
                edits.push({
                    range: new monaco.Range(line, 1, line, 1),
                    text: '// '
                });
            }
        }
        this.editor.executeEdits('comment', edits);
    }

    uncommentLines(model, startLine, endLine) {
        const edits = [];
        for (let line = startLine; line <= endLine; line++) {
            const lineContent = model.getLineContent(line);
            if (lineContent.trim().startsWith('// ')) {
                edits.push({
                    range: new monaco.Range(line, 1, line, 4),
                    text: ''
                });
            }
        }
        this.editor.executeEdits('uncomment', edits);
    }

    highlightCurrentScene(lineNumber) {
        if (!this.editor) return;
        
        const sceneName = this.findSceneAtLine(lineNumber);
        if (sceneName) {
            // Remove previous highlights
            this.editor.deltaDecorations([], []);
            
            // Add highlight for current scene
            const sceneRegex = new RegExp(`scene\\s+${sceneName}\\s*\\{`, 'i');
            const content = this.editor.getValue();
            const match = sceneRegex.exec(content);
            
            if (match) {
                const startPos = this.editor.getModel().getPositionAt(match.index);
                const endPos = this.editor.getModel().getPositionAt(match.index + match[0].length);
                
                this.editor.deltaDecorations([], [{
                    range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
                    options: {
                        isWholeLine: true,
                        className: 'current-scene-highlight'
                    }
                }]);
            }
        }
    }

    findSceneAtLine(lineNumber) {
        if (!this.editor) return null;
        
        const content = this.editor.getValue();
        const lines = content.split('\n');
        
        for (let i = lineNumber - 1; i >= 0; i--) {
            const line = lines[i];
            const sceneMatch = line.match(/scene\s+(\w+)\s*\{/);
            if (sceneMatch) {
                return sceneMatch[1];
            }
        }
        
        return null;
    }

    validateCode() {
        if (!this.editor) return;
        // Only update squiggles/markers, not error panel merging
        const content = this.editor.getValue();
        // Use ErrorManager to handle error panel and merging
        if (window.ide && window.ide.errorManager) {
            window.ide.errorManager.forceValidate();
        }
        // Show squiggles in Monaco for all errors/warnings/info
        const errorManager = window.ide && window.ide.errorManager;
        if (window.monaco && this.editor.getModel() && errorManager) {
            const markers = [
                ...(errorManager.errors || []),
                ...(errorManager.warnings || []),
                ...(errorManager.info || [])
            ].map(d => ({
                severity: d.type === 'error' ? monaco.MarkerSeverity.Error : d.type === 'warning' ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Info,
                message: d.message,
                startLineNumber: d.line,
                startColumn: d.column || 1,
                endLineNumber: d.line,
                endColumn: (d.column || 1) + 1
            }));
            monaco.editor.setModelMarkers(this.editor.getModel(), 'coslang-linter', markers);
        }
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
        
        this.ide.uiManager.updateStatus(`Navigated to line ${lineNumber}`);
    }

    getValue() {
        return this.editor ? this.editor.getValue() : '';
    }

    setValue(content) {
        if (this.editor) {
            this.editor.setValue(content);
        }
    }

    restoreLastSavedContent() {
        const saved = localStorage.getItem('cosmosx-editor-content');
        if (saved && saved.trim()) {
            this.setValue(saved);
            // Use the new system message dialog for notification
            DialogueManager.showSystemMessage('info', 'Restored last saved story from local storage.', { duration: 3500 });
        }
    }
} 