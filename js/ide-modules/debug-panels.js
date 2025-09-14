// Debug Panel Management Module
// Handles accordion-style debug panels with smooth transitions

class DebugPanelManager {
    constructor() {
        this.activePanel = null;
        this.panels = [];
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;
        
        const debugContainer = document.querySelector('.debug-container');
        if (!debugContainer) {
            console.error('❌ Debug container not found');
            return;
        }

        this.panels = debugContainer.querySelectorAll('.debug-panel');
        
        this.setupAccordionBehavior();
        this.setupSubPanelBehavior();
        this.setupRefreshButtons();
        this.setInitialState();
        
        this.initialized = true;
    }

    setupAccordionBehavior() {
        this.panels.forEach(panel => {
            const header = panel.querySelector('h3');
            const toggle = header.querySelector('.panel-toggle');
            
            // Click handler
            header.addEventListener('click', (e) => {
                
                // Don't trigger if clicking refresh button
                if (e.target.closest('.refresh-btn')) {
                    return;
                }
                
                this.togglePanel(panel);
            });
            
            // Keyboard navigation
            panel.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.togglePanel(panel);
                } else if (e.key === 'Escape') {
                    panel.classList.remove('active');
                    panel.classList.add('collapsed');
                    this.activePanel = null;
                }
            });
            
            // Focus management
            panel.addEventListener('focusin', () => {
                panel.setAttribute('aria-expanded', panel.classList.contains('active'));
            });
        });
    }

    setupSubPanelBehavior() {
        this.panels.forEach(panel => {
            const subPanels = panel.querySelectorAll('.sub-panel');
            
            subPanels.forEach(subPanel => {
                const subHeader = subPanel.querySelector('h4');
                const subToggle = subHeader.querySelector('.sub-toggle');
                
                // Click handler
                subHeader.addEventListener('click', (e) => {
                    this.toggleSubPanel(subPanel);
                });
                
                // Keyboard navigation
                subPanel.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleSubPanel(subPanel);
                    }
                });
                
                // Focus management
                subPanel.addEventListener('focusin', () => {
                    subPanel.setAttribute('aria-expanded', subPanel.classList.contains('expanded'));
                });
            });
        });
    }

    setupRefreshButtons() {
        this.panels.forEach(panel => {
            const refreshBtn = panel.querySelector('.refresh-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.refreshPanel(panel);
                });
                
                // Keyboard support for refresh buttons
                refreshBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        this.refreshPanel(panel);
                    }
                });
                
                // Add proper ARIA labels
                const panelName = panel.querySelector('h3').textContent.trim();
                refreshBtn.setAttribute('aria-label', `Refresh ${panelName} data`);
            }
        });
    }

    setInitialState() {
        // Start with all panels collapsed (no active class, no collapsed class for debug panels)
        this.panels.forEach(panel => {
            panel.classList.remove('expanded', 'active');
            // Remove collapsed class if it exists (shouldn't be used for debug panels)
            panel.classList.remove('collapsed');
            
            // Make panels focusable for keyboard navigation
            panel.setAttribute('tabindex', '0');
            
            // Initialize sub-panels as collapsed
            const subPanels = panel.querySelectorAll('.sub-panel');
            subPanels.forEach(subPanel => {
                subPanel.classList.remove('expanded');
                subPanel.classList.add('collapsed');
                subPanel.setAttribute('tabindex', '0');
            });
        });
    }

    togglePanel(panel) {
        const isActive = panel.classList.contains('active');
        
        // Toggle current panel - FIXED: Don't use collapsed class for debug panels
        if (isActive) {
            panel.classList.remove('active');
            // Remove collapsed class if it exists (shouldn't be used for debug panels)
            panel.classList.remove('collapsed');
            this.activePanel = null;
            this.forceClosePanel(panel);
        } else {
            // Remove collapsed class if it exists (shouldn't be used for debug panels)
            panel.classList.remove('collapsed');
            panel.classList.add('active');
            this.activePanel = panel;
            
            // Force content to be visible immediately
            this.forceOpenPanel(panel);
        }
        
        // Update toggle icon
        const toggle = panel.querySelector('.panel-toggle');
        if (toggle) {
            if (panel.classList.contains('active')) {
                toggle.style.transform = 'rotate(180deg)';
            } else {
                toggle.style.transform = 'rotate(0deg)';
            }
        }
        
        // Announce to screen readers
        const panelName = panel.querySelector('h3').textContent.trim();
        const status = panel.classList.contains('active') ? 'expanded' : 'collapsed';
        this.announceToScreenReader(`${panelName} panel ${status}`);
    }
    
    forceOpenPanel(panel) {
        const debugContent = panel.querySelector('.debug-content');
        if (debugContent) {
            // Completely bypass CSS transitions and force immediate visibility
            debugContent.style.transition = 'none';
            debugContent.style.display = 'block';
            debugContent.style.opacity = '1';
            debugContent.style.transform = 'translateY(0)';
            debugContent.style.maxHeight = 'none';
            debugContent.style.height = 'auto';
            debugContent.style.overflow = 'visible';
            debugContent.style.visibility = 'visible';
            debugContent.style.position = 'relative';
            debugContent.style.zIndex = '1';
            
            // Force immediate reflow
            debugContent.offsetHeight;
        }
    }
    
    forceClosePanel(panel) {
        const debugContent = panel.querySelector('.debug-content');
        if (debugContent) {
            // Completely bypass CSS transitions and force immediate hiding
            debugContent.style.transition = 'none';
            debugContent.style.display = 'none';
            debugContent.style.opacity = '0';
            debugContent.style.transform = 'translateY(-10px)';
            debugContent.style.maxHeight = '0';
            debugContent.style.overflow = 'hidden';
            debugContent.style.visibility = 'hidden';
        }
    }
    
    ensureContentVisible(panel) {
        const debugContent = panel.querySelector('.debug-content');
        if (debugContent) {
            // Force the content to be visible
            debugContent.style.display = 'block';
            debugContent.style.opacity = '1';
            debugContent.style.transform = 'translateY(0)';
            debugContent.style.maxHeight = 'none';
            debugContent.style.height = 'auto';
            debugContent.style.overflow = 'visible';
            
            // Force a reflow
            debugContent.offsetHeight;
        }
    }

    toggleSubPanel(subPanel) {
        const isExpanded = subPanel.classList.contains('expanded');
        const subToggle = subPanel.querySelector('.sub-toggle');
        
        if (isExpanded) {
            subPanel.classList.remove('expanded');
            subPanel.classList.add('collapsed');
            if (subToggle) subToggle.style.transform = 'rotate(-90deg) scale(1.1)';
        } else {
            subPanel.classList.remove('collapsed');
            subPanel.classList.add('expanded');
            if (subToggle) subToggle.style.transform = 'rotate(0deg) scale(1.1)';
        }
        
        // Announce to screen readers
        const subPanelName = subPanel.querySelector('h4').textContent.trim();
        const status = subPanel.classList.contains('expanded') ? 'expanded' : 'collapsed';
        this.announceToScreenReader(`${subPanelName} section ${status}`);
    }
    
    announceToScreenReader(message) {
        // Create or update live region for screen reader announcements
        let liveRegion = document.getElementById('screen-reader-announcements');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'screen-reader-announcements';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
    }

    refreshPanel(panel) {
        const refreshBtn = panel.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.classList.add('spinning');
            
            // Simulate refresh delay
            setTimeout(() => {
                refreshBtn.classList.remove('spinning');
                this.updatePanelData(panel.dataset.panel);
            }, 800);
        }
    }

    updatePanelData(panelType) {
        const panel = document.querySelector(`[data-panel="${panelType}"]`);
        if (!panel) return;

        switch (panelType) {
            case 'story-analysis':
                this.updateStoryAnalysis(panel);
                break;
            case 'variables-state':
                this.updateVariablesState(panel);
                break;
            case 'performance-stats':
                this.updatePerformanceStats(panel);
                break;
            case 'inventory-items':
                this.updateInventoryItems(panel);
                break;
            case 'events-logs':
                this.updateEventsLogs(panel);
                break;
            case 'network-connectivity':
                this.updateNetworkConnectivity(panel);
                break;
            case 'code-quality':
                this.updateCodeQuality(panel);
                break;
            case 'asset-management':
                this.updateAssetManagement(panel);
                break;
            case 'user-experience':
                this.updateUserExperience(panel);
                break;
            case 'advanced-analytics':
                this.updateAdvancedAnalytics(panel);
                break;
            case 'security-validation':
                this.updateSecurityValidation(panel);
                break;
            case 'development-tools':
                this.updateDevelopmentTools(panel);
                break;
        }
    }

    // Story Analysis Updates
    updateStoryAnalysis(panel) {
        const scenes = this.getScenesFromEditor();
        const totalScenes = scenes.length;
        const startScene = scenes.find(s => s.id === 'start') || scenes[0];
        const endScenes = scenes.filter(s => s.id.includes('end')).length;
        
        // Update scenes overview
        const scenesOverview = panel.querySelector('#scenes-overview-content');
        if (scenesOverview) {
            scenesOverview.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Total Scenes:</span>
                    <span class="debug-value">${totalScenes}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Start Scene:</span>
                    <span class="debug-value">${startScene ? startScene.id : 'None'}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">End Scenes:</span>
                    <span class="debug-value">${endScenes}</span>
                </div>
            `;
        }
        
        // Update narrative flow
        const narrativeFlow = panel.querySelector('#narrative-flow-content');
        if (narrativeFlow) {
            const storyLength = this.getStoryLength();
            const avgChoices = totalScenes > 0 ? Math.round(this.getTotalChoices() / totalScenes) : 0;
            const complexity = this.getStoryComplexity();
            
            narrativeFlow.innerHTML = `
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
        
        // Update story metadata
        const storyMetadata = panel.querySelector('#story-metadata-content');
        if (storyMetadata) {
            const metadata = this.getStoryMetadata();
            storyMetadata.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Title:</span>
                    <span class="debug-value">${metadata.title || 'Untitled'}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Author:</span>
                    <span class="debug-value">${metadata.author || 'Unknown'}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Version:</span>
                    <span class="debug-value">${metadata.version || '1.0.0'}</span>
                </div>
            `;
        }
    }

    // Variables & State Updates
    updateVariablesState(panel) {
        const variables = this.getVariablesFromEditor();
        const debugVars = panel.querySelector('#debug-vars');
        
        if (debugVars) {
            if (variables.length === 0) {
                debugVars.innerHTML = '<div class="debug-empty">No variables defined</div>';
            } else {
                debugVars.innerHTML = variables.map(variable => `
                    <div class="debug-item">
                        <span class="debug-label">${variable.name}:</span>
                        <span class="debug-value">${variable.value}</span>
                    </div>
                `).join('');
            }
        }
        
        // Update local variables
        const localVars = panel.querySelector('#local-vars-content');
        if (localVars) {
            const currentScene = this.getCurrentScene();
            const sceneVars = this.getSceneVariables(currentScene);
            const tempVars = this.getTempVariables();
            
            localVars.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Current Scene:</span>
                    <span class="debug-value">${currentScene || 'None'}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Scene Variables:</span>
                    <span class="debug-value">${sceneVars.length}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Temp Variables:</span>
                    <span class="debug-value">${tempVars.length}</span>
                </div>
            `;
        }
        
        // Update variable history
        const varHistory = panel.querySelector('#variable-history-content');
        if (varHistory) {
            const changes = this.getVariableChanges();
            const lastModified = this.getLastVariableChange();
            const trackedVars = this.getTrackedVariables();
            
            varHistory.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Changes:</span>
                    <span class="debug-value">${changes}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Last Modified:</span>
                    <span class="debug-value">${lastModified}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Tracked Vars:</span>
                    <span class="debug-value">${trackedVars}</span>
                </div>
            `;
        }
    }

    // Performance & Stats Updates
    updatePerformanceStats(panel) {
        const stats = this.getStatsFromEditor();
        const debugStats = panel.querySelector('#debug-stats');
        
        if (debugStats) {
            if (stats.length === 0) {
                debugStats.innerHTML = '<div class="debug-empty">No stats defined</div>';
            } else {
                debugStats.innerHTML = stats.map(stat => `
                    <div class="debug-item">
                        <span class="debug-label">${stat.name}:</span>
                        <span class="debug-value">${stat.value}</span>
                    </div>
                `).join('');
            }
        }
        
        // Update system performance
        const sysPerformance = panel.querySelector('#system-performance-content');
        if (sysPerformance) {
            const fps = this.getFPS();
            const memory = this.getMemoryUsage();
            const cpu = this.getCPUUsage();
            
            sysPerformance.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">FPS:</span>
                    <span class="debug-value">${fps}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Memory:</span>
                    <span class="debug-value">${memory}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">CPU:</span>
                    <span class="debug-value">${cpu}</span>
                </div>
            `;
        }
        
        // Update execution time
        const execTime = panel.querySelector('#execution-time-content');
        if (execTime) {
            const parseTime = this.getParseTime();
            const renderTime = this.getRenderTime();
            const updateTime = this.getUpdateTime();
            
            execTime.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Parse Time:</span>
                    <span class="debug-value">${parseTime}ms</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Render Time:</span>
                    <span class="debug-value">${renderTime}ms</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Update Time:</span>
                    <span class="debug-value">${updateTime}ms</span>
                </div>
            `;
        }
    }

    // Inventory & Items Updates
    updateInventoryItems(panel) {
        const inventory = this.getInventoryFromEditor();
        const debugInventory = panel.querySelector('#debug-inventory');
        
        if (debugInventory) {
            if (inventory.length === 0) {
                debugInventory.innerHTML = '<div class="debug-empty">No inventory defined</div>';
            } else {
                debugInventory.innerHTML = inventory.map(item => `
                    <div class="debug-item">
                        <span class="debug-label">${item.name}:</span>
                        <span class="debug-value">${item.quantity}</span>
                    </div>
                `).join('');
            }
        }
        
        // Update item database
        const itemDB = panel.querySelector('#item-database-content');
        if (itemDB) {
            const totalItems = this.getTotalItems();
            const categories = this.getItemCategories();
            const rareItems = this.getRareItems();
            
            itemDB.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Total Items:</span>
                    <span class="debug-value">${totalItems}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Categories:</span>
                    <span class="debug-value">${categories}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Rare Items:</span>
                    <span class="debug-value">${rareItems}</span>
                </div>
            `;
        }
        
        // Update item interactions
        const itemInteractions = panel.querySelector('#item-interactions-content');
        if (itemInteractions) {
            const usedItems = this.getUsedItems();
            const combinedItems = this.getCombinedItems();
            const craftedItems = this.getCraftedItems();
            
            itemInteractions.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Used Items:</span>
                    <span class="debug-value">${usedItems}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Combined Items:</span>
                    <span class="debug-value">${combinedItems}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Crafted Items:</span>
                    <span class="debug-value">${craftedItems}</span>
                </div>
            `;
        }
    }

    // Events & Logs Updates
    updateEventsLogs(panel) {
        const logs = this.getSystemLogs();
        const debugLog = panel.querySelector('#debug-log');
        
        if (debugLog) {
            if (logs.length === 0) {
                debugLog.innerHTML = '<div class="debug-empty">No logs available</div>';
            } else {
                debugLog.innerHTML = logs.map(log => `
                    <div class="debug-item ${log.type}">
                        <span class="debug-time">${log.time}</span>
                        <span class="debug-message">${log.message}</span>
                    </div>
                `).join('');
            }
        }
        
        // Update event timeline
        const eventTimeline = panel.querySelector('#event-timeline-content');
        if (eventTimeline) {
            const storyEvents = this.getStoryEvents();
            const achievements = this.getAchievements();
            const triggers = this.getTriggers();
            
            eventTimeline.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Story Events:</span>
                    <span class="debug-value">${storyEvents}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Achievements:</span>
                    <span class="debug-value">${achievements}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Triggers:</span>
                    <span class="debug-value">${triggers}</span>
                </div>
            `;
        }
        
        // Update error log
        const errorLog = panel.querySelector('#error-log-content');
        if (errorLog) {
            const errors = this.getErrors();
            const warnings = this.getWarnings();
            const lastError = this.getLastError();
            
            errorLog.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Errors:</span>
                    <span class="debug-value">${errors}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Warnings:</span>
                    <span class="debug-value">${warnings}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Last Error:</span>
                    <span class="debug-value">${lastError}</span>
                </div>
            `;
        }
    }

    // Network & Connectivity Updates
    updateNetworkConnectivity(panel) {
        // Connection status
        const connStatus = panel.querySelector('#connection-status-content');
        if (connStatus) {
            const status = this.getConnectionStatus();
            const latency = this.getLatency();
            const bandwidth = this.getBandwidth();
            
            connStatus.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Status:</span>
                    <span class="debug-value">${status}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Latency:</span>
                    <span class="debug-value">${latency}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Bandwidth:</span>
                    <span class="debug-value">${bandwidth}</span>
                </div>
            `;
        }
        
        // API requests
        const apiRequests = panel.querySelector('#api-requests-content');
        if (apiRequests) {
            const totalRequests = this.getTotalRequests();
            const successRate = this.getSuccessRate();
            const avgResponse = this.getAvgResponse();
            
            apiRequests.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Total Requests:</span>
                    <span class="debug-value">${totalRequests}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Success Rate:</span>
                    <span class="debug-value">${successRate}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Avg Response:</span>
                    <span class="debug-value">${avgResponse}</span>
                </div>
            `;
        }
        
        // Sync status
        const syncStatus = panel.querySelector('#sync-status-content');
        if (syncStatus) {
            const autoSave = this.getAutoSaveStatus();
            const lastSync = this.getLastSync();
            const cloudSync = this.getCloudSyncStatus();
            
            syncStatus.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Auto Save:</span>
                    <span class="debug-value">${autoSave}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Last Sync:</span>
                    <span class="debug-value">${lastSync}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Cloud Sync:</span>
                    <span class="debug-value">${cloudSync}</span>
                </div>
            `;
        }
    }

    // Code Quality Updates
    updateCodeQuality(panel) {
        // Syntax analysis
        const syntaxAnalysis = panel.querySelector('#syntax-analysis-content');
        if (syntaxAnalysis) {
            const syntaxErrors = this.getSyntaxErrors();
            const warnings = this.getCodeWarnings();
            const codeStyle = this.getCodeStyle();
            
            syntaxAnalysis.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Syntax Errors:</span>
                    <span class="debug-value">${syntaxErrors}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Warnings:</span>
                    <span class="debug-value">${warnings}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Code Style:</span>
                    <span class="debug-value">${codeStyle}</span>
                </div>
            `;
        }
        
        // Best practices
        const bestPractices = panel.querySelector('#best-practices-content');
        if (bestPractices) {
            const namingConventions = this.getNamingConventions();
            const documentation = this.getDocumentation();
            const structure = this.getCodeStructure();
            
            bestPractices.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Naming Conventions:</span>
                    <span class="debug-value">${namingConventions}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Documentation:</span>
                    <span class="debug-value">${documentation}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Structure:</span>
                    <span class="debug-value">${structure}</span>
                </div>
            `;
        }
        
        // Complexity metrics
        const complexityMetrics = panel.querySelector('#complexity-metrics-content');
        if (complexityMetrics) {
            const cyclomatic = this.getCyclomaticComplexity();
            const cognitiveLoad = this.getCognitiveLoad();
            const maintainability = this.getMaintainability();
            
            complexityMetrics.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Cyclomatic:</span>
                    <span class="debug-value">${cyclomatic}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Cognitive Load:</span>
                    <span class="debug-value">${cognitiveLoad}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Maintainability:</span>
                    <span class="debug-value">${maintainability}</span>
                </div>
            `;
        }
    }

    // Asset Management Updates
    updateAssetManagement(panel) {
        // Asset inventory
        const assetInventory = panel.querySelector('#asset-inventory-content');
        if (assetInventory) {
            const totalAssets = this.getTotalAssets();
            const images = this.getImageAssets();
            const audio = this.getAudioAssets();
            
            assetInventory.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Total Assets:</span>
                    <span class="debug-value">${totalAssets}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Images:</span>
                    <span class="debug-value">${images}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Audio:</span>
                    <span class="debug-value">${audio}</span>
                </div>
            `;
        }
        
        // Asset optimization
        const assetOptimization = panel.querySelector('#asset-optimization-content');
        if (assetOptimization) {
            const totalSize = this.getTotalAssetSize();
            const compression = this.getAssetCompression();
            const loadingTime = this.getAssetLoadingTime();
            
            assetOptimization.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Total Size:</span>
                    <span class="debug-value">${totalSize}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Compression:</span>
                    <span class="debug-value">${compression}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Loading Time:</span>
                    <span class="debug-value">${loadingTime}</span>
                </div>
            `;
        }
        
        // Asset usage
        const assetUsage = panel.querySelector('#asset-usage-content');
        if (assetUsage) {
            const referenced = this.getReferencedAssets();
            const unused = this.getUnusedAssets();
            const brokenLinks = this.getBrokenAssetLinks();
            
            assetUsage.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Referenced:</span>
                    <span class="debug-value">${referenced}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Unused:</span>
                    <span class="debug-value">${unused}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Broken Links:</span>
                    <span class="debug-value">${brokenLinks}</span>
                </div>
            `;
        }
    }

    // User Experience Updates
    updateUserExperience(panel) {
        // Accessibility
        const accessibility = panel.querySelector('#accessibility-content');
        if (accessibility) {
            const wcagCompliance = this.getWCAGCompliance();
            const screenReader = this.getScreenReaderStatus();
            const keyboardNav = this.getKeyboardNavigation();
            
            accessibility.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">WCAG Compliance:</span>
                    <span class="debug-value">${wcagCompliance}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Screen Reader:</span>
                    <span class="debug-value">${screenReader}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Keyboard Nav:</span>
                    <span class="debug-value">${keyboardNav}</span>
                </div>
            `;
        }
        
        // Usability metrics
        const usabilityMetrics = panel.querySelector('#usability-metrics-content');
        if (usabilityMetrics) {
            const clickPaths = this.getClickPaths();
            const avgSession = this.getAvgSession();
            const bounceRate = this.getBounceRate();
            
            usabilityMetrics.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Click Paths:</span>
                    <span class="debug-value">${clickPaths}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Avg. Session:</span>
                    <span class="debug-value">${avgSession}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Bounce Rate:</span>
                    <span class="debug-value">${bounceRate}</span>
                </div>
            `;
        }
        
        // User feedback
        const userFeedback = panel.querySelector('#user-feedback-content');
        if (userFeedback) {
            const rating = this.getUserRating();
            const reviews = this.getReviews();
            const satisfaction = this.getSatisfaction();
            
            userFeedback.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Rating:</span>
                    <span class="debug-value">${rating}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Reviews:</span>
                    <span class="debug-value">${reviews}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Satisfaction:</span>
                    <span class="debug-value">${satisfaction}</span>
                </div>
            `;
        }
    }

    // Advanced Analytics Updates
    updateAdvancedAnalytics(panel) {
        // Story analytics
        const storyAnalytics = panel.querySelector('#story-analytics-content');
        if (storyAnalytics) {
            const engagementScore = this.getEngagementScore();
            const completionRate = this.getCompletionRate();
            const replayValue = this.getReplayValue();
            
            storyAnalytics.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Engagement Score:</span>
                    <span class="debug-value">${engagementScore}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Completion Rate:</span>
                    <span class="debug-value">${completionRate}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Replay Value:</span>
                    <span class="debug-value">${replayValue}</span>
                </div>
            `;
        }
        
        // Player behavior
        const playerBehavior = panel.querySelector('#player-behavior-content');
        if (playerBehavior) {
            const avgPlayTime = this.getAvgPlayTime();
            const choicePatterns = this.getChoicePatterns();
            const returnRate = this.getReturnRate();
            
            playerBehavior.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Avg. Play Time:</span>
                    <span class="debug-value">${avgPlayTime}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Choice Patterns:</span>
                    <span class="debug-value">${choicePatterns}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Return Rate:</span>
                    <span class="debug-value">${returnRate}</span>
                </div>
            `;
        }
        
        // Trend analysis
        const trendAnalysis = panel.querySelector('#trend-analysis-content');
        if (trendAnalysis) {
            const growthRate = this.getGrowthRate();
            const peakHours = this.getPeakHours();
            const popularScenes = this.getPopularScenes();
            
            trendAnalysis.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Growth Rate:</span>
                    <span class="debug-value">${growthRate}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Peak Hours:</span>
                    <span class="debug-value">${peakHours}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Popular Scenes:</span>
                    <span class="debug-value">${popularScenes}</span>
                </div>
            `;
        }
    }

    // Security & Validation Updates
    updateSecurityValidation(panel) {
        // Security checks
        const securityChecks = panel.querySelector('#security-checks-content');
        if (securityChecks) {
            const vulnerabilities = this.getVulnerabilities();
            const dataEncryption = this.getDataEncryption();
            const accessControl = this.getAccessControl();
            
            securityChecks.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Vulnerabilities:</span>
                    <span class="debug-value">${vulnerabilities}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Data Encryption:</span>
                    <span class="debug-value">${dataEncryption}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Access Control:</span>
                    <span class="debug-value">${accessControl}</span>
                </div>
            `;
        }
        
        // Data validation
        const dataValidation = panel.querySelector('#data-validation-content');
        if (dataValidation) {
            const inputValidation = this.getInputValidation();
            const sanitization = this.getSanitization();
            const typeSafety = this.getTypeSafety();
            
            dataValidation.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Input Validation:</span>
                    <span class="debug-value">${inputValidation}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Sanitization:</span>
                    <span class="debug-value">${sanitization}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Type Safety:</span>
                    <span class="debug-value">${typeSafety}</span>
                </div>
            `;
        }
        
        // Compliance
        const compliance = panel.querySelector('#compliance-content');
        if (compliance) {
            const gdpr = this.getGDPRCompliance();
            const coppa = this.getCOPPACompliance();
            const accessibility = this.getAccessibilityCompliance();
            
            compliance.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">GDPR:</span>
                    <span class="debug-value">${gdpr}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">COPPA:</span>
                    <span class="debug-value">${coppa}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Accessibility:</span>
                    <span class="debug-value">${accessibility}</span>
                </div>
            `;
        }
    }

    // Development Tools Updates
    updateDevelopmentTools(panel) {
        // Version control
        const versionControl = panel.querySelector('#version-control-content');
        if (versionControl) {
            const gitStatus = this.getGitStatus();
            const lastCommit = this.getLastCommit();
            const branch = this.getCurrentBranch();
            
            versionControl.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Git Status:</span>
                    <span class="debug-value">${gitStatus}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Last Commit:</span>
                    <span class="debug-value">${lastCommit}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Branch:</span>
                    <span class="debug-value">${branch}</span>
                </div>
            `;
        }
        
        // Testing
        const testing = panel.querySelector('#testing-content');
        if (testing) {
            const testCoverage = this.getTestCoverage();
            const passingTests = this.getPassingTests();
            const performance = this.getTestPerformance();
            
            testing.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Test Coverage:</span>
                    <span class="debug-value">${testCoverage}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Passing Tests:</span>
                    <span class="debug-value">${passingTests}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Performance:</span>
                    <span class="debug-value">${performance}</span>
                </div>
            `;
        }
        
        // Deployment
        const deployment = panel.querySelector('#deployment-content');
        if (deployment) {
            const environment = this.getEnvironment();
            const buildStatus = this.getBuildStatus();
            const deployReady = this.getDeployReady();
            
            deployment.innerHTML = `
                <div class="debug-item">
                    <span class="debug-label">Environment:</span>
                    <span class="debug-value">${environment}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Build Status:</span>
                    <span class="debug-value">${buildStatus}</span>
                </div>
                <div class="debug-item">
                    <span class="debug-label">Deploy Ready:</span>
                    <span class="debug-value">${deployReady}</span>
                </div>
            `;
        }
    }

    // Helper functions for data retrieval (simulated)
    getScenesFromEditor() { return []; }
    getVariablesFromEditor() { return []; }
    getStatsFromEditor() { return []; }
    getInventoryFromEditor() { return []; }
    getSystemLogs() { 
        return [
            { time: '12:00:00', message: 'IDE initialized successfully', type: 'info' }
        ]; 
    }
    getStoryLength() { return 0; }
    getTotalChoices() { return 0; }
    getStoryComplexity() { return 'Low'; }
    getStoryMetadata() { return { title: 'Untitled', author: 'Unknown', version: '1.0.0' }; }
    getCurrentScene() { return null; }
    getSceneVariables(scene) { return []; }
    getTempVariables() { return []; }
    getVariableChanges() { return 0; }
    getLastVariableChange() { return 'Never'; }
    getTrackedVariables() { return 0; }
    getFPS() { return 60; }
    getMemoryUsage() { return '24.5 MB'; }
    getCPUUsage() { return '2.3%'; }
    getParseTime() { return 0; }
    getRenderTime() { return 0; }
    getUpdateTime() { return 0; }
    getTotalItems() { return 0; }
    getItemCategories() { return 0; }
    getRareItems() { return 0; }
    getUsedItems() { return 0; }
    getCombinedItems() { return 0; }
    getCraftedItems() { return 0; }
    getStoryEvents() { return 0; }
    getAchievements() { return 0; }
    getTriggers() { return 0; }
    getErrors() { return 0; }
    getWarnings() { return 0; }
    getLastError() { return 'None'; }
    getConnectionStatus() { return 'Connected'; }
    getLatency() { return '45ms'; }
    getBandwidth() { return '1.2 Mbps'; }
    getTotalRequests() { return 127; }
    getSuccessRate() { return '98.4%'; }
    getAvgResponse() { return '120ms'; }
    getAutoSaveStatus() { return 'Enabled'; }
    getLastSync() { return '2 min ago'; }
    getCloudSyncStatus() { return 'Offline'; }
    getSyntaxErrors() { return 0; }
    getCodeWarnings() { return 2; }
    getCodeStyle() { return 'Good'; }
    getNamingConventions() { return '95%'; }
    getDocumentation() { return '80%'; }
    getCodeStructure() { return 'Excellent'; }
    getCyclomaticComplexity() { return '3.2'; }
    getCognitiveLoad() { return 'Low'; }
    getMaintainability() { return 'High'; }
    getTotalAssets() { return 0; }
    getImageAssets() { return 0; }
    getAudioAssets() { return 0; }
    getTotalAssetSize() { return '0 MB'; }
    getAssetCompression() { return 'N/A'; }
    getAssetLoadingTime() { return '0ms'; }
    getReferencedAssets() { return 0; }
    getUnusedAssets() { return 0; }
    getBrokenAssetLinks() { return 0; }
    getWCAGCompliance() { return 'AA'; }
    getScreenReaderStatus() { return 'Ready'; }
    getKeyboardNavigation() { return 'Full'; }
    getClickPaths() { return 3; }
    getAvgSession() { return '5m 30s'; }
    getBounceRate() { return '12%'; }
    getUserRating() { return '4.8/5'; }
    getReviews() { return 0; }
    getSatisfaction() { return 'High'; }
    getEngagementScore() { return '85%'; }
    getCompletionRate() { return '92%'; }
    getReplayValue() { return 'High'; }
    getAvgPlayTime() { return '15m'; }
    getChoicePatterns() { return 'Balanced'; }
    getReturnRate() { return '78%'; }
    getGrowthRate() { return '+15%'; }
    getPeakHours() { return '7-9 PM'; }
    getPopularScenes() { return 3; }
    getVulnerabilities() { return 0; }
    getDataEncryption() { return 'Enabled'; }
    getAccessControl() { return 'Secure'; }
    getInputValidation() { return '100%'; }
    getSanitization() { return 'Active'; }
    getTypeSafety() { return 'Strong'; }
    getGDPRCompliance() { return 'Compliant'; }
    getCOPPACompliance() { return 'Compliant'; }
    getAccessibilityCompliance() { return 'WCAG AA'; }
    getGitStatus() { return 'Clean'; }
    getLastCommit() { return '2h ago'; }
    getCurrentBranch() { return 'main'; }
    getTestCoverage() { return '87%'; }
    getPassingTests() { return '24/26'; }
    getTestPerformance() { return 'Good'; }
    getEnvironment() { return 'Development'; }
    getBuildStatus() { return 'Success'; }
    getDeployReady() { return 'Yes'; }
}

// Create global instance
window.debugPanelManager = new DebugPanelManager();

// Export for use in other modules
window.DebugPanelManager = DebugPanelManager; 