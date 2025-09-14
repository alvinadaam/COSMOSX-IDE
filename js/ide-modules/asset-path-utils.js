// Asset Path Utils for IDE and VFS integration
// Resolves asset URLs for preview and engine use

/**
 * Resolves the correct URL/path for an asset, given its name and type.
 * - If the asset is in the IDE's AssetManager, returns its in-memory URL (VFS).
 * - Otherwise, returns the default path (e.g., assets/images/NAME).
 *
 * @param {string} name - The asset name (e.g., 'logo.png')
 * @param {'image'|'audio'|'video'} type - The asset type
 * @param {AssetManager} [assetManager] - Optional, the IDE's AssetManager instance
 * @returns {string} - The resolved URL or path
 */
export function resolveAssetPath(name, type, assetManager) {
  if (assetManager) {
    const assets = assetManager.getAssets(type === 'image' ? 'images' : type === 'audio' ? 'audio' : null);
    if (assets && Array.isArray(assets)) {
      const found = assets.find(a => a.name === name);
      if (found && found.url) return found.url;
    }
  }
  // Fallback to default asset folders
  const DEFAULT_FOLDERS = {
    image: 'assets/images/',
    audio: 'assets/audio/',
    video: 'assets/video/'
  };
  return DEFAULT_FOLDERS[type] + name;
} 