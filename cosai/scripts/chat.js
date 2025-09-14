/* ===== COSAI CHAT FUNCTIONALITY ===== */

// Extend CosAI with chat functionality
if (window.cosAI) {
    Object.assign(window.cosAI, {
        
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
        },

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
        },

        showTypingIndicator() {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.style.display = 'block';
                const chatMessages = document.querySelector('.chat-messages');
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        },

        hideTypingIndicator() {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
        },

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
        },

        async callOllamaAPI(message) {
            const systemPrompt = `You are CosAI, an expert tutor for the Coslang programming language. 
Coslang is a simple, educational language for creating interactive stories.

Your role:
- Explain Coslang concepts clearly and simply
- Provide working code examples
- Help debug Coslang code
- Suggest best practices
- Answer questions about story creation
- Be encouraging and educational

Always provide practical, runnable examples with proper syntax highlighting.`;

            const requestBody = {
                model: 'phi1.5',
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
        },

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
        },

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
        },

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

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
        },

        // Fallback response when Ollama is not available
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
    });
} 