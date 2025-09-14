// scenes-advanced.js
// Advanced features for the Scenes panel: live search/filter, sorting, and quick actions.

/**
 * Filter scenes by search term (name, tags, description)
 * @param {Array} scenes - List of scene objects
 * @param {string} searchTerm - User input
 * @returns {Array} Filtered scenes
 */
export function filterScenes(scenes, searchTerm) {
    if (!searchTerm) return scenes;
    const term = searchTerm.toLowerCase();
    return scenes.filter(scene => {
        if (scene.id && scene.id.toLowerCase().includes(term)) return true;
        if (scene.description && scene.description.toLowerCase().includes(term)) return true;
        if (scene.meta && scene.meta.tags) {
            const tags = Array.isArray(scene.meta.tags) ? scene.meta.tags : [scene.meta.tags];
            if (tags.some(tag => tag && tag.toLowerCase().includes(term))) return true;
        }
        return false;
    });
}

/**
 * Sort scenes by a given key (id, meta.title, etc.)
 * @param {Array} scenes
 * @param {string} key - e.g. 'id', 'meta.title'
 * @param {boolean} [asc=true]
 * @returns {Array}
 */
export function sortScenes(scenes, key = 'id', asc = true) {
    return [...scenes].sort((a, b) => {
        let aVal = key.split('.').reduce((o, k) => (o ? o[k] : undefined), a) || '';
        let bVal = key.split('.').reduce((o, k) => (o ? o[k] : undefined), b) || '';
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
        if (aVal < bVal) return asc ? -1 : 1;
        if (aVal > bVal) return asc ? 1 : -1;
        return 0;
    });
}

/**
 * Generate quick action buttons for a scene (duplicate, delete, rename)
 * @param {object} scene
 * @param {function} onAction - callback(action, scene)
 * @returns {HTMLElement}
 */
export function createSceneQuickActions(scene, onAction) {
    const container = document.createElement('div');
    container.className = 'scene-quick-actions';
    container.style.display = 'flex';
    container.style.gap = '6px';
    container.style.marginTop = '4px';
    container.style.justifyContent = 'flex-end';
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', 'Scene quick actions');
    // Button base style
    const btnStyle = `
        background: #232a36;
        border: none;
        border-radius: 6px;
        color: #bfc9db;
        padding: 5px 8px;
        font-size: 1em;
        cursor: pointer;
        transition: background 0.15s, color 0.15s, box-shadow 0.15s;
        box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        outline: none;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    // Duplicate
    const dupBtn = document.createElement('button');
    dupBtn.className = 'scene-action-btn';
    dupBtn.title = 'Duplicate Scene';
    dupBtn.setAttribute('aria-label', 'Duplicate Scene');
    dupBtn.innerHTML = '<i class="fas fa-copy"></i>';
    dupBtn.style.cssText = btnStyle;
    dupBtn.onmouseenter = () => { dupBtn.style.background = '#2e86de'; dupBtn.style.color = '#fff'; };
    dupBtn.onmouseleave = () => { dupBtn.style.background = '#232a36'; dupBtn.style.color = '#bfc9db'; };
    dupBtn.onfocus = () => { dupBtn.style.boxShadow = '0 0 0 2px #2e86de'; };
    dupBtn.onblur = () => { dupBtn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; };
    dupBtn.onclick = e => { e.stopPropagation(); onAction('duplicate', scene); };
    container.appendChild(dupBtn);
    // Delete
    const delBtn = document.createElement('button');
    delBtn.className = 'scene-action-btn';
    delBtn.title = 'Delete Scene';
    delBtn.setAttribute('aria-label', 'Delete Scene');
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
    delBtn.style.cssText = btnStyle;
    delBtn.onmouseenter = () => { delBtn.style.background = '#f44336'; delBtn.style.color = '#fff'; };
    delBtn.onmouseleave = () => { delBtn.style.background = '#232a36'; delBtn.style.color = '#bfc9db'; };
    delBtn.onfocus = () => { delBtn.style.boxShadow = '0 0 0 2px #f44336'; };
    delBtn.onblur = () => { delBtn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; };
    delBtn.onclick = e => { e.stopPropagation(); onAction('delete', scene); };
    container.appendChild(delBtn);
    // Rename
    const renBtn = document.createElement('button');
    renBtn.className = 'scene-action-btn';
    renBtn.title = 'Rename Scene';
    renBtn.setAttribute('aria-label', 'Rename Scene');
    renBtn.innerHTML = '<i class="fas fa-edit"></i>';
    renBtn.style.cssText = btnStyle;
    renBtn.onmouseenter = () => { renBtn.style.background = '#58a6ff'; renBtn.style.color = '#fff'; };
    renBtn.onmouseleave = () => { renBtn.style.background = '#232a36'; renBtn.style.color = '#bfc9db'; };
    renBtn.onfocus = () => { renBtn.style.boxShadow = '0 0 0 2px #58a6ff'; };
    renBtn.onblur = () => { renBtn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; };
    renBtn.onclick = e => { e.stopPropagation(); onAction('rename', scene); };
    container.appendChild(renBtn);
    // Responsive: add a style tag for small screens
    if (!document.getElementById('scene-quick-actions-style')) {
        const style = document.createElement('style');
        style.id = 'scene-quick-actions-style';
        style.textContent = `
        @media (max-width: 700px) {
            .scene-quick-actions { gap: 2px !important; }
            .scene-action-btn { padding: 4px 5px !important; font-size: 0.95em !important; }
        }
        `;
        document.head.appendChild(style);
    }
    return container;
} 