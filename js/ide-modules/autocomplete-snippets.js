// Modern CosLang Autocomplete Snippet Loader
// Loads snippets from JSON for maintainability and extensibility

let cachedSnippets = null;

async function loadSnippets() {
    if (cachedSnippets) return cachedSnippets;
    const response = await fetch('js/ide-modules/autocomplete-dataset/coslang-snippets.json');
    const data = await response.json();
    cachedSnippets = data;
    return data;
}

/**
 * Returns CosLang autocomplete snippets, optionally filtered by context.
 * @param {object} context - (optional) Context for filtering snippets
 * @returns {Promise<Array>} Array of snippet objects
 */
export async function getSnippetCompletions(context) {
    const snippets = await loadSnippets();
    // Optionally, filter snippets by context here
    return snippets;
} 