// Simple Monaco Setup for COSMOSX IDE - Updated for v1.0 Engine
import { logger } from './cosmosx-engine/logger.js';
require(['vs/editor/editor.main'], function() {
    'use strict';
    
    console.log('🚀 Setting up Monaco editor...');
    
    try {
        // Register COSLANG language
        monaco.languages.register({ id: 'coslang' });
        
        // Import and setup beautiful syntax highlighting
        import('./coslang-syntax.js').then(module => {
            if (module.setupCoslangSyntax) {
                module.setupCoslangSyntax();
                // Force set theme after syntax is loaded
                monaco.editor.setTheme('coslang-beautiful');
            }
        }).catch(err => {
            console.warn('Could not load syntax highlighting:', err);
            // Fallback to dark theme even if syntax fails
            monaco.editor.setTheme('vs-dark');
        });
        
        // Create editor with proper dark theme
        const editor = monaco.editor.create(document.getElementById('editor'), {
            value: getDefaultContent(),
            language: 'coslang',
            theme: 'coslang-beautiful',
            automaticLayout: true,
            minimap: { enabled: true },
            wordWrap: 'on',
            lineNumbers: 'on',
            folding: true,
            scrollBeyondLastLine: false,
            selectOnLineNumbers: true,
            roundedSelection: false,
            renderLineHighlight: 'all',
            cursorStyle: 'line',
            fontSize: 14,
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            cursorBlinking: 'blink',
            cursorSmoothCaretAnimation: 'on',
            multiCursorModifier: 'alt',
            accessibilitySupport: 'on',
            scrollbar: {
                useShadows: true,
                verticalHasArrows: true,
                horizontalHasArrows: true,
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 14,
                horizontalScrollbarSize: 14,
                arrowSize: 20
            },
            // Proper cursor and selection settings
            fixedOverflowWidgets: true,
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: false,
            renderValidationDecorations: 'on',
            glyphMargin: true,
            lineDecorationsWidth: 20,
            lineNumbersMinChars: 3,
            // Ensure proper coordinate system
            pixelRatio: window.devicePixelRatio || 1,
            // Better cursor handling
            cursorWidth: 2,
            smoothScrolling: true,
            mouseWheelScrollSensitivity: 1,
            fastScrollSensitivity: 5
        });
        
        // Force set the theme immediately after creation
        editor.updateOptions({
            theme: 'coslang-beautiful'
        });
        
        // Also set it globally as a fallback
        monaco.editor.setTheme('coslang-beautiful');
        
        // Handle resize with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (editor && typeof editor.layout === 'function') {
                    editor.layout();
                }
            }, 150);
        });
        
        // Initialize editor properly after it's ready
        setTimeout(() => {
            if (editor && typeof editor.layout === 'function') {
                editor.layout();
                editor.focus();
                
                // Force theme application after editor is ready
                editor.updateOptions({
                    theme: 'coslang-beautiful'
                });
                
                // Also set theme globally
                monaco.editor.setTheme('coslang-beautiful');
                
                // Force editor background color
                const editorElement = document.getElementById('editor');
                if (editorElement) {
                    const monacoEditor = editorElement.querySelector('.monaco-editor');
                    if (monacoEditor) {
                        monacoEditor.style.backgroundColor = '#10131a';
                        const background = monacoEditor.querySelector('.monaco-editor-background');
                        if (background) {
                            background.style.backgroundColor = '#10131a';
                        }
                    }
                }
            }
            
            // Fix: Remove any inline z-index from header that's blocking the editor
            const header = document.querySelector('header');
            if (header && header.style.zIndex) {
                header.style.removeProperty('z-index');
            }
            
            // Comprehensive fix: Remove inline z-index from ALL elements that might be blocking
            const blockingSelectors = [
                'header',
                '.panel-header',
                '.sidebar',
                '.right-sidebar',
                '.editor-tabs',
                '.tab',
                '.tab-content',
                '.tab-pane',
                '.advanced-search-panel',
                '.formatting-options-panel',
                '.replace-dialog',
                '.notification',
                '.status-bar',
                '.controls',
                '.logo'
            ];
            
            // Force panel headers to have low z-index and ensure they don't overlap editor
            const panelHeaders = document.querySelectorAll('.panel-header');
            panelHeaders.forEach(panelHeader => {
                panelHeader.style.zIndex = '1';
                panelHeader.style.position = 'relative';
                panelHeader.style.pointerEvents = 'auto';
            });
            
            // Fix the right sidebar that's creating the stacking context
            const rightSidebar = document.querySelector('.right-sidebar');
            if (rightSidebar) {
                rightSidebar.style.zIndex = '5';
                rightSidebar.style.position = 'relative';
            }
            
            // Also ensure the editor has higher z-index than panels
            const editorElement = document.getElementById('editor');
            if (editorElement) {
                editorElement.style.zIndex = '10';
                editorElement.style.position = 'relative';
                
                // Debug editor container and layout
                const editorContainer = document.querySelector('.editor-container');
                if (editorContainer) {
                    const containerStyle = window.getComputedStyle(editorContainer);
                }
                
                // Debug main layout
                const mainElement = document.querySelector('main');
                if (mainElement) {
                    const mainStyle = window.getComputedStyle(mainElement);
                }
                
                // Debug sidebar that might be overlapping
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    const sidebarStyle = window.getComputedStyle(sidebar);
                }
            }
            
            blockingSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (element.style.zIndex && parseInt(element.style.zIndex) > 100) {
                        element.style.removeProperty('z-index');
                    }
                });
            });
            
            // Also check for any elements with position: fixed that might be covering
            const allElements = document.querySelectorAll('*');
            allElements.forEach(element => {
                const style = window.getComputedStyle(element);
                if (style.position === 'fixed' && style.zIndex && parseInt(style.zIndex) > 100) {
                    if (element.style.zIndex) {
                        element.style.removeProperty('z-index');
                    }
                }
            });
        }, 300);
        
        // Make editor globally available
        window.coslangEditor = editor;

        // Add logger debugging for editor events
        try {
            logger.info('Monaco editor created successfully', { editorId: editor.getId() });
            
            // Log focus events
            editor.onDidFocusEditorWidget(() => {
                logger.info('Editor focused');
            });
            
            // Log blur events
            editor.onDidBlurEditorWidget(() => {
                logger.info('Editor lost focus');
            });
            
            // Log content changes
            editor.onDidChangeModelContent(() => {
                logger.debug('Editor content changed');
            });
            
            // Test if editor is read-only
            const isReadOnly = editor.getOption(monaco.editor.EditorOption.readOnly);
            logger.info('Editor read-only status:', isReadOnly);
            
            // Deep debugging: Check for overlapping elements and layout issues
            const editorElement = document.getElementById('editor');
            if (editorElement) {
                const rect = editorElement.getBoundingClientRect();
                const elementsAtPoint = document.elementsFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
                
                // Check if editor is the top element
                if (elementsAtPoint[0] !== editorElement && !editorElement.contains(elementsAtPoint[0])) {
                    logger.error('Editor is covered by another element:', elementsAtPoint[0]);
                    
                    // Deep analysis of the covering element
                    const coveringElement = elementsAtPoint[0];
                    const coveringStyle = window.getComputedStyle(coveringElement);
                    
                    // Check parent elements for layout issues
                    let parent = coveringElement.parentElement;
                    let depth = 0;
                    while (parent && depth < 5) {
                        const parentStyle = window.getComputedStyle(parent);
                    }
                    
                    // Check editor's parent structure
                    let editorParent = editorElement.parentElement;
                    depth = 0;
                    while (editorParent && depth < 5) {
                        const parentStyle = window.getComputedStyle(editorParent);
                    }
                    
                    // Fix: Remove high z-index from header if it's blocking
                    const header = document.querySelector('header');
                    if (header && header.style.zIndex) {
                        header.style.removeProperty('z-index');
                    }
                }
            }
            
        } catch (loggerError) {
            console.error('Logger error:', loggerError);
        }

        // Register new Coslang autocomplete if available
        if (window.CoslangAutocomplete) {
            try {
                const autocomplete = new window.CoslangAutocomplete();
                autocomplete.registerWithMonaco();
                console.log('✅ Coslang autocomplete registered from monaco-setup.js');
            } catch (error) {
                console.error('Failed to register autocomplete:', error);
            }
        } else {
            console.warn('CoslangAutocomplete not available');
        }
        
        // Also load the separate autocomplete files
        if (typeof getQuickCompletions === 'function') {
            window.getQuickCompletions = getQuickCompletions;
            console.log('✅ Quick completions loaded');
        }
        
        if (typeof getSnippetCompletions === 'function') {
            window.getSnippetCompletions = getSnippetCompletions;
            console.log('✅ Snippet completions loaded');
        }
        
        // Set our custom beautiful theme
        monaco.editor.setTheme('coslang-beautiful');
        
        console.log('✅ Monaco editor ready!');
        
    } catch (error) {
        console.error('Monaco setup failed:', error);
        createFallbackEditor();
    }
    
    function createFallbackEditor() {
        const editorContainer = document.getElementById('editor');
        if (!editorContainer) return;
        
        console.warn('Using fallback textarea editor');
        
        editorContainer.innerHTML = '';
        
        const textarea = document.createElement('textarea');
        textarea.id = 'fallback-editor';
        textarea.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            outline: none;
            resize: none;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.5;
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            box-sizing: border-box;
        `;
        textarea.value = getDefaultContent();
        
        editorContainer.appendChild(textarea);
        
        window.coslangEditor = {
            getValue: () => textarea.value,
            setValue: (value) => { textarea.value = value; },
            onDidChangeModelContent: (callback) => {
                textarea.addEventListener('input', callback);
            },
            focus: () => textarea.focus()
        };
    }
    
    function getDefaultContent() {
        return ''; // No default content - let localStorage handle restoration
    }
}); 