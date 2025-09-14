// CosmosUI Asset Style Utils
// Maps asset controls to style/attribute objects for UI rendering

/**
 * Maps image asset controls to a style and attribute object for rendering.
 * @param {Object} controls - The controls/settings for the image asset.
 * @returns {Object} { style, attrs }
 */
export function getImageAssetStyles(controls = {}) {
  const style = {};
  const attrs = {};
  if (controls.width) style.width = typeof controls.width === 'number' ? controls.width + 'px' : controls.width;
  if (controls.height) style.height = typeof controls.height === 'number' ? controls.height + 'px' : controls.height;
  if (controls.opacity !== undefined) style.opacity = controls.opacity;
  if (controls.fit) style.objectFit = controls.fit;
  if (controls.zIndex !== undefined) style.zIndex = controls.zIndex;
  if (controls.visible === false) style.display = 'none';
  if (controls.alt) attrs.alt = controls.alt;
  // Future: border, radius, shadow, transition, effect, position, etc.
  return { style, attrs };
}

/**
 * Maps audio asset controls to attribute object for rendering.
 * @param {Object} controls - The controls/settings for the audio asset.
 * @returns {Object} attrs
 */
export function getAudioAssetAttrs(controls = {}) {
  const attrs = {};
  if (controls.volume !== undefined) attrs.volume = controls.volume;
  if (controls.loop) attrs.loop = true;
  if (controls.autoplay) attrs.autoplay = true;
  if (controls.controls !== undefined) attrs.controls = controls.controls;
  if (controls.mute) attrs.muted = true;
  // Future: start, end, fadeIn, fadeOut, etc.
  return attrs;
}

/**
 * Maps video asset controls to style and attribute objects for rendering.
 * @param {Object} controls - The controls/settings for the video asset.
 * @returns {Object} { style, attrs }
 */
export function getVideoAssetStyles(controls = {}) {
  const style = {};
  const attrs = {};
  if (controls.width) style.width = typeof controls.width === 'number' ? controls.width + 'px' : controls.width;
  if (controls.height) style.height = typeof controls.height === 'number' ? controls.height + 'px' : controls.height;
  if (controls.poster) attrs.poster = controls.poster;
  if (controls.volume !== undefined) attrs.volume = controls.volume;
  if (controls.loop) attrs.loop = true;
  if (controls.autoplay) attrs.autoplay = true;
  if (controls.controls !== undefined) attrs.controls = controls.controls;
  if (controls.mute) attrs.muted = true;
  if (controls.zIndex !== undefined) style.zIndex = controls.zIndex;
  if (controls.visible === false) style.display = 'none';
  // Future: start, end, fadeIn, fadeOut, etc.
  return { style, attrs };
}

// General utility for global controls (tags, alias, preload, etc.) can be added as needed. 