// COSMOSX IDE: Smart Coslang Autocorrect Engine
// Orchestrates advanced, context-aware autocorrection using the pattern library and AST/engine context.

import { getCoslangFixes } from './LIBS/coslang-autocorrect-lib.js';
import { parseCosLang } from '../cosmosx-engine/core/CosmosEngine/parser.js';

/**
 * Get all smart, context-aware autocorrections for Coslang code.
 * @param {string} code - The Coslang source code.
 * @param {object} [ast] - Optional pre-parsed AST.
 * @returns {Array<{line:number,column:number,description:string,fix:{line:number,column:number,text:string}}>} Array of safe, deduplicated fix suggestions.
 */
export function getSmartAutocorrections(code, ast = null) {
    let parsedAst = ast;
    if (!parsedAst) {
        try {
            parsedAst = parseCosLang(code);
        } catch (e) {
            // If parsing fails, pass null AST to the library (it will handle parse-time fixes)
            parsedAst = null;
        }
    }
    // Get all fix suggestions from the library
    let fixes = getCoslangFixes(code, parsedAst);
    // Deduplicate by line+column+description+text
    const seen = new Set();
    fixes = fixes.filter(f => {
        const key = `${f.line}|${f.column}|${f.description}|${f.fix && f.fix.text}`;
        if (seen.has(key)) return false;
        seen.add(key);
        // Defensive: ensure all required fields
        f.line = typeof f.line === 'number' ? f.line : 1;
        f.column = typeof f.column === 'number' ? f.column : 1;
        f.description = f.description || 'Autocorrect suggestion';
        f.fix = f.fix && typeof f.fix === 'object' ? f.fix : null;
        return !!f.fix && !!f.fix.text;
    });
    return fixes;
} 