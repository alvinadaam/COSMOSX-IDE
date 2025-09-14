/* ===== COSAI UTILITIES ===== */

// Extend CosAI with utility functions
if (window.cosAI) {
    Object.assign(window.cosAI, {
        
        // String utilities
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        unescapeHtml(text) {
            const div = document.createElement('div');
            div.innerHTML = text;
            return div.textContent;
        },

        truncateText(text, maxLength = 100) {
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        },

        // Date utilities
        formatDate(date) {
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        },

        timeAgo(date) {
            const now = new Date();
            const diff = now - date;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
            if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            return 'Just now';
        },

        // Storage utilities
        saveToLocalStorage(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
                return false;
            }
        },

        loadFromLocalStorage(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Failed to load from localStorage:', error);
                return defaultValue;
            }
        },

        removeFromLocalStorage(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Failed to remove from localStorage:', error);
                return false;
            }
        },

        // Chat history utilities
        saveChatHistory() {
            return this.saveToLocalStorage('cosai-chat-history', this.chatHistory);
        },

        loadChatHistory() {
            const history = this.loadFromLocalStorage('cosai-chat-history', []);
            this.chatHistory = history;
            return history;
        },

        clearChatHistory() {
            this.chatHistory = [];
            this.removeFromLocalStorage('cosai-chat-history');
            this.showToast('Chat history cleared', 'success');
        },

        exportChatHistory() {
            const data = {
                timestamp: new Date().toISOString(),
                messages: this.chatHistory,
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cosai-chat-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Chat history exported', 'success');
        },

        // Code utilities
        formatCode(code, language = 'coslang') {
            // Basic code formatting
            let formatted = code.trim();
            
            // Add proper indentation
            const lines = formatted.split('\n');
            const indentedLines = lines.map(line => {
                if (line.trim().startsWith('}')) {
                    return line;
                }
                if (line.trim().startsWith('scene') || line.trim().startsWith('choice')) {
                    return line;
                }
                if (line.trim().startsWith('text:')) {
                    return '    ' + line;
                }
                return line;
            });
            
            return indentedLines.join('\n');
        },

        validateCoslangCode(code) {
            const errors = [];
            
            // Basic validation
            if (!code.includes('scene')) {
                errors.push('Code must contain at least one scene');
            }
            
            if (!code.includes('text:')) {
                errors.push('Code must contain at least one text block');
            }
            
            if (!code.includes('choice')) {
                errors.push('Code must contain at least one choice');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        },

        // Network utilities
        async checkConnectivity() {
            try {
                const response = await fetch('https://httpbin.org/get', {
                    method: 'HEAD',
                    mode: 'no-cors'
                });
                return true;
            } catch (error) {
                return false;
            }
        },

        async pingOllama() {
            try {
                const start = Date.now();
                const response = await fetch('http://localhost:11434/api/tags');
                const end = Date.now();
                
                return {
                    isOnline: response.ok,
                    latency: end - start
                };
            } catch (error) {
                return {
                    isOnline: false,
                    latency: null,
                    error: error.message
                };
            }
        },

        // UI utilities
        scrollToBottom(element) {
            if (element) {
                element.scrollTop = element.scrollHeight;
            }
        },

        focusElement(selector) {
            const element = document.querySelector(selector);
            if (element) {
                element.focus();
                if (element.select) {
                    element.select();
                }
            }
        },

        // Keyboard utilities
        isModifierKey(event) {
            return event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;
        },

        getKeyboardShortcut(event) {
            const keys = [];
            if (event.ctrlKey) keys.push('Ctrl');
            if (event.metaKey) keys.push('Cmd');
            if (event.altKey) keys.push('Alt');
            if (event.shiftKey) keys.push('Shift');
            if (event.key !== 'Control' && event.key !== 'Meta' && event.key !== 'Alt' && event.key !== 'Shift') {
                keys.push(event.key.toUpperCase());
            }
            return keys.join('+');
        },

        // Animation utilities
        animateElement(element, animation, duration = 300) {
            return new Promise((resolve) => {
                element.classList.add(animation);
                setTimeout(() => {
                    element.classList.remove(animation);
                    resolve();
                }, duration);
            });
        },

        // Debounce utility
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle utility
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Color utilities
        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        },

        // Random utilities
        randomId(length = 8) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        },

        randomColor() {
            return '#' + Math.floor(Math.random()*16777215).toString(16);
        },

        // Array utilities
        shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },

        // Object utilities
        deepClone(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => this.deepClone(item));
            if (typeof obj === 'object') {
                const clonedObj = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        clonedObj[key] = this.deepClone(obj[key]);
                    }
                }
                return clonedObj;
            }
        },

        // Error handling utilities
        handleError(error, context = '') {
            console.error(`Error in ${context}:`, error);
            
            // Log to console with timestamp
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Error in ${context}:`, error);
            
            // Show user-friendly error message
            const message = error.message || 'An unexpected error occurred';
            this.showToast(message, 'error');
            
            return {
                error: error.message,
                timestamp: timestamp,
                context: context
            };
        },

        // Performance utilities
        measurePerformance(name, fn) {
            const start = performance.now();
            const result = fn();
            const end = performance.now();
            
            console.log(`${name} took ${(end - start).toFixed(2)}ms`);
            return result;
        },

        async measureAsyncPerformance(name, fn) {
            const start = performance.now();
            const result = await fn();
            const end = performance.now();
            
            console.log(`${name} took ${(end - start).toFixed(2)}ms`);
            return result;
        }
    });
} 