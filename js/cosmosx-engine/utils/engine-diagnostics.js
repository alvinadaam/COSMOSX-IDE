// COSMOSX Engine Diagnostics Utility
// Provides deep, semantic, and runtime-aware diagnostics for Coslang stories using the engine/AST.

import { CosmosEngine } from '../core/CosmosEngine/engine.js';

/**
 * Get engine-driven diagnostics (errors, warnings, info) for a Coslang story.
 * @param {CosmosEngine|object} engineOrAst - The CosmosEngine instance or AST.
 * @returns {Array} diagnostics - Array of diagnostic objects: { line, message, type, code, suggestion }
 */
export function getEngineDiagnostics(engineOrAst) {
    const diagnostics = [];
    let engine = null;
    let ast = null;
    
    try {
        // Accept either an engine or AST
        if (engineOrAst && typeof engineOrAst === 'object' && engineOrAst.constructor && engineOrAst.constructor.name === 'CosmosEngine') {
            engine = engineOrAst;
            ast = engine.ast;
        } else {
            // Use AST directly
            ast = engineOrAst;
            if (ast) {
                engine = new CosmosEngine(ast);
            }
        }
    } catch (e) {
        diagnostics.push({
            line: 1,
            message: 'Engine initialization failed: ' + e.message,
            type: 'error',
            code: 'ENGINE_INIT_ERROR',
            suggestion: 'Check your story structure and try again.',
            source: 'engine'
        });
        return diagnostics;
    }

    if (!ast) {
        diagnostics.push({
            line: 1,
            message: 'No AST available for validation',
            type: 'error',
            code: 'NO_AST',
            suggestion: 'Check your story syntax and try again.',
            source: 'engine'
        });
        return diagnostics;
    }

    // --- Support both array and object for scenes ---
    let scenesArr = [];
    if (ast.scenes) {
        if (Array.isArray(ast.scenes)) {
            scenesArr = ast.scenes;
        } else if (typeof ast.scenes === 'object') {
            scenesArr = Object.values(ast.scenes);
        }
    }

    // Check for missing 'start' scene (critical error)
    if (scenesArr.length === 0) {
        diagnostics.push({
            line: 1,
            message: 'No scenes found in story. Add at least one scene to make your story playable.',
            type: 'error',
            code: 'NO_SCENES',
            suggestion: 'Add a scene with: scene start { ... }',
            source: 'engine'
        });
        return diagnostics; // Stop here if no scenes
    }

    // Check for start scene
    const sceneNames = new Set(scenesArr.map(s => s.id));
    if (!sceneNames.has('start')) {
        diagnostics.push({
            line: 1,
            message: 'No "start" scene found. Stories need a "start" scene to begin.',
            type: 'error',
            code: 'NO_START_SCENE',
            suggestion: 'Add a scene named "start" or rename an existing scene to "start"',
            source: 'engine'
        });
    }

    // Check for undefined scene references
    for (const scene of scenesArr) {
        if (scene.choices) {
            for (const choice of scene.choices) {
                if (choice.target && !sceneNames.has(choice.target)) {
                    diagnostics.push({
                        line: choice.line || scene.line || 1,
                        message: `Choice in scene "${scene.id}" references undefined scene: "${choice.target}"`,
                        type: 'error',
                        code: 'UNDEFINED_SCENE_REFERENCE',
                        suggestion: `Create a scene with id: ${choice.target}`,
                        source: 'engine'
                    });
                }
            }
        }
    }

    // Check for unreachable scenes (not referenced by any choice)
    const referenced = new Set();
    for (const scene of scenesArr) {
        // Check scene content for choice nodes
        if (scene.content && Array.isArray(scene.content)) {
            for (const node of scene.content) {
                if (node && node.type === 'choice' && node.target) {
                    referenced.add(node.target);
                }
                // Also check inside if blocks
                if (node && node.type === 'if') {
                    if (node.then && Array.isArray(node.then)) {
                        for (const thenNode of node.then) {
                            if (thenNode && thenNode.type === 'choice' && thenNode.target) {
                                referenced.add(thenNode.target);
                            }
                        }
                    }
                    if (node.else && Array.isArray(node.else)) {
                        for (const elseNode of node.else) {
                            if (elseNode && elseNode.type === 'choice' && elseNode.target) {
                                referenced.add(elseNode.target);
                            }
                        }
                    }
                }
            }
        }
        // Legacy support for scene.choices array
        if (scene.choices) {
            for (const choice of scene.choices) {
                if (choice.target) referenced.add(choice.target);
            }
        }
    }
    
    for (const scene of scenesArr) {
        if (scene.id !== 'start' && !referenced.has(scene.id)) {
            diagnostics.push({
                line: scene.line || 1,
                message: `Scene "${scene.id}" is unreachable (not referenced by any choice)`,
                type: 'warning',
                code: 'UNREACHABLE_SCENE',
                suggestion: `Add a choice to reference scene: ${scene.id}`,
                source: 'engine'
            });
        }
    }

    // Check for scenes without text content
    for (const scene of scenesArr) {
        let hasTextContent = false;
        
        // Check if scene has text nodes in content array
        if (scene.content && Array.isArray(scene.content)) {
            for (const node of scene.content) {
                if (node && node.type === 'text' && node.value && node.value.trim() !== '') {
                    hasTextContent = true;
                    break;
                }
            }
        }
        
        // Legacy check for scene.content.text
        if (!hasTextContent && scene.content && scene.content.text && scene.content.text.trim() !== '') {
            hasTextContent = true;
        }
        
        if (!hasTextContent) {
            diagnostics.push({
                line: scene.line || 1,
                message: `Scene "${scene.id}" has no text content`,
                type: 'warning',
                code: 'EMPTY_SCENE_CONTENT',
                suggestion: 'Add text content to make the scene meaningful',
                source: 'engine'
            });
        }
    }

    // Check for scenes without choices (except end scenes)
    for (const scene of scenesArr) {
        let hasChoices = false;
        
        // Check if scene has choice nodes in content array
        if (scene.content && Array.isArray(scene.content)) {
            for (const node of scene.content) {
                if (node && node.type === 'choice') {
                    hasChoices = true;
                    break;
                }
                // Also check inside if blocks
                if (node && node.type === 'if') {
                    if (node.then && Array.isArray(node.then)) {
                        for (const thenNode of node.then) {
                            if (thenNode && thenNode.type === 'choice') {
                                hasChoices = true;
                                break;
                            }
                        }
                    }
                    if (!hasChoices && node.else && Array.isArray(node.else)) {
                        for (const elseNode of node.else) {
                            if (elseNode && elseNode.type === 'choice') {
                                hasChoices = true;
                                break;
                            }
                        }
                    }
                }
                if (hasChoices) break;
            }
        }
        
        // Legacy check for scene.choices array
        if (!hasChoices && scene.choices && scene.choices.length > 0) {
            hasChoices = true;
        }
        
        if (scene.id !== 'end' && !hasChoices) {
            diagnostics.push({
                line: scene.line || 1,
                message: `Scene "${scene.id}" has no choices - players cannot progress`,
                type: 'warning',
                code: 'NO_CHOICES',
                suggestion: 'Add choices to allow story progression',
                source: 'engine'
            });
        }
    }

    // Check for potential infinite loops
    for (const scene of scenesArr) {
        if (scene.choices) {
            for (const choice of scene.choices) {
                if (choice.target === scene.id) {
                    diagnostics.push({
                        line: choice.line || scene.line || 1,
                        message: `Scene "${scene.id}" has a choice that leads back to itself - potential infinite loop`,
                        type: 'warning',
                        code: 'POTENTIAL_LOOP',
                        suggestion: 'Consider adding a condition or different target to prevent loops',
                        source: 'engine'
                    });
                }
            }
        }
    }

    // Check for variables and state issues
    if (ast.variables) {
        for (const [varName, varValue] of Object.entries(ast.variables)) {
            if (varValue === undefined || varValue === null) {
                diagnostics.push({
                    line: 1,
                    message: `Variable "${varName}" has undefined value`,
                    type: 'warning',
                    code: 'UNDEFINED_VARIABLE',
                    suggestion: 'Initialize the variable with a proper value',
                    source: 'engine'
                });
            }
        }
    }

    // Check for metadata completeness
    if (ast.meta) {
        if (!ast.meta.title) {
            diagnostics.push({
                line: 1,
                message: 'Story missing title metadata',
                type: 'warning',
                code: 'MISSING_TITLE',
                suggestion: 'Add: title: "Your Story Title"',
                source: 'engine'
            });
        }
        
        if (!ast.meta.author) {
            diagnostics.push({
                line: 1,
                message: 'Story missing author metadata',
                type: 'info',
                code: 'MISSING_AUTHOR',
                suggestion: 'Add: author: "Your Name"',
                source: 'engine'
            });
        }
    }

    // Ensure all diagnostics have source: 'engine'
    for (const d of diagnostics) {
        if (!d.source) d.source = 'engine';
    }
    
    return diagnostics;
} 