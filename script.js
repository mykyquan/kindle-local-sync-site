// script.js
document.addEventListener('DOMContentLoaded', () => {
  // Language Toggle — cycles English -> Simplified -> Traditional -> English.
  // label is the language you are reading now; title/aria-label say where the
  // next click goes. Keeping both in one table stops them drifting apart.
  const LANGS = [
    { code: 'en',    label: 'EN', next: 'Switch to Simplified Chinese' },
    { code: 'zh-CN', label: '简', next: '切换到繁体中文' },
    { code: 'zh-TW', label: '繁', next: '切換至英文' },
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

  const setMenuOpen = (isExpanded, { returnFocus = false } = {}) => {
    mobileMenu.classList.toggle('active', isExpanded);
    menuToggle.setAttribute('aria-expanded', isExpanded);
    mobileMenu.setAttribute('aria-hidden', !isExpanded);
    mobileMenu.toggleAttribute('inert', !isExpanded);
    document.body.classList.toggle('menu-open', isExpanded);

    if (isExpanded) {
      menuToggle.innerHTML = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
      mobileLinks[0]?.focus();
    } else {
      menuToggle.innerHTML = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
      if (returnFocus) menuToggle.focus();
    }
  };

  if(menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      setMenuOpen(!mobileMenu.classList.contains('active'));
    });
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (!mobileMenu.classList.contains('active')) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false, { returnFocus: true });
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = [menuToggle, ...mobileLinks];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
        setMenuOpen(false);
      }
    });
  }

  // Intersection Observer for Scroll Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const revealElements = document.querySelectorAll(
    '.reveal-fade-up, .reveal-zoom, .reveal-slide-right, .reveal-slide-left'
  );

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
});
