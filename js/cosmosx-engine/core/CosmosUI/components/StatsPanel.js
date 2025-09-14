// StatsPanel.js
// Logic-only helpers for formatting stats for UI rendering.
// No DOM, no styles.

import { getStats } from '../SceneRenderer.js';

/**
 * Formats stats for UI display.
 * @param {object} engineState - The state object from CosmosEngine.getState()
 * @returns {Array<{key:string, value:string}>} Array of stat key-value pairs for UI
 */
export function formatStats(engineState) {
  const stats = getStats(engineState);
  // Convert to array of {key, value} for easier UI rendering
  return Object.entries(stats).map(([key, value]) => ({ key, value }));
} 