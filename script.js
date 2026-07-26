// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Language Toggle — cycles English -> Simplified -> Traditional -> English.
  // label is the language you are reading now; title/aria-label say where the
  // next click goes. Keeping both in one table stops them drifting apart.
  const LANGS = [
    { code: 'en',    label: 'EN', next: 'Switch to Simplified Chinese' },
    { code: 'zh-CN', label: '简', next: 'Switch to Traditional Chinese' },
    { code: 'zh-TW', label: '繁', next: 'Switch to English' },
  ];

  const langToggleBtn = document.getElementById('langToggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('lang');
      const i = LANGS.findIndex(l => l.code === current);
      const lang = LANGS[(i + 1) % LANGS.length];

      document.documentElement.setAttribute('lang', lang.code);
      langToggleBtn.textContent = lang.label;
      langToggleBtn.title = lang.next;
      langToggleBtn.setAttribute('aria-label', lang.next);
    });
  }

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const toggleMenu = () => {
    mobileMenu.classList.toggle('active');
    const isExpanded = mobileMenu.classList.contains('active');
    menuToggle.setAttribute('aria-expanded', isExpanded);
    if (isExpanded) {
      menuToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    } else {
      menuToggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    }
  };

  if(menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => {
      link.addEventListener('click', toggleMenu);
    });
  }

  // Intersection Observer for Scroll Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll(
    '.reveal-fade-up, .reveal-zoom, .reveal-slide-right, .reveal-slide-left'
  );
  revealElements.forEach(el => observer.observe(el));
});
