// IDE File Operations Module
// Handles file open logic for CosmosX IDE

export function openCoslangFile(ide) {
  // Create a hidden file input if not already present
  let fileInput = document.getElementById('cosmosx-file-input');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.coslang';
    fileInput.style.display = 'none';
    fileInput.id = 'cosmosx-file-input';
    document.body.appendChild(fileInput);
  }

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    if (ide.editor) {
      ide.editor.setValue(text);
      ide.showNotification(`Loaded <b>${file.name}</b>`, 'success');
      ide.addDebugLogEntry(`Loaded file: ${file.name}`, 'success');
    }
    fileInput.value = '';
  };

  fileInput.click();
} 