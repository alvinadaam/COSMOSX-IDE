// Asset Manager Module
// Handles all asset-related functionality: images, audio, file uploads, etc.

import { DialogueManager } from './dialogues.js';

export class AssetManager {
    constructor(ide) {
        this.ide = ide;
        this.assets = { images: [], audio: [] };
    }

    setupAssetPanel() {
        // Initialize asset panel
        this.updateAssetPanel();
    }

    updateAssetPanel() {
        const imageAssets = document.getElementById('image-assets');
        const audioAssets = document.getElementById('audio-assets');
        
        if (imageAssets) {
            if (this.assets.images.length === 0) {
                imageAssets.innerHTML = `
                    <div class="empty-assets">
                        <i class="fas fa-image"></i>
                        <p>No images uploaded</p>
                        <small>Click + to add images</small>
                    </div>
                `;
            } else {
                imageAssets.innerHTML = this.assets.images.map(asset => `
                    <div class="asset-item" onclick="window.ide.assetManager.insertAsset('${asset.name}', 'image')">
                        <img src="${asset.url}" alt="${asset.name}">
                        <span>${asset.name}</span>
                    </div>
                `).join('');
            }
        }
        
        if (audioAssets) {
            if (this.assets.audio.length === 0) {
                audioAssets.innerHTML = `
                    <div class="empty-assets">
                        <i class="fas fa-music"></i>
                        <p>No audio files uploaded</p>
                        <small>Click + to add audio</small>
                    </div>
                `;
            } else {
                audioAssets.innerHTML = this.assets.audio.map(asset => `
                    <div class="asset-item" onclick="window.ide.assetManager.insertAsset('${asset.name}', 'audio')">
                        <i class="fas fa-music"></i>
                        <span>${asset.name}</span>
                    </div>
                `).join('');
            }
        }
    }

    addAsset() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,audio/*';
        input.multiple = true;
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const url = URL.createObjectURL(file);
                const asset = {
                    name: file.name,
                    url: url,
                    type: file.type.startsWith('image/') ? 'image' : 'audio'
                };
                
                this.assets[asset.type === 'image' ? 'images' : 'audio'].push(asset);
            });
            
            this.updateAssetPanel();
            DialogueManager.showSystemMessage('success', `${files.length} asset(s) uploaded successfully!`);
        };
        
        input.click();
    }

    insertAsset(assetName, assetType) {
        if (!this.ide.editorManager.editor) return;
        
        const asset = this.assets[assetType === 'image' ? 'images' : 'audio'].find(a => a.name === assetName);
        if (!asset) return;
        
        const insertText = assetType === 'image' ? `IMAGE:\n${asset.name}` : `MUSIC:\n${asset.name}`;
        const position = this.ide.editorManager.editor.getPosition();
        
        this.ide.editorManager.editor.executeEdits('asset-insert', [{
            range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
            text: insertText + '\n'
        }]);
        
        DialogueManager.showSystemMessage('success', `${assetType} asset inserted!`);
    }

    addImageAsset(file) {
        const url = URL.createObjectURL(file);
        const asset = {
            name: file.name,
            url: url,
            type: 'image'
        };
        
        this.assets.images.push(asset);
        this.updateAssetPanel();
    }

    addAudioAsset(file) {
        const url = URL.createObjectURL(file);
        const asset = {
            name: file.name,
            url: url,
            type: 'audio'
        };
        
        this.assets.audio.push(asset);
        this.updateAssetPanel();
    }

    getAssets(type = null) {
        if (type) {
            return this.assets[type] || [];
        }
        return this.assets;
    }

    removeAsset(assetName, assetType) {
        const assetList = this.assets[assetType === 'image' ? 'images' : 'audio'];
        const index = assetList.findIndex(a => a.name === assetName);
        if (index > -1) {
            URL.revokeObjectURL(assetList[index].url);
            assetList.splice(index, 1);
            this.updateAssetPanel();
        }
    }

    clearAssets(type = null) {
        if (type) {
            this.assets[type].forEach(asset => URL.revokeObjectURL(asset.url));
            this.assets[type] = [];
        } else {
            Object.values(this.assets).flat().forEach(asset => URL.revokeObjectURL(asset.url));
            this.assets = { images: [], audio: [] };
        }
        this.updateAssetPanel();
    }
} 