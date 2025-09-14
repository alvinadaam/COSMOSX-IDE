/* ===== COSAI MAIN JAVASCRIPT ===== */

// CosAI Application Class
class CosAI {
    constructor() {
        this.isInitialized = false;
        this.currentModel = 'phi1.5';
        this.connectionStatus = 'disconnected';
        this.chatHistory = [];
        this.isTyping = false;
        
        // Initialize components
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing CosAI...');
            
            // Initialize syntax highlighting
            this.initSyntaxHighlighting();
            
            // Initialize UI components
            this.initUI();
            
            // Check Ollama connection
            await this.checkOllamaConnection();
            
            // Initialize chat functionality
            this.initChat();
            
            // Initialize sidebar interactions
            this.initSidebar();
            
            this.isInitialized = true;
            console.log('✅ CosAI initialized successfully');
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Failed to initialize CosAI:', error);
            this.showError('Failed to initialize CosAI. Please check your connection.');
        }
    }

    initSyntaxHighlighting() {
        // Initialize highlight.js for Coslang syntax
        if (typeof hljs !== 'undefined') {
            // Register Coslang language
            hljs.registerLanguage('coslang', function(hljs) {
                const KEYWORDS = {
                    keyword: 'scene choice text set if else vars stats inventory macro',
                    literal: 'true false',
                    built_in: 'title author version'
                };
                
                return {
                    name: 'Coslang',
                    keywords: KEYWORDS,
                    contains: [
                        hljs.C_LINE_COMMENT_MODE,
                        hljs.C_BLOCK_COMMENT_MODE,
                        hljs.QUOTE_STRING_MODE,
                        hljs.C_NUMBER_MODE,
                        {
                            className: 'function',
                            beginKeywords: 'scene macro',
                            end: /(\{|;)/,
                            contains: [
                                hljs.UNDERSCORE_TITLE_MODE
                            ]
                        },
                        {
                            className: 'symbol',
                            begin: /->|=>|:|\[/
                        },
                        {
                            className: 'variable',
                            begin: /\{[^}]+\}/,
                            relevance: 10
                        }
                    ]
                };
            });
            
            // Apply highlighting to existing code blocks
            document.querySelectorAll('.code-block').forEach(block => {
                block.querySelector('code').classList.add('language-coslang');
            });
            hljs.highlightAll();
        }
    }

    initUI() {
        // Initialize UI components
        this.setupCopyButtons();
        this.setupAutoResize();
        this.setupKeyboardShortcuts();
        this.setupConnectionIndicator();
        
        // Initialize scrollbar system
        this.initScrollbars();
        
        // Initialize performance optimizer
        this.initPerformanceOptimizer();
    }

    async checkOllamaConnection() {
        try {
            const response = await fetch('http://localhost:11434/api/tags', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Ollama API response:', data);
                
                // Check if any models are available
                const hasModels = data.models && data.models.length > 0;
                
                if (hasModels) {
                    // Check for phi models specifically
                    const phiModels = data.models.filter(model => 
                        model.name.includes('phi') || model.name.includes('Phi')
                    );
                    
                    if (phiModels.length > 0) {
                        this.connectionStatus = 'connected';
                        this.updateConnectionStatus();
                        console.log('✅ Connected to Ollama with Phi model:', phiModels[0].name);
                    } else {
                        this.connectionStatus = 'disconnected';
                        this.updateConnectionStatus();
                        console.warn('⚠️ Ollama running but no Phi model found. Available models:', data.models.map(m => m.name));
                    }
                } else {
                    this.connectionStatus = 'disconnected';
                    this.updateConnectionStatus();
                    console.warn('⚠️ Ollama running but no models found');
                }
            } else {
                throw new Error(`Ollama responded with status: ${response.status}`);
            }
        } catch (error) {
            this.connectionStatus = 'disconnected';
            this.updateConnectionStatus();
            console.warn('⚠️ Ollama connection error:', error.message);
        }
    }

    updateConnectionStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.connection-status div:nth-child(2)');
        const testBtn = document.getElementById('test-connection');
        
        if (statusIndicator && statusText) {
            if (this.connectionStatus === 'connected') {
                statusIndicator.className = 'status-indicator status-connected';
                statusText.textContent = '✅ Connected to Ollama';
                if (testBtn) testBtn.style.display = 'none';
            } else {
                statusIndicator.className = 'status-indicator status-disconnected';
                statusText.textContent = '❌ No Phi model found';
                if (testBtn) testBtn.style.display = 'inline-flex';
            }
        }
    }

    setupCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.copyCodeToClipboard(button);
            });
        });
    }

    copyCodeToClipboard(button) {
        const codeBlock = button.closest('.code-block');
        const code = codeBlock.querySelector('code').textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.color = 'var(--success)';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code:', err);
            this.showError('Failed to copy code to clipboard');
        });
    }

    setupAutoResize() {
        const textarea = document.getElementById('user-input');
        if (textarea) {
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 150) + 'px';
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to send message
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
            
            // Escape to clear input
            if (e.key === 'Escape') {
                const textarea = document.getElementById('user-input');
                if (textarea && textarea.value.trim()) {
                    textarea.value = '';
                    textarea.style.height = 'auto';
                }
            }
            
            // Ctrl/Cmd + K to focus input
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('user-input').focus();
            }
        });
    }

    setupConnectionIndicator() {
        // Periodically check connection status
        setInterval(() => {
            this.checkOllamaConnection();
        }, 30000); // Check every 30 seconds
        
        // Setup test connection button
        const testBtn = document.getElementById('test-connection');
        if (testBtn) {
            testBtn.addEventListener('click', async () => {
                testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                await this.checkOllamaConnection();
                testBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                
                // Show detailed connection info in console
                console.log('🔍 Connection test completed. Check browser console for details.');
            });
        }
    }

    initChat() {
        const sendBtn = document.getElementById('send-btn');
        const userInput = document.getElementById('user-input');
        
        if (sendBtn && userInput) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
            
            userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    initSidebar() {
        // Topic item clicks
        document.querySelectorAll('.topic-item, .example-item').forEach(item => {
            item.addEventListener('click', () => {
                const text = item.textContent.trim();
                this.setInputValue(text);
            });
        });
        
        // Mobile sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Setup sidebar scrolling
        this.setupSidebarScrolling();
        
        // Setup collapsible quick examples
        this.setupCollapsibleExamples();
    }

    setupSidebarScrolling() {
        const sidebar = document.querySelector('.sidebar');
        const sidebarContent = document.querySelector('.sidebar-content');
        
        if (sidebar && sidebarContent) {
            // Check if content overflows
            const checkOverflow = () => {
                const hasOverflow = sidebarContent.scrollHeight > sidebarContent.clientHeight;
                sidebar.classList.toggle('has-overflow', hasOverflow);
            };
            
            // Check on load
            checkOverflow();
            
            // Check on resize
            window.addEventListener('resize', checkOverflow);
            
            // Check when content changes
            const observer = new MutationObserver(checkOverflow);
            observer.observe(sidebarContent, {
                childList: true,
                subtree: true
            });
            
            // Add smooth scrolling to sidebar
            sidebarContent.style.scrollBehavior = 'smooth';
            
            // Setup scroll to top button
            this.setupScrollToTop();
        }
    }

    setupScrollToTop() {
        const scrollToTopBtn = document.getElementById('scroll-to-top');
        const sidebarContent = document.querySelector('.sidebar-content');
        
        if (scrollToTopBtn && sidebarContent) {
            // Show/hide button based on scroll position
            const toggleScrollButton = () => {
                if (sidebarContent.scrollTop > 100) {
                    scrollToTopBtn.style.display = 'flex';
                } else {
                    scrollToTopBtn.style.display = 'none';
                }
            };
            
            // Listen for scroll events
            sidebarContent.addEventListener('scroll', toggleScrollButton);
            
            // Scroll to top when button is clicked
            scrollToTopBtn.addEventListener('click', () => {
                sidebarContent.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    setupCollapsibleExamples() {
        const quickExamples = document.getElementById('quick-examples');
        const exampleHeader = document.getElementById('example-header');
        const toggleBtn = document.getElementById('toggle-examples');
        
        if (quickExamples && exampleHeader && toggleBtn) {
            // Toggle on header click
            exampleHeader.addEventListener('click', () => {
                this.toggleQuickExamples();
            });
            
            // Toggle on button click
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent double trigger
                this.toggleQuickExamples();
            });
            
            // Load saved state
            const isCollapsed = localStorage.getItem('quickExamplesCollapsed') === 'true';
            if (isCollapsed) {
                this.collapseQuickExamples();
            }
        }
    }

    toggleQuickExamples() {
        const quickExamples = document.getElementById('quick-examples');
        const toggleBtn = document.getElementById('toggle-examples');
        
        if (quickExamples && toggleBtn) {
            if (quickExamples.classList.contains('collapsed')) {
                this.expandQuickExamples();
            } else {
                this.collapseQuickExamples();
            }
        }
    }

    collapseQuickExamples() {
        const quickExamples = document.getElementById('quick-examples');
        const toggleBtn = document.getElementById('toggle-examples');
        
        if (quickExamples && toggleBtn) {
            quickExamples.classList.add('collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            localStorage.setItem('quickExamplesCollapsed', 'true');
        }
    }

    expandQuickExamples() {
        const quickExamples = document.getElementById('quick-examples');
        const toggleBtn = document.getElementById('toggle-examples');
        
        if (quickExamples && toggleBtn) {
            quickExamples.classList.remove('collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            localStorage.setItem('quickExamplesCollapsed', 'false');
        }
    }

    async sendToAI(userMessage) {
        try {
            // Always try to connect to Ollama first
            await this.checkOllamaConnection();
            
            if (this.connectionStatus !== 'connected') {
                this.hideTypingIndicator();
                this.addMessage(this.getFallbackResponse(userMessage), false);
                return;
            }

            const response = await this.callOllamaAPI(userMessage);
            this.hideTypingIndicator();
            
            if (response) {
                this.addMessage(response, false);
            } else {
                this.addMessage('Sorry, I couldn\'t generate a response. Please try again.', false);
            }
            
        } catch (error) {
            console.error('Error sending message to AI:', error);
            this.hideTypingIndicator();
            this.addMessage(this.getFallbackResponse(userMessage), false);
        }
    }

    async callOllamaAPI(message) {
        const systemPrompt = `You are CosAI, an expert tutor for the Coslang interactive fiction language. 
Coslang is a storytelling language for creating choose-your-own-adventure stories and interactive fiction.

Your role:
- Explain Coslang concepts clearly and simply
- Provide working story examples with proper syntax
- Help debug Coslang stories
- Suggest best practices for interactive storytelling
- Answer questions about story creation and branching
- Be encouraging and educational

When providing code examples:
- Use proper Coslang syntax (scenes, text, choices, vars, stats, inventory)
- Include comments explaining the story logic
- Show complete, runnable story examples
- Use markdown code blocks with \`\`\`coslang\`\`\`
- Demonstrate variable interpolation with {variable_name}
- Show conditional logic with if/else statements
- Include tags like [LOG: message], [ACHIEVEMENT: name], [EVENT: name]

Key Coslang features to teach:
- Scene structure and navigation
- Variables (vars, stats, inventory)
- Text with variable interpolation
- Choices with scene targeting (-> scene_name)
- Conditional logic (if/else)
- Set operations with tags
- Macros for reusable functions

Always be helpful, patient, and educational. Focus on practical storytelling examples that users can immediately use.`;

        const requestBody = {
            model: 'phi:latest',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 1000
            }
        };

        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.message?.content || null;
    }

    getFallbackResponse(userMessage) {
        return `
            <p>🤖 <strong>Phi Model Required</strong></p>
            <p>I need a Phi model to answer your question about: <em>"${userMessage}"</em></p>
            
            <p><strong>Ollama is running, but you need to install a Phi model:</strong></p>
            <ol>
                <li>Open a new terminal/command prompt</li>
                <li>Install Phi-1.5B: <code>ollama pull phi1.5</code></li>
                <li>Or install Phi-2: <code>ollama pull phi2</code></li>
                <li>Refresh this page and try again!</li>
            </ol>
            
            <p><strong>Alternative:</strong> Try clicking one of the example topics in the sidebar for a quick demo.</p>
            
            <p><em>Note: If you can't run ollama commands, you may need to add Ollama to your PATH or restart your terminal.</em></p>
        `;
    }

    setInputValue(value) {
        const textarea = document.getElementById('user-input');
        if (textarea) {
            textarea.value = value;
            textarea.focus();
            textarea.dispatchEvent(new Event('input'));
        }
    }

    sendMessage() {
        const userInput = document.getElementById('user-input');
        const message = userInput.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addMessage(message, true);
        
        // Clear input
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Send to AI
        this.sendToAI(message);
    }

    addMessage(content, isUser) {
        const chatMessages = document.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'} fade-in`;
        
        const avatarClass = isUser ? 'user-avatar' : 'bot-avatar';
        const avatarIcon = isUser ? 'fa-user' : 'fa-robot';
        const name = isUser ? 'You' : 'CosAI';
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <div class="message-avatar ${avatarClass}">
                    <i class="fas ${avatarIcon}"></i>
                </div>
                <div class="message-name">${name}</div>
            </div>
            <div class="message-content ${isUser ? 'user-content' : 'bot-content'}">
                ${isUser ? this.escapeHtml(content) : this.formatBotResponse(content)}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Store in chat history
        this.chatHistory.push({
            role: isUser ? 'user' : 'assistant',
            content: content,
            timestamp: new Date()
        });
        
        // Apply syntax highlighting to new code blocks
        if (!isUser) {
            this.applySyntaxHighlighting();
        }
    }

    showTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'block';
            const chatMessages = document.querySelector('.chat-messages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatBotResponse(content) {
        // Check if content contains code blocks
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let formattedContent = content;
        let match;
        
        while ((match = codeBlockRegex.exec(content)) !== null) {
            const language = match[1] || 'coslang';
            const code = match[2];
            
            const codeBlockHTML = `
                <div class="code-block">
                    <div class="code-header">
                        <div class="code-lang">
                            <i class="fas fa-code"></i>
                            <span>${language}</span>
                        </div>
                        <button class="copy-btn">
                            <i class="fas fa-copy"></i>
                            <span>Copy</span>
                        </button>
                    </div>
                    <div class="code-container">
                        <pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>
                    </div>
                </div>
            `;
            
            formattedContent = formattedContent.replace(match[0], codeBlockHTML);
        }
        
        // Convert markdown-style formatting
        formattedContent = this.convertMarkdown(formattedContent);
        
        return formattedContent;
    }

    convertMarkdown(text) {
        // Convert **bold** to <strong>
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert `code` to <code>
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert line breaks to <br>
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }

    applySyntaxHighlighting() {
        if (typeof hljs !== 'undefined') {
            // Apply highlighting to new code blocks
            document.querySelectorAll('.code-block').forEach(block => {
                const codeElement = block.querySelector('code');
                if (codeElement && !codeElement.classList.contains('hljs')) {
                    codeElement.classList.add('language-coslang');
                    hljs.highlightElement(codeElement);
                }
            });
            
            // Add event listeners to new copy buttons
            document.querySelectorAll('.copy-btn').forEach(button => {
                if (!button.hasAttribute('data-initialized')) {
                    button.setAttribute('data-initialized', 'true');
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.copyCodeToClipboard(button);
                    });
                }
            });
        }
    }

    showWelcomeMessage() {
        // Welcome message is already in HTML
        console.log('👋 Welcome to CosAI!');
    }

    showError(message) {
        console.error('❌ Error:', message);
        // You can implement a toast notification system here
    }

    showSuccess(message) {
        console.log('✅ Success:', message);
        // You can implement a toast notification system here
    }

    initScrollbars() {
        // Initialize enhanced scrollbar system
        if (window.ScrollbarSystem) {
            this.scrollbarSystem = new ScrollbarSystem();
            this.scrollbarSystem.initialize();
            console.log('🎨 Scrollbar system initialized');
        } else {
            console.warn('⚠️ ScrollbarSystem not available');
        }
    }

    initPerformanceOptimizer() {
        // Initialize performance optimizer for i5-6500T
        if (window.PerformanceOptimizer) {
            this.performanceOptimizer = new PerformanceOptimizer();
            this.performanceOptimizer.initialize();
            this.performanceOptimizer.optimizeForHardware();
            console.log('⚡ Performance optimizer initialized for i5-6500T');
        } else {
            console.warn('⚠️ PerformanceOptimizer not available');
        }
    }
}

// Initialize CosAI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cosAI = new CosAI();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CosAI;
} 