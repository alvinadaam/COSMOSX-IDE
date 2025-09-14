// Code Intelligence Module
// Provides advanced code analysis, refactoring, and smart suggestions

export class CodeIntelligence {
    constructor(ide) {
        this.ide = ide;
        this.analysisCache = new Map();
        this.refactoringHistory = [];
        this.smartSuggestions = [];
    }

    // Analyze code for potential improvements
    analyzeCode(content) {
        const analysis = {
            complexity: this.calculateComplexity(content),
            suggestions: this.generateSuggestions(content),
            metrics: this.calculateMetrics(content),
            warnings: this.detectWarnings(content)
        };

        this.analysisCache.set(this.hashContent(content), analysis);
        return analysis;
    }

    // Calculate code complexity
    calculateComplexity(content) {
        const scenes = content.match(/scene\s+\w+\s*\{/g) || [];
        const choices = content.match(/choice\s+/g) || [];
        const conditionals = content.match(/if\s+/g) || [];
        const variables = content.match(/set\s+/g) || [];

        return {
            scenes: scenes.length,
            choices: choices.length,
            conditionals: conditionals.length,
            variables: variables.length,
            complexity: scenes.length + choices.length + conditionals.length
        };
    }

    // Generate smart suggestions
    generateSuggestions(content) {
        const suggestions = [];

        // Check for missing metadata
        if (!content.includes('title:')) {
            suggestions.push({
                type: 'metadata',
                message: 'Add story title for better organization',
                code: 'title: "Your Story Title"',
                priority: 'high'
            });
        }

        // Check for unused variables
        const variables = this.extractVariables(content);
        const usedVars = this.extractUsedVariables(content);
        const unused = variables.filter(v => !usedVars.includes(v));
        
        unused.forEach(variable => {
            suggestions.push({
                type: 'unused_variable',
                message: `Variable '${variable}' is defined but never used`,
                code: `# Consider removing or using: set ${variable}`,
                priority: 'medium'
            });
        });

        // Check for missing scene references
        const sceneRefs = this.extractSceneReferences(content);
        const definedScenes = this.extractDefinedScenes(content);
        const missing = sceneRefs.filter(ref => !definedScenes.includes(ref));
        
        missing.forEach(scene => {
            suggestions.push({
                type: 'missing_scene',
                message: `Scene '${scene}' is referenced but not defined`,
                code: `scene ${scene} {\n\ttext: "Scene content"\n\tchoice "Continue" -> next_scene\n}`,
                priority: 'high'
            });
        });

        return suggestions;
    }

    // Calculate code metrics
    calculateMetrics(content) {
        const lines = content.split('\n');
        const nonEmptyLines = lines.filter(line => line.trim().length > 0);
        const comments = lines.filter(line => line.trim().startsWith('#'));
        
        return {
            totalLines: lines.length,
            codeLines: nonEmptyLines.length - comments.length,
            commentLines: comments.length,
            commentRatio: comments.length / nonEmptyLines.length,
            averageLineLength: nonEmptyLines.reduce((sum, line) => sum + line.length, 0) / nonEmptyLines.length
        };
    }

    // Detect potential warnings
    detectWarnings(content) {
        const warnings = [];

        // Check for long scenes
        const scenes = content.split(/scene\s+\w+\s*\{/);
        scenes.forEach((scene, index) => {
            if (scene.length > 1000) {
                warnings.push({
                    type: 'long_scene',
                    message: `Scene ${index} is very long (${scene.length} chars). Consider breaking it into smaller scenes.`,
                    severity: 'medium'
                });
            }
        });

        // Check for deeply nested conditionals
        const conditionalDepth = this.calculateConditionalDepth(content);
        if (conditionalDepth > 3) {
            warnings.push({
                type: 'deep_nesting',
                message: `Deep conditional nesting detected (${conditionalDepth} levels). Consider simplifying logic.`,
                severity: 'high'
            });
        }

        return warnings;
    }

    // Extract variables from content
    extractVariables(content) {
        const variables = [];
        const setMatches = content.match(/set\s+(\w+)\s*=/g) || [];
        setMatches.forEach(match => {
            const varName = match.match(/set\s+(\w+)\s*=/)[1];
            variables.push(varName);
        });
        return variables;
    }

    // Extract used variables from content
    extractUsedVariables(content) {
        const usedVars = [];
        const varMatches = content.match(/\{(\w+)\}/g) || [];
        varMatches.forEach(match => {
            const varName = match.match(/\{(\w+)\}/)[1];
            usedVars.push(varName);
        });
        return [...new Set(usedVars)];
    }

    // Extract scene references
    extractSceneReferences(content) {
        const refs = [];
        const choiceMatches = content.match(/->\s+(\w+)/g) || [];
        choiceMatches.forEach(match => {
            const sceneName = match.match(/->\s+(\w+)/)[1];
            refs.push(sceneName);
        });
        return [...new Set(refs)];
    }

    // Extract defined scenes
    extractDefinedScenes(content) {
        const scenes = [];
        const sceneMatches = content.match(/scene\s+(\w+)\s*\{/g) || [];
        sceneMatches.forEach(match => {
            const sceneName = match.match(/scene\s+(\w+)\s*\{/)[1];
            scenes.push(sceneName);
        });
        return scenes;
    }

    // Calculate conditional depth
    calculateConditionalDepth(content) {
        let maxDepth = 0;
        let currentDepth = 0;
        const lines = content.split('\n');
        
        lines.forEach(line => {
            if (line.includes('if')) {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
            } else if (line.includes('}') && currentDepth > 0) {
                currentDepth--;
            }
        });
        
        return maxDepth;
    }

    // Hash content for caching
    hashContent(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }

    // Get refactoring suggestions
    getRefactoringSuggestions(content) {
        const suggestions = [];

        // Suggest extracting long text blocks
        const textBlocks = content.match(/text:\s*"([^"]{100,})"/g);
        if (textBlocks && textBlocks.length > 0) {
            suggestions.push({
                type: 'extract_text',
                message: 'Consider breaking long text blocks into smaller paragraphs',
                action: 'extract_text_blocks'
            });
        }

        // Suggest variable consolidation
        const variables = this.extractVariables(content);
        const similarVars = this.findSimilarVariables(variables);
        if (similarVars.length > 0) {
            suggestions.push({
                type: 'consolidate_variables',
                message: 'Consider consolidating similar variables',
                action: 'consolidate_variables',
                data: similarVars
            });
        }

        return suggestions;
    }

    // Find similar variables
    findSimilarVariables(variables) {
        const groups = {};
        variables.forEach(variable => {
            const base = variable.replace(/(_|\.)/g, '').toLowerCase();
            if (!groups[base]) groups[base] = [];
            groups[base].push(variable);
        });
        
        return Object.values(groups).filter(group => group.length > 1);
    }

    // Apply refactoring
    applyRefactoring(content, refactoringType, data) {
        let newContent = content;
        
        switch (refactoringType) {
            case 'extract_text_blocks':
                newContent = this.extractTextBlocks(content);
                break;
            case 'consolidate_variables':
                newContent = this.consolidateVariables(content, data);
                break;
        }
        
        this.refactoringHistory.push({
            type: refactoringType,
            timestamp: new Date(),
            originalContent: content,
            newContent: newContent
        });
        
        return newContent;
    }

    // Extract long text blocks
    extractTextBlocks(content) {
        return content.replace(/text:\s*"([^"]{100,})"/g, (match, text) => {
            const paragraphs = text.split('. ').filter(p => p.trim());
            return `text: "${paragraphs.join('. ')}"`;
        });
    }

    // Consolidate variables
    consolidateVariables(content, similarGroups) {
        let newContent = content;
        
        similarGroups.forEach(group => {
            const primary = group[0];
            const others = group.slice(1);
            
            others.forEach(variable => {
                const regex = new RegExp(`\\b${variable}\\b`, 'g');
                newContent = newContent.replace(regex, primary);
            });
        });
        
        return newContent;
    }

    // Get undo refactoring
    undoLastRefactoring() {
        if (this.refactoringHistory.length > 0) {
            const lastRefactoring = this.refactoringHistory.pop();
            return lastRefactoring.originalContent;
        }
        return null;
    }
}

// Export to global scope
window.CodeIntelligence = CodeIntelligence; 