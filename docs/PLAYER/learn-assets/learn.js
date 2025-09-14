// Minimal JS for COSMOSX Player Learn Page

document.addEventListener('DOMContentLoaded', function () {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Highlight active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    function setActiveLink() {
        navLinks.forEach(link => link.classList.remove('active'));
        const hash = window.location.hash;
        if (hash) {
            const active = document.querySelector('.nav-link[href="' + hash + '"]');
            if (active) active.classList.add('active');
        }
    }
    window.addEventListener('hashchange', setActiveLink);
    setActiveLink();
}); 