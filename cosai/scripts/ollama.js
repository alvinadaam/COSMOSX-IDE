/* ===== COSAI OLLAMA INTEGRATION ===== */

// Extend CosAI with Ollama-specific functionality
if (window.cosAI) {
    Object.assign(window.cosAI, {
        
        // Ollama API endpoints
        OLLAMA_BASE_URL: 'http://localhost:11434',
        OLLAMA_ENDPOINTS: {
            CHAT: '/api/chat',
            GENERATE: '/api/generate',
            TAGS: '/api/tags',
            PULL: '/api/pull',
            LIST: '/api/list'
        },

        // Model configuration
        MODEL_CONFIG: {
            name: 'phi1.5',
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1000,
            stream: false
        },

        // System prompt for Coslang tutoring
        SYSTEM_PROMPT: `You are CosAI, an expert tutor for the Coslang interactive fiction language. 
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

Always be helpful, patient, and educational. Focus on practical storytelling examples that users can immediately use.`,

        async checkModelAvailability() {
            try {
                const response = await fetch(`${this.OLLAMA_BASE_URL}${this.OLLAMA_ENDPOINTS.LIST}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch model list');
                }
                
                const data = await response.json();
                const models = data.models || [];
                
                const phiModel = models.find(model => 
                    model.name.includes('phi') || 
                    model.name.includes('1.5') ||
                    model.name.includes('phi1.5')
                );
                
                return {
                    available: !!phiModel,
                    model: phiModel,
                    allModels: models
                };
            } catch (error) {
                console.error('Error checking model availability:', error);
                return { available: false, error: error.message };
            }
        },

        async pullModel(modelName = 'phi1.5') {
            try {
                console.log(`📥 Pulling model: ${modelName}`);
                
                const response = await fetch(`${this.OLLAMA_BASE_URL}${this.OLLAMA_ENDPOINTS.PULL}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: modelName
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to pull model: ${response.statusText}`);
                }
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n').filter(line => line.trim());
                    
                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            if (data.status) {
                                console.log(`📥 ${data.status}`);
                            }
                        } catch (e) {
                            // Ignore parsing errors for incomplete JSON
                        }
                    }
                }
                
                console.log('✅ Model pulled successfully');
                return true;
                
            } catch (error) {
                console.error('❌ Failed to pull model:', error);
                return false;
            }
        },

        async generateResponse(prompt, options = {}) {
            const config = { ...this.MODEL_CONFIG, ...options };
            
            try {
                const response = await fetch(`${this.OLLAMA_BASE_URL}${this.OLLAMA_ENDPOINTS.GENERATE}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: config.name,
                        prompt: this.SYSTEM_PROMPT + '\n\nUser: ' + prompt + '\n\nCosAI:',
                        stream: config.stream,
                        options: {
                            temperature: config.temperature,
                            top_p: config.top_p,
                            num_predict: config.max_tokens
                        }
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                if (config.stream) {
                    return this.handleStreamResponse(response);
                } else {
                    const data = await response.json();
                    return data.response || '';
                }
                
            } catch (error) {
                console.error('Error generating response:', error);
                throw error;
            }
        },

        async handleStreamResponse(response) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.response) {
                            fullResponse += data.response;
                            // You could emit a custom event here for real-time updates
                        }
                    } catch (e) {
                        // Ignore parsing errors for incomplete JSON
                    }
                }
            }
            
            return fullResponse;
        },

        async chatWithModel(messages, options = {}) {
            const config = { ...this.MODEL_CONFIG, ...options };
            
            try {
                const response = await fetch(`${this.OLLAMA_BASE_URL}${this.OLLAMA_ENDPOINTS.CHAT}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: config.name,
                        messages: [
                            { role: 'system', content: this.SYSTEM_PROMPT },
                            ...messages
                        ],
                        stream: config.stream,
                        options: {
                            temperature: config.temperature,
                            top_p: config.top_p,
                            num_predict: config.max_tokens
                        }
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                return data.message?.content || '';
                
            } catch (error) {
                console.error('Error in chat with model:', error);
                throw error;
            }
        },

        // Override the sendToAI method to use our Ollama integration
        async sendToAI(userMessage) {
            try {
                if (this.connectionStatus !== 'connected') {
                    this.hideTypingIndicator();
                    this.addMessage('Sorry, I\'m not connected to Ollama. Please make sure Ollama is running and Phi-1.5B is installed.', false);
                    return;
                }

                // Check if model is available
                const modelStatus = await this.checkModelAvailability();
                if (!modelStatus.available) {
                    this.hideTypingIndicator();
                    this.addMessage('Phi-1.5B model is not installed. Would you like me to help you install it?', false);
                    return;
                }

                // Send message using chat API
                const response = await this.chatWithModel([
                    { role: 'user', content: userMessage }
                ]);
                
                this.hideTypingIndicator();
                
                if (response) {
                    this.addMessage(response, false);
                } else {
                    this.addMessage('Sorry, I couldn\'t generate a response. Please try again.', false);
                }
                
            } catch (error) {
                console.error('Error sending message to AI:', error);
                this.hideTypingIndicator();
                this.addMessage('Sorry, there was an error processing your request. Please try again.', false);
            }
        },

        // Model management utilities
        async installModel(modelName = 'phi1.5') {
            try {
                console.log(`🔧 Installing model: ${modelName}`);
                this.showMessage('Installing Phi-1.5B model... This may take a few minutes.', false);
                
                const success = await this.pullModel(modelName);
                
                if (success) {
                    this.showMessage('✅ Phi-1.5B model installed successfully! You can now start chatting.', false);
                    await this.checkOllamaConnection();
                } else {
                    this.showMessage('❌ Failed to install model. Please check your internet connection and try again.', false);
                }
                
                return success;
            } catch (error) {
                console.error('Error installing model:', error);
                this.showMessage('❌ Error installing model: ' + error.message, false);
                return false;
            }
        },

        showMessage(content, isUser = false) {
            this.addMessage(content, isUser);
        }
    });
} 