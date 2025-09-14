// CosmosX Player - Dialogue System
// Reusable popup/dialog system for file upload, save screens, etc.

import { logger } from './logger.js';

class DialogueSystemClass {
    constructor() {
        this.activeDialogue = null;
        this.dialogueCount = 0;
        this.init();
    }

    init() {
        // Create dialogue container
        this.createDialogueContainer();
        logger.info('DialogueSystem: Initialized');
    }

    createDialogueContainer() {
        // Create container for all dialogues
        const container = document.createElement('div');
        container.id = 'dialogue-container';
        container.className = 'dialogue-container';
        document.body.appendChild(container);
    }

    // Main dialogue creation method
    createDialogue(options = {}) {
        const {
            id = `dialogue-${++this.dialogueCount}`,
            title = 'Dialogue',
            content = '',
            type = 'info', // info, warning, error, success
            showClose = true,
            width = '500px',
            height = 'auto',
            onClose = null,
            onConfirm = null,
            confirmText = 'OK',
            cancelText = 'Cancel',
            showCancel = false,
            closeOnOverlay = true
        } = options;

        // Create dialogue overlay
        const overlay = document.createElement('div');
        overlay.className = 'dialogue-overlay';
        overlay.id = `${id}-overlay`;
        
        // Create dialogue box
        const dialogue = document.createElement('div');
        dialogue.className = `dialogue-box dialogue-${type}`;
        dialogue.style.width = width;
        dialogue.style.height = height;
        
        // Build dialogue content
        dialogue.innerHTML = `
            <div class="dialogue-header">
                <h3 class="dialogue-title">${title}</h3>
                ${showClose ? '<button class="dialogue-close" aria-label="Close">×</button>' : ''}
            </div>
            <div class="dialogue-body">
                ${content}
            </div>
            ${onConfirm || showCancel ? `
                <div class="dialogue-footer">
                    ${showCancel ? `<button class="dialogue-btn dialogue-cancel">${cancelText}</button>` : ''}
                    ${onConfirm ? `<button class="dialogue-btn dialogue-confirm">${confirmText}</button>` : ''}
                </div>
            ` : ''}
        `;

        overlay.appendChild(dialogue);
        
        // Add to container
        const container = document.getElementById('dialogue-container');
        container.appendChild(overlay);

        // Set up event listeners
        this.setupDialogueEvents(overlay, { onClose, onConfirm, closeOnOverlay });

        // Store reference
        this.activeDialogue = overlay;

        return overlay;
    }

    setupDialogueEvents(overlay, options) {
        const { onClose, onConfirm, closeOnOverlay } = options;
        const dialogue = overlay.querySelector('.dialogue-box');

        // Close button
        const closeBtn = dialogue.querySelector('.dialogue-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeDialogue(overlay, onClose);
            });
        }

        // Confirm button
        const confirmBtn = dialogue.querySelector('.dialogue-confirm');
        if (confirmBtn && onConfirm) {
            confirmBtn.addEventListener('click', () => {
                onConfirm(this.getDialogueData(overlay));
                this.closeDialogue(overlay, onClose);
            });
        }

        // Cancel button
        const cancelBtn = dialogue.querySelector('.dialogue-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeDialogue(overlay, onClose);
            });
        }

        // Overlay click
        if (closeOnOverlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeDialogue(overlay, onClose);
                }
            });
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                this.closeDialogue(overlay, onClose);
            }
        });
    }

    closeDialogue(overlay, onClose) {
        overlay.classList.remove('active');
        
        // Clean up file inputs to prevent conflicts
        const fileInputs = overlay.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.value = '';
        });
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (onClose) onClose();
            this.activeDialogue = null;
        }, 300);
    }

    showDialogue(overlay) {
        overlay.classList.add('active');
    }

    getDialogueData(overlay) {
        // Get form data if dialogue contains forms
        const form = overlay.querySelector('form');
        if (form) {
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            return data;
        }
        return null;
    }

    // Pre-built dialogue types

    // File upload dialogue
    createFileUploadDialogue(options = {}) {
        // Guard: Only allow one file upload dialogue at a time
        if (this.activeDialogue && this.activeDialogue.classList.contains('dialogue-overlay')) {
            const existing = this.activeDialogue.querySelector('.file-upload-area');
            if (existing) {
                logger.debug('DialogueSystem: File upload dialogue already open, ignoring');
                return;
            }
        }
        const {
            title = 'Load Story File',
            accept = '.coslang',
            multiple = false,
            onFileSelect = null,
            onClose = null
        } = options;

        const fileInputId = `file-input-${Date.now()}`;
        const content = `
            <div class="file-upload-area" id="file-upload-area">
                <div class="file-upload-icon">
                    <i class="fas fa-file-upload"></i>
                </div>
                <h4>Upload Coslang Story</h4>
                <p>Drag & drop your .coslang file here or click to browse</p>
                <input type="file" accept="${accept}" ${multiple ? 'multiple' : ''} style="display:none;" id="${fileInputId}">
                <button class="file-select-btn" type="button" id="file-select-btn">Select File</button>
            </div>
        `;

        const overlay = this.createDialogue({
            title,
            content,
            type: 'info',
            width: '500px',
            onClose
        });

        // Set up file input functionality
        const fileInput = overlay.querySelector(`#${fileInputId}`);
        const fileSelectBtn = overlay.querySelector('#file-select-btn');
        const fileUploadArea = overlay.querySelector('#file-upload-area');

        // File select button click
        if (fileSelectBtn) {
            fileSelectBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        // File input change
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                    this.handleFileSelection(files[0], fileUploadArea, onFileSelect, overlay);
                }
            });
        }

        // Drag and drop functionality
        this.setupDragAndDrop(fileUploadArea, (file) => {
            this.handleFileSelection(file, fileUploadArea, onFileSelect, overlay);
        });

        // Show the dialogue
        this.showDialogue(overlay);

        return overlay;
    }

    // Save game dialogue
    createSaveGameDialogue(options = {}) {
        const {
            currentSaveName = '',
            onSave = null,
            onClose = null
        } = options;

        const content = `
            <div class="save-game-form">
                <div class="form-group">
                    <label for="save-name">Save Name:</label>
                    <input type="text" id="save-name" name="saveName" value="${currentSaveName}" placeholder="Enter save name...">
                </div>
                <div class="form-group">
                    <label for="save-description">Description (optional):</label>
                    <textarea id="save-description" name="saveDescription" placeholder="Add a description..."></textarea>
                </div>
            </div>
        `;

        const overlay = this.createDialogue({
            title: 'Save Game',
            content,
            type: 'info',
            width: '450px',
            confirmText: 'Save',
            cancelText: 'Cancel',
            showCancel: true,
            onConfirm: (data) => {
                if (onSave) onSave(data);
            },
            onClose
        });

        this.showDialogue(overlay);
        return overlay;
    }

    // Confirmation dialogue
    createConfirmDialogue(options = {}) {
        const {
            title = 'Confirm Action',
            message = 'Are you sure you want to continue?',
            confirmText = 'Yes',
            cancelText = 'No',
            type = 'warning',
            onConfirm = null,
            onCancel = null
        } = options;

        const content = `
            <div class="confirm-message">
                <p>${message}</p>
            </div>
        `;

        const overlay = this.createDialogue({
            title,
            content,
            type,
            width: '400px',
            confirmText,
            cancelText,
            showCancel: true,
            onConfirm,
            onClose: onCancel
        });

        this.showDialogue(overlay);
        return overlay;
    }

    // Input dialogue
    createInputDialogue(options = {}) {
        const {
            title = 'Input Required',
            message = 'Please enter a value:',
            inputType = 'text',
            inputName = 'value',
            placeholder = '',
            defaultValue = '',
            confirmText = 'OK',
            cancelText = 'Cancel',
            onConfirm = null,
            onCancel = null
        } = options;

        const content = `
            <div class="input-form">
                <p class="input-message">${message}</p>
                <div class="form-group">
                    <input type="${inputType}" name="${inputName}" placeholder="${placeholder}" value="${defaultValue}" class="input-field">
                </div>
            </div>
        `;

        const overlay = this.createDialogue({
            title,
            content,
            type: 'info',
            width: '400px',
            confirmText,
            cancelText,
            showCancel: true,
            onConfirm,
            onClose: onCancel
        });

        this.showDialogue(overlay);
        return overlay;
    }

    // Setup drag and drop for file upload
    setupDragAndDrop(element, onFileSelect) {
        if (!element) return;

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.add('dragover');
        });

        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('dragover');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.name.endsWith('.coslang')) {
                    if (onFileSelect) onFileSelect(file);
                } else {
                    showNotification('Please select a valid .coslang file', 'error');
                }
            }
        });

        // Click to select file
        element.addEventListener('click', (e) => {
            if (e.target === element || e.target.closest('.file-upload-area')) {
                const fileInput = element.querySelector('input[type="file"]');
                if (fileInput) {
                    fileInput.click();
                }
            }
        });
    }

    // Close all dialogues
    closeAll() {
        const container = document.getElementById('dialogue-container');
        if (container) {
            container.innerHTML = '';
        }
        this.activeDialogue = null;
    }

    handleFileSelection(file, fileUploadArea, onFileSelect, overlay) {
        if (fileUploadArea) {
            fileUploadArea.classList.add('file-selected');
            fileUploadArea.innerHTML = `
                <div class="file-success-animation">
                    <div class="success-icon">✓</div>
                    <h4>File Selected!</h4>
                    <p>${file.name}</p>
                </div>
            `;
        }

        // Close dialogue after a brief delay to show the success animation
        setTimeout(() => {
            if (onFileSelect) onFileSelect(file);
            this.closeDialogue(overlay);
        }, 800);
    }
}

// Initialize DialogueSystem globally
let DialogueSystem;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        DialogueSystem = new DialogueSystemClass();
        window.DialogueSystem = DialogueSystem;
    });
} else {
    DialogueSystem = new DialogueSystemClass();
    window.DialogueSystem = DialogueSystem;
}

// Notification system (replaces old implementation)
let activeNotification = null;
let notificationTimeout = null;

function showNotification(message, type = 'info', duration = 3000) {
    // Prevent notification spam: if same message/type is already showing, just reset timer
    if (activeNotification && activeNotification.dataset.message === message && activeNotification.dataset.type === type) {
        clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(() => hideNotification(activeNotification), duration);
        return;
    }
    // Remove any existing notification
    if (activeNotification) {
        hideNotification(activeNotification, true);
    }
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.dataset.message = message;
    notification.dataset.type = type;
    notification.style.opacity = '0';
    notification.style.pointerEvents = 'auto';
    // Icon per type
    const iconMap = {
        info: '<i class="fas fa-info-circle notification-icon"></i>',
        success: '<i class="fas fa-check-circle notification-icon"></i>',
        warning: '<i class="fas fa-exclamation-triangle notification-icon"></i>',
        error: '<i class="fas fa-times-circle notification-icon"></i>'
    };
    notification.innerHTML = `
        <div class="notification-content">
            ${iconMap[type] || iconMap.info}
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close">&times;</button>
        </div>
    `;
    // Close button
    notification.querySelector('.notification-close').onclick = () => hideNotification(notification);
    // Add to body
    document.body.appendChild(notification);
    // Fade in
    setTimeout(() => {
        notification.classList.add('show');
        notification.style.opacity = '1';
    }, 10);
    // Auto-hide
    notificationTimeout = setTimeout(() => hideNotification(notification), duration);
    activeNotification = notification;
}

function hideNotification(notification, immediate = false) {
    if (!notification) return;
    notification.style.opacity = '0';
    notification.classList.remove('show');
    clearTimeout(notificationTimeout);
    activeNotification = null;
    setTimeout(() => {
        if (notification.parentNode) notification.parentNode.removeChild(notification);
    }, immediate ? 0 : 400);
}

export { DialogueSystem, showNotification }; 