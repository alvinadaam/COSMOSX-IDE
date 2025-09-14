// SceneRenderer.js
// Logic-only helpers for extracting and formatting scene content for UI rendering.
// No DOM, no styles.

/**
 * Extracts the current text block(s) to display for the current scene/position.
 * @param {object} engineState - The state object from CosmosEngine.getState()
 * @returns {string[]} Array of text blocks to display
 */
export function getCurrentText(engineState) {
  if (!engineState || !engineState.scene || !Array.isArray(engineState.scene.content)) return [];
  const pos = engineState.position;
  const content = engineState.scene.content;
  // Gather all consecutive text nodes from current position
  const texts = [];
  for (let i = pos; i < content.length; i++) {
    const node = content[i];
    if (node.type === 'text') {
      // Interpolate variables if needed (engine should do this)
      texts.push(node.value);
    } else {
      break; // Stop at first non-text node (e.g., choice, set, if, etc.)
    }
  }
  return texts;
}

/**
 * Extracts available choices for the current scene/position.
 * @param {object} engineState - The state object from CosmosEngine.getState()
 * @returns {Array<{index:number, text:string, tags?:string[], target:string}>}
 */
export function getChoices(engineState) {
  if (!engineState || !engineState.scene || !Array.isArray(engineState.scene.content)) return [];
  const content = engineState.scene.content;
  // Choices are typically after text blocks at the current position
  const choices = [];
  for (let i = 0; i < content.length; i++) {
    const node = content[i];
    if (node.type === 'choice') {
      choices.push({
        index: choices.length,
        text: node.text,
        tags: node.tags,
        target: node.target
      });
    }
  }
  return choices;
}

/**
 * Extracts stats in a UI-friendly format.
 * @param {object} engineState - The state object from CosmosEngine.getState()
 * @returns {object} Stats key-value pairs
 */
export function getStats(engineState) {
  return engineState && engineState.stats ? { ...engineState.stats } : {};
}

/**
 * Extracts inventory in a UI-friendly format.
 * @param {object} engineState - The state object from CosmosEngine.getState()
 * @returns {object} Inventory key-value pairs
 */
export function getInventory(engineState) {
  return engineState && engineState.inventory ? { ...engineState.inventory } : {};
}

/**
 * Extracts log entries for UI display.
 * @param {object} engineState - The state object from CosmosEngine.getState()
 * @returns {Array} Log entries
 */
export function getLog(engineState) {
  return engineState && Array.isArray(engineState.log) ? [ ...engineState.log ] : [];
} 