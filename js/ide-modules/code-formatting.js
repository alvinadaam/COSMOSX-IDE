// Code Formatting Module for CosmosX IDE
class CodeFormatter {
    constructor(ide) {
        this.ide = ide;
        this.formattingRules = {
            indentSize: 4,
            maxLineLength: 120,
            preserveEmptyLines: true,
            alignAssignments: true,
            alignChoices: true,
            addSpacing: true
        };
        this.init();
    }
    
    init() {
        this.setupFormattingCommands();
        this.setupFormattingOptions();
    }
    
    setupFormattingCommands() {
        if (this.ide.editor) {
            // Add format command
            this.ide.editor.addAction({
                id: 'format-coslang',
                label: 'Format COSLANG Code',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
                run: () => this.formatCode()
            });
            
            // Add format selection command
            this.ide.editor.addAction({
                id: 'format-selection',
                label: 'Format Selection',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL],
                run: () => this.formatSelection()
            });
        }
    }
    
    setupFormattingOptions() {
        // Create formatting options panel
        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'formatting-options-panel';
        optionsPanel.innerHTML = `
            <div class="options-header">
                <h3><i class="fas fa-code"></i> Formatting Options</h3>
                <button class="options-close">&times;</button>
            </div>
            <div class="options-content">
                <div class="option-group">
                    <label>Indent Size:</label>
                    <select id="indent-size">
                        <option value="2">2 spaces</option>
                        <option value="4" selected>4 spaces</option>
                        <option value="8">8 spaces</option>
                    </select>
                </div>
                <div class="option-group">
                    <label>Max Line Length:</label>
                    <input type="number" id="max-line-length" value="120" min="60" max="200">
                </div>
                <div class="option-group">
                    <label>
                        <input type="checkbox" id="preserve-empty-lines" checked>
                        Preserve empty lines
                    </label>
                </div>
                <div class="option-group">
                    <label>
                        <input type="checkbox" id="align-assignments" checked>
                        Align assignments
                    </label>
                </div>
                <div class="option-group">
                    <label>
                        <input type="checkbox" id="align-choices" checked>
                        Align choices
                    </label>
                </div>
                <div class="option-group">
                    <label>
                        <input type="checkbox" id="add-spacing" checked>
                        Add spacing around operators
                    </label>
                </div>
                <div class="option-buttons">
                    <button id="apply-formatting">Apply Formatting</button>
                    <button id="reset-options">Reset to Default</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(optionsPanel);
        this.setupOptionsEvents();
    }
    
    setupOptionsEvents() {
        // Load saved options
        this.loadFormattingOptions();
        
        // Save options on change
        const options = ['indent-size', 'max-line-length', 'preserve-empty-lines', 
                        'align-assignments', 'align-choices', 'add-spacing'];
        
        options.forEach(optionId => {
            const element = document.getElementById(optionId);
            if (element) {
                element.addEventListener('change', () => {
                    this.saveFormattingOptions();
                });
            }
        });
        
        // Apply formatting button
        document.getElementById('apply-formatting').addEventListener('click', () => {
            this.formatCode();
            this.hideOptionsPanel();
        });
        
        // Reset options button
        document.getElementById('reset-options').addEventListener('click', () => {
            this.resetFormattingOptions();
        });
        
        // Close button
        document.querySelector('.options-close').addEventListener('click', () => {
            this.hideOptionsPanel();
        });
    }
    
    loadFormattingOptions() {
        try {
            const saved = localStorage.getItem('cosmosx-formatting-options');
            if (saved) {
                const options = JSON.parse(saved);
                this.formattingRules = { ...this.formattingRules, ...options };
                
                // Update UI
                Object.keys(options).forEach(key => {
                    const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = options[key];
                        } else {
                            element.value = options[key];
                        }
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load formatting options:', error);
        }
    }
    
    saveFormattingOptions() {
        try {
            const options = {
                indentSize: parseInt(document.getElementById('indent-size').value),
                maxLineLength: parseInt(document.getElementById('max-line-length').value),
                preserveEmptyLines: document.getElementById('preserve-empty-lines').checked,
                alignAssignments: document.getElementById('align-assignments').checked,
                alignChoices: document.getElementById('align-choices').checked,
                addSpacing: document.getElementById('add-spacing').checked
            };
            
            this.formattingRules = { ...this.formattingRules, ...options };
            localStorage.setItem('cosmosx-formatting-options', JSON.stringify(options));
        } catch (error) {
            console.warn('Failed to save formatting options:', error);
        }
    }
    
    resetFormattingOptions() {
        this.formattingRules = {
            indentSize: 4,
            maxLineLength: 120,
            preserveEmptyLines: true,
            alignAssignments: true,
            alignChoices: true,
            addSpacing: true
        };
        
        // Update UI
        document.getElementById('indent-size').value = '4';
        document.getElementById('max-line-length').value = '120';
        document.getElementById('preserve-empty-lines').checked = true;
        document.getElementById('align-assignments').checked = true;
        document.getElementById('align-choices').checked = true;
        document.getElementById('add-spacing').checked = true;
        
        this.saveFormattingOptions();
        this.ide.showNotification('Formatting options reset to default', 'success');
    }
    
    formatCode() {
        if (!this.ide.editor) return;
        
        const content = this.ide.editor.getValue();
        const formatted = this.formatCoslangCode(content);
        
        if (formatted !== content) {
            this.ide.editor.setValue(formatted);
            this.ide.showNotification('Code formatted successfully', 'success');
        } else {
            this.ide.showNotification('Code is already properly formatted', 'info');
        }
    }
    
    formatSelection() {
        if (!this.ide.editor) return;
        
        const selection = this.ide.editor.getSelection();
        if (!selection) return;
        
        const model = this.ide.editor.getModel();
        const startLine = selection.startLineNumber;
        const endLine = selection.endLineNumber;
        
        const lines = [];
        for (let i = startLine; i <= endLine; i++) {
            lines.push(model.getLineContent(i));
        }
        
        const selectedContent = lines.join('\n');
        const formatted = this.formatCoslangCode(selectedContent);
        
        if (formatted !== selectedContent) {
            const range = new monaco.Range(startLine, 1, endLine, model.getLineMaxColumn(endLine));
            this.ide.editor.executeEdits('format-selection', [{
                range: range,
                text: formatted
            }]);
            this.ide.showNotification('Selection formatted successfully', 'success');
        }
    }
    
    formatCoslangCode(code) {
        if (!code.trim()) return code;
        
        const lines = code.split('\n');
        const formattedLines = [];
        let currentIndent = 0;
        let inScene = false;
        let inBlock = false;
        let blockType = '';
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // Skip empty lines if preserveEmptyLines is false
            if (!line && !this.formattingRules.preserveEmptyLines) {
                continue;
            }
            
            // Handle scene headers
            if (line.startsWith('#SCENE')) {
                if (inScene && formattedLines.length > 0) {
                    formattedLines.push(''); // Add empty line between scenes
                }
                inScene = true;
                inBlock = false;
                currentIndent = 0;
                line = this.formatSceneHeader(line);
            }
            // Handle block headers
            else if (this.isBlockHeader(line)) {
                inBlock = true;
                blockType = this.getBlockType(line);
                currentIndent = this.formattingRules.indentSize;
                line = this.formatBlockHeader(line);
            }
            // Handle block content
            else if (inBlock && line) {
                line = this.formatBlockContent(line, blockType, currentIndent);
            }
            // Handle regular content
            else if (line) {
                line = this.formatRegularContent(line, currentIndent);
            }
            
            formattedLines.push(line);
        }
        
        return formattedLines.join('\n').trim();
    }
    
    formatSceneHeader(line) {
        // Ensure proper spacing after #SCENE
        return line.replace(/^#SCENE\s*/, '#SCENE ');
    }
    
    isBlockHeader(line) {
        const blockHeaders = ['TEXT:', 'CHOICES:', 'VARS:', 'STATS:', 'IMAGE:', 'MUSIC:', 'DIALOGUE:'];
        return blockHeaders.some(header => line.startsWith(header));
    }
    
    getBlockType(line) {
        if (line.startsWith('TEXT:')) return 'text';
        if (line.startsWith('CHOICES:')) return 'choices';
        if (line.startsWith('VARS:')) return 'vars';
        if (line.startsWith('STATS:')) return 'stats';
        if (line.startsWith('IMAGE:')) return 'image';
        if (line.startsWith('MUSIC:')) return 'music';
        if (line.startsWith('DIALOGUE:')) return 'dialogue';
        return 'unknown';
    }
    
    formatBlockHeader(line) {
        // Ensure proper spacing after block header
        return line.replace(/^(\w+:)\s*/, '$1 ');
    }
    
    formatBlockContent(line, blockType, indent) {
        const indentStr = ' '.repeat(indent);
        
        switch (blockType) {
            case 'text':
                return this.formatTextBlock(line, indentStr);
            case 'choices':
                return this.formatChoicesBlock(line, indentStr);
            case 'vars':
                return this.formatVarsBlock(line, indentStr);
            case 'stats':
                return this.formatStatsBlock(line, indentStr);
            case 'image':
            case 'music':
                return this.formatMediaBlock(line, indentStr);
            case 'dialogue':
                return this.formatDialogueBlock(line, indentStr);
            default:
                return indentStr + line;
        }
    }
    
    formatTextBlock(line, indentStr) {
        // Wrap long text lines
        if (line.length > this.formattingRules.maxLineLength) {
            return this.wrapTextLine(line, indentStr, this.formattingRules.maxLineLength);
        }
        return indentStr + line;
    }
    
    formatChoicesBlock(line, indentStr) {
        // Format choice lines
        if (line.startsWith('-') || line.startsWith('*')) {
            // Ensure proper spacing after choice marker
            line = line.replace(/^([-*])\s*/, '$1 ');
            
            // Align choices if enabled
            if (this.formattingRules.alignChoices) {
                const choiceMatch = line.match(/^[-*]\s*([^:]+):\s*(.*)/);
                if (choiceMatch) {
                    const choiceText = choiceMatch[1].trim();
                    const choiceContent = choiceMatch[2].trim();
                    const padding = Math.max(20 - choiceText.length, 1);
                    line = `- ${choiceText}${' '.repeat(padding)}: ${choiceContent}`;
                }
            }
        }
        return indentStr + line;
    }
    
    formatVarsBlock(line, indentStr) {
        // Format variable assignments
        if (line.includes('=')) {
            if (this.formattingRules.alignAssignments) {
                const parts = line.split('=');
                if (parts.length === 2) {
                    const varName = parts[0].trim();
                    const varValue = parts[1].trim();
                    const padding = Math.max(15 - varName.length, 1);
                    line = `${varName}${' '.repeat(padding)}= ${varValue}`;
                }
            } else if (this.formattingRules.addSpacing) {
                line = line.replace(/\s*=\s*/, ' = ');
            }
        }
        return indentStr + line;
    }
    
    formatStatsBlock(line, indentStr) {
        // Format stat assignments (similar to vars)
        return this.formatVarsBlock(line, indentStr);
    }
    
    formatMediaBlock(line, indentStr) {
        // Format media references
        if (line.startsWith('@')) {
            line = line.replace(/^@\s*/, '@');
        }
        return indentStr + line;
    }
    
    formatDialogueBlock(line, indentStr) {
        // Format dialogue lines
        if (line.includes(':')) {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const speaker = parts[0].trim();
                const dialogue = parts.slice(1).join(':').trim();
                
                if (this.formattingRules.alignAssignments) {
                    const padding = Math.max(15 - speaker.length, 1);
                    line = `${speaker}${' '.repeat(padding)}: ${dialogue}`;
                } else if (this.formattingRules.addSpacing) {
                    line = `${speaker}: ${dialogue}`;
                }
            }
        }
        return indentStr + line;
    }
    
    formatRegularContent(line, indent) {
        const indentStr = ' '.repeat(indent);
        
        // Add spacing around operators if enabled
        if (this.formattingRules.addSpacing) {
            line = line.replace(/([+\-*/=<>!&|])\s*/g, '$1 ');
            line = line.replace(/\s*([+\-*/=<>!&|])/g, ' $1');
        }
        
        return indentStr + line;
    }
    
    wrapTextLine(line, indentStr, maxLength) {
        const words = line.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            if ((currentLine + word).length > maxLength - indentStr.length) {
                if (currentLine) {
                    lines.push(indentStr + currentLine.trim());
                    currentLine = word + ' ';
                } else {
                    lines.push(indentStr + word);
                }
            } else {
                currentLine += word + ' ';
            }
        });
        
        if (currentLine.trim()) {
            lines.push(indentStr + currentLine.trim());
        }
        
        return lines.join('\n');
    }
    
    showOptionsPanel() {
        const panel = document.querySelector('.formatting-options-panel');
        if (panel) {
            panel.classList.add('active');
        }
    }
    
    hideOptionsPanel() {
        const panel = document.querySelector('.formatting-options-panel');
        if (panel) {
            panel.classList.remove('active');
        }
    }
    
    // Utility methods for external use
    getFormattingRules() {
        return { ...this.formattingRules };
    }
    
    setFormattingRules(rules) {
        this.formattingRules = { ...this.formattingRules, ...rules };
        this.saveFormattingOptions();
    }
    
    // Format specific sections
    formatScene(sceneName) {
        if (!this.ide.editor) return;
        
        const content = this.ide.editor.getValue();
        const sceneRegex = new RegExp(`#SCENE\\s+${sceneName}[\\s\\S]*?(?=#SCENE|$)`, 'g');
        const match = sceneRegex.exec(content);
        
        if (match) {
            const originalScene = match[0];
            const formattedScene = this.formatCoslangCode(originalScene);
            
            if (formattedScene !== originalScene) {
                const range = this.findSceneRange(sceneName);
                if (range) {
                    this.ide.editor.executeEdits('format-scene', [{
                        range: range,
                        text: formattedScene
                    }]);
                    this.ide.showNotification(`Scene "${sceneName}" formatted`, 'success');
                }
            }
        }
    }
    
    findSceneRange(sceneName) {
        if (!this.ide.editor) return null;
        
        const content = this.ide.editor.getValue();
        const lines = content.split('\n');
        
        let startLine = -1;
        let endLine = -1;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#SCENE')) {
                if (startLine !== -1) {
                    endLine = i - 1;
                    break;
                }
                if (line.includes(sceneName)) {
                    startLine = i + 1;
                }
            }
        }
        
        if (startLine !== -1) {
            if (endLine === -1) endLine = lines.length;
            return new monaco.Range(startLine, 1, endLine, lines[endLine - 1].length + 1);
        }
        
        return null;
    }
}

// Export for use in IDE
if (typeof window !== 'undefined') {
    window.CodeFormatter = CodeFormatter;
} 