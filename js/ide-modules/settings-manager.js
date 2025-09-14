// Settings Manager Module
// Handles all IDE settings, preferences, and state management

export class SettingsManager {
    constructor() {
        this.state = {
            isModified: false,
            autoSave: true,
            autoSaveInterval: 30000, // 30 seconds
            theme: 'dark',
            fontSize: 14,
            wordWrap: true,
            minimap: true
        };
        this.performance = {
            lastSave: null,
            parseTime: 0,
            validationTime: 0,
            renderTime: 0
        };
    }

    async loadSettings() {
        try {
            const savedSettings = localStorage.getItem('cosmosx-ide-settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.state = { ...this.state, ...settings };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    async saveSettings() {
        try {
            localStorage.setItem('cosmosx-ide-settings', JSON.stringify(this.state));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    updateSetting(key, value) {
        this.state[key] = value;
        this.saveSettings();
    }

    getSetting(key) {
        return this.state[key];
    }

    getAllSettings() {
        return { ...this.state };
    }

    resetSettings() {
        this.state = {
            isModified: false,
            autoSave: true,
            autoSaveInterval: 30000,
            theme: 'dark',
            fontSize: 14,
            wordWrap: true,
            minimap: true
        };
        this.saveSettings();
    }
} 