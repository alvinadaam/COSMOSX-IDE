// CosmosX IDE Enhanced UI Logic
// Handles tab switching, help menu, scene selection, and button animation

document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            // Add active class to clicked tab
            tab.classList.add('active');
            // Hide all tab panes
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            // Show the corresponding tab pane
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Help menu toggle
    const helpBtn = document.getElementById('help-btn');
    const helpMenu = document.getElementById('help-menu');
    if (helpBtn && helpMenu) {
        helpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            helpMenu.style.display = helpMenu.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', (e) => {
            if (helpMenu.style.display === 'block' &&
                !helpMenu.contains(e.target) &&
                !helpBtn.contains(e.target)) {
                helpMenu.style.display = 'none';
            }
        });
    }

    // Scene item selection (dynamic, so use event delegation)
    const sceneList = document.getElementById('scene-list');
    if (sceneList) {
        sceneList.addEventListener('click', (e) => {
            let item = e.target;
            while (item && !item.classList.contains('scene-item') && item !== sceneList) {
                item = item.parentElement;
            }
            if (item && item.classList.contains('scene-item')) {
                sceneList.querySelectorAll('.scene-item').forEach(i => {
                    i.classList.remove('active');
                });
                item.classList.add('active');
            }
        });
    }

    // Button animation
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(1px)';
        });
        button.addEventListener('mouseup', () => {
            button.style.transform = '';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
}); 