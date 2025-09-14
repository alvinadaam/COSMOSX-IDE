// corePlayer.js
// Glue between UI and the new modular CosmosX engine. Uses engine API for all data/state.

// Import the modular engine and CosmosUI
import { CosmosEngine } from '../../js/cosmosx-engine/core/CosmosEngine/engine.js';
import { CosmosUI } from '../../js/cosmosx-engine/core/CosmosUI/index.js';
import { logger } from './logger.js';
import { parseCosLang } from '../../js/cosmosx-engine/core/CosmosEngine/parser.js';

logger.info('🚀 Player Engine initializing...');

window.corePlayer = {
  engine: null,
  ui: null,
  storyData: null,
  currentSceneId: null,

  init() {
    try {
      // Verify DOM elements exist before initializing
      const storyRoot = document.getElementById('story-root');
      const choicesRoot = document.getElementById('choices-root');
      const statsRoot = document.getElementById('stats-root');
      const inventoryRoot = document.getElementById('inventory-root');
      
      logger.debug('CorePlayer: Checking DOM elements...');
      logger.debug('Story root exists:', !!storyRoot);
      logger.debug('Choices root exists:', !!choicesRoot);
      logger.debug('Stats root exists:', !!statsRoot);
      logger.debug('Inventory root exists:', !!inventoryRoot);
      
      if (!storyRoot || !choicesRoot || !statsRoot || !inventoryRoot) {
        logger.error('CorePlayer: Required DOM elements not found');
        logger.error('Story root:', storyRoot);
        logger.error('Choices root:', choicesRoot);
        logger.error('Stats root:', statsRoot);
        logger.error('Inventory root:', inventoryRoot);
        return;
      }
      
      // Initialize the CosmosEngine
      this.engine = null; // Will be set on loadStory
      this.ui = null; // Will be set on loadStory
      
      logger.info('Player ready for story load');
    } catch (error) {
      logger.error('Failed to initialize:', error);
      return;
    }
  },

  loadStory(coslangText) {
    logger.debug('Loading Coslang story...');
    logger.debug('Story text length:', coslangText.length);
    logger.debug('Story preview:', coslangText.substring(0, 200) + '...');
    
    try {
      // Show loading state (if UIManager available)
      if (window.uiManager && window.uiManager.showLoadingState) window.uiManager.showLoadingState();
      
      // Parse the story using the parser (imported via engine)
      let ast = null;
      if (typeof parseCosLang === 'function') {
        ast = parseCosLang(coslangText);
      } else {
        logger.error('parseCosLang not found. Please ensure parser is loaded.');
        return;
      }
      this.storyData = ast;
      
      logger.debug('Story parsed successfully');
      logger.debug('Available scenes:', Object.keys(this.storyData.scenes || {}));
      logger.debug('Story metadata:', this.storyData.meta);
      
      if (this.storyData && this.storyData.scenes && Object.keys(this.storyData.scenes).length) {
        // Start the story
        const firstScene = Object.keys(this.storyData.scenes)[0];
        logger.info('Story loaded successfully. First scene:', firstScene);
        this.startStory(firstScene);
      } else {
        logger.error('No scenes found in loaded story.');
        logger.debug('Story data:', this.storyData);
        if (window.uiManager && window.uiManager.showErrorState) window.uiManager.showErrorState('No scenes found in story');
      }
    } catch (error) {
      logger.error('Error loading story:', error);
      logger.error('Error stack:', error.stack);
      if (window.uiManager && window.uiManager.showErrorState) window.uiManager.showErrorState('Failed to load story: ' + error.message);
    }
  },

  startStory(startScene = 'start') {
    if (!this.storyData) {
      logger.error('Story data not ready');
      return;
    }
    try {
      // Initialize engine and CosmosUI for this story
      this.engine = new CosmosEngine(this.storyData);
      // Only reset state when loading a new story
      this.engine.start(startScene, { reset: true });
      this.ui = new CosmosUI(this.engine);
      this.currentSceneId = startScene;
      this.renderCurrentScene();
      logger.info(`Story started successfully at scene: ${startScene}`);
    } catch (error) {
      logger.error('Error starting story:', error);
      if (window.uiManager && window.uiManager.showErrorState) window.uiManager.showErrorState('Error starting story: ' + error.message);
    }
  },

  makeChoice(choiceIndex) {
    if (!this.engine || !this.ui) {
      logger.error('Engine or UI not ready');
      return;
    }
    try {
      logger.info(`Making choice ${choiceIndex} from scene: ${this.currentSceneId}`);
      // Check if the chosen choice has a [RESET] tag
      const renderable = this.ui.getRenderableStateAfterSetExecution();
      const choice = renderable.choices[choiceIndex];
      const hasResetTag = choice && choice.tags && choice.tags.some(tag => tag.toUpperCase() === 'RESET');
      if (hasResetTag) {
        // Perform a true restart
        logger.info('RESET tag detected: Performing full game reset!');
        this.engine.start(choice.target, { reset: true });
        this.currentSceneId = this.engine.state.sceneId;
        this.renderCurrentScene();
        return;
      }
      // Normal choice handling
      this.ui.choose(choiceIndex);
      this.currentSceneId = this.engine.state.sceneId;
      this.renderCurrentScene();
      logger.info(`Choice ${choiceIndex} successful, new scene: ${this.currentSceneId}`);
    } catch (error) {
      logger.error('Error making choice:', error);
      if (window.uiManager && window.uiManager.showErrorState) window.uiManager.showErrorState('Error making choice: ' + error.message);
    }
  },

  advance() {
    if (!this.engine || !this.ui) {
      logger.error('Engine or UI not ready');
      return;
    }
    try {
      this.ui.advance();
      this.renderCurrentScene();
    } catch (error) {
      logger.error('Error advancing scene:', error);
      if (window.uiManager && window.uiManager.showErrorState) window.uiManager.showErrorState('Error advancing scene: ' + error.message);
    }
  },

  renderCurrentScene() {
    if (!this.engine || !this.ui || !this.currentSceneId) {
      logger.error('CorePlayer: Cannot render - engine, UI, or scene not ready');
      return;
    }
    try {
      const state = this.engine.getState();
      const renderable = this.ui.getRenderableStateAfterSetExecution();
      // --- DOM/UI wiring ---
      // Get DOM elements
      const storyRoot = document.getElementById('story-root');
      const choicesRoot = document.getElementById('choices-root');
      const statsRoot = document.getElementById('stats-root');
      const inventoryRoot = document.getElementById('inventory-root');
      // Render text
      if (storyRoot) {
        storyRoot.innerHTML = '';
        renderable.text.forEach(textBlock => {
          const p = document.createElement('p');
          p.textContent = textBlock;
          storyRoot.appendChild(p);
        });
      }
      // Render choices
      if (choicesRoot) {
        choicesRoot.innerHTML = '';
        renderable.choices.forEach((choice, idx) => {
          const btn = document.createElement('button');
          btn.textContent = choice.text;
          btn.className = 'choice-btn';
          btn.onclick = () => this.makeChoice(idx);
          choicesRoot.appendChild(btn);
        });
      }
      // Render stats
      if (statsRoot) {
        statsRoot.innerHTML = '';
        statsRoot.className = 'stats-panel fade-in';
        const statsEntries = Object.entries(renderable.stats || {});
        if (statsEntries.length === 0) {
          const emptyDiv = document.createElement('div');
          emptyDiv.className = 'empty-stats';
          emptyDiv.innerHTML = '<div class="empty-stats-icon">📊</div><div class="empty-stats-text"><h4>No Stats</h4><p>Stats will appear here as you play.</p></div>';
          statsRoot.appendChild(emptyDiv);
        } else {
          const statsContainer = document.createElement('div');
          statsContainer.className = 'stats-container';
          statsEntries.forEach(([key, value]) => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            
            const statLabel = document.createElement('div');
            statLabel.className = 'stat-label';
            statLabel.textContent = key;
            
            const statValue = document.createElement('div');
            statValue.className = 'stat-value';
            statValue.textContent = value;
            
            statCard.appendChild(statLabel);
            statCard.appendChild(statValue);
            statsContainer.appendChild(statCard);
          });
          statsRoot.appendChild(statsContainer);
        }
      }
      // Render inventory
      if (inventoryRoot) {
        inventoryRoot.innerHTML = '';
        inventoryRoot.className = 'inventory-panel fade-in';
        const inventoryEntries = Object.entries(renderable.inventory || {});
        if (inventoryEntries.length === 0) {
          const emptyDiv = document.createElement('div');
          emptyDiv.className = 'empty-inventory';
          emptyDiv.innerHTML = '<div class="empty-inventory-icon">🎒</div><div class="empty-inventory-text"><h4>No Inventory</h4><p>Your items will appear here.</p></div>';
          inventoryRoot.appendChild(emptyDiv);
        } else {
          const inventoryItems = document.createElement('div');
          inventoryItems.className = 'inventory-items';
          inventoryEntries.forEach(([item, count]) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.textContent = `${item}: ${count}`;
            inventoryItems.appendChild(itemDiv);
          });
          inventoryRoot.appendChild(inventoryItems);
        }
      }
      // Render achievements
      const achievementsRoot = document.getElementById('achievements-root');
      if (achievementsRoot && renderable.achievements) {
        achievementsRoot.innerHTML = '';
        achievementsRoot.className = 'achievements-panel fade-in';
        const unlocked = Object.entries(renderable.achievements).filter(([_, unlocked]) => unlocked);
        if (unlocked.length === 0) {
          const emptyDiv = document.createElement('div');
          emptyDiv.className = 'empty-achievements';
          emptyDiv.innerHTML = '<div class="empty-achievements-icon">🏆</div><div class="empty-achievements-text"><h4>No Achievements</h4><p>Achievements will appear here as you unlock them.</p></div>';
          achievementsRoot.appendChild(emptyDiv);
        } else {
          unlocked.forEach(([name]) => {
            const div = document.createElement('div');
            div.className = 'achievement-item unlocked';
            div.textContent = name;
            achievementsRoot.appendChild(div);
          });
        }
      }
      // Render events
      const eventsRoot = document.getElementById('events-root');
      if (eventsRoot && renderable.events) {
        eventsRoot.innerHTML = '';
        eventsRoot.className = 'events-panel fade-in';
        const triggered = Object.entries(renderable.events).filter(([_, triggered]) => triggered);
        if (triggered.length === 0) {
          const emptyDiv = document.createElement('div');
          emptyDiv.className = 'empty-events';
          emptyDiv.innerHTML = '<div class="empty-events-icon">🎉</div><div class="empty-events-text"><h4>No Events</h4><p>Events will appear here as you play.</p></div>';
          eventsRoot.appendChild(emptyDiv);
        } else {
          triggered.forEach(([name]) => {
            const div = document.createElement('div');
            div.className = 'event-item';
            div.textContent = name;
            eventsRoot.appendChild(div);
          });
        }
      }
      // Render log
      const logRoot = document.getElementById('log-root');
      if (logRoot && renderable.log) {
        logRoot.innerHTML = '';
        logRoot.className = 'log-panel fade-in';
        const filteredLog = renderable.log.filter(entry => entry.type === 'log' || entry.type === 'achievement');
        if (filteredLog.length === 0) {
          const emptyDiv = document.createElement('div');
          emptyDiv.className = 'empty-log';
          emptyDiv.innerHTML = '<div class="empty-log-icon">📝</div><div class="empty-log-text"><h4>No Log Entries</h4><p>Story log will appear here as you play.</p></div>';
          logRoot.appendChild(emptyDiv);
        } else {
          filteredLog.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'log-item';
            if (entry.type === 'log') {
              div.innerHTML = `<div class="log-content"><div class="log-message">${entry.message}</div></div>`;
            } else if (entry.type === 'achievement') {
              div.innerHTML = `<div class="log-content"><div class="log-message">🏆 Achievement unlocked: ${entry.name}</div></div>`;
              div.classList.add('achievement-log');
            }
            logRoot.appendChild(div);
          });
        }
      }
      // Optionally, handle errors/log
      if (renderable.error && window.uiManager && window.uiManager.showErrorState) {
        window.uiManager.showErrorState(renderable.error);
      }
      // Optionally, scroll to top of story area
      if (storyRoot) storyRoot.scrollTop = 0;
      logger.debug('Renderable state:', renderable);
      // Notify UIManager to show story content
      if (window.uiManager && typeof window.uiManager.onStoryLoaded === 'function') {
        window.uiManager.onStoryLoaded();
      }
      logger.debug('Scene content:', this.engine.state.scene.content);
      logger.debug('Engine position:', this.engine.state.position);
      logger.debug('Current node:', this.engine.getCurrentContent());
    } catch (error) {
      logger.error('Error rendering scene:', error);
      if (window.uiManager && window.uiManager.showErrorState) window.uiManager.showErrorState('Error rendering scene: ' + error.message);
    }
  },

  saveGame() {
    if (!this.engine) {
      logger.error('[PlayerEngine] Engine not ready');
      if (window.uiManager && window.uiManager.showErrorState) window.uiManager.showErrorState('Engine not ready');
      return false;
    }
    try {
      const state = this.engine.getState();
      localStorage.setItem('cosmosx-player-save', JSON.stringify(state));
      if (window.uiManager && window.uiManager.showSuccessState) {
        window.uiManager.showSuccessState('Game saved successfully!');
      } else {
        alert('Game saved successfully!');
      }
      return true;
    } catch (e) {
      logger.error('Failed to save game:', e);
      if (window.uiManager && window.uiManager.showErrorState) window.uiManager.showErrorState('Failed to save game');
      else alert('Failed to save game');
      return false;
    }
  },

  loadGame() {
    if (!this.engine || !this.ui) {
      logger.error('[PlayerEngine] Engine or UI not ready');
      if (window.uiManager && window.uiManager.showErrorState) window.uiManager.showErrorState('Engine or UI not ready');
      return false;
    }
    try {
      const saved = localStorage.getItem('cosmosx-player-save');
      if (!saved) {
        if (window.uiManager && window.uiManager.showErrorState) window.uiManager.showErrorState('No saved game found');
        else alert('No saved game found');
        return false;
      }
      const state = JSON.parse(saved);
      // Restore engine state (shallow merge for MVP)
      Object.assign(this.engine.state, state);
      this.currentSceneId = this.engine.state.sceneId;
      this.renderCurrentScene();
      if (window.uiManager && window.uiManager.showSuccessState) window.uiManager.showSuccessState('Game loaded successfully!');
      else alert('Game loaded successfully!');
      return true;
    } catch (e) {
      logger.error('Failed to load game:', e);
      if (window.uiManager && window.uiManager.showErrorState) window.uiManager.showErrorState('Failed to load game');
      else alert('Failed to load game');
      return false;
    }
  },
};

// Initialize when the script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.corePlayer.init();
  });
} else {
  window.corePlayer.init();
}

logger.info('✅ CosmosX Player Engine initialized!'); 