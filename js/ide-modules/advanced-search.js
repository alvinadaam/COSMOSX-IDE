// Advanced Search & Replace Module
// Provides powerful search capabilities with regex, multi-file, and smart replacements

export class AdvancedSearch {
    constructor(ide) {
        this.ide = ide;
        this.searchHistory = [];
        this.replaceHistory = [];
        this.currentSearch = null;
        this.searchResults = [];
        this.isSearching = false;
    }

    // Initialize search panel
    initializeSearchPanel() {
        this.createSearchPanel();
        this.setupSearchEvents();
        this.setupKeyboardShortcuts();
    }

    // Create search panel
    createSearchPanel() {
        const searchPanel = document.createElement('div');
        searchPanel.id = 'advanced-search-panel';
        searchPanel.className = 'search-panel';
        searchPanel.innerHTML = `
            <div class="search-header">
                <h3><i class="fas fa-search"></i> Advanced Search</h3>
                <button class="close-btn" id="close-search">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="search-controls">
                <div class="search-input-group">
                    <input type="text" id="search-input" placeholder="Search for text or regex pattern...">
                    <div class="search-options">
                        <label>
                            <input type="checkbox" id="regex-search"> Regex
                        </label>
                        <label>
                            <input type="checkbox" id="case-sensitive"> Case Sensitive
                        </label>
                        <label>
                            <input type="checkbox" id="whole-word"> Whole Word
                        </label>
                    </div>
                </div>
                
                <div class="replace-input-group">
                    <input type="text" id="replace-input" placeholder="Replace with...">
                    <button id="replace-btn" class="btn">Replace</button>
                    <button id="replace-all-btn" class="btn primary">Replace All</button>
                </div>
            </div>
            
            <div class="search-results">
                <div class="results-header">
                    <span id="results-count">0 results</span>
                    <div class="results-actions">
                        <button id="prev-result" class="btn small">
                            <i class="fas fa-chevron-up"></i>
                        </button>
                        <button id="next-result" class="btn small">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                </div>
                <div id="results-list" class="results-list"></div>
            </div>
            
            <div class="search-actions">
                <button id="find-btn" class="btn primary">Find</button>
                <button id="find-all-btn" class="btn">Find All</button>
                <button id="clear-search" class="btn">Clear</button>
            </div>
        `;

        document.body.appendChild(searchPanel);
    }

    // Setup search events
    setupSearchEvents() {
        const searchInput = document.getElementById('search-input');
        const replaceInput = document.getElementById('replace-input');
        const findBtn = document.getElementById('find-btn');
        const findAllBtn = document.getElementById('find-all-btn');
        const replaceBtn = document.getElementById('replace-btn');
        const replaceAllBtn = document.getElementById('replace-all-btn');
        const closeBtn = document.getElementById('close-search');
        const prevBtn = document.getElementById('prev-result');
        const nextBtn = document.getElementById('next-result');
        const clearBtn = document.getElementById('clear-search');

        // Search input events
        searchInput.addEventListener('input', () => {
            this.debounceSearch();
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch();
            }
        });

        // Button events
        findBtn.addEventListener('click', () => this.performSearch());
        findAllBtn.addEventListener('click', () => this.findAll());
        replaceBtn.addEventListener('click', () => this.replaceCurrent());
        replaceAllBtn.addEventListener('click', () => this.replaceAll());
        closeBtn.addEventListener('click', () => this.hideSearchPanel());
        prevBtn.addEventListener('click', () => this.navigateResults(-1));
        nextBtn.addEventListener('click', () => this.navigateResults(1));
        clearBtn.addEventListener('click', () => this.clearSearch());

        // Option changes
        document.getElementById('regex-search').addEventListener('change', () => {
            this.debounceSearch();
        });

        document.getElementById('case-sensitive').addEventListener('change', () => {
            this.debounceSearch();
        });

        document.getElementById('whole-word').addEventListener('change', () => {
            this.debounceSearch();
        });
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+F to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.showSearchPanel();
            }

            // Escape to close search
            if (e.key === 'Escape') {
                this.hideSearchPanel();
            }

            // F3 for next result
            if (e.key === 'F3') {
                e.preventDefault();
                this.navigateResults(1);
            }

            // Shift+F3 for previous result
            if (e.shiftKey && e.key === 'F3') {
                e.preventDefault();
                this.navigateResults(-1);
            }
        });
    }

    // Show search panel
    showSearchPanel() {
        const panel = document.getElementById('advanced-search-panel');
        panel.style.display = 'block';
        document.getElementById('search-input').focus();
        
        // Auto-search if there's selected text
        const editor = this.ide.editorManager.editor;
        const selection = editor.getSelection();
        if (!selection.isEmpty()) {
            const selectedText = editor.getModel().getValueInRange(selection);
            document.getElementById('search-input').value = selectedText;
            this.performSearch();
        }
    }

    // Hide search panel
    hideSearchPanel() {
        const panel = document.getElementById('advanced-search-panel');
        panel.style.display = 'none';
        this.clearSearch();
    }

    // Debounced search
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch();
        }, 300);
    }

    // Perform search
    performSearch() {
        const searchTerm = document.getElementById('search-input').value;
        if (!searchTerm.trim()) {
            this.clearSearch();
            return;
        }

        const options = this.getSearchOptions();
        this.currentSearch = { term: searchTerm, options };
        
        const editor = this.ide.editorManager.editor;
        const model = editor.getModel();
        const content = model.getValue();
        
        this.searchResults = this.findMatches(content, searchTerm, options);
        this.displayResults();
        this.highlightResults();
        
        this.addToSearchHistory(searchTerm);
    }

    // Find all matches
    findAll() {
        this.performSearch();
        if (this.searchResults.length > 0) {
            this.navigateResults(1);
        }
    }

    // Get search options
    getSearchOptions() {
        return {
            regex: document.getElementById('regex-search').checked,
            caseSensitive: document.getElementById('case-sensitive').checked,
            wholeWord: document.getElementById('whole-word').checked
        };
    }

    // Find matches in content
    findMatches(content, searchTerm, options) {
        const matches = [];
        const lines = content.split('\n');
        
        let regex;
        if (options.regex) {
            try {
                const flags = options.caseSensitive ? 'g' : 'gi';
                regex = new RegExp(searchTerm, flags);
            } catch (e) {
                console.error('Invalid regex pattern:', e);
                return [];
            }
        } else {
            let pattern = searchTerm;
            if (options.wholeWord) {
                pattern = `\\b${pattern}\\b`;
            }
            const flags = options.caseSensitive ? 'g' : 'gi';
            regex = new RegExp(pattern, flags);
        }

        lines.forEach((line, lineIndex) => {
            let match;
            while ((match = regex.exec(line)) !== null) {
                matches.push({
                    line: lineIndex + 1,
                    column: match.index + 1,
                    endColumn: match.index + match[0].length + 1,
                    text: match[0],
                    fullLine: line
                });
            }
        });

        return matches;
    }

    // Display search results
    displayResults() {
        const resultsList = document.getElementById('results-list');
        const resultsCount = document.getElementById('results-count');
        
        resultsCount.textContent = `${this.searchResults.length} result${this.searchResults.length !== 1 ? 's' : ''}`;
        
        if (this.searchResults.length === 0) {
            resultsList.innerHTML = '<div class="no-results">No matches found</div>';
            return;
        }

        const resultsHtml = this.searchResults.map((result, index) => `
            <div class="result-item" data-index="${index}">
                <div class="result-line">Line ${result.line}:${result.column}</div>
                <div class="result-text">${this.highlightMatch(result.fullLine, result.text)}</div>
            </div>
        `).join('');

        resultsList.innerHTML = resultsHtml;

        // Add click handlers
        resultsList.querySelectorAll('.result-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.goToResult(index);
            });
        });
    }

    // Highlight match in text
    highlightMatch(line, match) {
        const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedMatch})`, 'gi');
        return line.replace(regex, '<mark>$1</mark>');
    }

    // Highlight results in editor
    highlightResults() {
        const editor = this.ide.editorManager.editor;
        const decorations = this.searchResults.map(result => ({
            range: {
                startLineNumber: result.line,
                startColumn: result.column,
                endLineNumber: result.line,
                endColumn: result.endColumn
            },
            options: {
                inlineClassName: 'search-highlight'
            }
        }));

        this.currentDecorations = editor.deltaDecorations(
            this.currentDecorations || [],
            decorations
        );
    }

    // Navigate through results
    navigateResults(direction) {
        if (this.searchResults.length === 0) return;

        if (!this.currentResultIndex) {
            this.currentResultIndex = 0;
        } else {
            this.currentResultIndex += direction;
        }

        if (this.currentResultIndex >= this.searchResults.length) {
            this.currentResultIndex = 0;
        } else if (this.currentResultIndex < 0) {
            this.currentResultIndex = this.searchResults.length - 1;
        }

        this.goToResult(this.currentResultIndex);
    }

    // Go to specific result
    goToResult(index) {
        if (index < 0 || index >= this.searchResults.length) return;

        const result = this.searchResults[index];
        const editor = this.ide.editorManager.editor;

        // Set cursor position
        editor.setPosition({
            lineNumber: result.line,
            column: result.column
        });

        // Set selection
        editor.setSelection({
            startLineNumber: result.line,
            startColumn: result.column,
            endLineNumber: result.line,
            endColumn: result.endColumn
        });

        // Reveal the line
        editor.revealLineInCenter(result.line);

        // Update current result index
        this.currentResultIndex = index;

        // Highlight current result
        this.highlightCurrentResult();
    }

    // Highlight current result
    highlightCurrentResult() {
        const editor = this.ide.editorManager.editor;
        
        // Remove previous current result decoration
        if (this.currentResultDecoration) {
            editor.deltaDecorations([this.currentResultDecoration], []);
        }

        if (this.currentResultIndex !== undefined && this.searchResults[this.currentResultIndex]) {
            const result = this.searchResults[this.currentResultIndex];
            this.currentResultDecoration = editor.deltaDecorations([], [{
                range: {
                    startLineNumber: result.line,
                    startColumn: result.column,
                    endLineNumber: result.line,
                    endColumn: result.endColumn
                },
                options: {
                    inlineClassName: 'search-highlight-current'
                }
            }])[0];
        }
    }

    // Replace current match
    replaceCurrent() {
        if (this.currentResultIndex === undefined || this.searchResults.length === 0) return;

        const replaceText = document.getElementById('replace-input').value;
        const result = this.searchResults[this.currentResultIndex];
        const editor = this.ide.editorManager.editor;

        editor.executeEdits('search-replace', [{
            range: {
                startLineNumber: result.line,
                startColumn: result.column,
                endLineNumber: result.line,
                endColumn: result.endColumn
            },
            text: replaceText
        }]);

        this.addToReplaceHistory(result.text, replaceText);
        this.performSearch(); // Refresh search results
    }

    // Replace all matches
    replaceAll() {
        if (this.searchResults.length === 0) return;

        const replaceText = document.getElementById('replace-input').value;
        const editor = this.ide.editorManager.editor;
        const edits = [];

        // Sort results in reverse order to maintain positions
        const sortedResults = [...this.searchResults].sort((a, b) => {
            if (a.line !== b.line) return b.line - a.line;
            return b.column - a.column;
        });

        sortedResults.forEach(result => {
            edits.push({
                range: {
                    startLineNumber: result.line,
                    startColumn: result.column,
                    endLineNumber: result.line,
                    endColumn: result.endColumn
                },
                text: replaceText
            });
        });

        editor.executeEdits('search-replace-all', edits);
        this.addToReplaceHistory('multiple', replaceText);
        this.clearSearch();
    }

    // Clear search
    clearSearch() {
        this.searchResults = [];
        this.currentResultIndex = undefined;
        this.currentSearch = null;

        // Clear decorations
        const editor = this.ide.editorManager.editor;
        if (this.currentDecorations) {
            editor.deltaDecorations(this.currentDecorations, []);
            this.currentDecorations = null;
        }
        if (this.currentResultDecoration) {
            editor.deltaDecorations([this.currentResultDecoration], []);
            this.currentResultDecoration = null;
        }

        // Clear display
        document.getElementById('results-list').innerHTML = '';
        document.getElementById('results-count').textContent = '0 results';
    }

    // Add to search history
    addToSearchHistory(term) {
        if (!this.searchHistory.includes(term)) {
            this.searchHistory.unshift(term);
            this.searchHistory = this.searchHistory.slice(0, 10); // Keep last 10
        }
    }

    // Add to replace history
    addToReplaceHistory(from, to) {
        this.replaceHistory.unshift({ from, to, timestamp: new Date() });
        this.replaceHistory = this.replaceHistory.slice(0, 10); // Keep last 10
    }

    // Get search history
    getSearchHistory() {
        return this.searchHistory;
    }

    // Get replace history
    getReplaceHistory() {
        return this.replaceHistory;
    }
}

// Export to global scope
window.AdvancedSearch = AdvancedSearch; 