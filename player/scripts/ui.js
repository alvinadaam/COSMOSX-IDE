// CosmosX Player Engine - UI Management (Enhanced v2.9.2)

import { logger } from './logger.js';
import { showNotification } from './dialogues.js';

class UIManager {
    constructor() {
        this.welcomeScreen = null;
        this.storyContent = null;
        this.welcomeLoadBtn = null;
        this.welcomeDemoBtn = null;
        this.loadFileBtn = null;
        this.saveBtn = null;
        this.loadBtn = null;
        this.docsBtn = null;
        this.isStoryLoaded = false;
        
        this.init();
    }

    init() {
        logger.debug('UIManager: Initializing UI components');
        
        // Get DOM elements
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.storyContent = document.getElementById('story-content');
        this.welcomeLoadBtn = document.getElementById('welcome-load-btn');
        this.welcomeDemoBtn = document.getElementById('welcome-demo-btn');
        this.loadFileBtn = document.getElementById('load-file-btn');
        this.saveBtn = document.getElementById('save-btn');
        this.loadBtn = document.getElementById('load-btn');
        this.docsBtn = document.getElementById('docs-btn');
        
        // Validate required elements
        if (!this.welcomeScreen || !this.storyContent) {
            logger.error('UIManager: Required UI elements not found');
            return;
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show welcome screen by default
        this.showWelcomeScreen();
        
        logger.debug('UIManager: UI components initialized successfully');
    }

    setupEventListeners() {
        // Welcome screen buttons
        if (this.welcomeLoadBtn) {
            this.welcomeLoadBtn.addEventListener('click', () => {
                logger.debug('UIManager: Welcome load button clicked');
                this.triggerFileLoad();
            });
        }
        
        if (this.welcomeDemoBtn) {
            this.welcomeDemoBtn.addEventListener('click', () => {
                logger.debug('UIManager: Welcome demo button clicked');
                this.loadDemoStory();
            });
        }
        
        // Header buttons
        if (this.loadFileBtn) {
            this.loadFileBtn.addEventListener('click', () => {
                logger.debug('UIManager: Header load file button clicked');
                this.triggerFileLoad();
            });
        }
        
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => {
                logger.debug('UIManager: Save button clicked');
                this.triggerSaveGame();
            });
        }
        
        if (this.loadBtn) {
            this.loadBtn.addEventListener('click', () => {
                logger.debug('UIManager: Load button clicked');
                this.triggerLoadGame();
            });
        }
        
        if (this.docsBtn) {
            this.docsBtn.addEventListener('click', () => {
                logger.debug('UIManager: Docs button clicked');
                this.openDocumentation();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        logger.debug('UIManager: Event listeners set up successfully');
    }

    showWelcomeScreen() {
        logger.debug('UIManager: Showing welcome screen');
        
        if (this.welcomeScreen && this.storyContent) {
            // Hide story content
            this.storyContent.style.display = 'none';
            this.storyContent.classList.remove('fade-in');
            
            // Show welcome screen with animation
            this.welcomeScreen.style.display = 'flex';
            this.welcomeScreen.classList.add('fade-in');
            
            // Update button visibility
            this.updateButtonVisibility(false);
            
            this.isStoryLoaded = false;
            
            logger.debug('UIManager: Welcome screen displayed');
        }
    }

    hideWelcomeScreen() {
        logger.debug('UIManager: Hiding welcome screen');
        
        if (this.welcomeScreen && this.storyContent) {
            // Hide welcome screen with fade out
            this.welcomeScreen.classList.remove('fade-in');
            this.welcomeScreen.style.display = 'none';
            
            // Show story content with animation
            this.storyContent.style.display = 'block';
            this.storyContent.classList.add('fade-in');
            
            // Update button visibility
            this.updateButtonVisibility(true);
            
            this.isStoryLoaded = true;
            
            logger.debug('UIManager: Welcome screen hidden, story content shown');
        }
    }

    updateButtonVisibility(storyLoaded) {
        // Update header button visibility based on story state
        if (this.saveBtn) {
            this.saveBtn.style.display = storyLoaded ? 'flex' : 'none';
        }
        
        if (this.loadBtn) {
            this.loadBtn.style.display = storyLoaded ? 'flex' : 'none';
        }
        
        if (this.loadFileBtn) {
            this.loadFileBtn.style.display = 'flex'; // Always visible
        }
        
        if (this.docsBtn) {
            this.docsBtn.style.display = 'flex'; // Always visible
        }
        
        logger.debug(`UIManager: Button visibility updated - story loaded: ${storyLoaded}`);
    }

    triggerFileLoad() {
        logger.debug('UIManager: Triggering file load');
        
        // Dispatch custom event for file loading
        const fileLoadEvent = new CustomEvent('fileLoadRequested', {
            detail: { source: 'ui-manager' }
        });
        document.dispatchEvent(fileLoadEvent);
    }

    triggerSaveGame() {
        logger.debug('UIManager: Triggering save game');
        
        // Dispatch custom event for save game
        const saveGameEvent = new CustomEvent('saveGameRequested', {
            detail: { source: 'ui-manager' }
        });
        document.dispatchEvent(saveGameEvent);
    }

    triggerLoadGame() {
        logger.debug('UIManager: Triggering load game');
        
        // Dispatch custom event for load game
        const loadGameEvent = new CustomEvent('loadGameRequested', {
            detail: { source: 'ui-manager' }
        });
        document.dispatchEvent(loadGameEvent);
    }

    openDocumentation() {
        logger.debug('UIManager: Opening documentation');
        
        // Open documentation in new tab
        const docsUrl = '../docs/COSLANG/learn.html';
        window.open(docsUrl, '_blank');
        
        showNotification('Documentation opened in new tab', 'info');
    }

    loadDemoStory() {
        logger.debug('UIManager: Loading demo story');
        
        // Demo story content
        const demoStory = {
            title: 'Welcome to CosmosX',
            author: 'CosmosX Team',
            version: '1.0.0',
            scenes: {
                'start': {
                    text: `Welcome to the CosmosX Player Engine! This is a demo story to showcase the interactive fiction capabilities.

You find yourself in a mysterious room with two doors. The air is thick with anticipation as you consider your next move.

What would you like to do?`,
                    choices: [
                        {
                            text: 'Open the red door',
                            target: 'red_door',
                            description: 'The red door seems to glow with an otherworldly light.'
                        },
                        {
                            text: 'Open the blue door',
                            target: 'blue_door',
                            description: 'The blue door hums softly with mysterious energy.'
                        },
                        {
                            text: 'Examine the room more closely',
                            target: 'examine_room',
                            description: 'Take a moment to look around and gather more information.'
                        }
                    ]
                },
                'red_door': {
                    text: `You open the red door and step into a chamber filled with warm, golden light.

The walls are covered in ancient runes that seem to pulse with life. In the center of the room, you see a pedestal with a glowing crystal.

This appears to be a place of great power.`,
                    choices: [
                        {
                            text: 'Touch the crystal',
                            target: 'touch_crystal',
                            description: 'The crystal calls to you with an irresistible energy.'
                        },
                        {
                            text: 'Study the runes',
                            target: 'study_runes',
                            description: 'The ancient symbols might reveal important secrets.'
                        },
                        {
                            text: 'Return to the previous room',
                            target: 'start',
                            description: 'Go back and try a different path.'
                        }
                    ]
                },
                'blue_door': {
                    text: `The blue door opens to reveal a vast library stretching into infinity.

Books float in the air, their pages turning of their own accord. The knowledge of countless worlds seems to be contained within these walls.

You feel a sense of wonder and possibility.`,
                    choices: [
                        {
                            text: 'Read a floating book',
                            target: 'read_book',
                            description: 'Choose a book that catches your interest.'
                        },
                        {
                            text: 'Explore the library',
                            target: 'explore_library',
                            description: 'Wander through the endless shelves of knowledge.'
                        },
                        {
                            text: 'Return to the previous room',
                            target: 'start',
                            description: 'Go back and try a different path.'
                        }
                    ]
                },
                'examine_room': {
                    text: `Taking a closer look around the room, you notice subtle details you missed before.

There's a small inscription on the wall that reads: "Choose wisely, for each path leads to different truths."

You also notice that the doors seem to change color slightly when you look at them directly.`,
                    choices: [
                        {
                            text: 'Open the red door',
                            target: 'red_door',
                            description: 'Now that you\'ve examined the room, the red door seems more inviting.'
                        },
                        {
                            text: 'Open the blue door',
                            target: 'blue_door',
                            description: 'The blue door\'s energy feels more familiar now.'
                        },
                        {
                            text: 'Look for hidden passages',
                            target: 'hidden_passage',
                            description: 'There might be more to this room than meets the eye.'
                        }
                    ]
                },
                'touch_crystal': {
                    text: `As your hand makes contact with the crystal, a surge of energy courses through your body.

Visions flash before your eyes - you see possibilities, alternate realities, and the power to shape your own destiny.

The crystal has awakened something within you.`,
                    choices: [
                        {
                            text: 'Embrace the power',
                            target: 'embrace_power',
                            description: 'Accept the gift and see where it leads.'
                        },
                        {
                            text: 'Resist the energy',
                            target: 'resist_energy',
                            description: 'Try to control and understand the power first.'
                        },
                        {
                            text: 'Return to the previous room',
                            target: 'red_door',
                            description: 'Step back and reconsider your options.'
                        }
                    ]
                },
                'read_book': {
                    text: `You reach for a particularly interesting book that seems to glow with its own light.

As you open it, the pages come alive with moving images and text that writes itself as you read. The book tells the story of your own journey, but from a different perspective.

It's as if you're reading about yourself from another timeline.`,
                    choices: [
                        {
                            text: 'Continue reading',
                            target: 'continue_reading',
                            description: 'Learn more about this alternate version of yourself.'
                        },
                        {
                            text: 'Close the book',
                            target: 'blue_door',
                            description: 'Return to the library and choose a different path.'
                        },
                        {
                            text: 'Take the book with you',
                            target: 'take_book',
                            description: 'The book might contain valuable knowledge.'
                        }
                    ]
                },
                'hidden_passage': {
                    text: `Your careful examination reveals a hidden door behind a tapestry on the wall.

The passage leads to a small chamber with a mirror that doesn't reflect your image, but instead shows scenes from other worlds and possibilities.

This mirror seems to be a window into other realities.`,
                    choices: [
                        {
                            text: 'Step through the mirror',
                            target: 'mirror_world',
                            description: 'Enter a completely different reality.'
                        },
                        {
                            text: 'Study the mirror',
                            target: 'study_mirror',
                            description: 'Try to understand how the mirror works.'
                        },
                        {
                            text: 'Return to the main room',
                            target: 'start',
                            description: 'Go back and choose one of the main doors.'
                        }
                    ]
                }
            }
        };
        
        // Dispatch demo story load event
        const demoLoadEvent = new CustomEvent('demoStoryLoadRequested', {
            detail: { 
                story: demoStory,
                source: 'ui-manager'
            }
        });
        document.dispatchEvent(demoLoadEvent);
        
        showNotification('Demo story loaded successfully!', 'success');
    }

    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when story is loaded
        if (!this.isStoryLoaded) return;
        
        switch (e.key) {
            case 's':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.triggerSaveGame();
                }
                break;
            case 'o':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.triggerFileLoad();
                }
                break;
            case 'l':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.triggerLoadGame();
                }
                break;
            case 'F1':
                e.preventDefault();
                this.openDocumentation();
                break;
        }
    }

    // Public methods for external use
    onStoryLoaded() {
        logger.debug('UIManager: Story loaded, updating UI');
        this.hideWelcomeScreen();
    }

    onStoryUnloaded() {
        logger.debug('UIManager: Story unloaded, showing welcome screen');
        this.showWelcomeScreen();
    }

    showLoadingState() {
        logger.debug('UIManager: Showing loading state');
        showNotification('Loading story...', 'info');
    }

    showErrorState(error) {
        logger.error('UIManager: Showing error state:', error);
        showNotification(`Error: ${error.message || 'Failed to load story'}`, 'error');
    }

    showSuccessState(message) {
        logger.debug('UIManager: Showing success state');
        showNotification(message || 'Operation completed successfully', 'success');
    }
}

// Initialize UI Manager
const uiManager = new UIManager();

// Make uiManager available globally for other modules
window.uiManager = uiManager;

// Export for use in other modules
export { UIManager, uiManager };

// Export initialization function for main.js
export function initializeUI() {
    logger.debug('UI: Initializing UI system');
    return uiManager;
} 