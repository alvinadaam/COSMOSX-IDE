// fileloader.js
// Handles file input, drag & drop, and Coslang parsing. Passes parsed data to corePlayer.

import { logger } from './logger.js';

let fileUploadDialogueOpen = false;
let eventListenersSetup = false;

const fileLoader = {
  init() {
    this.setupFileInput();
    this.setupDragDrop();
    this.setupEventListeners();
    logger.info('FileLoader initialized (dialogue system handles file loading)');
  },

  setupFileInput() {
    document.body.addEventListener('change', (e) => {
      if (e.target.matches('.file-upload input[type="file"]')) {
        const file = e.target.files[0];
        if (file) this.handleFile(file);
      }
    });
    logger.debug('setupFileInput: Initialized');
  },

  setupDragDrop() {
    document.body.addEventListener('dragover', (e) => {
      if (e.target.closest('.file-upload')) {
        e.preventDefault();
        e.target.closest('.file-upload').classList.add('active');
      }
    });
    document.body.addEventListener('dragleave', (e) => {
      if (e.target.closest('.file-upload')) {
        e.preventDefault();
        e.target.closest('.file-upload').classList.remove('active');
      }
    });
    document.body.addEventListener('drop', (e) => {
      if (e.target.closest('.file-upload')) {
        e.preventDefault();
        e.target.closest('.file-upload').classList.remove('active');
        const file = e.dataTransfer.files[0];
        if (file) this.handleFile(file);
      }
    });
  },

  setupEventListeners() {
    if (eventListenersSetup) {
      logger.debug('FileLoader: Event listeners already set up, skipping');
      return;
    }
    eventListenersSetup = true;
    // Listen for file load requests from UI
    document.addEventListener('fileLoadRequested', (e) => {
      logger.debug('FileLoader: fileLoadRequested event received');
      this.showFileUploadDialogue();
    });
    // Listen for demo story load requests
    document.addEventListener('demoStoryLoadRequested', (e) => {
      logger.debug('FileLoader: Demo story load requested');
      if (e.detail && e.detail.story) {
        this.loadDemoStory(e.detail.story);
      }
    });
  },

  showFileUploadDialogue() {
    logger.debug('FileLoader: Showing file upload dialogue');
    if (fileUploadDialogueOpen) {
      logger.debug('FileLoader: File upload dialogue already open, ignoring');
      return;
    }
    fileUploadDialogueOpen = true;
    if (window.DialogueSystem) {
      window.DialogueSystem.createFileUploadDialogue({
        onFileSelect: (file) => {
          fileUploadDialogueOpen = false;
          if (file) {
            this.handleFile(file);
          }
        },
        onClose: () => {
          fileUploadDialogueOpen = false;
        }
      });
    } else {
      logger.error('FileLoader: DialogueSystem not available');
      fileUploadDialogueOpen = false;
    }
  },

  loadDemoStory(demoStory) {
    logger.debug('FileLoader: Loading demo story');
    if (window.corePlayer && typeof window.corePlayer.loadStory === 'function') {
      // Convert demo story object to CosLang format
      const coslangText = this.convertDemoToCosLang(demoStory);
      window.corePlayer.loadStory(coslangText);
    } else {
      logger.error('FileLoader: corePlayer.loadStory not available');
    }
  },

  convertDemoToCosLang(demoStory) {
    logger.debug('FileLoader: Converting demo story to CosLang format');
    
    let coslang = `#META
Title = ${demoStory.meta.title}
Author = ${demoStory.meta.author}
Language = ${demoStory.meta.language}

`;

    // Convert scenes to CosLang format
    Object.entries(demoStory.scenes).forEach(([sceneId, scene]) => {
      coslang += `#SCENE ${sceneId}
TEXT:
${scene.text}

`;

      if (scene.choices && scene.choices.length > 0) {
        coslang += `CHOICES:
`;
        scene.choices.forEach(choice => {
          coslang += `- ${choice.text} => ${choice.target}
`;
        });
      }
      
      coslang += `
`;
    });

    return coslang;
  },

  handleFile(file) {
    try {
      if (!file.name.endsWith('.coslang')) {
        logger.error('Only .coslang files are supported');
        alert('Please upload a valid .coslang Coslang file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          logger.debug('File loaded, passing to corePlayer...');
          if (window.corePlayer && typeof window.corePlayer.loadStory === 'function') {
            window.corePlayer.loadStory(text);
          } else {
            logger.debug('corePlayer.loadStory not found');
          }
        } catch (error) {
          logger.error('Error processing file content:', error);
          alert('Error processing file content');
        }
      };
      
      reader.onerror = () => {
        logger.error('Error reading file');
        alert('Error reading file');
      };
      
      reader.readAsText(file);
      logger.debug('Reading file', file.name);
    } catch (error) {
      logger.error('Error handling file:', error);
      alert('Error handling file');
    }
  },

  // Export function for use by other modules
  loadStoryFile(file) {
    logger.debug('loadStoryFile called with', file.name);
    this.handleFile(file);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => fileLoader.init());
} else {
  fileLoader.init();
}

// Export the loadStoryFile function
export { fileLoader }; 