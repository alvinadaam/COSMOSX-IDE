// Debug Manager Module
// Handles all debug panel functionality: variables, stats, inventory, logs, etc.

export class DebugManager {
    constructor(ide) {
        this.ide = ide;
        this.debugLogEntries = [];
        this.scrollbarDebounceTimer = null;
    }

    setupDebugPanel() {
        // Initialize debug panels
        this.updateDebugPanel();
        
        // Note: applyScrollbarsToDebugPanels() is called within updateDebugPanel()
    }

    applyScrollbarsToDebugPanels() {
        // Debounce scrollbar application to prevent multiple rapid calls
        if (this.scrollbarDebounceTimer) {
            clearTimeout(this.scrollbarDebounceTimer);
        }
        
        this.scrollbarDebounceTimer = setTimeout(() => {
            this._applyScrollbarsToDebugPanels();
        }, 100);
    }

    _applyScrollbarsToDebugPanels() {
        // Use the actual scrollbar system methods
        if (!this.ide.scrollbarSystem) {
            console.warn('Scrollbar system not available');
            return;
        }
        
        // Add debug content areas to scrollable elements
        const debugSelectors = [
            '.debug-content',
            '.sub-content',
            '.debug-panel .debug-content',
            '.sub-panel .sub-content',
            '.debug-panel',  // Main debug panel containers
            '.debug-container'  // Main debug container
        ];
        
        debugSelectors.forEach(selector => {
            // Add to scrollbar system's managed elements
            this.ide.scrollbarSystem.addScrollableElement(selector);
            
            // Apply styles to existing elements
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element) {
                    this.ide.scrollbarSystem.applyScrollbarStyles(element);
                    this.ide.scrollbarSystem.checkOverflow(element);
                }
            });
        });
        
        // Refresh all scrollbars
        this.ide.scrollbarSystem.refreshScrollbars();
        
        console.log('🎨 Applied scrollbar system to debug panels');
    }

    addDebugRefreshButtons() {
        const debugPanels = document.querySelectorAll('.debug-panel h3');
        debugPanels.forEach(header => {
            if (!header.querySelector('.refresh-btn')) {
                const refreshBtn = document.createElement('button');
                refreshBtn.className = 'refresh-btn';
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                refreshBtn.title = 'Refresh';
                refreshBtn.onclick = () => this.updateDebugPanel();
                header.appendChild(refreshBtn);
            }
        });
        
        // Setup panel toggle handlers for scrollbar updates
        this.setupPanelToggleHandlers();
    }

    setupPanelToggleHandlers() {
        // Handle debug panel toggles
        const debugPanels = document.querySelectorAll('.debug-panel');
        debugPanels.forEach(panel => {
            const toggle = panel.querySelector('.panel-toggle');
            if (toggle) {
                toggle.addEventListener('click', () => {
                    // Refresh scrollbars after panel expansion
                    setTimeout(() => {
                        if (this.ide.scrollbarSystem) {
                            this.ide.scrollbarSystem.refreshScrollbars();
                        }
                    }, 100);
                });
            }
        });
        
        // Handle sub-panel toggles
        const subPanels = document.querySelectorAll('.sub-panel');
        subPanels.forEach(panel => {
            const toggle = panel.querySelector('.sub-toggle');
            if (toggle) {
                toggle.addEventListener('click', () => {
                    // Refresh scrollbars after sub-panel expansion
                    setTimeout(() => {
                        if (this.ide.scrollbarSystem) {
                            this.ide.scrollbarSystem.refreshScrollbars();
                        }
                    }, 100);
                });
            }
        });
    }

    updateDebugPanel() {
        if (!this.ide.editorManager.editor) return;
        
        const content = this.ide.editorManager.getValue();
        
        try {
            // Parse the content properly
            const ast = this.ide.engine ? this.ide.engine.ast : null;
            
            // Update variables with real parsing
            this.updateDebugVariables(content, ast);
            
            // Update stats with real scene data
            this.updateDebugStats(content, ast);
            
            // Update inventory with real data
            this.updateDebugInventory(content, ast);
            
            // Update story analysis
            this.updateStoryAnalysis(ast);
            
            // Update performance metrics
            this.updatePerformanceMetrics();
            
            // Update log
            this.updateDebugLog();
            
                    // Add refresh buttons to debug panel headers
        this.addDebugRefreshButtons();
        
        // Re-apply scrollbars after content updates
        this.applyScrollbarsToDebugPanels();
        
    } catch (error) {
        console.warn('Error updating debug panel:', error);
        this.addDebugLogEntry('Debug panel update failed: ' + error.message, 'error');
    }
    }

    updateDebugVariables(content, ast) {
        const debugVars = document.getElementById('debug-vars');
        if (!debugVars) return;
        
        const variables = [];
        
        // Extract variables from AST if available
        if (ast && ast.scenes) {
            Object.values(ast.scenes).forEach(scene => {
                if (scene.vars) {
                    Object.entries(scene.vars).forEach(([key, value]) => {
                        variables.push({ name: key, value: value, scene: scene.id });
                    });
                }
            });
        }
        
        // Also check for global variables in content
        const globalMatches = content.match(/(\w+)\s*=\s*([^\n]+)/g);
        if (globalMatches) {
            globalMatches.forEach(match => {
                const [name, value] = match.split('=').map(s => s.trim());
                if (name && value && !variables.find(v => v.name === name)) {
                    variables.push({ name, value, scene: 'global' });
                }
            });
        }
        
        if (variables.length === 0) {
            debugVars.innerHTML = '<div class="debug-empty">No variables defined</div>';
        } else {
            debugVars.innerHTML = variables.map(v => `
                <div class="debug-item">
                    <span class="debug-label">${v.name}:</span>
                    <span class="debug-value">${v.value}</span>
                    ${v.scene !== 'global' ? `<span class="debug-scene">(${v.scene})</span>` : ''}
                </div>
            `).join('');
        }
    }

    updateDebugStats(content, ast) {
        const debugStats = document.getElementById('debug-stats');
        if (!debugStats) return;
        
        let sceneCount = 0;
        let choiceCount = 0;
        let textCount = 0;
        let wordCount = 0;
        
        if (ast && ast.scenes) {
            sceneCount = Object.keys(ast.scenes).length;
            
            Object.values(ast.scenes).forEach(scene => {
                if (scene.content) {
                    scene.content.forEach(item => {
                        if (item.type === 'choice') {
                            choiceCount++;
                        } else if (item.type === 'text') {
                            textCount++;
                            wordCount += item.value.split(' ').length;
                        }
                    });
                }
            });
        } else {
            // Fallback to regex counting
            sceneCount = (content.match(/scene\s+\w+/g) || []).length;
            choiceCount = (content.match(/choice/g) || []).length;
            textCount = (content.match(/text:/g) || []).length;
            wordCount = content.split(/\s+/).length;
        }
        
        debugStats.innerHTML = `
            <div class="debug-item">
                <span class="debug-label">Scenes:</span>
                <span class="debug-value">${sceneCount}</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">Choices:</span>
                <span class="debug-value">${choiceCount}</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">Text blocks:</span>
                <span class="debug-value">${textCount}</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">Word count:</span>
                <span class="debug-value">${wordCount}</span>
            </div>
        `;
    }

    updateDebugInventory(content, ast) {
        const debugInventory = document.getElementById('debug-inventory');
        if (!debugInventory) return;
        
        const inventory = [];
        
        // Extract inventory from AST if available
        if (ast && ast.scenes) {
            Object.values(ast.scenes).forEach(scene => {
                if (scene.inventory) {
                    Object.entries(scene.inventory).forEach(([item, count]) => {
                        inventory.push({ item, count, scene: scene.id });
                    });
                }
            });
        }
        
        // Also check for inventory in content
        const inventoryMatches = content.match(/(\w+)\s*=\s*\[([^\]]*)\]/g);
        if (inventoryMatches) {
            inventoryMatches.forEach(match => {
                const [name, items] = match.split('=').map(s => s.trim());
                const itemList = items.replace(/[\[\]]/g, '').split(',').map(item => item.trim()).filter(item => item);
                if (itemList.length > 0) {
                    itemList.forEach(item => {
                        if (!inventory.find(i => i.item === item)) {
                            inventory.push({ item, count: 1, scene: 'global' });
                        }
                    });
                }
            });
        }
        
        if (inventory.length === 0) {
            debugInventory.innerHTML = '<div class="debug-empty">No inventory defined</div>';
        } else {
            debugInventory.innerHTML = inventory.map(i => `
                <div class="debug-item">
                    <span class="debug-label">${i.item}:</span>
                    <span class="debug-value">${i.count}</span>
                    ${i.scene !== 'global' ? `<span class="debug-scene">(${i.scene})</span>` : ''}
                </div>
            `).join('');
        }
    }

    updateDebugLog() {
        const debugLog = document.getElementById('debug-log');
        if (!debugLog) return;
        
        // Store log entries in memory for persistence
        if (!this.debugLogEntries) {
            this.debugLogEntries = [
                { time: new Date().toLocaleTimeString(), message: 'IDE initialized successfully', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'Monaco editor loaded', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'Syntax validation complete', type: 'success' },
                { time: new Date().toLocaleTimeString(), message: 'Scene parsing finished', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'Debug panel updated', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'Smart scrollbars enabled', type: 'success' },
                { time: new Date().toLocaleTimeString(), message: 'Asset panel refreshed', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'Error checking complete', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'Autocomplete system ready', type: 'success' },
                { time: new Date().toLocaleTimeString(), message: 'Preview system initialized', type: 'info' },
                { time: new Date().toLocaleTimeString(), message: 'All systems operational', type: 'success' }
            ];
        }
        
        // Add new entry if called with a message
        if (arguments.length > 0) {
            const message = arguments[0];
            const type = arguments[1] || 'info';
            this.debugLogEntries.unshift({
                time: new Date().toLocaleTimeString(),
                message: message,
                type: type
            });
            
            // Keep only last 50 entries
            if (this.debugLogEntries.length > 50) {
                this.debugLogEntries = this.debugLogEntries.slice(0, 50);
            }
        }
        
        debugLog.innerHTML = this.debugLogEntries.map(entry => `
            <div class="debug-item ${entry.type}">
                <span class="debug-time">${entry.time}</span>
                <span class="debug-message">${entry.message}</span>
            </div>
        `).join('');
    }

    addDebugLogEntry(message, type = 'info') {
        this.updateDebugLog(message, type);
    }

    addDiagnostics(diagnostics) {
        // Add engine diagnostics to the error panel
        if (diagnostics && diagnostics.length > 0) {
            diagnostics.forEach(diagnostic => {
                this.ide.errors.push({
                    line: diagnostic.line || 1,
                    message: diagnostic.message,
                    type: diagnostic.type || 'error',
                    code: diagnostic.code,
                    suggestion: diagnostic.suggestion
                });
            });
            this.updateErrorPanel();
        }
    }

    // --- Robust, Stable Error Panel ---
    renderErrorPanel() {
        const errorList = document.getElementById('error-list');
        const errorCount = document.getElementById('error-count');
        if (!errorList) return;
        // Defensive: always use a fresh copy
        let errors = Array.isArray(this.ide.errors) ? this.ide.errors.slice() : [];
        // Deduplicate by line+message+source+type
        const seen = new Set();
        errors = errors.filter(e => {
            const key = `${e.line}|${e.message}|${e.source}|${e.type}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        // Group by type
        const grouped = { error: [], warning: [], info: [] };
        errors.forEach(e => {
            if (grouped[e.type]) grouped[e.type].push(e);
            else grouped.error.push(e); // fallback
        });
        const total = errors.length;
        // Defensive: clear panel first
        errorList.innerHTML = '';
        // Empty state
        if (total === 0) {
            errorList.innerHTML = `
                <div class="no-errors" role="status" aria-live="polite">
                    <i class="fas fa-check-circle"></i>
                    <p>No issues found</p>
                    <small>Your code is clean and ready to run</small>
                </div>
            `;
        } else {
            // Render each group
            ['error','warning','info'].forEach(type => {
                if (grouped[type].length > 0) {
                    const groupLabel = type.charAt(0).toUpperCase() + type.slice(1) + (grouped[type].length > 1 ? 's' : '');
                    const groupIcon = type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info-circle';
                    const groupColor = type === 'error' ? '#ff6b6b' : type === 'warning' ? '#ffd43b' : '#74c0fc';
                    const groupDiv = document.createElement('div');
                    groupDiv.className = `error-group error-group-${type}`;
                    groupDiv.setAttribute('role', 'group');
                    groupDiv.innerHTML = `
                        <div class="error-group-header" style="color:${groupColor}">
                            <i class="fas fa-${groupIcon}"></i> ${groupLabel} (${grouped[type].length})
                        </div>
                    `;
                    grouped[type].forEach((issue, idx) => {
                        const item = document.createElement('div');
                        item.className = `error-item ${type}`;
                        item.setAttribute('tabindex', '0');
                        item.setAttribute('role', 'button');
                        item.setAttribute('aria-label', `${type} at line ${issue.line}: ${issue.message}`);
                        item.onclick = () => window.ide.navigateToLine(issue.line);
                        item.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') item.onclick(); };
                        item.innerHTML = `
                            <div class="error-icon"><i class="fas fa-${groupIcon}"></i></div>
                            <div class="error-content">
                                <div class="error-message">
                                    ${issue.message}
                                    <span class="error-source-badge error-source-${issue.source || 'unknown'}">
                                        ${issue.source === 'engine' ? 'Engine' : (issue.source === 'structure' || issue.source === 'syntax') ? 'Structure' : (issue.source || 'Unknown')}
                                    </span>
                                    ${issue.fix ? `<button class='quick-fix-btn' title='Apply quick fix' onclick='event.stopPropagation(); window.ide.debugManager.applyQuickFix(${errors.indexOf(issue)});'>💡 Fix</button>` : ''}
                                </div>
                                <div class="error-location">Line ${issue.line}</div>
                                ${issue.suggestion ? `<div class="error-suggestion">💡 ${issue.suggestion}</div>` : ''}
                            </div>
                        `;
                        groupDiv.appendChild(item);
                    });
                    errorList.appendChild(groupDiv);
                }
            });
        }
        // Update count badge
        if (errorCount) {
            const errorCountNum = grouped.error.length;
            const warningCountNum = grouped.warning.length;
            const infoCountNum = grouped.info.length;
            errorCount.textContent = errorCountNum + warningCountNum + infoCountNum;
            errorCount.className = `error-badge ${errorCountNum > 0 ? 'has-errors' : warningCountNum > 0 ? 'has-warnings' : 'has-info'}`;
        }
    }

    // Debounced stable update
    updateErrorPanel() {
        if (this._errorPanelTimeout) clearTimeout(this._errorPanelTimeout);
        this._errorPanelTimeout = setTimeout(() => this.renderErrorPanel(), 30);
    }

    applyQuickFix(issueIdx) {
        const issue = this.ide.errors[issueIdx];
        if (!issue || !issue.fix || !this.ide.editorManager) return;
        const { line, column, text } = issue.fix.apply;
        const editor = this.ide.editorManager.editor;
        if (!editor) return;
        const model = editor.getModel();
        if (!model) return;
        // Monaco is 1-based for lines/columns
        const range = new monaco.Range(line, column, line, column);
        editor.executeEdits('quick-fix', [{ range, text }]);
        // Re-validate after fix
        this.ide.editorManager.validateCode();
    }

    setupErrorPanel() {
        // Initialize error panel
        this.updateErrorPanel();
    }

    updateStoryAnalysis(ast) {
        // Update story analysis panels
        this.updateScenesOverview(ast);
        this.updateNarrativeFlow(ast);
        this.updateStoryMetadata(ast);
    }

    updateScenesOverview(ast) {
        const content = document.getElementById('scenes-overview-content');
        if (!content) return;

        let totalScenes = 0;
        let startScene = 'None';
        let endScenes = 0;

        if (ast && ast.scenes) {
            totalScenes = Object.keys(ast.scenes).length;
            startScene = ast.scenes.start ? 'start' : 'None';
            
            // Count scenes with no outgoing choices (potential end scenes)
            Object.values(ast.scenes).forEach(scene => {
                const hasOutgoingChoices = scene.content && scene.content.some(item => 
                    item.type === 'choice' && item.target
                );
                if (!hasOutgoingChoices) {
                    endScenes++;
                }
            });
        }

        content.innerHTML = `
            <div class="debug-item">
                <span class="debug-label">Total Scenes:</span>
                <span class="debug-value">${totalScenes}</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">Start Scene:</span>
                <span class="debug-value">${startScene}</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">End Scenes:</span>
                <span class="debug-value">${endScenes}</span>
            </div>
        `;
    }

    updateNarrativeFlow(ast) {
        const content = document.getElementById('narrative-flow-content');
        if (!content) return;

        let storyLength = 0;
        let avgChoices = 0;
        let complexity = 'Low';

        if (ast && ast.scenes) {
            let totalChoices = 0;
            let totalText = 0;

            Object.values(ast.scenes).forEach(scene => {
                if (scene.content) {
                    scene.content.forEach(item => {
                        if (item.type === 'choice') {
                            totalChoices++;
                        } else if (item.type === 'text') {
                            storyLength += item.value.split(' ').length;
                            totalText++;
                        }
                    });
                }
            });

            avgChoices = totalText > 0 ? (totalChoices / totalText).toFixed(1) : 0;
            
            if (totalChoices > 10) complexity = 'High';
            else if (totalChoices > 5) complexity = 'Medium';
        }

        content.innerHTML = `
            <div class="debug-item">
                <span class="debug-label">Story Length:</span>
                <span class="debug-value">${storyLength} words</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">Avg. Choices:</span>
                <span class="debug-value">${avgChoices}</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">Complexity:</span>
                <span class="debug-value">${complexity}</span>
            </div>
        `;
    }

    updateStoryMetadata(ast) {
        const content = document.getElementById('story-metadata-content');
        if (!content) return;

        const title = ast && ast.meta && ast.meta.title ? ast.meta.title : 'Untitled';
        const author = ast && ast.meta && ast.meta.author ? ast.meta.author : 'Unknown';
        const version = ast && ast.meta && ast.meta.version ? ast.meta.version : '1.0.0';

        content.innerHTML = `
            <div class="debug-item">
                <span class="debug-label">Title:</span>
                <span class="debug-value">${title}</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">Author:</span>
                <span class="debug-value">${author}</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">Version:</span>
                <span class="debug-value">${version}</span>
            </div>
        `;
    }

    updatePerformanceMetrics() {
        // Update performance metrics
        const content = document.getElementById('system-performance-content');
        if (!content) return;

        const memoryUsage = performance.memory ? 
            Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 10) / 10 : 'N/A';
        const fps = 60; // Placeholder - could implement real FPS tracking
        const cpu = '2.3%'; // Placeholder

        content.innerHTML = `
            <div class="debug-item">
                <span class="debug-label">FPS:</span>
                <span class="debug-value">${fps}</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">Memory:</span>
                <span class="debug-value">${memoryUsage} MB</span>
            </div>
            <div class="debug-item">
                <span class="debug-label">CPU:</span>
                <span class="debug-value">${cpu}</span>
            </div>
        `;
    }
} 