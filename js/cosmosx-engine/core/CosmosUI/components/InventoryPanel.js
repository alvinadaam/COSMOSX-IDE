// InventoryPanel.js
// Logic-only helpers for formatting inventory for UI rendering.
// No DOM, no styles.

import { getInventory } from '../SceneRenderer.js';

/**
 * Formats inventory for UI display.
 * @param {object} engineState - The state object from CosmosEngine.getState()
 * @returns {Array<{item:string, count:string}>} Array of inventory items for UI
 */
export function formatInventory(engineState) {
  const inventory = getInventory(engineState);
  // Convert to array of {item, count} for easier UI rendering
  return Object.entries(inventory).map(([item, count]) => ({ item, count }));
} 