// Enhanced Scrollbar System
// Provides beautiful, consistent scrollbars across the entire COSMOSX IDE

class ScrollbarSystem {
    constructor() {
        this.initialized = false;
        this.scrollableElements = [];
        this.observers = [];
        this.resizeTimeout = null;
        this.contentChangeTimeout = null;
    }

    initialize() {
        if (this.initialized) return;
        
        // Prevent duplicate initialization
        if (window.scrollbarSystemInitialized) {
            console.warn('⚠️ Scrollbar system already initialized, skipping duplicate');
            return;
        }
        
        console.log('🎨 Initializing Enhanced Scrollbar System...');
        
        this.setupGlobalStyles();
        this.identifyScrollableElements();
        this.setupScrollbarStyles();
        this.setupOverflowDetection();
        this.setupEventListeners();
        this.setupAnimations();
        
        this.initialized = true;
        window.scrollbarSystemInitialized = true;
        console.log('✅ Enhanced Scrollbar System initialized');
    }

    setupGlobalStyles() {
        // Add global scrollbar styles if not already present
        if (!document.querySelector('#enhanced-scrollbar-styles')) {
            const style = document.createElement('style');
            style.id = 'enhanced-scrollbar-styles';
            style.textContent = `
                /* Enhanced Scrollbar System - Global Styles */
                
                /* Webkit Scrollbars (Chrome, Safari, Edge) */
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 4px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: var(--border-color);
                    border-radius: 4px;
                    border: 1px solid transparent;
                    background-clip: content-box;
                    transition: all 0.2s ease;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: var(--accent-primary);
                    border: 1px solid var(--accent-primary);
                }
                
                ::-webkit-scrollbar-corner {
                    background: transparent;
                }
                
                /* Firefox Scrollbars */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: var(--border-color) transparent;
                }
                
                /* Custom Scrollbar Classes */
                .enhanced-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: var(--accent-primary) transparent;
                }
                
                .enhanced-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--accent-primary);
                    border: 1px solid var(--accent-primary);
                }
                
                .enhanced-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--accent-secondary);
                    border: 1px solid var(--accent-secondary);
                }
                
                /* Smooth Scrolling */
                .smooth-scroll {
                    scroll-behavior: smooth;
                }
                
                /* Scroll Indicators */
                .scroll-indicator {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    width: 24px;
                    height: 24px;
                    background: var(--accent-primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    opacity: 0.8;
                    pointer-events: none;
                    z-index: 10;
                    animation: scrollBounce 2s infinite;
                    box-shadow: 0 2px 8px rgba(77, 171, 247, 0.3);
                }
                
                @keyframes scrollBounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-3px); }
                    60% { transform: translateY(-1px); }
                }
                
                /* Overflow States */
                .has-overflow {
                    position: relative;
                }
                
                .has-overflow::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 20px;
                    background: linear-gradient(transparent, var(--bg-primary));
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .has-overflow.overflow-active::after {
                    opacity: 1;
                }
                
                /* Scrollbar Visibility */
                .scrollbar-visible {
                    scrollbar-width: auto;
                }
                
                .scrollbar-hidden {
                    scrollbar-width: none;
                }
                
                .scrollbar-hidden::-webkit-scrollbar {
                    display: none;
                }
            `;
            document.head.appendChild(style);
        }
    }

    identifyScrollableElements() {
        // Define all scrollable elements across the IDE
        this.scrollableElements = [
            // Main containers
            '.panel-content',
            '.debug-content',
            '.debug-container',
            '.sub-content',
            '.tab-pane',
            '.preview-container',
            '.preview-content',
            '.preview-sidebar',
            '.preview-panels',
            '.preview-panel .panel-content',
            
            // Sidebars
            '.sidebar',
            '.right-sidebar',
            '.scene-list',
            '.error-list',
            '.asset-grid',
            
            // Editor areas
            '.editor-container',
            '.monaco-editor',
            '.monaco-scrollable-element',
            
            // Debug panels
            '.debug-panel .debug-content',
            '.sub-panel .sub-content',
            
            // Notifications and modals
            '.notification-container',
            '.help-menu',
            '.context-menu',
            
            // Any element with overflow
            '[style*="overflow"]',
            '[class*="scroll"]'
        ];
    }

    setupScrollbarStyles() {
        // Apply enhanced scrollbar styles to all identified elements
        this.scrollableElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.applyScrollbarStyles(element);
            });
        });
    }

    applyScrollbarStyles(element) {
        if (!element) return;
        
        // Add enhanced scrollbar class
        element.classList.add('enhanced-scrollbar');
        
        // Add smooth scrolling
        element.classList.add('smooth-scroll');
        
        // Check for overflow and add indicator if needed
        this.checkOverflow(element);
    }

    checkOverflow(element) {
        if (!element) return;
        
        const hasOverflow = element.scrollHeight > element.clientHeight || 
                           element.scrollWidth > element.clientWidth;
        
        if (hasOverflow) {
            element.classList.add('has-overflow');
            this.addScrollIndicator(element);
        } else {
            element.classList.remove('has-overflow');
            this.removeScrollIndicator(element);
        }
    }

    addScrollIndicator(element) {
        if (element.querySelector('.scroll-indicator')) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.innerHTML = '<i class="fas fa-chevron-down"></i>';
        
        element.style.position = 'relative';
        element.appendChild(indicator);
    }

    removeScrollIndicator(element) {
        const indicator = element.querySelector('.scroll-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    setupOverflowDetection() {
        // Monitor for content changes that might affect overflow
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    this.debouncedCheckOverflow();
                }
            });
        });
        
        // Observe all scrollable elements
        this.scrollableElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                observer.observe(element, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
            });
        });
        
        this.observers.push(observer);
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateAllScrollbars();
            }, 150);
        });
        
        // Tab switching
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                setTimeout(() => {
                    this.updateAllScrollbars();
                }, 200);
            });
        });
        
        // Editor content changes
        if (window.ide && window.ide.editor) {
            window.ide.editor.onDidChangeModelContent(() => {
                this.debouncedCheckOverflow();
            });
        }
        
        // Scroll events for indicators
        document.addEventListener('scroll', (e) => {
            if (e.target.classList.contains('has-overflow')) {
                this.updateScrollIndicator(e.target);
            }
        }, { passive: true });
    }

    setupAnimations() {
        // Add scroll animations if not already present
        if (!document.querySelector('#scroll-animations')) {
            const style = document.createElement('style');
            style.id = 'scroll-animations';
            style.textContent = `
                @keyframes scrollBounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-3px); }
                    60% { transform: translateY(-1px); }
                }
                
                @keyframes scrollFade {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .scroll-indicator {
                    animation: scrollBounce 2s infinite;
                }
                
                .enhanced-scrollbar {
                    transition: all 0.3s ease;
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateScrollIndicator(element) {
        const indicator = element.querySelector('.scroll-indicator');
        if (!indicator) return;
        
        const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 5;
        const isAtTop = element.scrollTop <= 5;
        
        if (isAtBottom) {
            indicator.innerHTML = '<i class="fas fa-chevron-up"></i>';
        } else if (isAtTop) {
            indicator.innerHTML = '<i class="fas fa-chevron-down"></i>';
        } else {
            indicator.innerHTML = '<i class="fas fa-chevron-up"></i><i class="fas fa-chevron-down"></i>';
        }
    }

    debouncedCheckOverflow() {
        clearTimeout(this.contentChangeTimeout);
        this.contentChangeTimeout = setTimeout(() => {
            this.updateAllScrollbars();
        }, 100);
    }

    updateAllScrollbars() {
        this.scrollableElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.checkOverflow(element);
            });
        });
    }

    // Public methods for external use
    refreshScrollbars() {
        this.updateAllScrollbars();
    }

    addScrollableElement(selector) {
        if (!this.scrollableElements.includes(selector)) {
            this.scrollableElements.push(selector);
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.applyScrollbarStyles(element);
            });
        }
    }

    removeScrollableElement(selector) {
        const index = this.scrollableElements.indexOf(selector);
        if (index > -1) {
            this.scrollableElements.splice(index, 1);
        }
    }

    // Cleanup method
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        if (this.contentChangeTimeout) {
            clearTimeout(this.contentChangeTimeout);
        }
        
        this.initialized = false;
    }
}

// Create global instance
window.ScrollbarSystem = ScrollbarSystem;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.scrollbarSystem) {
        window.scrollbarSystem = new ScrollbarSystem();
        window.scrollbarSystem.initialize();
    }
});

// Export for use in other modules
export { ScrollbarSystem }; 