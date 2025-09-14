// IDE Actions Module
// Handles main actions for the CosmosX IDE
import { openCoslangFile } from './ide-modules/file-ops.js';

export function saveStory(ide) {
  ide.showNotification('Story saved!', 'success');
  ide.addDebugLogEntry('Story saved', 'success');
}

export function openStory(ide) {
  openCoslangFile(ide);
}

export function newStory(ide) {
  ide.showNotification('New story created (not yet implemented)', 'info');
  ide.addDebugLogEntry('New story created', 'info');
}

export function exportStory(ide) {
  ide.showNotification('Export story (not yet implemented)', 'info');
  ide.addDebugLogEntry('Export story triggered', 'info');
}

export function renameFile(ide) {
  if (ide.fileOperations) {
    ide.fileOperations.renameFile();
  } else {
    ide.showNotification('Rename file (not yet implemented)', 'info');
    ide.addDebugLogEntry('Rename file triggered', 'info');
  }
}

export function duplicateFile(ide) {
  if (ide.fileOperations) {
    ide.fileOperations.duplicateFile();
  } else {
    ide.showNotification('Duplicate file (not yet implemented)', 'info');
    ide.addDebugLogEntry('Duplicate file triggered', 'info');
  }
}

export function deleteFile(ide) {
  if (ide.fileOperations) {
    ide.fileOperations.deleteFile();
  } else {
    ide.showNotification('Delete file (not yet implemented)', 'info');
    ide.addDebugLogEntry('Delete file triggered', 'info');
  }
}

export function startPreview(ide) {
  ide.showNotification('Preview started (not yet implemented)', 'info');
  ide.addDebugLogEntry('Preview started', 'info');
} 