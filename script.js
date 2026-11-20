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

      const demoControl = document.getElementById('demoMotionToggle');
      const controlState = demoControl?.dataset.state || 'play';
      const localizedControlLabel = demoControl?.getAttribute(`data-label-${controlState}-${lang.code.toLowerCase()}`);
      if (localizedControlLabel) {
        demoControl.setAttribute('aria-label', localizedControlLabel);
        demoControl.title = localizedControlLabel;
      }
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
  const demoPauseIcon = demoMotionToggle?.querySelector('.demo-pause-icon');
  const demoPlayIcon = demoMotionToggle?.querySelector('.demo-play-icon');
  const demoReplayIcon = demoMotionToggle?.querySelector('.demo-replay-icon');

  if (demoVideo && demoMotionToggle) {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let userPaused = false;
    let pausedForMotion = false;

    const updateDemoControl = () => {
      const isEnded = demoVideo.ended;
      const isPlaying = !demoVideo.paused && !isEnded;
      const state = isEnded ? 'replay' : isPlaying ? 'pause' : 'play';
      const language = document.documentElement.lang.toLowerCase();
      const label = demoMotionToggle.getAttribute(`data-label-${state}-${language}`);

      demoMotionToggle.dataset.state = state;
      demoPauseIcon.hidden = state !== 'pause';
      demoPlayIcon.hidden = state !== 'play';
      demoReplayIcon.hidden = state !== 'replay';
      if (label) {
        demoMotionToggle.setAttribute('aria-label', label);
        demoMotionToggle.title = label;
      }
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

  // Product media shares one viewport-aware preview behavior. Transforming the
  // existing element keeps video playback and image requests unchanged.
  const mediaPreviews = document.querySelectorAll('.media-preview');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activePreview = null;

  const getLayoutRect = (element) => {
    let left = 0;
    let top = 0;
    let current = element;

    while (current) {
      left += current.offsetLeft;
      top += current.offsetTop;
      current = current.offsetParent;
    }

    return {
      left: left - window.scrollX,
      top: top - window.scrollY,
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  };

  const getVisibleMedia = (preview) => [...preview.querySelectorAll('video, img')]
    .find(media => getComputedStyle(media).display !== 'none' && media.getClientRects().length > 0);

  const updatePreviewGeometry = (preview) => {
    const media = getVisibleMedia(preview);
    if (!media) return;

    const rect = getLayoutRect(preview);
    const headerBottom = document.querySelector('.header')?.getBoundingClientRect().bottom || 0;
    const topInset = Math.max(16, headerBottom + 16);
    const bottomInset = 16;
    const availableHeight = Math.max(1, window.innerHeight - topInset - bottomInset);
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = Math.min(window.innerHeight * 0.8, availableHeight);
    const naturalWidth = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
    const naturalHeight = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;
    const intrinsicScale = naturalWidth && naturalHeight
      ? Math.min(naturalWidth / media.clientWidth, naturalHeight / media.clientHeight)
      : Infinity;
    const scale = Math.max(1, Math.min(maxWidth / rect.width, maxHeight / rect.height, intrinsicScale));

    if (scale <= 1.005) {
      preview.style.setProperty('--preview-scale', '1');
      preview.style.setProperty('--preview-x', '0px');
      preview.style.setProperty('--preview-y', '0px');
      preview.style.setProperty('--preview-control-scale', '1');
      return;
    }

    const targetCenterX = window.innerWidth / 2;
    const targetCenterY = topInset + availableHeight / 2;
    const currentCenterX = rect.left + rect.width / 2;
    const currentCenterY = rect.top + rect.height / 2;

    preview.style.setProperty('--preview-scale', scale.toFixed(4));
    preview.style.setProperty('--preview-x', `${(targetCenterX - currentCenterX).toFixed(2)}px`);
    preview.style.setProperty('--preview-y', `${(targetCenterY - currentCenterY).toFixed(2)}px`);
    preview.style.setProperty('--preview-control-scale', (1 / scale).toFixed(4));
  };

  const closePreview = () => {
    if (!activePreview) return;
    activePreview.classList.remove('is-previewing');
    activePreview.closest('section')?.classList.remove('has-active-preview');
    activePreview = null;
  };

  const openPreview = (preview) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    if (activePreview && activePreview !== preview) closePreview();
    activePreview = preview;
    updatePreviewGeometry(preview);
    preview.closest('section')?.classList.add('has-active-preview');
    preview.classList.add('is-previewing');
  };

  mediaPreviews.forEach(preview => {
    preview.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') openPreview(preview);
    });
  });

  document.addEventListener('pointermove', (event) => {
    if (!activePreview) return;

    const base = getLayoutRect(activePreview);
    const transformed = activePreview.getBoundingClientRect();
    const edge = 8;
    const insidePreviewPath = event.clientX >= Math.min(base.left, transformed.left) - edge
      && event.clientX <= Math.max(base.left + base.width, transformed.right) + edge
      && event.clientY >= Math.min(base.top, transformed.top) - edge
      && event.clientY <= Math.max(base.top + base.height, transformed.bottom) + edge;

    if (!insidePreviewPath) closePreview();
  });

  const refreshActivePreview = () => {
    if (activePreview) updatePreviewGeometry(activePreview);
  };

  window.addEventListener('resize', refreshActivePreview);
  window.addEventListener('scroll', refreshActivePreview, { passive: true });
  finePointer.addEventListener?.('change', () => {
    if (!finePointer.matches) closePreview();
  });
  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) closePreview();
  });

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
