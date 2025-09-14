// CosmosX Player Engine - Main App Logic

// Entry point for CosmosX Player

import { initializeUI } from './ui.js';
import { logger } from './logger.js';

document.addEventListener('DOMContentLoaded', function() {
  logger.info('🚀 CosmosX Player starting...');
  
  // Initialize core player first
  if (window.corePlayer && typeof window.corePlayer.init === 'function') {
    window.corePlayer.init();
    logger.info('Core player initialized');
  } else {
    logger.error('Core player not found');
  }
  
  // Initialize UI after core player
  setTimeout(() => {
    initializeUI();
    logger.info('UI initialized');
    
    // Keep debug mode enabled for now to see everything
    // SmartLogger.enterGameplay(); // Commented out to keep debug mode active
  }, 100);
});