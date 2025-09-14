// Enhanced Scrollbar System for CosAI
// Provides beautiful, consistent scrollbars across CosAI interface

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
        
        console.log('🎨 Initializing Enhanced Scrollbar System for CosAI...');
        
        this.setupGlobalStyles();
        this.identifyScrollableElements();
        this.setupScrollbarStyles();
        this.setupOverflowDetection();
        this.setupEventListeners();
        this.setupAnimations();
        
        this.initialized = true;
        window.scrollbarSystemInitialized = true;
        console.log('✅ Enhanced Scrollbar System initialized for CosAI');
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
                    background: var(--border-color, #2a2a2a);
                    border-radius: 4px;
                    border: 1px solid transparent;
                    background-clip: content-box;
                    transition: all 0.2s ease;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: var(--accent-primary, #4dabf7);
                    border: 1px solid var(--accent-primary, #4dabf7);
                }
                
                ::-webkit-scrollbar-corner {
                    background: transparent;
                }
                
                /* Firefox Scrollbars */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: var(--border-color, #2a2a2a) transparent;
                }
                
                /* Custom Scrollbar Classes */
                .enhanced-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: var(--accent-primary, #4dabf7) transparent;
                }
                
                .enhanced-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--accent-primary, #4dabf7);
                    border: 1px solid var(--accent-primary, #4dabf7);
                }
                
                .enhanced-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: var(--accent-secondary, #3b82f6);
                    border: 1px solid var(--accent-secondary, #3b82f6);
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
                    background: var(--accent-primary, #4dabf7);
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
                    background: linear-gradient(transparent, var(--bg-primary, #1a1a1a));
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
        // Define all scrollable elements in CosAI
        this.scrollableElements = [
            // Chat interface
            '.chat-container',
            '.chat-messages',
            '.message-content',
            '.bot-content',
            '.user-content',
            
            // Sidebar - prioritize this for better scrolling
            '.sidebar',
            '.sidebar-section',
            '.topic-list',
            '.quick-examples',
            
            // Code blocks
            '.code-container',
            '.code-block pre',
            
            // Any other scrollable areas
            '.scrollable-content',
            '.panel-content',
            '.modal-content'
        ];
    }

    setupScrollbarStyles() {
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
        
        // Check for overflow and add indicators
        this.checkOverflow(element);
    }

    checkOverflow(element) {
        if (!element) return;
        
        const hasVerticalOverflow = element.scrollHeight > element.clientHeight;
        const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;
        
        if (hasVerticalOverflow || hasHorizontalOverflow) {
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
        indicator.innerHTML = '↓';
        element.appendChild(indicator);
        
        // Update indicator visibility based on scroll position
        this.updateScrollIndicator(element);
    }

    removeScrollIndicator(element) {
        const indicator = element.querySelector('.scroll-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    setupOverflowDetection() {
        // Use ResizeObserver to detect content changes
        if (window.ResizeObserver) {
            this.observers = [];
            
            this.scrollableElements.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    const observer = new ResizeObserver(() => {
                        this.debouncedCheckOverflow();
                    });
                    observer.observe(element);
                    this.observers.push(observer);
                });
            });
        }
        
        // Fallback: Check overflow on window resize
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.updateAllScrollbars();
            }, 100);
        });
    }

    setupEventListeners() {
        // Listen for scroll events to update indicators
        this.scrollableElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.addEventListener('scroll', () => {
                    this.updateScrollIndicator(element);
                });
            });
        });
        
        // Listen for content changes (for dynamic content)
        const observer = new MutationObserver(() => {
            clearTimeout(this.contentChangeTimeout);
            this.contentChangeTimeout = setTimeout(() => {
                this.refreshScrollbars();
            }, 100);
        });
        
        // Observe the entire document for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupAnimations() {
        // Add scroll animations
        this.scrollableElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.addEventListener('scroll', () => {
                    // Add smooth scroll animation
                    element.style.scrollBehavior = 'smooth';
                    
                    // Remove smooth behavior after animation
                    setTimeout(() => {
                        element.style.scrollBehavior = 'auto';
                    }, 500);
                });
            });
        });
    }

    updateScrollIndicator(element) {
        const indicator = element.querySelector('.scroll-indicator');
        if (!indicator) return;
        
        const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 5;
        const isAtTop = element.scrollTop <= 5;
        
        if (isAtBottom) {
            indicator.style.opacity = '0.3';
            indicator.innerHTML = '↑';
        } else if (isAtTop) {
            indicator.style.opacity = '0.8';
            indicator.innerHTML = '↓';
        } else {
            indicator.style.opacity = '0.6';
            indicator.innerHTML = '↕';
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

    refreshScrollbars() {
        this.setupScrollbarStyles();
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

    destroy() {
        // Clean up observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        
        // Clear timeouts
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        if (this.contentChangeTimeout) clearTimeout(this.contentChangeTimeout);
        
        // Remove styles
        const style = document.querySelector('#enhanced-scrollbar-styles');
        if (style) style.remove();
        
        this.initialized = false;
        window.scrollbarSystemInitialized = false;
    }
}

// Export for use in other modules
window.ScrollbarSystem = ScrollbarSystem; 