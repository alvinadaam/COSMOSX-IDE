// CosmosAssets: Asset registry and path resolver for Coslang
// Supports images, audio, video (local and remote)

const DEFAULT_FOLDERS = {
  image: 'assets/images/',
  audio: 'assets/audio/',
  video: 'assets/video/'
};

export class Asset {
  constructor(type, name, value, settings = {}) {
    this.type = type; // 'image', 'audio', 'video'
    this.name = name;
    this.value = value; // filename, path, or URL
    this.settings = settings; // Flexible controls/settings for this asset
    this.resolvedPath = CosmosAssetsRegistry.resolveAssetPath(type, value);
  }

  /**
   * Get a specific control/setting value for this asset.
   * @param {string} key
   * @returns {any}
   */
  getControl(key) {
    return this.settings[key];
  }

  /**
   * Get all controls/settings for this asset.
   * @returns {Object}
   */
  getAllControls() {
    return { ...this.settings };
  }
}

export class CosmosAssetsRegistry {
  constructor() {
    this.assets = {};
    // Structure: { type: { name: Asset } }
    for (const t of ['image', 'audio', 'video']) this.assets[t] = {};
  }

  static resolveAssetPath(type, value) {
    if (/^https?:\/\//i.test(value)) return value; // Remote URL
    if (value.includes('/')) return DEFAULT_FOLDERS[type] + value; // Subfolder or custom path
    return DEFAULT_FOLDERS[type] + value; // Just filename
  }

  addAsset(type, name, value, settings = {}) {
    const asset = new Asset(type, name, value, settings);
    this.assets[type][name] = asset;
    return asset;
  }

  getAsset(type, nameOrFilename) {
    // 1. Try alias (from assets block)
    if (this.assets[type] && this.assets[type][nameOrFilename]) {
      return this.assets[type][nameOrFilename];
    }
    // 2. Try direct filename (case-insensitive)
    const files = Object.values(this.assets[type] || {});
    const found = files.find(asset =>
      asset.value && asset.value.toLowerCase() === nameOrFilename.toLowerCase() ||
      asset.name && asset.name.toLowerCase() === nameOrFilename.toLowerCase()
    );
    if (found) return found;

    // 3. Fallback: If not registered, create a temp asset object for direct file use
    if (type === 'image') {
      return {
        type: 'image',
        name: nameOrFilename,
        value: nameOrFilename,
        resolvedPath: `assets/images/${nameOrFilename}`
      };
    }
    if (type === 'audio') {
      return {
        type: 'audio',
        name: nameOrFilename,
        value: nameOrFilename,
        resolvedPath: `assets/audio/${nameOrFilename}`
      };
    }
    if (type === 'video') {
      return {
        type: 'video',
        name: nameOrFilename,
        value: nameOrFilename,
        resolvedPath: `assets/video/${nameOrFilename}`
      };
    }
    return null;
  }

  getAssetsByType(type) {
    return Object.values(this.assets[type]);
  }

  getAllAssets() {
    return Object.values(this.assets).flatMap(typeAssets => Object.values(typeAssets));
  }
}

// Export a singleton registry for use everywhere
export const cosmosAssets = new CosmosAssetsRegistry(); 