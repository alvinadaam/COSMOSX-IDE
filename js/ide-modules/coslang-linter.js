// COSMOSX IDE: Real-Time Coslang Linter
// This module provides lintCoslang(code) for real-time syntax and logic checking.

import { parseCosLang } from '../cosmosx-engine/core/CosmosEngine/parser.js';
import { ErrorManager } from './error-manager.js';

/**
 * Lint Coslang code and return errors/warnings with positions.
 * @param {string} code - The Coslang source code.
 * @returns {Array<{type: 'error'|'warning', message: string, line: number, column: number, fix?: object}>}
 */
export function lintCoslang(code) {
    const results = [];
    let ast = null;
    let parseErrors = [];
    const lines = code.split('\n');

    // Simple quick-fix: missing colon after 'scene' or 'choice'
    lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        // Missing colon after 'scene' keyword
        if (/^\s*scene\s+\w+\s*[^:{]/.test(line)) {
            results.push({
                type: 'error',
                message: "Missing colon or brace after 'scene' declaration.",
                line: lineNum,
                column: line.indexOf('scene') + 1,
                fix: {
                    description: "Insert missing colon",
                    apply: { line: lineNum, column: line.length + 1, text: ':' }
                }
            });
        }
        // Typo: 'choise' instead of 'choice'
        if (/\bchoise\b/.test(line)) {
            results.push({
                type: 'error',
                message: "Possible typo: 'choise' should be 'choice'.",
                line: lineNum,
                column: line.indexOf('choise') + 1,
                fix: {
                    description: "Replace 'choise' with 'choice'",
                    apply: { line: lineNum, column: line.indexOf('choise') + 1, text: 'choice' }
                }
            });
        }
        // Missing colon after 'choice'
        if (/^\s*choice\s+\w+\s*[^:]/.test(line)) {
            results.push({
                type: 'error',
                message: "Missing colon after 'choice' declaration.",
                line: lineNum,
                column: line.indexOf('choice') + 1,
                fix: {
                    description: "Insert missing colon",
                    apply: { line: lineNum, column: line.length + 1, text: ':' }
                }
            });
        }
    });

    try {
        ast = parseCosLang(code, {
            collectErrors: true,
            onError: (err) => parseErrors.push(err)
        });
    } catch (e) {
        // Fatal parse error (e.g. unclosed block)
        results.push({
            type: 'error',
            message: e.message,
            line: e.lineNumber || 1,
            column: e.columnNumber || 1
        });
    }

    // Add parser errors
    for (const err of parseErrors) {
        results.push({
            type: err.severity === 'warning' ? 'warning' : 'error',
            message: err.message,
            line: err.line || 1,
            column: err.column || 1
        });
    }

    // Run additional logic checks using ErrorManager if available
    if (ast && typeof ErrorManager === 'object' && ErrorManager.collectErrors) {
        const logicErrors = ErrorManager.collectErrors(ast);
        for (const err of logicErrors) {
            results.push({
                type: err.severity === 'warning' ? 'warning' : 'error',
                message: err.message,
                line: err.line || 1,
                column: err.column || 1
            });
        }
    }

    return results;
} 