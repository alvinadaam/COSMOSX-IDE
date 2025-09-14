// Engine Integration Module for COSMOSX IDE
// Handles preview, validation, and debug logic using the new CosmosEngine

import { CosmosEngine } from '../cosmosx-engine/core/CosmosEngine/engine.js';
import { parseCosLang } from '../cosmosx-engine/core/CosmosEngine/parser.js';
import { CoslangSyntaxValidator } from '../syntax-validator.js';
import { getEngineDiagnostics } from '../cosmosx-engine/utils/engine-diagnostics.js';

/**
 * Parse and validate CosLang code, returning AST or error.
 */
export function validateCosLang(code) {
    try {
        const ast = parseCosLang(code);
        return { ast, error: null };
    } catch (error) {
        return { ast: null, error: error.message };
    }
}

/**
 * Run a preview of the story using CosmosEngine, starting at a given scene.
 * Returns engine instance and error (if any).
 */
export function runPreview(ast, startScene = 'start') {
    try {
        const engine = new CosmosEngine(ast);
        engine.start(startScene, { reset: true });
        return { engine, error: null };
    } catch (error) {
        return { engine: null, error: error.message };
    }
}

/**
 * Extract debug state from the engine for display in debug panels.
 */
export function getDebugState(engine) {
    if (!engine) return null;
    return engine.getState();
}

/**
 * Run both the legacy syntax validator and the new engine/parser validation.
 * Returns merged errors and warnings for unified error panel.
 */
export function validateAllCosLang(code) {
    // Legacy validator (structure, metadata, beginner tips)
    const syntaxValidator = new CoslangSyntaxValidator();
    const syntaxResult = syntaxValidator.validate(code);
    // Engine/parser validator (deep syntax, logic)
    const { ast, error: engineError } = validateCosLang(code);
    let engineErrors = [];
    let engineDiagnostics = [];
    if (engineError) {
        engineErrors.push({
            message: engineError,
            type: 'error',
            code: 'ENGINE_ERROR',
            suggestion: 'Check syntax and logic',
            source: 'engine'
        });
    }
    // Get deep engine diagnostics if AST is valid
    if (ast) {
        engineDiagnostics = getEngineDiagnostics(ast).map(d => ({ ...d, source: 'engine' }));
    }
    // Merge errors/warnings, label their source
    const errors = [
        ...syntaxResult.errors.map(e => ({ ...e, source: 'structure' })),
        ...engineErrors,
        ...engineDiagnostics.filter(d => d.type === 'error')
    ];
    const warnings = [
        ...syntaxResult.warnings.map(w => ({ ...w, source: 'structure' })),
        ...engineDiagnostics.filter(d => d.type === 'warning')
    ];
    const info = engineDiagnostics.filter(d => d.type === 'info');
    return {
        errors,
        warnings,
        info,
        ast,
        isValid: errors.length === 0
    };
}

/**
 * Pro-level Coslang validation pipeline.
 * Runs syntax validation, parses to AST, runs engine diagnostics, and merges results.
 * Returns { errors, warnings, info, ast, isValid }
 */
export function validateCoslangPro(code) {
    // 1. Run syntax validator
    const syntaxValidator = new CoslangSyntaxValidator();
    const syntaxResult = syntaxValidator.validate(code);
    // If there are fatal errors, return only these
    const fatalErrors = syntaxResult.errors.filter(e => e.type === 'error');
    if (fatalErrors.length > 0) {
        return {
            errors: syntaxResult.errors,
            warnings: syntaxResult.warnings,
            info: syntaxResult.info,
            ast: null,
            isValid: false
        };
    }
    // 2. Parse to AST (using the same parser as the engine)
    let ast = null;
    let parseError = null;
    try {
        ast = parseCosLang(code);
    } catch (e) {
        parseError = {
            line: 1,
            message: 'Parse error: ' + e.message,
            type: 'error',
            code: 'PARSE_ERROR',
            suggestion: 'Check your syntax and try again.',
            source: 'parser'
        };
    }
    if (parseError) {
        return {
            errors: [parseError],
            warnings: [],
            info: [],
            ast: null,
            isValid: false
        };
    }
    // 3. Run engine diagnostics on the AST
    const engineDiagnostics = getEngineDiagnostics(ast);
    // 4. Merge errors/warnings, avoiding duplicates
    const allErrors = [
        ...syntaxResult.errors,
        ...engineDiagnostics.filter(d => d.type === 'error' && !syntaxResult.errors.some(e => e.message === d.message))
    ];
    const allWarnings = [
        ...syntaxResult.warnings,
        ...engineDiagnostics.filter(d => d.type === 'warning' && !syntaxResult.warnings.some(w => w.message === d.message))
    ];
    const allInfo = [
        ...syntaxResult.info,
        ...engineDiagnostics.filter(d => d.type === 'info' && !syntaxResult.info.some(i => i.message === d.message))
    ];
    return {
        errors: allErrors,
        warnings: allWarnings,
        info: allInfo,
        ast,
        isValid: allErrors.length === 0
    };
} 