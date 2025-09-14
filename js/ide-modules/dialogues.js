// IDE Dialogues Module
// Handles dialogue events, display, and logic for CosmosX IDE

export class DialogueManager {
  constructor() {
    this.dialogues = [];
    this.activeDialogue = null;
  }

  // Add a dialogue event
  addDialogue(dialogue) {
    this.dialogues.push(dialogue);
  }

  // Trigger a dialogue by ID or object
  triggerDialogue(idOrObj) {
    if (typeof idOrObj === 'string') {
      this.activeDialogue = this.dialogues.find(d => d.id === idOrObj) || null;
    } else {
      this.activeDialogue = idOrObj;
    }
    if (this.activeDialogue) {
      this.renderDialogue(this.activeDialogue);
    }
  }

  // Render the dialogue (shows a modal in the DOM)
  renderDialogue(dialogue) {
    // Remove any existing modal
    const oldModal = document.getElementById('cosmosx-dialogue-modal');
    if (oldModal) oldModal.remove();

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'cosmosx-dialogue-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(24,28,34,0.82)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10050';

    // Modal content
    const content = document.createElement('div');
    content.style.background = '#232a36';
    content.style.borderRadius = '14px';
    content.style.boxShadow = '0 4px 32px #000a';
    content.style.padding = '32px 40px';
    content.style.maxWidth = '420px';
    content.style.textAlign = 'center';
    content.style.color = '#e6eaf3';
    content.innerHTML = `
      <div style="font-size:1.18rem;margin-bottom:18px;">${dialogue.text || ''}</div>
      <button id="cosmosx-dialogue-ok" style="margin-top:18px;padding:10px 28px;border-radius:8px;background:#58a6ff;color:#fff;font-size:1.08rem;border:none;cursor:pointer;">OK</button>
    `;
    modal.appendChild(content);
    document.body.appendChild(modal);

    // OK button closes modal
    document.getElementById('cosmosx-dialogue-ok').onclick = () => {
      modal.remove();
      this.clearDialogue();
    };
  }

  // Show an input dialogue (for rename, etc.)
  showInputDialogue({ title, label, value, okText = 'OK', cancelText = 'Cancel', onOk, onCancel }) {
    const oldModal = document.getElementById('cosmosx-dialogue-modal');
    if (oldModal) oldModal.remove();
    const modal = document.createElement('div');
    modal.id = 'cosmosx-dialogue-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(24,28,34,0.82)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10050';
    const content = document.createElement('div');
    content.style.background = '#232a36';
    content.style.borderRadius = '14px';
    content.style.boxShadow = '0 4px 32px #000a';
    content.style.padding = '32px 40px';
    content.style.maxWidth = '420px';
    content.style.textAlign = 'center';
    content.style.color = '#e6eaf3';
    content.innerHTML = `
      <div style="font-size:1.18rem;margin-bottom:18px;">${title || ''}</div>
      <input id="cosmosx-dialogue-input" type="text" value="${value || ''}" placeholder="${label || ''}" style="width:90%;padding:10px 12px;border-radius:7px;border:none;font-size:1.08rem;margin-bottom:18px;background:#181c22;color:#e6eaf3;" />
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="cosmosx-dialogue-cancel" style="padding:10px 24px;border-radius:8px;background:#30363d;color:#fff;font-size:1.08rem;border:none;cursor:pointer;">${cancelText}</button>
        <button id="cosmosx-dialogue-ok" style="padding:10px 24px;border-radius:8px;background:#58a6ff;color:#fff;font-size:1.08rem;border:none;cursor:pointer;">${okText}</button>
      </div>
    `;
    modal.appendChild(content);
    document.body.appendChild(modal);
    const input = document.getElementById('cosmosx-dialogue-input');
    setTimeout(() => { if (input) input.focus(); }, 100);
    document.getElementById('cosmosx-dialogue-cancel').onclick = () => {
      modal.remove();
      if (onCancel) onCancel();
    };
    document.getElementById('cosmosx-dialogue-ok').onclick = () => {
      const val = input.value.trim();
      modal.remove();
      if (onOk) onOk(val);
    };
  }

  // Show a confirm dialogue (for delete, etc.)
  showConfirmDialogue({ title, message, okText = 'OK', cancelText = 'Cancel', onOk, onCancel }) {
    const oldModal = document.getElementById('cosmosx-dialogue-modal');
    if (oldModal) oldModal.remove();
    const modal = document.createElement('div');
    modal.id = 'cosmosx-dialogue-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(24,28,34,0.82)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10050';
    const content = document.createElement('div');
    content.style.background = '#232a36';
    content.style.borderRadius = '14px';
    content.style.boxShadow = '0 4px 32px #000a';
    content.style.padding = '32px 40px';
    content.style.maxWidth = '420px';
    content.style.textAlign = 'center';
    content.style.color = '#e6eaf3';
    content.innerHTML = `
      <div style="font-size:1.18rem;margin-bottom:18px;">${title || ''}</div>
      <div style="margin-bottom:18px;">${message || ''}</div>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="cosmosx-dialogue-cancel" style="padding:10px 24px;border-radius:8px;background:#30363d;color:#fff;font-size:1.08rem;border:none;cursor:pointer;">${cancelText}</button>
        <button id="cosmosx-dialogue-ok" style="padding:10px 24px;border-radius:8px;background:#f44336;color:#fff;font-size:1.08rem;border:none;cursor:pointer;">${okText}</button>
      </div>
    `;
    modal.appendChild(content);
    document.body.appendChild(modal);
    document.getElementById('cosmosx-dialogue-cancel').onclick = () => {
      modal.remove();
      if (onCancel) onCancel();
    };
    document.getElementById('cosmosx-dialogue-ok').onclick = () => {
      modal.remove();
      if (onOk) onOk();
    };
  }

  // Clear the active dialogue
  clearDialogue() {
    this.activeDialogue = null;
    // TODO: Hide dialogue UI if implemented
  }

  // --- Modern System Message/Notification Dialog ---
  static showSystemMessage(type = 'info', message = '', options = {}) {
    // Remove any existing system message
    const oldMsg = document.getElementById('cosmosx-system-message');
    if (oldMsg) oldMsg.remove();
    // Color/icon by type
    const config = {
      info:   { color: '#58a6ff', icon: 'info-circle' },
      warning:{ color: '#ffd24e', icon: 'exclamation-circle' },
      error:  { color: '#f44336', icon: 'exclamation-triangle' }
    };
    const { color, icon } = config[type] || config.info;
    // Create message box
    const msg = document.createElement('div');
    msg.id = 'cosmosx-system-message';
    msg.style.position = 'fixed';
    msg.style.top = '32px';
    msg.style.right = '32px';
    msg.style.background = '#232a36';
    msg.style.color = color;
    msg.style.opacity = '0.93';
    msg.style.borderRadius = '12px';
    msg.style.boxShadow = '0 4px 24px #000a';
    msg.style.padding = '18px 32px';
    msg.style.zIndex = '10060';
    msg.style.display = 'flex';
    msg.style.alignItems = 'center';
    msg.style.gap = '16px';
    msg.style.fontSize = '1.08rem';
    msg.style.fontWeight = '500';
    msg.style.maxWidth = '420px';
    msg.style.transition = 'opacity 0.2s';
    msg.innerHTML = `
      <i class="fas fa-${icon}" style="font-size:1.4em;"></i>
      <span style="flex:1;">${message}</span>
      <button style="background:none;border:none;color:${color};font-size:1.2em;cursor:pointer;opacity:0.7;" onclick="this.parentElement.remove()">&times;</button>
    `;
    document.body.appendChild(msg);
    // Auto-remove after duration (default 4s)
    setTimeout(() => { if (msg.parentElement) msg.remove(); }, options.duration || 4000);
  }
}

// Example usage (to be removed in production):
// const dm = new DialogueManager();
// dm.addDialogue({ id: 'welcome', text: 'Welcome to CosmosX IDE!' });
// dm.triggerDialogue('welcome'); 