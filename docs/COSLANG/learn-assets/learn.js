// CosLang Learn Page JavaScript - Modernized for Accessibility & EdTech Quality

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.setAttribute('aria-label', 'Open navigation menu');
        mobileMenuToggle.setAttribute('tabindex', '0');
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            sidebar.setAttribute('aria-expanded', sidebar.classList.contains('open'));
        });
        mobileMenuToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                sidebar.classList.toggle('open');
                sidebar.setAttribute('aria-expanded', sidebar.classList.contains('open'));
            }
        });
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                sidebar.classList.remove('open');
                sidebar.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.setAttribute('tabindex', '0');
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                if (sidebar) sidebar.classList.remove('open');
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.pushState(null, null, targetId);
            }
        });
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                this.click();
            }
        });
    });

    // Active navigation highlighting (debounced)
    function updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const scrollPosition = window.scrollY;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    window.addEventListener('scroll', debounce(updateActiveNav, 50));
    updateActiveNav();

    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash;
        if (hash) {
            const targetSection = document.querySelector(hash);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    // --- Syntax Highlighting for Coslang ---
    function highlightCoslang(code) {
        // Basic Coslang syntax highlighting
        return code
            // Comments
            .replace(/(^|\s)(#.*)/gm, '$1<span class="coslang-comment">$2</span>')
            // Strings
            .replace(/("[^"]*")/g, '<span class="coslang-string">$1</span>')
            // Keywords
            .replace(/\b(scene|assets|vars|set|if|else|macro|choice|text|play|show|audio|image|video|inventory|event|achievement|call)\b/g, '<span class="coslang-keyword">$1</span>')
            // Numbers
            .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="coslang-number">$1</span>')
            // Variable interpolation
            .replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, '<span class="coslang-var">{$1}</span>')
            // Choices ("Choice text" -> target)
            .replace(/choice\s+"([^"]+)"\s*->\s*(\w+)/g, 'choice <span class="coslang-choice-text">"$1"</span> -&gt; <span class="coslang-choice-target">$2</span>')
            // Tags ([TAG:...])
            .replace(/\[(ACHIEVEMENT|EVENT|LOG|inventory [+-]{2}|[A-Z_]+):?([^\]]*)\]/g, '<span class="coslang-tag">[$1$2]</span>');
    }

    // Enhance all code blocks
    function enhanceCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
            // Only enhance once
            if (block.classList.contains('coslang-enhanced')) return;
            block.classList.add('coslang-enhanced');
            // Syntax highlighting
            block.innerHTML = highlightCoslang(block.textContent);
        // Add line numbers
        const lines = block.textContent.split('\n');
        if (lines.length > 1) {
            const lineNumbers = document.createElement('div');
            lineNumbers.className = 'line-numbers';
                lineNumbers.setAttribute('aria-hidden', 'true');
            lineNumbers.innerHTML = lines.map((_, i) => `<span>${i + 1}</span>`).join('');
            const wrapper = document.createElement('div');
            wrapper.className = 'code-wrapper';
            wrapper.appendChild(lineNumbers);
            wrapper.appendChild(block.cloneNode(true));
            block.parentNode.replaceChild(wrapper, block);
        }
    });
    }
    enhanceCodeBlocks();

    // Add copy button to all code blocks
    function addCopyButtons() {
        const codeBlocks = document.querySelectorAll('pre');
        codeBlocks.forEach(pre => {
            if (pre.querySelector('.copy-button')) return;
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
            copyButton.setAttribute('aria-label', 'Copy code');
            copyButton.setAttribute('tabindex', '0');
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.title = 'Copy code';
        copyButton.addEventListener('click', function() {
                const code = pre.innerText;
            navigator.clipboard.writeText(code).then(() => {
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                copyButton.title = 'Copied!';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    copyButton.title = 'Copy code';
                }, 2000);
            });
        });
            copyButton.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    copyButton.click();
                }
            });
        pre.style.position = 'relative';
        pre.appendChild(copyButton);
    });
    }
    addCopyButtons();

    // Add CSS for syntax highlighting and copy button
    const style = document.createElement('style');
    style.textContent = `
        .coslang-comment { color: #7eaa7c; font-style: italic; }
        .coslang-string { color: #ffd43b; }
        .coslang-keyword { color: #4dabf7; font-weight: bold; }
        .coslang-number { color: #ffca28; }
        .coslang-var { color: #fc5c7d; font-weight: bold; }
        .coslang-choice-text { color: #66bb6a; }
        .coslang-choice-target { color: #7e57c2; }
        .coslang-tag { color: #ffca28; font-weight: bold; }
        .copy-button {
            position: absolute;
            top: 8px;
            right: 8px;
            background: #2a3140;
            border: 1px solid #3a4150;
            color: #b0cfff;
            padding: 6px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.2s ease;
            z-index: 2;
        }
        .copy-button:focus { outline: 2px solid #ffd43b; }
        .copy-button:hover {
            background: #3a4150;
            color: #58a6ff;
        }
        .code-wrapper {
            display: flex;
            background: #232a36;
            border-radius: 8px;
            overflow: hidden;
        }
        .line-numbers {
            background: #1a1f2a;
            padding: 20px 12px 20px 20px;
            border-right: 1px solid #2a3140;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.9rem;
            color: #6a737d;
            user-select: none;
        }
        .line-numbers span {
            display: block;
            line-height: 1.5;
        }
        .code-wrapper pre {
            margin: 0;
            border: none;
            border-radius: 0;
            flex: 1;
        }
    `;
    document.head.appendChild(style);

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Escape key closes mobile menu
        if (e.key === 'Escape' && sidebar) {
            sidebar.classList.remove('open');
        }
        // Ctrl/Cmd + K opens search
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            showSearchModal();
        }
    });

    // --- In-page Search Modal ---
    function showSearchModal() {
        if (document.getElementById('searchModal')) return;
        const modal = document.createElement('div');
        modal.id = 'searchModal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(20,20,30,0.85)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div style="background:#23244a;padding:2em 2.5em;border-radius:12px;max-width:420px;width:90vw;box-shadow:0 4px 32px #0008;">
                <input id="searchInput" type="text" placeholder="Search sections or keywords..." style="width:100%;padding:0.8em 1em;font-size:1.1em;border-radius:6px;border:1px solid #4dabf7;margin-bottom:1.2em;outline:none;" aria-label="Search Coslang documentation">
                <div id="searchResults" style="max-height:260px;overflow-y:auto;"></div>
                <button id="closeSearch" style="margin-top:1em;background:#4dabf7;color:#fff;padding:0.6em 1.2em;border:none;border-radius:6px;cursor:pointer;">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        const input = document.getElementById('searchInput');
        const results = document.getElementById('searchResults');
        const closeBtn = document.getElementById('closeSearch');
        input.focus();
        input.addEventListener('input', function() {
            const val = input.value.toLowerCase();
            const matches = [];
            document.querySelectorAll('section[id], h2, h3, h4').forEach(el => {
                if (el.textContent.toLowerCase().includes(val)) {
                    matches.push({
                        text: el.textContent,
                        id: el.getAttribute('id') || el.closest('section')?.getAttribute('id')
                    });
                }
            });
            results.innerHTML = matches.length ? matches.map(m => `<div class="search-result" tabindex="0" data-id="${m.id}">${m.text}</div>`).join('') : '<div style="color:#aaa;">No results found.</div>';
            results.querySelectorAll('.search-result').forEach(res => {
                res.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    if (id) {
                        document.getElementById('searchModal').remove();
                        const target = document.getElementById(id);
                        if (target) target.scrollIntoView({behavior:'smooth',block:'start'});
                    }
                });
                res.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') this.click();
                });
            });
        });
        closeBtn.addEventListener('click', () => modal.remove());
        closeBtn.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') modal.remove(); });
        modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
        document.addEventListener('keydown', function escListener(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escListener);
            }
        });
    }

    // --- Expand/Collapse for Advanced Sections (if present) ---
    document.querySelectorAll('.expandable').forEach(section => {
        const header = section.querySelector('.expand-header');
        if (header) {
            header.setAttribute('tabindex', '0');
            header.setAttribute('role', 'button');
            header.setAttribute('aria-expanded', 'false');
            header.addEventListener('click', function() {
                section.classList.toggle('expanded');
                header.setAttribute('aria-expanded', section.classList.contains('expanded'));
            });
            header.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') header.click();
            });
        }
    });

    // Accessibility: ARIA roles for main content
    const main = document.querySelector('main.content');
    if (main) {
        main.setAttribute('role', 'main');
    }
    if (sidebar) {
        sidebar.setAttribute('role', 'navigation');
        sidebar.setAttribute('aria-label', 'CosLang documentation navigation');
    }

    // --- Initialize Enhanced Scrollbar System ---
    if (window.ScrollbarSystem) {
        const scrollbarSystem = new window.ScrollbarSystem();
        scrollbarSystem.initialize();
    }
}); 