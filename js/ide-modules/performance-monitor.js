// Performance Monitor Module
// Handles all performance monitoring and optimization functionality

export class PerformanceMonitor {
    constructor(ide) {
        this.ide = ide;
        this.performance = {
            lastSave: null,
            parseTime: 0,
            validationTime: 0,
            renderTime: 0
        };
        this.fpsCounter = 0;
        this.lastTime = performance.now();
    }

    setupPerformanceMonitoring() {
        const measurePerformance = () => {
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            if (deltaTime > 0) {
                const fps = 1000 / deltaTime;
                this.updatePerformanceMetrics(fps);
            }
            
            this.fpsCounter++;
            requestAnimationFrame(measurePerformance);
        };
        
        measurePerformance();
    }

    updatePerformanceMetrics(fps) {
        // Update performance metrics in debug panel
        const debugStats = document.getElementById('debug-stats');
        if (debugStats) {
            const performanceItem = debugStats.querySelector('.performance-fps');
            if (performanceItem) {
                performanceItem.innerHTML = `
                    <span class="debug-label">FPS:</span>
                    <span class="debug-value ${fps > 50 ? 'performance-good' : fps > 30 ? 'performance-warning' : 'performance-error'}">${Math.round(fps)}</span>
                `;
            }
        }
    }

    measureOperation(operationName, operation) {
        const startTime = performance.now();
        const result = operation();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.performance[operationName] = duration;
        
        // Log performance if it's slow
        if (duration > 100) {
            console.warn(`Slow operation: ${operationName} took ${duration.toFixed(2)}ms`);
        }
        
        return result;
    }

    getPerformanceReport() {
        return {
            parseTime: this.performance.parseTime,
            validationTime: this.performance.validationTime,
            renderTime: this.performance.renderTime,
            averageFPS: this.calculateAverageFPS(),
            memoryUsage: this.getMemoryUsage(),
            recommendations: this.getPerformanceRecommendations()
        };
    }

    calculateAverageFPS() {
        // This would be calculated over time
        return 60; // Placeholder
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    getPerformanceRecommendations() {
        const recommendations = [];
        
        if (this.performance.parseTime > 100) {
            recommendations.push('Consider optimizing story parsing');
        }
        
        if (this.performance.validationTime > 50) {
            recommendations.push('Consider debouncing validation');
        }
        
        if (this.performance.renderTime > 200) {
            recommendations.push('Consider optimizing UI rendering');
        }
        
        return recommendations;
    }

    optimizeForPerformance() {
        // Implement performance optimizations
        console.log('Applying performance optimizations...');
        
        // Debounce expensive operations
        this.debounceExpensiveOperations();
        
        // Optimize memory usage
        this.optimizeMemoryUsage();
        
        // Cache frequently accessed data
        this.setupCaching();
    }

    debounceExpensiveOperations() {
        // Debounce validation
        let validationTimeout;
        const debouncedValidation = () => {
            clearTimeout(validationTimeout);
            validationTimeout = setTimeout(() => {
                this.ide.editorManager.validateCode();
            }, 500);
        };
        
        // Debounce scene parsing
        let parsingTimeout;
        const debouncedParsing = () => {
            clearTimeout(parsingTimeout);
            parsingTimeout = setTimeout(() => {
                this.ide.sceneManager.updateSceneSidebar();
            }, 300);
        };
        
        // Add to event system
        this.ide.eventSystem.on('editor-change', debouncedValidation);
        this.ide.eventSystem.on('editor-change', debouncedParsing);
    }

    optimizeMemoryUsage() {
        // Clear unused assets
        setInterval(() => {
            this.ide.assetManager.clearUnusedAssets();
        }, 60000); // Every minute
        
        // Clear old cache entries
        setInterval(() => {
            this.ide.eventSystem.clearCache();
        }, 300000); // Every 5 minutes
    }

    setupCaching() {
        // Cache parsed AST
        this.ide.eventSystem.setCache('parsed-ast', null, 30000); // 30 seconds
        
        // Cache scene list
        this.ide.eventSystem.setCache('scene-list', null, 15000); // 15 seconds
        
        // Cache validation results
        this.ide.eventSystem.setCache('validation-results', null, 10000); // 10 seconds
    }

    startProfiling() {
        console.log('Starting performance profiling...');
        this.profilingStartTime = performance.now();
        this.profilingData = [];
    }

    stopProfiling() {
        if (this.profilingStartTime) {
            const totalTime = performance.now() - this.profilingStartTime;
            console.log(`Profiling completed in ${totalTime.toFixed(2)}ms`);
            console.log('Performance data:', this.profilingData);
            
            this.profilingStartTime = null;
            this.profilingData = [];
        }
    }

    logPerformanceEvent(eventName, duration) {
        if (this.profilingStartTime) {
            this.profilingData.push({
                event: eventName,
                duration: duration,
                timestamp: performance.now() - this.profilingStartTime
            });
        }
    }
} 