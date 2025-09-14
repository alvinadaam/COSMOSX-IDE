// ChoiceList.js
// Logic-only helpers for formatting and filtering choices for UI rendering.
// No DOM, no styles.

import { getChoices } from '../SceneRenderer.js';

/**
 * Formats choices for UI display, optionally filtering or mapping as needed.
 * @param {object} engineState - The state object from CosmosEngine.getState()
 * @returns {Array<{index:number, text:string, tags?:string[], target:string}>}
 */
export function formatChoices(engineState) {
  // Use getChoices to extract choices
  const choices = getChoices(engineState);
  // Optionally, add more formatting or filtering here
  return choices;
} 