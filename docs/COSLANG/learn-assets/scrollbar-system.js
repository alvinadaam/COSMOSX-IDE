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
        // Define all scrollable elements for the learn page
        this.scrollableElements = [
            '.container',
            '.sidebar',
            '.content',
            '.content-body',
            '.content-body section',
            '.code-wrapper',
            'pre',
            '.note',
            '.faq-item',
            '.rules-grid',
            '.feature-card',
            '.component-card',
            '.upcoming-feature',
            '.structure-diagram',
            '.architecture-overview',
            '.internal-architecture',
            '.ide-components',
            '.ide-workflow',
            '.ide-features',
            '.section-highlight',
            '.expandable',
            '.search-result',
            '#searchResults',
        ];
    }

    setupScrollbarStyles() {
        this.scrollableElements.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                this.applyScrollbarStyles(el);
            });
        });
    }

    applyScrollbarStyles(element) {
        if (!element) return;
        element.classList.add('enhanced-scrollbar');
    }

    checkOverflow(element) {
        if (!element) return;
        if (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth) {
            element.classList.add('has-overflow', 'overflow-active');
            this.addScrollIndicator(element);
        } else {
            element.classList.remove('overflow-active');
            this.removeScrollIndicator(element);
        }
    }

    addScrollIndicator(element) {
        if (element.querySelector('.scroll-indicator')) return;
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.innerHTML = '<i class="fas fa-arrow-down"></i>';
        element.appendChild(indicator);
    }

    removeScrollIndicator(element) {
        const indicator = element.querySelector('.scroll-indicator');
        if (indicator) indicator.remove();
    }

    setupOverflowDetection() {
        this.scrollableElements.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                this.checkOverflow(el);
                // Observe for content changes
                const observer = new MutationObserver(() => this.checkOverflow(el));
                observer.observe(el, { childList: true, subtree: true, attributes: true });
                this.observers.push(observer);
            });
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.debouncedCheckOverflow());
        window.addEventListener('orientationchange', () => this.debouncedCheckOverflow());
    }

    setupAnimations() {
        // No-op for now, but could add custom scroll animations here
    }

    updateScrollIndicator(element) {
        this.checkOverflow(element);
    }

    debouncedCheckOverflow() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => this.updateAllScrollbars(), 100);
    }

    updateAllScrollbars() {
        this.scrollableElements.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                this.checkOverflow(el);
            });
        });
    }

    refreshScrollbars() {
        this.updateAllScrollbars();
    }

    addScrollableElement(selector) {
        if (!this.scrollableElements.includes(selector)) {
            this.scrollableElements.push(selector);
            document.querySelectorAll(selector).forEach(el => this.applyScrollbarStyles(el));
        }
    }

    removeScrollableElement(selector) {
        this.scrollableElements = this.scrollableElements.filter(s => s !== selector);
    }

    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.scrollableElements = [];
        this.initialized = false;
        window.scrollbarSystemInitialized = false;
        const style = document.querySelector('#enhanced-scrollbar-styles');
        if (style) style.remove();
    }
}

// Export for use in the learn page
window.ScrollbarSystem = ScrollbarSystem; 