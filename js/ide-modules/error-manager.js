// Advanced Error & Warning Manager for COSMOSX IDE
// Provides fast, real-time validation with enhanced UI and features

import { CoslangSyntaxValidator } from '../syntax-validator.js';
import { validateCoslangPro } from './engine-integration.js';
import { getSmartAutocorrections } from './coslang-autocorrect.js';

export class ErrorManager {
    constructor(ide) {
        this.ide = ide;
        this.errors = [];
        this.warnings = [];
        this.info = [];
        this.validationQueue = [];
        this.isValidating = false;
        this.lastValidationTime = 0;
        this.validationDebounceMs = 500; // Increased debounce time
        this.errorPanel = null;
        this.errorCount = null;
        this.lastContentHash = '';
        this.validationInProgress = false;
        this.setupErrorPanel();
        this.setupRealTimeValidation();
    }

    setupErrorPanel() {
        this.errorPanel = document.getElementById('error-list');
        this.errorCount = document.getElementById('error-count');
        if (this.errorPanel) {
            // Use the same empty check as updateErrorPanel
            const editorValue = this.ide && this.ide.editorManager && typeof this.ide.editorManager.getValue === 'function'
                ? this.ide.editorManager.getValue() : '';
            const isEditorEmpty = !editorValue || !editorValue.trim();
            if (isEditorEmpty) {
                this.errorPanel.innerHTML = `
                    <div class="no-errors">
                        <i class="fas fa-keyboard"></i>
                        <p>Start typing to write your Coslang code!</p>
                        <small>Let your creativity flow. The error panel will help you as you go.</small>
                    </div>
                `;
            } else {
                this.errorPanel.innerHTML = `
                    <div class="no-errors">
                        <i class="fas fa-check-circle"></i>
                        <p>No issues found</p>
                        <small>Your code is clean and ready to run</small>
                    </div>
                `;
            }
        }
    }

    setupRealTimeValidation() {
        // Set up real-time validation with proper debouncing
        let validationTimeout;
        let lastContent = '';
        
        const validateWithDebounce = (content) => {
            // Don't validate if content hasn't changed
            if (content === lastContent) return;
            
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(() => {
                if (content !== lastContent) {
                    lastContent = content;
                    this.validateCode();
                }
            }, this.validationDebounceMs);
        };

        // Listen for editor changes
        if (this.ide.editorManager && this.ide.editorManager.editor) {
            this.ide.editorManager.editor.onDidChangeModelContent(() => {
                const content = this.ide.editorManager.getValue();
                validateWithDebounce(content);
            });
        }

        // Initial validation after a delay
        setTimeout(() => this.validateCode(), 200);
    }

    async validateCode() {
        if (!this.ide.editorManager || !this.ide.editorManager.editor) return;
        
        const content = this.ide.editorManager.getValue();
        const contentHash = this.hashContent(content);
        
        // Don't revalidate if content hasn't changed
        if (contentHash === this.lastContentHash && this.errors.length > 0) {
            return;
        }
        
        // Prevent multiple simultaneous validations
        if (this.validationInProgress) {
            return;
        }
        
        this.validationInProgress = true;
        
        if (!content.trim()) {
            this.clearErrors();
            this.lastContentHash = contentHash;
            this.validationInProgress = false;
            return;
        }

        try {
            // Run comprehensive validation
            const result = await this.runValidation(content);
            
            // Only update if content hasn't changed during validation
            const currentContentHash = this.hashContent(this.ide.editorManager.getValue());
            if (currentContentHash !== contentHash) {
                this.validationInProgress = false;
                return; // Content changed during validation, skip update
            }
            
            // Update errors and warnings
            this.errors = result.errors || [];
            this.warnings = result.warnings || [];
            this.info = result.info || [];
            
            // Update UI
            this.updateErrorPanel();
            this.updateStatusBar();
            this.highlightErrorsInEditor();
            
            // Store content hash
            this.lastContentHash = contentHash;
            
            // Trigger any callbacks
            if (this.ide.onValidationComplete) {
                this.ide.onValidationComplete(result);
            }
            
        } catch (error) {
            console.error('Validation error:', error);
            this.addError({
                line: 1,
                message: 'Validation failed: ' + error.message,
                type: 'error',
                code: 'VALIDATION_ERROR',
                source: 'system'
            });
        } finally {
            this.validationInProgress = false;
        }
    }

    hashContent(content) {
        // Simple hash function for content comparison
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    async runValidation(content) {
        // Use the pro-level validator for comprehensive results
        const proResult = validateCoslangPro(content);
        // Get smart autocorrect suggestions (context-aware quick-fixes)
        let smartFixes = [];
        try {
            smartFixes = getSmartAutocorrections(content, proResult.ast).map(fix => ({
                line: fix.line || 1,
                column: fix.column || 1,
                message: fix.description || fix.message || 'Autocorrect suggestion',
                type: 'info',
                source: 'autocorrect',
                fix: fix.fix,
                explanation: fix.explanation || '',
                tags: fix.tags || []
            }));
        } catch (e) {
            // Defensive: ignore smart fix errors
        }
        // Merge and deduplicate (by line+column+message+code+fix.text)
        const allErrors = this.deduplicateIssues([
            ...(proResult.errors || [])
        ]);
        const allWarnings = this.deduplicateIssues([
            ...(proResult.warnings || [])
        ]);
        const allInfo = this.deduplicateIssues([
            ...(proResult.info || []),
            ...smartFixes
        ]);
        return {
            errors: allErrors,
            warnings: allWarnings,
            info: allInfo,
            ast: proResult.ast,
            isValid: allErrors.length === 0
        };
    }

    deduplicateIssues(issues) {
        const seen = new Set();
        return issues.filter(issue => {
            const fixText = issue.fix && issue.fix.text ? issue.fix.text : '';
            const key = `${issue.line}|${issue.column}|${issue.message}|${issue.code || ''}|${fixText}`;
            if (seen.has(key)) return false;
            seen.add(key);
            // Defensive: ensure all required fields
            issue.line = typeof issue.line === 'number' ? issue.line : 1;
            issue.column = typeof issue.column === 'number' ? issue.column : 1;
            issue.message = issue.message || 'Unknown error';
            issue.type = issue.type || 'error';
            issue.source = issue.source || 'unknown';
            return true;
        });
    }

    updateErrorPanel() {
        if (!this.errorPanel) return;
        const errors = this.errors;
        const warnings = this.warnings;
        const info = this.info;
        let html = '';
        // Check if editor is empty
        const editorValue = this.ide && this.ide.editorManager && typeof this.ide.editorManager.getValue === 'function'
            ? this.ide.editorManager.getValue() : '';
        const isEditorEmpty = !editorValue || !editorValue.trim();
        // Errors section
        if (errors.length > 0) {
            html += `
                <div class="error-section">
                    <div class="error-section-header">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Errors (${errors.length})</span>
                    </div>
                    ${errors.map(issue => this.renderIssue(issue)).join('')}
                </div>
            `;
        }
        // Warnings section
        if (warnings.length > 0) {
            html += `
                <div class="warning-section">
                    <div class="error-section-header">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>Warnings (${warnings.length})</span>
                    </div>
                    ${warnings.map(issue => this.renderIssue(issue)).join('')}
                </div>
            `;
        }
        // Info/Fixes section (autocorrect and info)
        if (info.length > 0) {
            html += `
                <div class="info-section">
                    <div class="error-section-header">
                        <i class="fas fa-magic"></i>
                        <span>Info & Fixes (${info.length})</span>
                    </div>
                    ${info.map(issue => this.renderIssue(issue)).join('')}
                </div>
            `;
        }
        if (errors.length === 0 && warnings.length === 0 && info.length === 0) {
            if (isEditorEmpty) {
                html = `
                    <div class="no-errors">
                        <i class="fas fa-keyboard"></i>
                        <p>Start typing to write your Coslang code!</p>
                        <small>Let your creativity flow. The error panel will help you as you go.</small>
                    </div>
                `;
            } else {
                html = `
                    <div class="no-errors">
                        <i class="fas fa-check-circle"></i>
                        <p>No issues found</p>
                        <small>Your code is clean and ready to run</small>
                    </div>
                `;
            }
        }
        this.errorPanel.innerHTML = html;
        // Update error count badge
        if (this.errorCount) {
            const totalIssues = errors.length + warnings.length + info.length;
            this.errorCount.textContent = totalIssues;
            this.errorCount.className = `error-badge ${errors.length > 0 ? 'has-errors' : warnings.length > 0 ? 'has-warnings' : info.length > 0 ? 'has-info' : ''}`;
        }
    }

    renderIssue(issue) {
        // Special rendering for autocorrect/info (smart fixes)
        if (issue.source === 'autocorrect') {
            return `
                <div class="error-item info smart-autocorrect" onclick="window.ide.navigateToLine(${issue.line})">
                    <div class="error-icon">
                        <i class="fas fa-magic"></i>
                    </div>
                    <div class="error-content">
                        <div class="error-message">
                            <strong>${issue.message}</strong>
                            <span class="error-source-badge error-source-autocorrect">Autocorrect</span>
                        </div>
                        <div class="error-location">Line ${issue.line}${issue.column ? ", Col " + issue.column : ''}</div>
                        <div class="autocorrect-fix-block">
                            <span class="autocorrect-label">Suggested fix:</span>
                            <pre class="autocorrect-fix">${issue.fix && issue.fix.text ? issue.fix.text.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}</pre>
                        </div>
                        <div class="autocorrect-explanation">
                            <span class="autocorrect-label">Why?</span>
                            <span>${issue.explanation || 'This fix will improve your code.'}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        // Default rendering for errors/warnings
        const iconClass = issue.type === 'error' ? 'exclamation-triangle' : 
                         issue.type === 'warning' ? 'exclamation-circle' : 'info-circle';
        
        const sourceBadge = issue.source ? `
            <span class="error-source-badge error-source-${issue.source}">
                ${this.getSourceDisplayName(issue.source)}
            </span>
        ` : '';
        
        const suggestion = issue.suggestion ? `
            <div class="error-suggestion">
                <i class="fas fa-lightbulb"></i>
                ${issue.suggestion}
            </div>
        ` : '';
        
        const quickFix = this.getQuickFix(issue);
        const quickFixButton = quickFix ? `
            <button class="quick-fix-btn" onclick="window.ide.errorManager.applyQuickFix('${quickFix.type}', ${issue.line})">
                <i class="fas fa-magic"></i>
                ${quickFix.label}
            </button>
        ` : '';
        
        return `
            <div class="error-item ${issue.type}" onclick="window.ide.navigateToLine(${issue.line})">
                <div class="error-icon">
                    <i class="fas fa-${iconClass}"></i>
                </div>
                <div class="error-content">
                    <div class="error-message">
                        ${issue.message}
                        ${sourceBadge}
                    </div>
                    <div class="error-location">Line ${issue.line}</div>
                    ${suggestion}
                    ${quickFixButton}
                </div>
            </div>
        `;
    }

    getSourceDisplayName(source) {
        const sourceNames = {
            'engine': 'Engine',
            'structure': 'Structure',
            'syntax': 'Syntax',
            'macro': 'Macro',
            'security': 'Security',
            'performance': 'Performance',
            'accessibility': 'Accessibility',
            'system': 'System',
            'parser': 'Parser',
            'autocorrect': 'Autocorrect'
        };
        return sourceNames[source] || source;
    }

    getQuickFix(issue) {
        const quickFixes = {
            'MISSING_TITLE': {
                type: 'add_metadata',
                label: 'Add Title',
                action: 'title: "Your Story Title"'
            },
            'MISSING_AUTHOR': {
                type: 'add_metadata',
                label: 'Add Author',
                action: 'author: "Your Name"'
            },
            'MISSING_VERSION': {
                type: 'add_metadata',
                label: 'Add Version',
                action: 'version: "1.0.0"'
            },
            'INVALID_SCENE_SYNTAX': {
                type: 'fix_syntax',
                label: 'Fix Syntax',
                action: 'scene scene_name {'
            },
            'INVALID_CHOICE_SYNTAX': {
                type: 'fix_syntax',
                label: 'Fix Choice',
                action: 'choice "text" -> target'
            }
        };
        
        return quickFixes[issue.code];
    }

    applyQuickFix(type, line) {
        if (!this.ide.editorManager || !this.ide.editorManager.editor) return;
        
        const editor = this.ide.editorManager.editor;
        const position = editor.getPosition();
        
        switch (type) {
            case 'add_metadata':
                // Add metadata at the top
                const metadata = this.getQuickFix(issue).action;
                const range = new monaco.Range(1, 1, 1, 1);
                editor.executeEdits('quick-fix', [{
                    range: range,
                    text: metadata + '\n'
                }]);
                break;
                
            case 'fix_syntax':
                // Navigate to line for manual fix
                editor.revealLineInCenter(line);
                editor.setPosition({ lineNumber: line, column: 1 });
                break;
        }
    }

    highlightErrorsInEditor() {
        if (!this.ide.editorManager || !this.ide.editorManager.editor) return;
        const editor = this.ide.editorManager.editor;
        // Only try Monaco marker/decorations if available
        const isMonaco = typeof editor.getModel === 'function' && typeof monaco !== 'undefined';
        if (!isMonaco) return; // fallback editor: skip highlighting
        const model = editor.getModel();
        // Clear existing markers (skip getModelMarkers, use deltaDecorations only)
        editor.deltaDecorations && editor.deltaDecorations([], []); // clear all
        // Add new markers for errors
        const decorations = this.errors.map(error => ({
            range: new monaco.Range(error.line, 1, error.line, 1),
            options: {
                isWholeLine: true,
                className: 'error-line-highlight',
                glyphMarginClassName: 'error-glyph',
                hoverMessage: {
                    value: `**${error.message}**\n\n${error.suggestion || ''}`
                }
            }
        }));
        editor.deltaDecorations([], decorations);
    }

    updateStatusBar() {
        const statusBar = document.getElementById('status');
        if (!statusBar) return;
        
        const errorCount = this.errors.length;
        const warningCount = this.warnings.length;
        
        if (errorCount > 0) {
            statusBar.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errorCount} error${errorCount > 1 ? 's' : ''}`;
            statusBar.className = 'status-error';
        } else if (warningCount > 0) {
            statusBar.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${warningCount} warning${warningCount > 1 ? 's' : ''}`;
            statusBar.className = 'status-warning';
        } else {
            statusBar.innerHTML = `<i class="fas fa-check-circle"></i> Ready`;
            statusBar.className = 'status-ready';
        }
    }

    addError(error) {
        this.errors.push(error);
        this.updateErrorPanel();
        this.updateStatusBar();
    }

    addWarning(warning) {
        this.warnings.push(warning);
        this.updateErrorPanel();
        this.updateStatusBar();
    }

    addInfo(info) {
        this.info.push(info);
        this.updateErrorPanel();
        this.updateStatusBar();
    }

    clearErrors() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
        this.updateErrorPanel();
        this.updateStatusBar();
    }

    getErrorSummary() {
        return {
            errors: this.errors.length,
            warnings: this.warnings.length,
            info: this.info.length,
            total: this.errors.length + this.warnings.length + this.info.length,
            isValid: this.errors.length === 0
        };
    }

    // Export errors for external use
    exportErrors() {
        return {
            errors: this.errors,
            warnings: this.warnings,
            info: this.info,
            summary: this.getErrorSummary(),
            timestamp: new Date().toISOString()
        };
    }

    // Force validation (for manual triggers)
    forceValidate() {
        this.lastContentHash = ''; // Reset hash to force validation
        this.validateCode();
    }
} 