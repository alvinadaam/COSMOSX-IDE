// COSLANG Syntax Validator & Highlighter - Updated for v1.0 Engine
// Recommended Syntax Highlighting (for Monaco, CodeMirror, etc):
//
// Story metadata:     /^(title|author|version):/i              color: #ffb347; font-weight: bold;
// Scene blocks:       /^scene\s+\w+\s*\{/i                    color: #58a6ff; font-weight: bold;
// Text blocks:        /^text:/i                               color: #ffd580; font-weight: bold;
// Set statements:     /^set\s+/i                              color: #7fd7ff; font-weight: bold;
// If/else blocks:     /^if\s+|^else\s*\{/i                    color: #b0eaff; font-weight: bold;
// Choice statements:  /^choice\s+/i                           color: #ffe066; font-weight: bold;
// Comments:           /^#/                                    color: #888; opacity: 0.6; font-style: italic;
// Variable interpolation: /\{[^}]+\}/g                        color: #7fd7ff; font-style: italic;
// Comparison operators: /(==|!=|>|<|>=|<=)/g                  color: #b0eaff; font-weight: bold;
// Logical operators:  /(and|or)/g                             color: #b0eaff; font-weight: bold;
// Mathematical operators: /(\+|-|\*|\/)/g                     color: #b0eaff; font-weight: bold;
// Scene references:   /->\s*\w+/                              color: #58a6ff; font-style: italic;
// Constants:          /\b(true|false)\b/g                     color: #ffe066; font-weight: bold;
// Numbers:            /\b\d+\b/g                              color: #baffc9;
// Strings:            /"[^"]*"/g                              color: #ffe066;
//
// Use these as a guide for your editor's theme or custom highlighter.
import { parseCosLang } from './cosmosx-engine/core/CosmosEngine/parser.js';

export class CoslangSyntaxValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    validate(content) {
        this.errors = [];
        this.warnings = [];
        this.info = [];
        let ast = null;
        try {
            ast = parseCosLang(content);
        } catch (e) {
            this.errors.push({
                line: 1,
                message: 'Parse error: ' + e.message,
                type: 'error',
                code: 'PARSE_ERROR',
                suggestion: 'Check your syntax and try again.',
                source: 'parser'
            });
            return {
                errors: this.errors,
                warnings: this.warnings,
                info: this.info,
                ast: null,
                isValid: false
            };
        }
        // Run structure checks on the AST
        this.runStructureChecks(ast);
        return {
            errors: this.errors,
            warnings: this.warnings,
            info: this.info,
            ast,
            isValid: this.errors.length === 0
        };
    }

    runStructureChecks(ast) {
        // Check for required metadata
        if (!ast.meta || !ast.meta.title) {
            this.errors.push({
                line: 1,
                message: 'Missing title metadata - Every story needs a title',
                type: 'error',
                code: 'MISSING_TITLE',
                suggestion: 'Add: title: "Your Story Title"',
                source: 'structure'
            });
        }
        if (!ast.meta || !ast.meta.author) {
            this.warnings.push({
                line: 1,
                message: 'Missing author metadata - Consider adding an author',
                type: 'warning',
                code: 'MISSING_AUTHOR',
                suggestion: 'Add: author: "Your Name"',
                source: 'structure'
            });
        }
        if (!ast.meta || !ast.meta.version) {
            this.warnings.push({
                line: 1,
                message: 'Missing version metadata - Consider adding a version',
                type: 'warning',
                code: 'MISSING_VERSION',
                suggestion: 'Add: version: "1.0.0"',
                source: 'structure'
            });
        }
        // Check for scenes
        const scenes = ast.scenes ? Object.values(ast.scenes) : [];
        if (!scenes.length) {
            this.errors.push({
                line: 1,
                message: 'No scenes found in story - Stories need at least one scene',
                type: 'error',
                code: 'NO_SCENES',
                suggestion: 'Add: scene start {\n\ttext: "Your story begins here..."\n}',
                source: 'structure'
            });
            return;
        }
        // Check for start scene
        if (!scenes.some(s => s.id === 'start')) {
            this.warnings.push({
                line: 1,
                message: 'No "start" scene found - Consider adding a start scene as entry point',
                type: 'warning',
                code: 'NO_START_SCENE',
                suggestion: 'Add: scene start {\n\ttext: "Welcome to your story!"\n}',
                source: 'structure'
            });
        }
        // Check for unmatched braces (parser should catch this, but double-check)
        // (If parseCosLang succeeded, braces are likely matched)
        // Additional structure checks can be added here as needed
    }

    clearAll() {
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    validateStructure(content) {
        // Check for required metadata
        if (!content.includes('title:')) {
            this.errors.push({
                line: 1,
                message: 'Missing title metadata - Every story needs a title',
                type: 'error',
                code: 'MISSING_TITLE',
                suggestion: 'Add: title: "Your Story Title"',
                source: 'structure'
            });
        }

        if (!content.includes('author:')) {
            this.warnings.push({
                line: 1,
                message: 'Missing author metadata - Consider adding an author',
                type: 'warning',
                code: 'MISSING_AUTHOR',
                suggestion: 'Add: author: "Your Name"',
                source: 'structure'
            });
        }

        if (!content.includes('version:')) {
            this.warnings.push({
                line: 1,
                message: 'Missing version metadata - Consider adding a version',
                type: 'warning',
                code: 'MISSING_VERSION',
                suggestion: 'Add: version: "1.0.0"',
                source: 'structure'
            });
        }

        // Check for scenes
        if (!content.includes('scene')) {
            this.errors.push({
                line: 1,
                message: 'No scenes found in story - Stories need at least one scene',
                type: 'error',
                code: 'NO_SCENES',
                suggestion: 'Add: scene start {\n\ttext: "Your story begins here..."\n}',
                source: 'structure'
            });
        }

        // Check for start scene
        if (!content.includes('scene start')) {
            this.warnings.push({
                line: 1,
                message: 'No "start" scene found - Consider adding a start scene as entry point',
                type: 'warning',
                code: 'NO_START_SCENE',
                suggestion: 'Add: scene start {\n\ttext: "Welcome to your story!"\n}',
                source: 'structure'
            });
        }

        // Check for story ending
        this.validateStoryEnding(content);
        
        // Check for orphaned scenes
        this.validateOrphanedScenes(content);
    }

    validateLine(line, lineNumber) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('#')) {
            return;
        }

        // Check for unmatched quotes
        this.validateQuotes(trimmedLine, lineNumber);
        
        // Check for invalid scene syntax
        this.validateSceneSyntax(trimmedLine, lineNumber);
        
        // Check for invalid choice syntax
        this.validateChoiceSyntax(trimmedLine, lineNumber);
        
        // Check for invalid variable assignment
        this.validateVariableAssignment(trimmedLine, lineNumber);
        
        // Check for invalid conditional syntax
        this.validateConditionalSyntax(trimmedLine, lineNumber);
        
        // Check for invalid text syntax
        this.validateTextSyntax(trimmedLine, lineNumber);
    }

    validateQuotes(line, lineNumber) {
        const quoteCount = (line.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) {
            this.errors.push({
                line: lineNumber,
                message: 'Unmatched quotes - missing opening or closing quote',
                type: 'error',
                code: 'UNMATCHED_QUOTES',
                source: 'syntax'
            });
        }
    }

    validateSceneSyntax(line, lineNumber) {
        if (line.trim().startsWith('scene')) {
            const sceneMatch = line.match(/scene\s+(\w+)\s*\{/);
            if (!sceneMatch) {
                this.errors.push({
                    line: lineNumber,
                    message: 'Invalid scene syntax. Use: scene scene_name {',
                    type: 'error',
                    code: 'INVALID_SCENE_SYNTAX',
                    source: 'syntax'
                });
            } else {
                const sceneName = sceneMatch[1];
                if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(sceneName)) {
                    this.errors.push({
                        line: lineNumber,
                        message: `Invalid scene name "${sceneName}". Use only letters, numbers, and underscores`,
                        type: 'error',
                        code: 'INVALID_SCENE_NAME',
                        source: 'syntax'
                    });
                }
            }
        }
    }

    validateChoiceSyntax(line, lineNumber) {
        if (line.trim().startsWith('choice')) {
            // Updated pattern: allow tags after the target
            const choicePattern = /^choice\s+"([^"]+)"\s*->\s*(\w+)(\s+(\[[^\]]+\]\s*)*)?$/;
            const match = line.trim().match(choicePattern);
            
            if (!match) {
                this.errors.push({
                    line: lineNumber,
                    message: 'Invalid choice syntax. Use: choice "text" -> target_scene [TAGS...]',
                    type: 'error',
                    code: 'INVALID_CHOICE_SYNTAX',
                    source: 'syntax'
                });
            } else {
                const [, choiceText, targetScene] = match;
                
                // Validate choice text
                if (!choiceText.trim()) {
                    this.errors.push({
                        line: lineNumber,
                        message: 'Choice text cannot be empty',
                        type: 'error',
                        code: 'EMPTY_CHOICE_TEXT',
                        source: 'syntax'
                    });
                }
                
                // Validate target scene name
                if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(targetScene)) {
                    this.errors.push({
                        line: lineNumber,
                        message: `Invalid target scene name "${targetScene}". Use only letters, numbers, and underscores`,
                        type: 'error',
                        code: 'INVALID_TARGET_SCENE',
                        source: 'syntax'
                    });
                }
            }
        }
    }

    validateVariableAssignment(line, lineNumber) {
        if (line.trim().startsWith('set')) {
            const setPattern = /^set\s+(\w+)\s*=\s*(.+)$/;
            const match = line.trim().match(setPattern);
            
            if (!match) {
                this.errors.push({
                    line: lineNumber,
                    message: 'Invalid set syntax. Use: set variable = value',
                    type: 'error',
                    code: 'INVALID_SET_SYNTAX',
                    source: 'syntax'
                });
            } else {
                const [, variable, value] = match;
                
                // Validate variable name
                if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable)) {
                    this.errors.push({
                        line: lineNumber,
                        message: `Invalid variable name "${variable}". Use only letters, numbers, and underscores`,
                        type: 'error',
                        code: 'INVALID_VARIABLE_NAME',
                        source: 'syntax'
                    });
                }
                
                // Validate value
                this.validateValue(value.trim(), lineNumber);
            }
        }
    }

    validateValue(value, lineNumber) {
        // Check for valid string
        if (value.startsWith('"') && value.endsWith('"')) {
            return; // Valid string
        }
        
        // Check for valid boolean
        if (value === 'true' || value === 'false') {
            return; // Valid boolean
        }
        
        // Check for valid number
        if (/^\d+(\.\d+)?$/.test(value)) {
            return; // Valid number
        }
        
        // Check for valid mathematical expression
        if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*[\+\-\*\/]\s*[a-zA-Z_][a-zA-Z0-9_]*$/.test(value) ||
            /^[a-zA-Z_][a-zA-Z0-9_]*\s*[\+\-\*\/]\s*\d+$/.test(value) ||
            /^\d+\s*[\+\-\*\/]\s*[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
            return; // Valid expression
        }
        
        // Check for valid variable reference
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
            return; // Valid variable reference
        }
        
        this.errors.push({
            line: lineNumber,
            message: `Invalid value "${value}". Use strings (in quotes), numbers, booleans (true/false), or variables`,
            type: 'error',
            code: 'INVALID_VALUE',
            source: 'syntax'
        });
    }

    validateConditionalSyntax(line, lineNumber) {
        if (line.trim().startsWith('if')) {
            const ifPattern = /^if\s+(.+)\s*\{$/;
            const match = line.trim().match(ifPattern);
            
            if (!match) {
                this.errors.push({
                    line: lineNumber,
                    message: 'Invalid if syntax. Use: if condition {',
                    type: 'error',
                    code: 'INVALID_IF_SYNTAX',
                    source: 'syntax'
                });
            } else {
                const condition = match[1];
                this.validateCondition(condition, lineNumber);
            }
        }
        
        if (line.trim().startsWith('} else {')) {
            // Valid else syntax
            return;
        }
    }

    validateCondition(condition, lineNumber) {
        // Check for comparison operators
        const comparisonPattern = /^[a-zA-Z_][a-zA-Z0-9_]*\s*(==|!=|>|<|>=|<=)\s*(true|false|\d+|[a-zA-Z_][a-zA-Z0-9_]*)$/;
        if (comparisonPattern.test(condition)) {
            return; // Valid comparison
        }
        
        // Check for logical operators
        const logicalPattern = /^[a-zA-Z_][a-zA-Z0-9_]*\s*(==|!=|>|<|>=|<=)\s*(true|false|\d+|[a-zA-Z_][a-zA-Z0-9_]*)\s+(and|or)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*(==|!=|>|<|>=|<=)\s*(true|false|\d+|[a-zA-Z_][a-zA-Z0-9_]*)$/;
        if (logicalPattern.test(condition)) {
            return; // Valid logical expression
        }
        
        // Check for simple variable reference
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(condition)) {
            return; // Valid variable reference
        }
        
        this.errors.push({
            line: lineNumber,
            message: `Invalid condition "${condition}". Use comparisons (==, !=, >, <, >=, <=) or logical operators (and, or)`,
            type: 'error',
            code: 'INVALID_CONDITION',
            source: 'syntax'
        });
    }

    validateTextSyntax(line, lineNumber) {
        if (line.trim().startsWith('text:')) {
            const textPattern = /^text:\s*"([^"]*)"$/;
            const match = line.trim().match(textPattern);
            
            if (!match) {
                this.errors.push({
                    line: lineNumber,
                    message: 'Invalid text syntax. Use: text: "your text here"',
                    type: 'error',
                    code: 'INVALID_TEXT_SYNTAX',
                    source: 'syntax'
                });
            } else {
                const text = match[1];
                
                // Check for variable interpolation syntax
                const varInterpolation = /\{[^}]+\}/g;
                const matches = text.match(varInterpolation);
                if (matches) {
                    matches.forEach(match => {
                        const varName = match.slice(1, -1); // Remove { and }
                        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
                            this.errors.push({
                                line: lineNumber,
                                message: `Invalid variable interpolation "${match}". Use: {variable_name}`,
                                type: 'error',
                                code: 'INVALID_VARIABLE_INTERPOLATION',
                                source: 'syntax'
                            });
                        }
                    });
                }
            }
        }
    }

    validateSceneReferences(content) {
        const scenes = this.extractScenes(content);
        const sceneNames = scenes.map(s => s.name);
        
        // Find all choice references
        const choicePattern = /choice\s+"[^"]+"\s*->\s*(\w+)/g;
        let match;
        while ((match = choicePattern.exec(content)) !== null) {
            const targetScene = match[1];
            if (!sceneNames.includes(targetScene)) {
                const lineNumber = this.findLineNumber(content, match[0]);
                this.errors.push({
                    line: lineNumber,
                    message: `Choice references non-existent scene "${targetScene}"`,
                    type: 'error',
                    code: 'INVALID_SCENE_REFERENCE',
                    suggestion: `Create scene: scene ${targetScene} {\n\ttext: "Scene content"\n}`,
                    source: 'structure'
                });
            }
        }
    }

    validateVariables(content) {
        const setPattern = /set\s+(\w+)\s*=/g;
        const variables = [];
        let match;
        
        while ((match = setPattern.exec(content)) !== null) {
            variables.push(match[1]);
        }
        
        // Check for duplicate variable declarations
        const duplicates = this.findDuplicates(variables);
        duplicates.forEach(duplicate => {
            const lineNumber = this.findLineNumber(content, `set ${duplicate} =`);
            this.warnings.push({
                line: lineNumber,
                message: `Variable "${duplicate}" is declared multiple times`,
                type: 'warning',
                code: 'DUPLICATE_VARIABLE',
                source: 'structure'
            });
        });
    }

    validateChoices(content) {
        const scenes = this.extractScenes(content);
        
        scenes.forEach(scene => {
            if (!scene.content.includes('choice')) {
                this.warnings.push({
                    line: scene.line,
                    message: `Scene "${scene.name}" has no choices - players cannot progress`,
                    type: 'warning',
                    code: 'NO_CHOICES',
                    suggestion: 'Add: choice "Continue" -> next_scene',
                    source: 'structure'
                });
            }
        });
    }

    validateConditionals(content) {
        const lines = content.split('\n');
        let braceCount = 0;
        let inConditional = false;
        
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('if')) {
                inConditional = true;
                braceCount++;
            } else if (trimmedLine.startsWith('} else {')) {
                if (!inConditional) {
                    this.errors.push({
                        line: index + 1,
                        message: 'Else block without matching if statement',
                        type: 'error',
                        code: 'ORPHANED_ELSE',
                        source: 'syntax'
                    });
                }
            } else if (trimmedLine === '}') {
                braceCount--;
                if (braceCount === 0) {
                    inConditional = false;
                }
            }
        });
        
        if (braceCount !== 0) {
            this.errors.push({
                line: 1,
                message: 'Unmatched braces in conditional blocks',
                type: 'error',
                code: 'UNMATCHED_BRACES',
                source: 'syntax'
            });
        }
    }

    extractScenes(content) {
        const scenes = [];
        const scenePattern = /scene\s+(\w+)\s*\{/g;
        let match;
        
        while ((match = scenePattern.exec(content)) !== null) {
            const sceneName = match[1];
            const lineNumber = this.findLineNumber(content, match[0]);
            
            // Extract scene content (everything between { and next scene or end of file)
            const startIndex = match.index + match[0].length;
            const endIndex = content.indexOf('scene', startIndex);
            const sceneContent = endIndex !== -1 
                ? content.substring(startIndex, endIndex)
                : content.substring(startIndex);
            
            scenes.push({
                name: sceneName,
                line: lineNumber,
                content: sceneContent
            });
        }
        
        return scenes;
    }

    findLineNumber(content, searchText) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(searchText)) {
                return i + 1;
            }
        }
        return 1;
    }

    findDuplicates(array) {
        const counts = {};
        const duplicates = [];
        
        array.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
            if (counts[item] === 2) {
                duplicates.push(item);
            }
        });
        
        return duplicates;
    }

    getErrorDescription(code) {
        const descriptions = {
            // Basic validation
            'MISSING_TITLE': 'Every Coslang story must have a title',
            'NO_SCENES': 'Stories need at least one scene to be playable',
            'INVALID_SCENE_SYNTAX': 'Scene blocks must use the format: scene name {',
            'INVALID_CHOICE_SYNTAX': 'Choices must use the format: choice "text" -> target',
            'INVALID_SET_SYNTAX': 'Variable assignments must use the format: set variable = value',
            'INVALID_IF_SYNTAX': 'Conditional blocks must use the format: if condition {',
            'INVALID_TEXT_SYNTAX': 'Text blocks must use the format: text: "content"',
            'UNMATCHED_QUOTES': 'All quoted strings must have matching opening and closing quotes',
            'INVALID_SCENE_REFERENCE': 'All choice targets must reference existing scenes',
            'DUPLICATE_VARIABLE': 'Variables should typically be declared only once',
            'NO_CHOICES': 'Scenes without choices cannot be progressed through',
            'ORPHANED_ELSE': 'Else blocks must be preceded by an if block',
            'UNMATCHED_BRACES': 'All opening braces { must have matching closing braces }',
            'INVALID_CONDITION': 'Conditions must use valid comparison or logical operators',
            'INVALID_VALUE': 'Values must be strings, numbers, booleans, or variables',
            'INVALID_VARIABLE_INTERPOLATION': 'Variable interpolation must use the format: {variable_name}',
            
            // 🚀 ULTIMATE: Macro validation
            'DUPLICATE_MACRO': 'Macro names must be unique - rename one of the conflicting macros',
            'INVALID_MACRO_NAME': 'Macro names must use only letters, numbers, and underscores',
            'INVALID_MACRO_ARGUMENT': 'Macro arguments must use only letters, numbers, and underscores',
            'UNDEFINED_MACRO': 'Macro must be defined before it can be called',
            'ORPHANED_MACRO_CALLS': 'Macro calls found but no macro definitions exist',
            
            // 🚀 ULTIMATE: Performance validation
            'LONG_SCENE': 'Very long scenes can impact performance and readability',
            'TOO_MANY_CHOICES': 'Too many choices in one scene can overwhelm users',
            'UNUSED_VARIABLE': 'Unused variables waste memory and create confusion',
            
            // 🚀 ULTIMATE: Accessibility validation
            'SINGLE_CHOICE': 'Single choice scenes reduce interactivity and engagement',
            'SHORT_TEXT': 'Very short text may not provide enough context for readers',
            'LONG_TEXT': 'Very long text can be overwhelming and difficult to read',
            
            // 🚀 ULTIMATE: Security validation
            'POTENTIAL_LOOP': 'Scenes that link to themselves can create infinite loops',
            'UNREACHABLE_CODE': 'Code after end choices may never be executed',
            
            // Additional validation
            'NO_SCENE_TEXT': 'Scenes without text content lack narrative substance',
            'EMPTY_SCENE': 'Empty scenes serve no purpose and should be removed or filled',
            'NO_START_SCENE': 'Start scenes provide clear entry points for stories',
            'NO_END_SCENE': 'End scenes provide satisfying conclusions for stories',
            'ORPHANED_SCENE': 'Unreachable scenes waste space and confuse readers'
        };
        
        return descriptions[code] || 'Unknown error code';
    }

    validateStoryEnding(content) {
        const scenes = this.extractScenes(content);
        const hasEndScene = scenes.some(s => s.name === 'end');
        
        if (!hasEndScene) {
            this.warnings.push({
                line: 1,
                message: 'No "end" scene found - Consider adding an end scene for story completion',
                type: 'warning',
                code: 'NO_END_SCENE',
                suggestion: 'Add: scene end {\n\ttext: "Story complete!"\n}',
                source: 'structure'
            });
        }
    }

    validateOrphanedScenes(content) {
        const scenes = this.extractScenes(content);
        const sceneNames = scenes.map(s => s.name);
        
        scenes.forEach(scene => {
            if (scene.name === 'start') return; // Start scene is always reachable
            
            // Check if this scene is referenced by any choice
            const isReferenced = sceneNames.some(name => {
                const sceneContent = scenes.find(s => s.name === name)?.content || '';
                return sceneContent.includes(`-> ${scene.name}`);
            });
            
            if (!isReferenced) {
                this.warnings.push({
                    line: scene.line,
                    message: `Scene "${scene.name}" is not reachable by any choice`,
                    type: 'warning',
                    code: 'ORPHANED_SCENE',
                    suggestion: `Add a choice that leads to this scene: choice "Go to ${scene.name}" -> ${scene.name}`,
                    source: 'structure'
                });
            }
        });
    }

    validateSceneContent(content) {
        const scenes = this.extractScenes(content);
        
        scenes.forEach(scene => {
            if (!scene.content.includes('text:')) {
                this.warnings.push({
                    line: scene.line,
                    message: `Scene "${scene.name}" has no text content`,
                    type: 'warning',
                    code: 'NO_SCENE_TEXT',
                    suggestion: 'Add: text: "Scene description"',
                    source: 'structure'
                });
            }
        });
    }

    // 🚀 ULTIMATE VALIDATION: Comprehensive macro validation
    validateMacros(content) {
        // Extract all macro definitions
        const macroDefinitions = content.match(/^MACRO\s+(\w+)\s*\(([^)]*)\)\s*:/gm);
        const macroCalls = content.match(/\[(\w+)\s*\([^)]*\)\]/g);
        
        if (macroDefinitions) {
            const definedMacros = new Set();
            
            macroDefinitions.forEach((def, index) => {
                const match = def.match(/^MACRO\s+(\w+)\s*\(([^)]*)\)\s*:/);
                if (match) {
                    const macroName = match[1];
                    const args = match[2].trim();
                    
                    // Check for duplicate macro definitions
                    if (definedMacros.has(macroName)) {
                        this.errors.push({
                            line: this.findLineNumber(content, def),
                            message: `Duplicate macro definition: "${macroName}"`,
                            type: 'error',
                            code: 'DUPLICATE_MACRO',
                            suggestion: 'Rename one of the macros to avoid conflicts',
                            source: 'macro'
                        });
                    }
                    definedMacros.add(macroName);
                    
                    // Validate macro name
                    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(macroName)) {
                        this.errors.push({
                            line: this.findLineNumber(content, def),
                            message: `Invalid macro name "${macroName}" - Use only letters, numbers, and underscores`,
                            type: 'error',
                            code: 'INVALID_MACRO_NAME',
                            source: 'macro'
                        });
                    }
                    
                    // Validate macro arguments
                    if (args) {
                        const argList = args.split(',').map(arg => arg.trim());
                        argList.forEach((arg, argIndex) => {
                            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(arg)) {
                                this.errors.push({
                                    line: this.findLineNumber(content, def),
                                    message: `Invalid macro argument "${arg}" at position ${argIndex + 1}`,
                                    type: 'error',
                                    code: 'INVALID_MACRO_ARGUMENT',
                                    source: 'macro'
                                });
                            }
                        });
                    }
                }
            });
            
            // Check for macro calls to undefined macros
            if (macroCalls) {
                macroCalls.forEach(call => {
                    const match = call.match(/\[(\w+)\s*\(/);
                    if (match) {
                        const calledMacro = match[1];
                        if (!definedMacros.has(calledMacro)) {
                            this.errors.push({
                                line: this.findLineNumber(content, call),
                                message: `Call to undefined macro: "${calledMacro}"`,
                                type: 'error',
                                code: 'UNDEFINED_MACRO',
                                suggestion: `Define the macro first: MACRO ${calledMacro}(args) { ... }`,
                                source: 'macro'
                            });
                        }
                    }
                });
            }
        }
        
        // Check for orphaned macro calls (calls without definitions)
        if (macroCalls && !macroDefinitions) {
            this.warnings.push({
                line: 1,
                message: 'Macro calls found but no macro definitions',
                type: 'warning',
                code: 'ORPHANED_MACRO_CALLS',
                suggestion: 'Define your macros before calling them',
                source: 'macro'
            });
        }
    }

    // 🚀 ULTIMATE VALIDATION: Performance and best practices
    validatePerformance(content) {
        const lines = content.split('\n');
        const scenes = this.extractScenes(content);
        
        // Check for overly long scenes
        scenes.forEach(scene => {
            const lineCount = scene.content.split('\n').filter(line => line.trim()).length;
            if (lineCount > 50) {
                this.warnings.push({
                    line: scene.line,
                    message: `Scene "${scene.name}" is very long (${lineCount} lines) - Consider breaking it into smaller scenes`,
                    type: 'warning',
                    code: 'LONG_SCENE',
                    suggestion: 'Split into multiple scenes for better readability and performance',
                    source: 'performance'
                });
            }
        });
        
        // Check for too many choices in a single scene
        scenes.forEach(scene => {
            const choiceCount = (scene.content.match(/choice/g) || []).length;
            if (choiceCount > 8) {
                this.warnings.push({
                    line: scene.line,
                    message: `Scene "${scene.name}" has many choices (${choiceCount}) - Consider reducing for better UX`,
                    type: 'warning',
                    code: 'TOO_MANY_CHOICES',
                    suggestion: 'Aim for 3-5 choices per scene for optimal user experience',
                    source: 'performance'
                });
            }
        });
        
        // Check for unused variables
        const declaredVars = new Set();
        const usedVars = new Set();
        
        lines.forEach(line => {
            const setMatch = line.match(/^set\s+(\w+)\s*=/);
            if (setMatch) declaredVars.add(setMatch[1]);
            
            const varMatches = line.match(/\{(\w+)\}/g);
            if (varMatches) {
                varMatches.forEach(match => {
                    const varName = match.slice(1, -1);
                    usedVars.add(varName);
                });
            }
        });
        
        declaredVars.forEach(varName => {
            if (!usedVars.has(varName)) {
                this.warnings.push({
                    line: this.findLineNumber(content, `set ${varName} =`),
                    message: `Variable "${varName}" is declared but never used`,
                    type: 'warning',
                    code: 'UNUSED_VARIABLE',
                    suggestion: 'Remove unused variables or use them in your story',
                    source: 'performance'
                });
            }
        });
    }

    // 🚀 ULTIMATE VALIDATION: Accessibility and UX
    validateAccessibility(content) {
        const scenes = this.extractScenes(content);
        
        // Check for scenes with only one choice (linear storytelling)
        scenes.forEach(scene => {
            const choiceCount = (scene.content.match(/choice/g) || []).length;
            if (choiceCount === 1) {
                this.info.push({
                    line: scene.line,
                    message: `Scene "${scene.name}" has only one choice - Consider adding more choices for interactivity`,
                    type: 'info',
                    code: 'SINGLE_CHOICE',
                    suggestion: 'Add alternative choices to make the story more engaging',
                    source: 'accessibility'
                });
            }
        });
        
        // Check for text length (too short or too long)
        scenes.forEach(scene => {
            const textMatches = scene.content.match(/text:\s*"([^"]*)"/g);
            if (textMatches) {
                textMatches.forEach(textMatch => {
                    const textContent = textMatch.match(/text:\s*"([^"]*)"/)[1];
                    if (textContent.length < 10) {
                        this.warnings.push({
                            line: scene.line,
                            message: 'Very short text content - Consider adding more description',
                            type: 'warning',
                            code: 'SHORT_TEXT',
                            suggestion: 'Add more descriptive text to engage readers',
                            source: 'accessibility'
                        });
                    } else if (textContent.length > 500) {
                        this.warnings.push({
                            line: scene.line,
                            message: 'Very long text content - Consider breaking it into smaller chunks',
                            type: 'warning',
                            code: 'LONG_TEXT',
                            suggestion: 'Break long text into multiple scenes or shorter paragraphs',
                            source: 'accessibility'
                        });
                    }
                });
            }
        });
    }

    // 🚀 ULTIMATE VALIDATION: Security and safety
    validateSecurity(content) {
        // Check for potential infinite loops
        const scenes = this.extractScenes(content);
        const sceneNames = scenes.map(s => s.name);
        
        scenes.forEach(scene => {
            const choices = scene.content.match(/choice[^}]*->\s*(\w+)/g);
            if (choices) {
                choices.forEach(choice => {
                    const targetMatch = choice.match(/->\s*(\w+)/);
                    if (targetMatch) {
                        const target = targetMatch[1];
                        if (target === scene.name) {
                            this.warnings.push({
                                line: scene.line,
                                message: `Scene "${scene.name}" has a choice that leads back to itself - potential infinite loop`,
                                type: 'warning',
                                code: 'POTENTIAL_LOOP',
                                suggestion: 'Consider adding a condition or different target to prevent loops',
                                source: 'security'
                            });
                        }
                    }
                });
            }
        });
        
        // Check for unreachable code after return-like statements
        const lines = content.split('\n');
        let inUnreachableBlock = false;
        
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            if (trimmedLine.includes('choice') && trimmedLine.includes('-> end')) {
                inUnreachableBlock = true;
            } else if (inUnreachableBlock && trimmedLine && !trimmedLine.startsWith('}')) {
                this.warnings.push({
                    line: index + 1,
                    message: 'Code after end choice may be unreachable',
                    type: 'warning',
                    code: 'UNREACHABLE_CODE',
                    suggestion: 'Move this code before the end choice or add more choices',
                    source: 'security'
                });
            } else if (trimmedLine === '}') {
                inUnreachableBlock = false;
            }
        });
    }

    // 🚀 ULTIMATE FEATURE: Calculate quality score
    calculateQualityScore() {
        const totalIssues = this.errors.length + this.warnings.length;
        const totalLines = 100; // Base score
        
        let score = Math.max(0, totalLines - (this.errors.length * 10) - (this.warnings.length * 2));
        
        // Bonus for good practices
        if (this.info.length > 0) score += Math.min(10, this.info.length);
        
        return Math.min(100, Math.max(0, score));
    }

    // 🚀 ULTIMATE FEATURE: Generate smart suggestions
    generateSmartSuggestions() {
        const suggestions = [];
        
        if (this.errors.length > 0) {
            suggestions.push('Fix all errors first for a working story');
        }
        
        if (this.warnings.length > 5) {
            suggestions.push('Consider addressing warnings to improve story quality');
        }
        
        const score = this.calculateQualityScore();
        if (score < 50) {
            suggestions.push('Story needs significant improvements - review all suggestions');
        } else if (score < 80) {
            suggestions.push('Story is functional but could be improved');
        } else {
            suggestions.push('Great job! Your story follows best practices');
        }
        
        return suggestions;
    }
} 