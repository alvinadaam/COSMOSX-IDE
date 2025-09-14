/* ===== COSAI UI UTILITIES ===== */

// Extend CosAI with UI utilities
if (window.cosAI) {
    Object.assign(window.cosAI, {
        
        // Toast notification system
        showToast(message, type = 'info', duration = 3000) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type} fade-in`;
            toast.innerHTML = `
                <div class="toast-content">
                    <i class="fas ${this.getToastIcon(type)}"></i>
                    <span>${message}</span>
                </div>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add toast styles if not already added
            if (!document.getElementById('toast-styles')) {
                const style = document.createElement('style');
                style.id = 'toast-styles';
                style.textContent = `
                    .toast {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: var(--surface-light);
                        border: 1px solid var(--border);
                        border-radius: 8px;
                        padding: 12px 16px;
                        color: var(--text-primary);
                        z-index: 1000;
                        max-width: 300px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .toast-success { border-left: 4px solid var(--success); }
                    .toast-error { border-left: 4px solid var(--error); }
                    .toast-warning { border-left: 4px solid var(--warning); }
                    .toast-info { border-left: 4px solid var(--primary); }
                    .toast-content { display: flex; align-items: center; gap: 8px; flex: 1; }
                    .toast-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; }
                    .toast-close:hover { color: var(--text-primary); }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(toast);
            
            // Auto remove
            setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, duration);
            
            // Manual close
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.classList.add('fade-out');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            });
        },

        getToastIcon(type) {
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };
            return icons[type] || icons.info;
        },

        // Modal system
        showModal(title, content, buttons = []) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        ${buttons.map(btn => `
                            <button class="btn ${btn.class || 'btn-secondary'}" data-action="${btn.action}">
                                ${btn.icon ? `<i class="fas ${btn.icon}"></i>` : ''}
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            modal.style.display = 'block';
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
            
            // Close on X button
            modal.querySelector('.modal-close').addEventListener('click', () => {
                this.closeModal(modal);
            });
            
            // Button actions
            modal.querySelectorAll('[data-action]').forEach(button => {
                button.addEventListener('click', () => {
                    const action = button.getAttribute('data-action');
                    if (action === 'close') {
                        this.closeModal(modal);
                    } else if (typeof this[action] === 'function') {
                        this[action]();
                        this.closeModal(modal);
                    }
                });
            });
            
            return modal;
        },

        closeModal(modal) {
            modal.classList.add('fade-out');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        },

        // Loading overlay
        showLoading(message = 'Loading...') {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="spinner spinner-large"></div>
                    <p>${message}</p>
                </div>
            `;
            
            // Add loading styles if not already added
            if (!document.getElementById('loading-styles')) {
                const style = document.createElement('style');
                style.id = 'loading-styles';
                style.textContent = `
                    .loading-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.7);
                        backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 2000;
                    }
                    .loading-content {
                        background: var(--surface);
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        padding: 24px;
                        text-align: center;
                        color: var(--text-primary);
                    }
                    .loading-content p {
                        margin-top: 16px;
                        font-size: 16px;
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(overlay);
            return overlay;
        },

        hideLoading(overlay) {
            if (overlay && overlay.parentNode) {
                overlay.classList.add('fade-out');
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                }, 300);
            }
        },

        // Progress bar
        showProgress(message = 'Processing...', progress = 0) {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-overlay';
            progressBar.innerHTML = `
                <div class="progress-content">
                    <p>${message}</p>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${Math.round(progress)}%</span>
                </div>
            `;
            
            // Add progress styles if not already added
            if (!document.getElementById('progress-styles')) {
                const style = document.createElement('style');
                style.id = 'progress-styles';
                style.textContent = `
                    .progress-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.7);
                        backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 2000;
                    }
                    .progress-content {
                        background: var(--surface);
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        padding: 24px;
                        text-align: center;
                        color: var(--text-primary);
                        min-width: 300px;
                    }
                    .progress-content p {
                        margin-bottom: 16px;
                        font-size: 16px;
                    }
                    .progress-text {
                        display: block;
                        margin-top: 8px;
                        font-size: 14px;
                        color: var(--text-secondary);
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(progressBar);
            
            // Update progress method
            progressBar.updateProgress = (newProgress, newMessage) => {
                const bar = progressBar.querySelector('.progress-bar');
                const text = progressBar.querySelector('.progress-text');
                const message = progressBar.querySelector('p');
                
                if (bar) bar.style.width = `${newProgress}%`;
                if (text) text.textContent = `${Math.round(newProgress)}%`;
                if (message && newMessage) message.textContent = newMessage;
            };
            
            return progressBar;
        },

        // Confirmation dialog
        async confirm(message, title = 'Confirm') {
            return new Promise((resolve) => {
                const modal = this.showModal(title, message, [
                    {
                        text: 'Cancel',
                        class: 'btn-secondary',
                        action: 'close'
                    },
                    {
                        text: 'Confirm',
                        class: 'btn-primary',
                        action: 'confirm'
                    }
                ]);
                
                // Override the confirm action
                modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                    this.closeModal(modal);
                    resolve(true);
                });
                
                // Override the close action
                modal.querySelector('[data-action="close"]').addEventListener('click', () => {
                    this.closeModal(modal);
                    resolve(false);
                });
            });
        },

        // Alert dialog
        alert(message, title = 'Alert') {
            this.showModal(title, message, [
                {
                    text: 'OK',
                    class: 'btn-primary',
                    action: 'close'
                }
            ]);
        },

        // Input dialog
        async prompt(message, defaultValue = '', title = 'Input') {
            return new Promise((resolve) => {
                const inputHtml = `
                    <p>${message}</p>
                    <input type="text" class="input" value="${defaultValue}" placeholder="Enter your answer...">
                `;
                
                const modal = this.showModal(title, inputHtml, [
                    {
                        text: 'Cancel',
                        class: 'btn-secondary',
                        action: 'close'
                    },
                    {
                        text: 'OK',
                        class: 'btn-primary',
                        action: 'confirm'
                    }
                ]);
                
                const input = modal.querySelector('input');
                input.focus();
                input.select();
                
                // Handle Enter key
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.closeModal(modal);
                        resolve(input.value);
                    }
                });
                
                // Override the confirm action
                modal.querySelector('[data-action="confirm"]').addEventListener('click', () => {
                    this.closeModal(modal);
                    resolve(input.value);
                });
                
                // Override the close action
                modal.querySelector('[data-action="close"]').addEventListener('click', () => {
                    this.closeModal(modal);
                    resolve(null);
                });
            });
        }
    });
} 