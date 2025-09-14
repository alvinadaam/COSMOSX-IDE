import { getSnippetCompletions } from './ide-modules/autocomplete-snippets.js';
import { getQuickCompletions } from './ide-modules/quick-completions.js';

export class CoslangAutocomplete {
    static isRegistered = false; // Static flag to prevent double registration
    
    constructor() {
        this.contextCache = new Map();
        this.completionCache = new Map();
        this.debounceTimer = null;
        this.performanceMetrics = {
            parseTime: 0,
            completionTime: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        this.lastModelVersion = null;
        this.lastCursorPosition = null;
    }

    // Parse context from the editor model with enhanced intelligence
    parseContext(model, position) {
        const content = model.getValue();
        const cursorPosition = position || model.getPosition?.() || { lineNumber: 1, column: 1 };
        const currentLine = model.getLineContent(cursorPosition.lineNumber);
        
        // Enhanced scene detection
        const scenes = [];
        const sceneRegex = /^scene\s+(\w+)\s*\{/gm;
        let match;
        while ((match = sceneRegex.exec(content)) !== null) {
            scenes.push(match[1]);
        }
        
        // Enhanced variable detection from multiple sources
        const variables = new Set();
        
        // From set statements
        const setRegex = /^set\s+(\w+)\s*=/gm;
        while ((match = setRegex.exec(content)) !== null) {
            variables.add(match[1]);
        }
        
        // From vars blocks
        const varsBlockRegex = /vars\s*\{([^}]+)\}/g;
        while ((match = varsBlockRegex.exec(content)) !== null) {
            const varsContent = match[1];
            const varRegex = /(\w+)\s*=\s*[^,\n]+/g;
            let varMatch;
            while ((varMatch = varRegex.exec(varsContent)) !== null) {
                variables.add(varMatch[1]);
            }
        }
        
        // From stats blocks
        const statsBlockRegex = /stats\s*\{([^}]+)\}/g;
        while ((match = statsBlockRegex.exec(content)) !== null) {
            const statsContent = match[1];
            const statRegex = /(\w+)\s*=\s*[^,\n]+/g;
            let statMatch;
            while ((statMatch = statRegex.exec(statsContent)) !== null) {
                variables.add(statMatch[1]);
            }
        }
        
        // From inventory blocks
        const inventoryBlockRegex = /inventory\s*\{([^}]+)\}/g;
        while ((match = inventoryBlockRegex.exec(content)) !== null) {
            const inventoryContent = match[1];
            const itemRegex = /(\w+)\s*=\s*[^,\n]+/g;
            let itemMatch;
            while ((itemMatch = itemRegex.exec(inventoryContent)) !== null) {
                variables.add(itemMatch[1]);
            }
        }
        
        // From variable interpolation
        const interpolationRegex = /\{(\w+)\}/g;
        while ((match = interpolationRegex.exec(content)) !== null) {
            variables.add(match[1]);
        }
        
        // Enhanced macro detection
        const macros = [];
        const macroRegex = /^macro\s+(\w+)\s*\(([^)]*)\)\s*\{/gm;
        while ((match = macroRegex.exec(content)) !== null) {
            const macroName = match[1];
            const argsString = match[2].trim();
            const args = argsString ? argsString.split(',').map(arg => arg.trim()) : [];
            macros.push({ name: macroName, args });
        }
        
        // Context detection helpers
        const isInBlock = (blockType) => {
            const lines = content.split('\n');
            let inBlock = false;
            let blockDepth = 0;
            
            for (let i = 0; i < cursorPosition.lineNumber - 1; i++) {
                const line = lines[i].trim();
                if (line.startsWith(blockType)) {
                    inBlock = true;
                    blockDepth = 1;
                } else if (inBlock) {
                    if (line.includes('{')) blockDepth++;
                    if (line.includes('}')) {
                        blockDepth--;
                        if (blockDepth === 0) inBlock = false;
                    }
                }
            }
            return inBlock;
        };
        
        // Enhanced context object
        const context = {
            scenes,
            variables: Array.from(variables),
            macros,
            currentLine: currentLine.trim(),
            cursorPosition,
            isInScene: isInBlock('scene'),
            isInVarsBlock: isInBlock('vars'),
            isInStatsBlock: isInBlock('stats'),
            isInInventoryBlock: isInBlock('inventory'),
            isInMacroBlock: isInBlock('macro'),
            isInChoice: currentLine.includes('choice'),
            isInIfBlock: isInBlock('if'),
            isInTextLine: currentLine.startsWith('text:'),
            isAtFileStart: cursorPosition.lineNumber <= 3,
            isAfterArrow: currentLine.includes('->'),
            isInVariableInterpolation: currentLine.includes('{') && !currentLine.includes('}'),
            isInMacroCall: currentLine.includes('[') && !currentLine.includes(']')
        };
        
        return context;
    }

    // Deduplicate completions by label and content
    deduplicate(completions) {
        const seen = new Map(); // Use Map to store both label and insertText
        return completions.filter(item => {
            const key = `${item.label}:${item.insertText}`;
            if (seen.has(key)) {
                return false;
            }
            seen.set(key, true);
            return true;
        });
    }

    // Provide quick completions based on context
    async getQuickCompletions(context) {
        try {
            // Use the imported quick completions function
            return await getQuickCompletions(context);
        } catch (error) {
            console.warn('Quick completions failed, using fallback:', error);
            // Fallback to basic completions
            const quick = [];
            // Scene names
            context.scenes.forEach(scene => {
                quick.push({
                    label: `-> ${scene}`,
                    insertText: `-> ${scene}`,
                    kind: 'text',
                    detail: 'Jump to scene'
                });
            });
            // Variables
            context.variables.forEach(variable => {
                quick.push({
                    label: `{${variable}}`,
                    insertText: `{${variable}}`,
                    kind: 'text',
                    detail: 'Variable interpolation'
                });
                quick.push({
                    label: `set ${variable} = ...`,
                    insertText: `set ${variable} = `,
                    kind: 'snippet',
                    detail: 'Set variable'
                });
            });
            // Macros
            context.macros.forEach(macro => {
                quick.push({
                    label: `[${macro.name}(...)]`,
                    insertText: `[${macro.name}(${macro.args.join(', ')})]`,
                    kind: 'snippet',
                    detail: 'Call macro'
                });
            });
            // Common keywords
            ['scene', 'set', 'choice', 'if', 'else', 'text:', 'vars', 'stats', 'inventory', 'macro'].forEach(kw => {
                quick.push({
                    label: kw,
                    insertText: kw,
                    kind: 'keyword',
                    detail: 'Keyword'
                });
            });
            return quick;
        }
    }

    // Main async completion provider with performance optimizations
    async getCompletionItems(model, position) {
        try {
            const startTime = performance.now();
            
            // Validate parameters
            if (!model || !position) {
                console.warn('Invalid parameters for autocomplete:', { model: !!model, position: !!position });
                return { suggestions: [] };
            }
            
            // 🚀 PERFORMANCE OPTIMIZATION: Check cache first
            const modelVersion = model.getVersionId?.() || 'unknown';
            const cursorPosition = `${position.lineNumber}:${position.column}`;
            const cacheKey = `${modelVersion}:${cursorPosition}`;
        
        if (this.completionCache.has(cacheKey)) {
            this.performanceMetrics.cacheHits++;
            return this.completionCache.get(cacheKey);
        }
        
        this.performanceMetrics.cacheMisses++;
        
        const wordInfo = model.getWordUntilPosition(position);
        const word = wordInfo.word;
        const line = model.getLineContent(position.lineNumber);
        
        // Parse context with timing
        const parseStart = performance.now();
        const context = this.parseContext(model, position);
        this.performanceMetrics.parseTime = performance.now() - parseStart;
        
        // Get completions with timing
        const completionStart = performance.now();
        
        // Quick completions
        const quick = await this.getQuickCompletions(context);
        
        // Snippet completions
        let snippets = [];
        try {
            snippets = await getSnippetCompletions(context);
        } catch (e) {
            // Fallback if snippet loading fails
            snippets = [
                { label: '🎭 scene', insertText: 'scene ${1:scene_id} {\n    text: "${2:Scene text}"\n    choice "${3:Choice text}" -> ${4:target_scene}\n}', kind: 'snippet', detail: '🎭 Scene block' },
                { label: '🔧 set', insertText: 'set ${1:variable} = ${2:value}', kind: 'snippet', detail: '🔧 Variable assignment' },
                { label: '🎯 choice', insertText: 'choice "${1:Choice text}" -> ${2:target_scene}', kind: 'snippet', detail: '🎯 Player choice' },
                { label: '🔀 if', insertText: 'if ${1:condition} {\n    text: "${2:Conditional text}"\n    choice "${3:Choice text}" -> ${4:target_scene}\n}', kind: 'snippet', detail: '🔀 If block' }
            ];
        }
        
        // Deduplicate and merge
        const allCompletions = this.deduplicate([...quick, ...snippets]);
        
        // Format for Monaco
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: wordInfo.startColumn,
            endColumn: wordInfo.endColumn
        };
        
        const result = {
            suggestions: allCompletions.map(item => ({
                label: item.label,
                kind: (item.kind === 'snippet' ? monaco.languages.CompletionItemKind.Snippet : 
                       item.kind === 'keyword' ? monaco.languages.CompletionItemKind.Keyword :
                       item.kind === 'operator' ? monaco.languages.CompletionItemKind.Operator :
                       item.kind === 'constant' ? monaco.languages.CompletionItemKind.Constant :
                       monaco.languages.CompletionItemKind.Text),
                insertText: item.insertText,
                insertTextRules: item.kind === 'snippet' ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
                detail: item.detail,
                documentation: item.documentation,
                range: range
            }))
        };
        
        this.performanceMetrics.completionTime = performance.now() - completionStart;
        
        // Cache the result
        this.completionCache.set(cacheKey, result);
        
        // Clean up old cache entries (keep last 100)
        if (this.completionCache.size > 100) {
            const entries = Array.from(this.completionCache.entries());
            this.completionCache.clear();
            entries.slice(-50).forEach(([key, value]) => {
                this.completionCache.set(key, value);
            });
        }
        
        const totalTime = performance.now() - startTime;
        
        // Log performance metrics occasionally
        if (Math.random() < 0.01) { // 1% of the time
            console.log(`🎯 Autocomplete Performance: Parse: ${this.performanceMetrics.parseTime.toFixed(2)}ms, Completion: ${this.performanceMetrics.completionTime.toFixed(2)}ms, Total: ${totalTime.toFixed(2)}ms, Cache Hit Rate: ${(this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100).toFixed(1)}%`);
        }
        
        return result;
        } catch (error) {
            console.error('Autocomplete error:', error);
            // Return basic fallback completions
            return {
                suggestions: [
                    {
                        label: '🎭 scene',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'scene ${1:scene_id} {\n    text: "${2:Scene text}"\n    choice "${3:Choice text}" -> ${4:target_scene}\n}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: '🎭 Scene block',
                        documentation: 'Create a new scene'
                    },
                    {
                        label: '🔧 set',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'set ${1:variable} = ${2:value}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: '🔧 Variable assignment',
                        documentation: 'Set a variable value'
                    }
                ]
            };
        }
    }

    // Register this autocomplete provider with Monaco editor
    registerWithMonaco() {
        // Prevent double registration
        if (CoslangAutocomplete.isRegistered) {
            console.log('🔄 CoslangAutocomplete already registered, skipping duplicate registration');
            return;
        }
        
        if (typeof monaco !== 'undefined') {
            try {
                monaco.languages.registerCompletionItemProvider('coslang', {
                    provideCompletionItems: (model, position) => {
                        try {
                            return this.getCompletionItems(model, position);
                        } catch (error) {
                            console.error('Error in completion provider:', error);
                            return { suggestions: [] };
                        }
                    }
                });
                CoslangAutocomplete.isRegistered = true;
                console.log('✅ CoslangAutocomplete registered with Monaco editor');
            } catch (error) {
                console.error('Failed to register with Monaco:', error);
            }
        } else {
            console.warn('Monaco editor not available for autocomplete registration');
        }
    }
    
    // Clear all caches (useful for debugging or memory management)
    clearCache() {
        this.contextCache.clear();
        this.completionCache.clear();
        console.log('🧹 Autocomplete cache cleared');
    }
    
    // Get performance metrics
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
}

// Attach to window for backward compatibility with existing IDE code
if (typeof window !== 'undefined') {
    window.CoslangAutocomplete = CoslangAutocomplete;
    console.log('✅ CoslangAutocomplete attached to window for IDE compatibility');
} 