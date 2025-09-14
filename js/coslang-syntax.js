// Beautiful COSLANG Syntax Highlighting
// Modern, vibrant colors with perfect sync to current engine syntax

export function setupCoslangSyntax() {
    if (typeof monaco === 'undefined') {
        console.warn('Monaco not available for syntax highlighting');
        return;
    }

    // Register COSLANG language
    monaco.languages.register({ id: 'coslang' });

    // Beautiful syntax highlighting with modern colors
    monaco.languages.setMonarchTokensProvider('coslang', {
        defaultToken: '',
        tokenizer: {
            root: [
                // Comments - Soft purple (COSLANG uses # for comments)
                [/^#.*$/, 'comment'],
                [/#.*$/, 'comment'],
                
                // Story metadata - Bright cyan
                [/^(title|author|version):/, 'keyword.metadata'],
                
                // Scene blocks - Vibrant orange
                [/^scene\s+\w+\s*\{/, 'keyword.scene'],
                
                // Assets block - Electric green (NEW)
                [/^assets\s*\{/, 'keyword.assets'],
                
                // Asset types - Bright colors (NEW)
                [/^(image|audio|video|font|document|animation)\s+/, 'keyword.asset-type'],
                
                // Asset properties - Soft blue (NEW)
                [/^(path|name|type|format|size|duration|width|height|volume|loop|autoplay):/, 'keyword.asset-property'],
                
                // Block keywords - Electric blue
                [/^(vars|stats|inventory)\s*\{/, 'keyword.block'],
                
                // Content keywords - Golden yellow
                [/^text:/, 'keyword.content'],
                [/^choice\s+/, 'keyword.content'],
                [/^set\s+/, 'keyword.content'],
                
                // Control flow - Magenta
                [/^if\s+/, 'keyword.control'],
                [/^}?\s*else\s*\{/, 'keyword.control'],
                [/^macro\s+/, 'keyword.control'],
                
                // Tags - Bright green
                [/\[(LOG|EVENT|ACHIEVEMENT):[^\]]*\]/, 'string.tag'],
                
                // Variable interpolation - Soft blue
                [/\{[^}]+\}/, 'string.interpolation'],
                
                // Scene references - Bright purple
                [/->\s*\w+/, 'string.reference'],
                
                // Asset references - Bright cyan (NEW)
                [/\$[a-zA-Z_]\w*/, 'string.asset-reference'],
                
                // Operators - Electric blue
                [/(==|!=|>|<|>=|<=|\+|-|\*|\/)/, 'operator'],
                [/\b(and|or)\b/, 'operator'],
                
                // Numbers - Mint green
                [/\b\d+\b/, 'number'],
                
                // Strings - Warm yellow
                [/"[^"]*"/, 'string'],
                
                // Constants - Bright orange
                [/\b(true|false)\b/, 'constant'],
                
                // Delimiters - Soft gray
                [/[{}()\[\]]/, 'delimiter'],
                [/[;,]/, 'delimiter'],
                
                // Identifiers - Light blue
                [/\b[a-zA-Z_]\w*\b/, 'identifier'],
                
                // Whitespace
                [/[ \t\r\n]+/, 'white']
            ]
        }
    });

    // Gorgeous modern theme with vibrant colors
    monaco.editor.defineTheme('coslang-beautiful', {
        base: 'vs-dark',
        inherit: false,
        rules: [
            // Comments - Soft purple (COSLANG uses # for comments)
            { token: 'comment', foreground: 'dda0dd', fontStyle: 'italic' },
            
            // Metadata - Bright cyan
            { token: 'keyword.metadata', foreground: '00ffff', fontStyle: 'bold' },
            
            // Scene blocks - Vibrant orange
            { token: 'keyword.scene', foreground: 'ff8c00', fontStyle: 'bold' },
            
            // Assets block - Electric green (NEW)
            { token: 'keyword.assets', foreground: '00ff7f', fontStyle: 'bold' },
            
            // Asset types - Bright colors (NEW)
            { token: 'keyword.asset-type', foreground: 'ff69b4', fontStyle: 'bold' },
            
            // Asset properties - Soft blue (NEW)
            { token: 'keyword.asset-property', foreground: '87cefa', fontStyle: 'bold' },
            
            // Block keywords - Electric blue
            { token: 'keyword.block', foreground: '00bfff', fontStyle: 'bold' },
            
            // Content keywords - Golden yellow
            { token: 'keyword.content', foreground: 'ffd700', fontStyle: 'bold' },
            
            // Control flow - Magenta
            { token: 'keyword.control', foreground: 'ff00ff', fontStyle: 'bold' },
            
            // Tags - Bright green
            { token: 'string.tag', foreground: '00ff00', fontStyle: 'bold' },
            
            // Variable interpolation - Soft blue
            { token: 'string.interpolation', foreground: '87ceeb' },
            
            // Scene references - Bright purple
            { token: 'string.reference', foreground: 'da70d6', fontStyle: 'bold' },
            
            // Asset references - Bright cyan (NEW)
            { token: 'string.asset-reference', foreground: '00ffff', fontStyle: 'bold' },
            
            // Operators - Electric blue
            { token: 'operator', foreground: '00bfff', fontStyle: 'bold' },
            
            // Numbers - Mint green
            { token: 'number', foreground: '98fb98' },
            
            // Strings - Warm yellow
            { token: 'string', foreground: 'f0e68c' },
            
            // Constants - Bright orange
            { token: 'constant', foreground: 'ffa500', fontStyle: 'bold' },
            
            // Delimiters - Soft gray
            { token: 'delimiter', foreground: 'd3d3d3' },
            
            // Identifiers - Light blue
            { token: 'identifier', foreground: '87ceeb' },
            
            // Whitespace
            { token: 'white', foreground: 'd4d4d4' }
        ],
        colors: {
            'editor.background': '#10131a',
            'editor.foreground': '#e6eaf3',
            'editor.lineHighlightBackground': '#181c22',
            'editor.selectionBackground': '#1f6feb40',
            'editor.inactiveSelectionBackground': '#388bfd20',
            'editor.findMatchBackground': '#ffd700',
            'editor.findMatchHighlightBackground': '#ffd70040',
            'editorCursor.foreground': '#e6eaf3',
            'editorWhitespace.foreground': '#232a36',
            'editorIndentGuide.background': '#232a36',
            'editorIndentGuide.activeBackground': '#388bfd',
            'editorLineNumber.foreground': '#8b949e',
            'editorLineNumber.activeForeground': '#e6eaf3',
            'editorRuler.foreground': '#232a36',
            'editorCodeLens.foreground': '#8b949e',
            'editorBracketMatch.background': '#1f6feb20',
            'editorBracketMatch.border': '#388bfd',
            'editorOverviewRuler.border': '#232a36',
            'editorError.foreground': '#ff4e4e',
            'editorWarning.foreground': '#ffd24e',
            'editorInfo.foreground': '#58a6ff',
            'editorGutter.background': '#10131a',
            'editorGutter.modifiedBackground': '#1f6feb20',
            'editorGutter.addedBackground': '#7ee78720',
            'editorGutter.deletedBackground': '#ff4e4e20',
            'diffEditor.insertedTextBackground': '#7ee78720',
            'diffEditor.removedTextBackground': '#ff4e4e20',
            'diffEditor.diagonalFill': '#1f6feb20',
            'editorWidget.background': '#181c22',
            'editorWidget.foreground': '#e6eaf3',
            'editorWidget.border': '#232a36',
            'editorSuggestWidget.background': '#181c22',
            'editorSuggestWidget.border': '#232a36',
            'editorSuggestWidget.selectedBackground': '#1f6feb40',
            'editorSuggestWidget.highlightForeground': '#58a6ff',
            'editorHoverWidget.background': '#181c22',
            'editorHoverWidget.border': '#232a36'
        }
    });

    console.log('🎨 Beautiful COSLANG syntax highlighting loaded with enhanced asset support!');
} 