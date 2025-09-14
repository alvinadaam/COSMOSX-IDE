// Performance Optimization Module for CosAI
// Optimized for i5-6500T, 16GB RAM configuration

class PerformanceOptimizer {
    constructor() {
        this.isInitialized = false;
        this.memoryUsage = 0;
        this.cpuUsage = 0;
        this.performanceMetrics = {
            responseTime: 0,
            memoryPeak: 0,
            requestsPerMinute: 0
        };
        
        // Hardware-specific optimizations
        this.hardwareProfile = {
            cpu: 'i5-6500T',
            ram: 16, // GB
            cores: 4,
            threads: 4,
            maxMemoryUsage: 12, // GB - leave 4GB for system
            maxConcurrentRequests: 2,
            responseTimeout: 30000, // 30 seconds
            debounceDelay: 300
        };
    }

    initialize() {
        if (this.isInitialized) return;
        
        console.log('⚡ Initializing Performance Optimizer for i5-6500T...');
        
        this.setupMemoryMonitoring();
        this.setupCPUOptimization();
        this.setupRequestThrottling();
        this.setupUIOptimizations();
        this.setupCaching();
        
        this.isInitialized = true;
        console.log('✅ Performance Optimizer initialized');
    }

    setupMemoryMonitoring() {
        // Monitor memory usage
        setInterval(() => {
            if (performance.memory) {
                this.memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024 * 1024); // GB
                this.performanceMetrics.memoryPeak = Math.max(
                    this.performanceMetrics.memoryPeak, 
                    this.memoryUsage
                );
                
                // Warn if memory usage is high
                if (this.memoryUsage > this.hardwareProfile.maxMemoryUsage * 0.8) {
                    console.warn('⚠️ High memory usage:', this.memoryUsage.toFixed(2), 'GB');
                    this.cleanupMemory();
                }
            }
        }, 5000); // Check every 5 seconds
    }

    setupCPUOptimization() {
        // Optimize for 4-core CPU
        this.setupDebouncing();
        this.setupLazyLoading();
        this.setupVirtualScrolling();
    }

    setupDebouncing() {
        // Debounce expensive operations
        this.debounceMap = new Map();
        
        this.debounce = (key, func, delay = this.hardwareProfile.debounceDelay) => {
            if (this.debounceMap.has(key)) {
                clearTimeout(this.debounceMap.get(key));
            }
            
            const timeoutId = setTimeout(() => {
                func();
                this.debounceMap.delete(key);
            }, delay);
            
            this.debounceMap.set(key, timeoutId);
        };
    }

    setupLazyLoading() {
        // Lazy load non-critical components
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    if (element.dataset.lazyLoad) {
                        this.loadLazyContent(element);
                    }
                }
            });
        });
        
        // Observe elements with lazy-load attribute
        document.querySelectorAll('[data-lazy-load]').forEach(element => {
            observer.observe(element);
        });
    }

    setupVirtualScrolling() {
        // Implement virtual scrolling for long chat histories
        this.virtualScroller = {
            itemHeight: 80, // Approximate height of chat message
            visibleItems: 10,
            buffer: 5,
            
            updateVisibleRange(scrollTop, containerHeight) {
                const startIndex = Math.floor(scrollTop / this.itemHeight);
                const endIndex = Math.min(
                    startIndex + this.visibleItems + this.buffer,
                    this.totalItems
                );
                
                return { startIndex, endIndex };
            }
        };
    }

    setupRequestThrottling() {
        // Limit concurrent requests to prevent CPU overload
        this.requestQueue = [];
        this.activeRequests = 0;
        this.maxConcurrentRequests = this.hardwareProfile.maxConcurrentRequests;
        
        this.throttledRequest = async (requestFn) => {
            return new Promise((resolve, reject) => {
                this.requestQueue.push({ requestFn, resolve, reject });
                this.processQueue();
            });
        };
        
        this.processQueue = async () => {
            if (this.activeRequests >= this.maxConcurrentRequests || this.requestQueue.length === 0) {
                return;
            }
            
            this.activeRequests++;
            const { requestFn, resolve, reject } = this.requestQueue.shift();
            
            try {
                const startTime = performance.now();
                const result = await requestFn();
                const endTime = performance.now();
                
                this.performanceMetrics.responseTime = endTime - startTime;
                resolve(result);
            } catch (error) {
                reject(error);
            } finally {
                this.activeRequests--;
                this.processQueue();
            }
        };
    }

    setupUIOptimizations() {
        // Optimize UI rendering for 4-core CPU
        this.setupAnimationOptimization();
        this.setupScrollOptimization();
        this.setupEventOptimization();
    }

    setupAnimationOptimization() {
        // Use transform instead of layout properties for animations
        const style = document.createElement('style');
        style.textContent = `
            .optimized-animation {
                will-change: transform;
                transform: translateZ(0);
            }
            
            .chat-message {
                will-change: transform, opacity;
            }
            
            .fade-in {
                animation: fadeIn 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    setupScrollOptimization() {
        // Optimize scroll performance
        let ticking = false;
        
        const optimizedScrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Handle scroll events efficiently
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        document.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }

    setupEventOptimization() {
        // Use event delegation for better performance
        document.addEventListener('click', (e) => {
            // Handle all click events through delegation
            if (e.target.matches('.copy-btn')) {
                this.handleCopyButton(e.target);
            } else if (e.target.matches('.topic-item, .example-item')) {
                this.handleTopicClick(e.target);
            }
        }, { passive: true });
    }

    setupCaching() {
        // Simple in-memory cache for repeated requests
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        this.cachedRequest = async (key, requestFn) => {
            const cached = this.cache.get(key);
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
            
            const data = await requestFn();
            this.cache.set(key, {
                data,
                timestamp: Date.now()
            });
            
            return data;
        };
    }

    cleanupMemory() {
        // Clean up memory when usage is high
        console.log('🧹 Cleaning up memory...');
        
        // Clear old cache entries
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
        
        // Clear debounce timeouts
        for (const [key, timeoutId] of this.debounceMap.entries()) {
            clearTimeout(timeoutId);
            this.debounceMap.delete(key);
        }
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    loadLazyContent(element) {
        // Load content when it becomes visible
        const content = element.dataset.lazyLoad;
        element.innerHTML = content;
        element.removeAttribute('data-lazy-load');
    }

    handleCopyButton(button) {
        const codeBlock = button.closest('.code-block');
        const code = codeBlock.querySelector('code').textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.color = 'var(--success)';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.color = '';
            }, 2000);
        });
    }

    handleTopicClick(element) {
        const text = element.textContent.trim();
        const textarea = document.getElementById('user-input');
        if (textarea) {
            textarea.value = text;
            textarea.focus();
            textarea.dispatchEvent(new Event('input'));
        }
    }

    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            memoryUsage: this.memoryUsage,
            cpuUsage: this.cpuUsage,
            activeRequests: this.activeRequests,
            queueLength: this.requestQueue.length,
            cacheSize: this.cache.size
        };
    }

    optimizeForHardware() {
        // Apply hardware-specific optimizations
        const optimizations = {
            // Reduce animation complexity for 4-core CPU
            reduceAnimations: () => {
                document.body.classList.add('reduced-motion');
            },
            
            // Optimize for 16GB RAM
            optimizeMemory: () => {
                this.maxCacheSize = 100; // Limit cache entries
                this.maxHistorySize = 50; // Limit chat history
            },
            
            // Optimize for i5-6500T
            optimizeCPU: () => {
                this.maxConcurrentRequests = 2; // Conservative for 4-core
                this.debounceDelay = 300; // Longer debounce
            }
        };
        
        // Apply all optimizations
        Object.values(optimizations).forEach(optimization => optimization());
    }

    destroy() {
        // Clean up all optimizations
        this.debounceMap.forEach(timeoutId => clearTimeout(timeoutId));
        this.debounceMap.clear();
        this.cache.clear();
        this.requestQueue = [];
        
        this.isInitialized = false;
    }
}

// Export for use in other modules
window.PerformanceOptimizer = PerformanceOptimizer; 