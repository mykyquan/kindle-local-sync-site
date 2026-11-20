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

      const demo = document.getElementById('heroDemo');
      const localizedDemoLabel = demo?.getAttribute(`data-label-${lang.code.toLowerCase()}`);
      if (localizedDemoLabel) demo.setAttribute('aria-label', localizedDemoLabel);
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

  // Start the demo only when motion is welcome. The custom control follows the
  // media element's real state, including autoplay rejection and completion.
  const demoVideo = document.getElementById('heroDemo');
  const demoMotionToggle = document.getElementById('demoMotionToggle');
  const demoPauseLabel = demoMotionToggle?.querySelector('.demo-pause-label');
  const demoPlayLabel = demoMotionToggle?.querySelector('.demo-play-label');
  const demoReplayLabel = demoMotionToggle?.querySelector('.demo-replay-label');

  if (demoVideo && demoMotionToggle) {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let userPaused = false;
    let pausedForMotion = false;

    const updateDemoControl = () => {
      const isEnded = demoVideo.ended;
      const isPlaying = !demoVideo.paused && !isEnded;
      demoPauseLabel.hidden = !isPlaying;
      demoPlayLabel.hidden = isPlaying || isEnded;
      demoReplayLabel.hidden = !isEnded;
    };

    demoMotionToggle.addEventListener('click', () => {
      if (!demoVideo.paused && !demoVideo.ended) {
        userPaused = true;
        demoVideo.pause();
        return;
      }

      userPaused = false;
      if (demoVideo.ended) demoVideo.currentTime = 0;
      demoVideo.play().catch(updateDemoControl);
    });

    demoVideo.addEventListener('play', updateDemoControl);
    demoVideo.addEventListener('pause', updateDemoControl);
    demoVideo.addEventListener('ended', updateDemoControl);
    demoVideo.addEventListener('error', () => {
      demoMotionToggle.disabled = true;
      updateDemoControl();
    });

    const handleMotionPreference = (event) => {
      if (event.matches) {
        pausedForMotion = !demoVideo.paused;
        demoVideo.pause();
      } else if (pausedForMotion && !userPaused) {
        pausedForMotion = false;
        demoVideo.play().catch(updateDemoControl);
      }
    };

    motionPreference.addEventListener?.('change', handleMotionPreference);
    updateDemoControl();

    if (!motionPreference.matches) {
      demoVideo.play().catch(updateDemoControl);
    }
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
