// Modern CosLang Quick Completion Provider
// Exports an async, context-aware, deduplicated quick completion function

export async function getQuickCompletions(context) {
    const completions = [];
    const line = (context.currentLine || '').trim().toLowerCase();
    const position = context.cursorPosition || {};
    
    // 🎯 INTELLIGENT CONTEXT-AWARE COMPLETIONS
    
    // 1. METADATA SUGGESTIONS (at file start)
    if (context.isAtFileStart && line === '') {
        completions.push(
            { 
                label: 'title:', 
                insertText: 'title: "${1:Story Title}"', 
                kind: 'snippet', 
                detail: '📖 Story title',
                documentation: 'Define the title of your story'
            },
            { 
                label: 'author:', 
                insertText: 'author: "${1:Author Name}"', 
                kind: 'snippet', 
                detail: '✍️ Story author',
                documentation: 'Define the author of your story'
            },
            { 
                label: 'version:', 
                insertText: 'version: "${1:1.0.0}"', 
                kind: 'snippet', 
                detail: '📋 Story version',
                documentation: 'Define the version of your story'
            }
        );
    }
    
    // 2. SCENE SUGGESTIONS (after -> or in scene context)
    if ((context.isAfterArrow || /->\s*$/.test(line)) && context.scenes) {
        context.scenes.forEach(scene => {
            completions.push({ 
                label: scene, 
                insertText: scene, 
                kind: 'text', 
                detail: '🎭 Jump to scene',
                documentation: `Navigate to the "${scene}" scene`
            });
        });
    }
    
    // 3. VARIABLE INTERPOLATION (inside {})
    if (context.isInVariableInterpolation || /\{\s*$/.test(line)) {
        context.variables.forEach(variable => {
            completions.push({ 
                label: `{${variable}}`, 
                insertText: `{${variable}}`, 
                kind: 'text', 
                detail: '🔗 Variable interpolation',
                documentation: `Insert the value of variable "${variable}"`
            });
        });
    }
    
    // 4. MACRO CALLS (inside [])
    if (context.isInMacroCall || /\[\s*$/.test(line)) {
        context.macros.forEach(macro => {
            completions.push({ 
                label: `[${macro.name}(...)]`, 
                insertText: `[${macro.name}(${macro.args.join(', ')})]`, 
                kind: 'snippet', 
                detail: '⚡ Call macro',
                documentation: `Call the "${macro.name}" macro with arguments: ${macro.args.join(', ')}`
            });
        });
    }
    // 5. CONTEXT-AWARE KEYWORD SUGGESTIONS
    
    // Scene context suggestions
    if (context.isInScene) {
        [
            { 
                label: 'text:', 
                insertText: 'text: "${1:Scene narrative text}"', 
                kind: 'snippet', 
                detail: '📝 Scene text',
                documentation: 'Add narrative text to the scene'
            },
            { 
                label: 'choice', 
                insertText: 'choice "${1:Choice text}" -> ${2:target_scene}', 
                kind: 'snippet', 
                detail: '🎯 Player choice',
                documentation: 'Add a player choice with navigation'
            },
            { 
                label: 'set', 
                insertText: 'set ${1:variable} = ${2:value}', 
                kind: 'snippet', 
                detail: '🔧 Variable assignment',
                documentation: 'Set a variable value'
            },
            { 
                label: 'if', 
                insertText: 'if ${1:condition} {\n    text: "${2:Conditional text}"\n    choice "${3:Choice text}" -> ${4:target_scene}\n}', 
                kind: 'snippet', 
                detail: '🔀 Conditional block',
                documentation: 'Add conditional logic'
            }
        ].forEach(item => completions.push(item));
    }
    
    // Variable block suggestions
    if (context.isInVarsBlock) {
        [
            { 
                label: 'player_name', 
                insertText: 'player_name = "${1:Player Name}"', 
                kind: 'snippet', 
                detail: '👤 Player name variable',
                documentation: 'Define the player character name'
            },
            { 
                label: 'health', 
                insertText: 'health = ${1:100}', 
                kind: 'snippet', 
                detail: '❤️ Health variable',
                documentation: 'Define player health'
            },
            { 
                label: 'gold', 
                insertText: 'gold = ${1:0}', 
                kind: 'snippet', 
                detail: '💰 Gold variable',
                documentation: 'Define player gold/currency'
            },
            { 
                label: 'score', 
                insertText: 'score = ${1:0}', 
                kind: 'snippet', 
                detail: '🏆 Score variable',
                documentation: 'Define player score'
            }
        ].forEach(item => completions.push(item));
    }
    
    // Stats block suggestions
    if (context.isInStatsBlock) {
        [
            { 
                label: 'strength', 
                insertText: 'strength = ${1:5}', 
                kind: 'snippet', 
                detail: '💪 Strength stat',
                documentation: 'Define strength attribute'
            },
            { 
                label: 'agility', 
                insertText: 'agility = ${1:3}', 
                kind: 'snippet', 
                detail: '🏃 Agility stat',
                documentation: 'Define agility attribute'
            },
            { 
                label: 'intelligence', 
                insertText: 'intelligence = ${1:2}', 
                kind: 'snippet', 
                detail: '🧠 Intelligence stat',
                documentation: 'Define intelligence attribute'
            },
            { 
                label: 'charisma', 
                insertText: 'charisma = ${1:4}', 
                kind: 'snippet', 
                detail: '🎭 Charisma stat',
                documentation: 'Define charisma attribute'
            }
        ].forEach(item => completions.push(item));
    }
    
    // Inventory block suggestions
    if (context.isInInventoryBlock) {
        [
            { 
                label: 'sword', 
                insertText: 'sword = ${1:1}', 
                kind: 'snippet', 
                detail: '⚔️ Sword item',
                documentation: 'Add sword to inventory'
            },
            { 
                label: 'potion', 
                insertText: 'potion = ${1:2}', 
                kind: 'snippet', 
                detail: '🧪 Health potion',
                documentation: 'Add health potions to inventory'
            },
            { 
                label: 'key', 
                insertText: 'key = ${1:0}', 
                kind: 'snippet', 
                detail: '🗝️ Key item',
                documentation: 'Add key to inventory'
            },
            { 
                label: 'map', 
                insertText: 'map = ${1:1}', 
                kind: 'snippet', 
                detail: '🗺️ Map item',
                documentation: 'Add map to inventory'
            }
        ].forEach(item => completions.push(item));
    }
    
    // General block suggestions (when not in specific context)
    if (!context.isInScene && !context.isInVarsBlock && !context.isInStatsBlock && !context.isInInventoryBlock) {
        [
            { 
                label: 'scene', 
                insertText: 'scene ${1:scene_id} {\n    text: "${2:Scene text}"\n    choice "${3:Choice text}" -> ${4:target_scene}\n}', 
                kind: 'snippet', 
                detail: '🎭 Scene block',
                documentation: 'Create a new scene'
            },
            { 
                label: 'vars', 
                insertText: 'vars {\n    ${1:variable} = ${2:value}\n}', 
                kind: 'snippet', 
                detail: '🔧 Variables block',
                documentation: 'Define global variables'
            },
            { 
                label: 'stats', 
                insertText: 'stats {\n    ${1:stat_name} = ${2:value}\n}', 
                kind: 'snippet', 
                detail: '📊 Stats block',
                documentation: 'Define character stats'
            },
            { 
                label: 'inventory', 
                insertText: 'inventory {\n    ${1:item_name} = ${2:quantity}\n}', 
                kind: 'snippet', 
                detail: '🎒 Inventory block',
                documentation: 'Define inventory items'
            },
            { 
                label: 'macro', 
                insertText: 'macro ${1:macro_name}(${2:arg1, arg2}) {\n    ${3:macro body}\n}', 
                kind: 'snippet', 
                detail: '⚡ Define macro',
                documentation: 'Create a reusable macro'
            }
        ].forEach(item => completions.push(item));
    }
    // 6. OPERATORS AND CONSTANTS (always available)
    [
        { 
            label: '==', 
            insertText: '== ', 
            kind: 'operator', 
            detail: '⚖️ Equal',
            documentation: 'Check if values are equal'
        },
        { 
            label: '!=', 
            insertText: '!= ', 
            kind: 'operator', 
            detail: '❌ Not equal',
            documentation: 'Check if values are not equal'
        },
        { 
            label: '>', 
            insertText: '> ', 
            kind: 'operator', 
            detail: '📈 Greater than',
            documentation: 'Check if value is greater than'
        },
        { 
            label: '<', 
            insertText: '< ', 
            kind: 'operator', 
            detail: '📉 Less than',
            documentation: 'Check if value is less than'
        },
        { 
            label: '>=', 
            insertText: '>= ', 
            kind: 'operator', 
            detail: '📊 Greater or equal',
            documentation: 'Check if value is greater than or equal to'
        },
        { 
            label: '<=', 
            insertText: '<= ', 
            kind: 'operator', 
            detail: '📊 Less or equal',
            documentation: 'Check if value is less than or equal to'
        },
        { 
            label: 'and', 
            insertText: 'and ', 
            kind: 'operator', 
            detail: '🔗 Logical AND',
            documentation: 'Combine conditions with AND'
        },
        { 
            label: 'or', 
            insertText: 'or ', 
            kind: 'operator', 
            detail: '🔗 Logical OR',
            documentation: 'Combine conditions with OR'
        },
        { 
            label: '+', 
            insertText: '+ ', 
            kind: 'operator', 
            detail: '➕ Addition',
            documentation: 'Add values together'
        },
        { 
            label: '-', 
            insertText: '- ', 
            kind: 'operator', 
            detail: '➖ Subtraction',
            documentation: 'Subtract values'
        },
        { 
            label: '*', 
            insertText: '* ', 
            kind: 'operator', 
            detail: '✖️ Multiplication',
            documentation: 'Multiply values'
        },
        { 
            label: '/', 
            insertText: '/ ', 
            kind: 'operator', 
            detail: '➗ Division',
            documentation: 'Divide values'
        },
        { 
            label: 'true', 
            insertText: 'true', 
            kind: 'constant', 
            detail: '✅ Boolean true',
            documentation: 'True boolean value'
        },
        { 
            label: 'false', 
            insertText: 'false', 
            kind: 'constant', 
            detail: '❌ Boolean false',
            documentation: 'False boolean value'
        }
    ].forEach(item => completions.push(item));
    // Deduplicate by label
    const seen = new Set();
    return completions.filter(item => {
        if (seen.has(item.label)) return false;
        seen.add(item.label);
        return true;
    });
} 