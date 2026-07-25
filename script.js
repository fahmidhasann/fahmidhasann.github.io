/* Portfolio interactions: progressively enhanced; content remains usable without JS/CDNs. */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const modalState = { active: null, opener: null, locks: new Set(), inerted: [], focusFrame: 0, focusTimer: 0 };

  /** How long a filtered-out card fades before it is pulled out of the layout. */
  const CARD_FADE_MS = 280;
  /** Slack on top of the fade, for the browser to settle the new track width. */
  const FILTER_RELAYOUT_MS = 20;
  /** Last-resort reveal of the hero if an enhancer throws before it can run. */
  const HERO_FAILSAFE_MS = 2000;
  /** Stagger between hero name characters, then between the blocks below it. */
  const HERO_CHAR_STAGGER_MS = 45;
  const HERO_BLOCK_STAGGER_MS = 100;
  const HERO_BLOCK_LEAD_MS = 80;
  const HERO_CASCADE_TAIL_MS = 600;
  /** Matches the theme icon's swap animation, so the glyph changes while hidden. */
  const THEME_ICON_SWAP_MS = 90;
  /** Retry delay when a browser ignores the first focus call on a fresh dialog. */
  const DIALOG_FOCUS_RETRY_MS = 50;
  /** Confetti burst for the konami easter egg. */
  const CONFETTI_PIECES = 100;
  const CONFETTI_LIFETIME_MS = 5000;
  /** Web3Forms endpoint backing the contact form. */
  const CONTACT_ENDPOINT = 'https://api.web3forms.com/submit';

  document.addEventListener('DOMContentLoaded', () => {
    const runInit = (name, fn) => {
      try {
        fn();
      } catch (error) {
        console.error(`[portfolio] ${name} failed`, error);
      }
    };

    runInit('initializeTheme', initializeTheme);
    document.documentElement.classList.add('js-ready');
    window.setTimeout(() => document.documentElement.classList.add('hero-entered'), HERO_FAILSAFE_MS);

    runInit('initializeNavigation', initializeNavigation);
    runInit('initializeCarousels', initializeCarousels);
    runInit('initializeProjectFiltering', initializeProjectFiltering);
    runInit('initializeCommandPalette', initializeCommandPalette);
    runInit('initializeThemeToggle', initializeThemeToggle);
    runInit('initializeEditionSwitch', initializeEditionSwitch);
    runInit('initializeEditionChooser', initializeEditionChooser);
    runInit('initializeVideoPopup', initializeVideoPopup);
    runInit('initializeNavScroll', initializeNavScroll);
    runInit('initializeContactForm', initializeContactForm);
    runInit('initializeEasterEgg', initializeEasterEgg);
    runInit('initializeParticles', initializeParticles);
    runInit('initializeHeroEntrance', initializeHeroEntrance);
    runInit('initializeScrollEffects', initializeScrollEffects);
    runInit('initializeProgressBar', initializeProgressBar);
  });

  function motionReduced() {
    return prefersReducedMotion.matches;
  }

  function smoothBehavior() {
    return motionReduced() ? 'auto' : 'smooth';
  }

  /* --------------------------------------------------------------------------
     Coalesced scroll and resize dispatch

     Several features react to the same scroll or resize stream. Each one gets a
     subscription here instead of its own listener, so the page does at most one
     batch of layout reads per animation frame.
     -------------------------------------------------------------------------- */

  function createFrameDispatcher(eventName) {
    const subscribers = new Set();
    let frame = 0;

    const flush = () => {
      frame = 0;
      subscribers.forEach(subscriber => {
        try {
          subscriber();
        } catch (error) {
          console.error(`[portfolio] ${eventName} subscriber failed`, error);
        }
      });
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(flush);
    };

    return subscriber => {
      if (!subscribers.size) window.addEventListener(eventName, schedule, { passive: true });
      subscribers.add(subscriber);
      subscriber();
    };
  }

  const onScroll = createFrameDispatcher('scroll');
  const onResize = createFrameDispatcher('resize');

  /* --------------------------------------------------------------------------
     Shared accessibility helpers
     -------------------------------------------------------------------------- */

  function getFocusable(container) {
    return Array.from(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.hidden && el.getClientRects().length > 0);
  }

  function lockPage(key) {
    modalState.locks.add(key);
    document.body.classList.add('scroll-locked');
    document.body.style.overflow = 'hidden';
  }

  function unlockPage(key) {
    modalState.locks.delete(key);
    if (!modalState.locks.size) {
      document.body.classList.remove('scroll-locked');
      document.body.style.removeProperty('overflow');
    }
  }

  function setPageInert(exceptions) {
    clearPageInert();
    Array.from(document.body.children).forEach(child => {
      if (exceptions.includes(child) || child.tagName === 'SCRIPT' || child.tagName === 'STYLE') return;
      const wasInert = child.inert;
      const ariaHidden = child.getAttribute('aria-hidden');
      child.inert = true;
      child.setAttribute('aria-hidden', 'true');
      modalState.inerted.push({ child, wasInert, ariaHidden });
    });
  }

  function clearPageInert() {
    modalState.inerted.forEach(({ child, wasInert, ariaHidden }) => {
      child.inert = wasInert;
      if (ariaHidden === null) child.removeAttribute('aria-hidden');
      else child.setAttribute('aria-hidden', ariaHidden);
    });
    modalState.inerted = [];
  }

  /**
   * Cancels focus attempts that openDialog scheduled for later. Without this a
   * retry can land after the dialog has already closed and steal focus away from
   * whatever the user moved on to.
   */
  function cancelPendingDialogFocus() {
    if (modalState.focusFrame) {
      window.cancelAnimationFrame(modalState.focusFrame);
      modalState.focusFrame = 0;
    }
    if (modalState.focusTimer) {
      window.clearTimeout(modalState.focusTimer);
      modalState.focusTimer = 0;
    }
  }

  function openDialog(dialog, opener, extras = []) {
    if (!dialog) return;
    if (modalState.active && modalState.active !== dialog) closeDialog(modalState.active);
    // Only one overlay may own the inert state at a time.
    closeMobileMenu();
    cancelPendingDialogFocus();
    modalState.active = dialog;
    modalState.opener = opener || document.activeElement;
    dialog.hidden = false;
    dialog.classList.add('active', 'visible');
    dialog.removeAttribute('aria-hidden');
    dialog.setAttribute('aria-modal', 'true');
    lockPage('dialog');
    setPageInert([dialog, ...extras]);
    const initialFocus = dialog.querySelector('[data-dialog-initial-focus]') || getFocusable(dialog)[0] || dialog;
    initialFocus.focus({ preventScroll: true });
    // Some browsers drop focus on an element that was hidden a moment ago, so
    // retry once the dialog has been painted, and once more shortly after.
    modalState.focusFrame = window.requestAnimationFrame(() => {
      modalState.focusFrame = 0;
      initialFocus.focus({ preventScroll: true });
      if (document.activeElement === initialFocus) return;
      modalState.focusTimer = window.setTimeout(() => {
        modalState.focusTimer = 0;
        initialFocus.focus({ preventScroll: true });
      }, DIALOG_FOCUS_RETRY_MS);
    });
  }

  function closeDialog(dialog) {
    if (!dialog || modalState.active !== dialog) return;
    const opener = modalState.opener;
    cancelPendingDialogFocus();
    dialog.classList.remove('active', 'visible');
    dialog.setAttribute('aria-hidden', 'true');
    dialog.hidden = true;
    clearPageInert();
    unlockPage('dialog');
    modalState.active = null;
    modalState.opener = null;
    if (opener && document.contains(opener)) window.requestAnimationFrame(() => opener.focus());
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (modalState.active) {
        event.preventDefault();
        closeActiveDialog();
        return;
      }
      if (isMobileMenuOpen()) closeMobileMenu({ restoreFocus: true });
    }

    if (event.key !== 'Tab') return;
    // The open dialog wins; otherwise the mobile menu covers the page and owns
    // the tab order the same way.
    const container = modalState.active || (isMobileMenuOpen() ? document.querySelector('.compact-nav') : null);
    if (!container) return;

    const focusable = getFocusable(container);
    if (!focusable.length) {
      event.preventDefault();
      container.focus();
      return;
    }
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

  function closeActiveDialog() {
    const dialog = modalState.active;
    if (!dialog) return;
    if (dialog.id === 'videoPopup') closeVideoPopup();
    else if (dialog.id === 'commandPalette') closeCommandPalette();
    else if (dialog.id === 'editionChooser') closeEditionChooser();
    else closeDialog(dialog);
  }

  function setItemFocusable(item, enabled) {
    item.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(control => {
      if (enabled) {
        if (control.dataset.previousTabindex !== undefined) {
          if (control.dataset.previousTabindex) control.setAttribute('tabindex', control.dataset.previousTabindex);
          else control.removeAttribute('tabindex');
          delete control.dataset.previousTabindex;
        }
      } else if (control.dataset.previousTabindex === undefined) {
        control.dataset.previousTabindex = control.getAttribute('tabindex') || '';
        control.setAttribute('tabindex', '-1');
      }
    });
  }

  function setItemVisible(item, visible, { instant = false } = {}) {
    if (item._fadeTimer) {
      window.clearTimeout(item._fadeTimer);
      item._fadeTimer = null;
    }

    const skipMotion = instant || motionReduced();

    if (visible) {
      const wasHidden = item.classList.contains('hidden-card');
      item.classList.remove('hidden-card');
      item.setAttribute('aria-hidden', 'false');
      setItemFocusable(item, true);
      if (skipMotion || !wasHidden) {
        item.classList.remove('is-fading');
        return;
      }
      item.classList.add('is-fading');
      void item.offsetWidth;
      window.requestAnimationFrame(() => item.classList.remove('is-fading'));
      return;
    }

    item.setAttribute('aria-hidden', 'true');
    setItemFocusable(item, false);
    if (skipMotion || item.classList.contains('hidden-card')) {
      item.classList.add('hidden-card');
      item.classList.remove('is-fading');
      return;
    }
    item.classList.add('is-fading');
    item._fadeTimer = window.setTimeout(() => {
      item.classList.add('hidden-card');
      item.classList.remove('is-fading');
      item._fadeTimer = null;
    }, CARD_FADE_MS);
  }

  /* --------------------------------------------------------------------------
     Preference storage

     Touching localStorage throws outright in some privacy modes, so every read
     and write goes through these helpers and degrades to "no preference saved".
     -------------------------------------------------------------------------- */

  function readPreference(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writePreference(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  /* --------------------------------------------------------------------------
     Theme and visual effects
     -------------------------------------------------------------------------- */

  function initializeTheme() {
    const savedTheme = readPreference('theme');
    const theme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    writePreference('theme', theme);
    updateThemeToggle(theme, { animate: true });
  }

  function updateThemeToggle(theme = document.documentElement.getAttribute('data-theme'), { animate = false } = {}) {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    const isDark = theme === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    const icon = toggle.querySelector('i');
    if (!icon) return;

    const applyIcon = () => {
      icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    };

    if (!animate || motionReduced()) {
      toggle.classList.remove('is-toggling');
      applyIcon();
      return;
    }

    toggle.classList.add('is-toggling');
    window.setTimeout(() => {
      applyIcon();
      toggle.classList.remove('is-toggling');
    }, THEME_ICON_SWAP_MS);
  }

  function initializeThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle || toggle.dataset.themeReady) return;
    toggle.dataset.themeReady = 'true';
    toggle.addEventListener('click', toggleTheme);
    updateThemeToggle();
  }

  function rememberEdition(edition) {
    if (edition !== 'classic' && edition !== 'terminal') return false;
    writePreference('portfolioEdition', edition);
    return true;
  }

  function isCurrentEditionPath(edition) {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (edition === 'classic') return path === '' || path === '/' || path.endsWith('/index.html');
    if (edition === 'terminal') return path === '/v2' || path.endsWith('/v2') || path.includes('/v2/');
    return false;
  }

  function initializeEditionSwitch() {
    document.querySelectorAll('.edition-switch[data-edition]').forEach(link => {
      if (link.dataset.editionReady) return;
      link.dataset.editionReady = 'true';
      link.addEventListener('click', (event) => {
        const edition = link.dataset.edition;
        if (!rememberEdition(edition)) return;
        event.preventDefault();
        if (isCurrentEditionPath(edition)) return;
        // Save first, then navigate ourselves so the preference always sticks.
        window.location.assign(link.href);
      });
    });
  }

  function closeEditionChooser() {
    const dialog = document.getElementById('editionChooser');
    rememberEdition('classic');
    if (dialog) closeDialog(dialog);
  }

  function initializeEditionChooser() {
    const dialog = document.getElementById('editionChooser');
    if (!dialog) return;

    const saved = readPreference('portfolioEdition');
    if (saved === 'classic' || saved === 'terminal') return;

    const chooseClassic = () => closeEditionChooser();
    const chooseTerminal = () => {
      rememberEdition('terminal');
      window.location.assign('/v2/');
    };

    document.getElementById('editionChooserClassic')?.addEventListener('click', chooseClassic);
    document.getElementById('editionChooserTerminal')?.addEventListener('click', chooseTerminal);
    document.getElementById('editionChooserClose')?.addEventListener('click', chooseClassic);

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) chooseClassic();
    });

    openDialog(dialog);
  }

  function initializeParticles() {
    if (motionReduced() || typeof particlesJS === 'undefined' || !document.getElementById('particles-js')) return;
    particlesJS('particles-js', {
      particles: {
        number: { value: window.innerWidth < 768 ? 24 : 44, density: { enable: true, value_area: 900 } },
        color: { value: '#ffffff' }, shape: { type: 'circle' },
        opacity: { value: 0.35, random: true }, size: { value: 2.2, random: true },
        line_linked: { enable: true, distance: 160, color: '#ffffff', opacity: 0.16, width: 1 },
        move: { enable: true, speed: 0.45, random: true, out_mode: 'out' }
      },
      interactivity: { detect_on: 'canvas', events: { onhover: { enable: true, mode: 'grab' }, resize: true }, modes: { grab: { distance: 140, line_linked: { opacity: 0.35 } } } },
      retina_detect: true
    });
  }

  function initializeHeroEntrance() {
    const root = document.documentElement;
    const chars = Array.from(document.querySelectorAll('.name-char'));
    const cascade = Array.from(document.querySelectorAll('.hero-entrance'));

    if (motionReduced()) {
      root.classList.add('hero-entered');
      return;
    }

    const cascadeStart = chars.length * HERO_CHAR_STAGGER_MS + HERO_BLOCK_LEAD_MS;
    chars.forEach((char, index) => {
      char.style.transitionDelay = `${index * HERO_CHAR_STAGGER_MS}ms`;
    });
    cascade.forEach((el, index) => {
      el.style.transitionDelay = `${cascadeStart + index * HERO_BLOCK_STAGGER_MS}ms`;
    });

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => root.classList.add('hero-entered'));
    });

    // Inline delays are only needed for the one-off entrance; clearing them keeps
    // later state changes (theme, filtering) from inheriting a stagger.
    const clearDelays = () => {
      chars.forEach(char => { char.style.transitionDelay = ''; });
      cascade.forEach(el => { el.style.transitionDelay = ''; });
    };
    const lastBlockDelay = Math.max(cascade.length - 1, 0) * HERO_BLOCK_STAGGER_MS;
    window.setTimeout(clearDelays, cascadeStart + lastBlockDelay + HERO_CASCADE_TAIL_MS);
  }

  function observeRevealItems(items) {
    if (!('IntersectionObserver' in window)) {
      items.forEach(item => item.classList.add('is-revealed'));
      return;
    }
    items.forEach(item => item.classList.add('will-reveal'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px' });
    items.forEach(item => observer.observe(item));
  }

  function initializeScrollEffects() {
    const items = Array.from(document.querySelectorAll('.project-card, .video-card, .reel-card, .contact-card, .section-header'));
    if (!items.length || motionReduced()) return;

    const coarsePointer = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const gsapReady = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    if (gsapReady && !coarsePointer) {
      gsap.registerPlugin(ScrollTrigger);
      // Mobile browser chrome changes viewport height as scrolling settles. Avoid
      // ScrollTrigger refreshes that can pull the page back to a recalculated point.
      ScrollTrigger.config({ ignoreMobileResize: true });
      gsap.utils.toArray(items).forEach((item, index) => gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        y: 18, opacity: 0, duration: 0.62, delay: index % 3 * 0.07, ease: 'power2.out'
      }));
      return;
    }

    observeRevealItems(items);
  }

  function initializeProgressBar() {
    const bar = document.querySelector('.progress-bar');
    if (!bar) return;
    onScroll(() => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = height > 0 ? Math.min(100, Math.max(0, window.scrollY / height * 100)) : 0;
      bar.style.width = `${progress}%`;
    });
  }

  /* --------------------------------------------------------------------------
     Navigation
     -------------------------------------------------------------------------- */

  function isMobileMenuOpen() {
    const menu = document.getElementById('navMenu');
    return Boolean(menu && menu.classList.contains('active'));
  }

  function openMobileMenu() {
    const menu = document.getElementById('navMenu');
    const toggle = document.getElementById('navToggle');
    const nav = document.querySelector('.compact-nav');
    if (!menu || !toggle) return;
    menu.classList.add('active');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    const backdrop = document.getElementById('navBackdrop');
    if (backdrop) {
      backdrop.hidden = false;
      backdrop.classList.add('active', 'visible');
    }
    toggle.setAttribute('aria-label', 'Close navigation menu');
    lockPage('menu');
    // The open menu covers the page, so the content behind it should not be
    // reachable by keyboard or exposed to screen readers.
    if (nav) setPageInert([nav, backdrop].filter(Boolean));
  }

  function closeMobileMenu({ restoreFocus = false } = {}) {
    const menu = document.getElementById('navMenu');
    const toggle = document.getElementById('navToggle');
    if (!menu || !toggle) return;
    const wasOpen = menu.classList.contains('active');
    menu.classList.remove('active');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    const backdrop = document.getElementById('navBackdrop');
    if (backdrop) {
      backdrop.classList.remove('active', 'visible');
      backdrop.hidden = true;
    }
    toggle.setAttribute('aria-label', 'Open navigation menu');
    unlockPage('menu');
    // A dialog opening over the menu takes ownership of the inert state, so
    // only release it here when nothing else is holding it.
    if (wasOpen && !modalState.active) clearPageInert();
    if (restoreFocus) toggle.focus();
  }

  function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navBackdrop = document.getElementById('navBackdrop');
    if (navToggle && navMenu) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-controls', 'navMenu');
      navToggle.addEventListener('click', () => navMenu.classList.contains('active') ? closeMobileMenu({ restoreFocus: true }) : openMobileMenu());
      navToggle.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navToggle.click();
        }
      });
      if (navBackdrop) navBackdrop.addEventListener('click', () => closeMobileMenu({ restoreFocus: true }));
    }
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', event => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;
        event.preventDefault();
        if (target.classList.contains('project-card')) revealProjectCard(target);
        window.requestAnimationFrame(() => window.scrollTo({ top: getScrollTargetTop(target), behavior: smoothBehavior() }));
        closeMobileMenu();
        // A skip link has to move focus, not just the viewport.
        if (anchor.classList.contains('skip-link')) target.focus({ preventScroll: true });
      });
    });
  }

  function getScrollTargetTop(target) {
    const nav = document.querySelector('.compact-nav');
    const offset = nav ? Math.ceil(nav.getBoundingClientRect().height) + 16 : 80;
    return Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0);
  }

  function scrollToSection(sectionId) {
    const resolvedId = sectionId === 'home' ? 'hero' : sectionId;
    const target = document.getElementById(resolvedId);
    if (target) window.scrollTo({ top: getScrollTargetTop(target), behavior: smoothBehavior() });
  }

  function initializeNavScroll() {
    const nav = document.querySelector('.compact-nav');
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');
    if (!nav) return;
    const update = () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
      const position = window.scrollY + 130;
      let current = '';
      sections.forEach(section => {
        if (position >= section.offsetTop && position < section.offsetTop + section.offsetHeight) current = section.id;
      });
      links.forEach(link => {
        const active = link.getAttribute('href') === `#${current}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    onScroll(update);
  }

  /* --------------------------------------------------------------------------
     Project filtering and disclosure
     -------------------------------------------------------------------------- */

  // Keyed by the carousel shell so filtering can refresh a carousel it does not
  // own, without hanging custom properties off the DOM node.
  const carouselControllers = new WeakMap();

  function initializeCarousels() {
    const carousels = Array.from(document.querySelectorAll('[data-carousel]'));
    if (!carousels.length) return;

    const getStep = (track) => {
      const item = Array.from(track.children).find(child => !child.classList.contains('hidden-card') && child.offsetParent !== null);
      if (!item) return Math.max(track.clientWidth * 0.8, 240);
      const styles = window.getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
      return item.getBoundingClientRect().width + gap;
    };

    const updateChrome = (carousel, track, prevBtn, nextBtn) => {
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const left = track.scrollLeft;
      const epsilon = 2;
      const canPrev = left > epsilon;
      const canNext = left < maxScroll - epsilon;
      carousel.dataset.canScrollPrev = String(canPrev);
      carousel.dataset.canScrollNext = String(canNext);
      if (prevBtn) prevBtn.disabled = !canPrev;
      if (nextBtn) nextBtn.disabled = !canNext;
    };

    const scrollByDir = (track, direction) => {
      track.scrollBy({ left: getStep(track) * direction, behavior: smoothBehavior() });
    };

    carousels.forEach(carousel => {
      const track = carousel.querySelector('.carousel-track');
      const prevBtn = carousel.querySelector('.carousel-btn-prev');
      const nextBtn = carousel.querySelector('.carousel-btn-next');
      if (!track) return;

      let rafId = 0;
      const scheduleUpdate = () => {
        if (rafId) return;
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          updateChrome(carousel, track, prevBtn, nextBtn);
        });
      };

      if (prevBtn) prevBtn.addEventListener('click', () => scrollByDir(track, -1));
      if (nextBtn) nextBtn.addEventListener('click', () => scrollByDir(track, 1));

      track.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollByDir(track, -1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollByDir(track, 1);
        }
      });

      track.addEventListener('scroll', scheduleUpdate, { passive: true });
      onResize(scheduleUpdate);
      if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(scheduleUpdate).observe(track);
      }

      carouselControllers.set(carousel, {
        update: () => updateChrome(carousel, track, prevBtn, nextBtn)
      });

      updateChrome(carousel, track, prevBtn, nextBtn);
    });
  }

  function initializeProjectFiltering() {
    const buttons = Array.from(document.querySelectorAll('.filter-btn'));
    const cards = Array.from(document.querySelectorAll('.project-card'));
    const status = document.getElementById('projectsFilterStatus');
    const projectsGrid = document.getElementById('projectsGrid');
    const projectsCarousel = projectsGrid && projectsGrid.closest('[data-carousel]');
    if (!buttons.length || !cards.length) return;

    const apply = (filter, { instant = false } = {}) => {
      const matching = cards.filter(card => filter === 'all' || card.dataset.category === filter);
      buttons.forEach(button => {
        const selected = button.dataset.filter === filter;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      cards.forEach(card => {
        setItemVisible(card, matching.includes(card), { instant });
      });
      if (status) {
        status.textContent = `${matching.length} ${matching.length === 1 ? 'project' : 'projects'} shown`;
      }
      const carousel = projectsCarousel && carouselControllers.get(projectsCarousel);
      if (carousel) {
        if (projectsGrid) {
          projectsGrid.scrollTo({ left: 0, behavior: 'auto' });
          projectsGrid.scrollLeft = 0;
        }
        carousel.update();
        // Cards fade out before they stop taking up space, so measure again once
        // the transition has finished and the track has its final width.
        if (!instant) window.setTimeout(carousel.update, CARD_FADE_MS + FILTER_RELAYOUT_MS);
      } else if (projectsGrid) {
        projectsGrid.scrollLeft = 0;
      }
      window.__portfolioProjectFilter = { filter, matching, apply };
    };

    buttons.forEach(button => button.addEventListener('click', () => apply(button.dataset.filter)));
    apply((buttons.find(button => button.classList.contains('active')) || buttons[0]).dataset.filter, { instant: true });

    const hashId = (location.hash || '').slice(1);
    const hashCard = hashId ? document.getElementById(hashId) : null;
    if (hashCard && hashCard.classList.contains('project-card')) {
      revealProjectCard(hashCard);
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: getScrollTargetTop(hashCard), behavior: 'auto' });
      });
    }
  }

  function revealProjectCard(card) {
    const state = window.__portfolioProjectFilter;
    if (state) {
      if (state.filter !== 'all') state.apply('all', { instant: true });
    } else {
      const allButton = document.querySelector('.filter-btn[data-filter="all"]');
      if (allButton && !allButton.classList.contains('active')) allButton.click();
    }
    if (typeof card.scrollIntoView === 'function') {
      card.scrollIntoView({ behavior: 'auto', inline: 'nearest', block: 'nearest' });
    }
  }

  /* --------------------------------------------------------------------------
     Dialogs
     -------------------------------------------------------------------------- */

  /**
   * Whether the visitor is on an Apple platform, which decides whether the
   * palette advertises the Command or the Control key. navigator.platform is
   * deprecated, so the modern hint is preferred where it exists.
   */
  function isApplePlatform() {
    const hint = navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '';
    return /mac|iphone|ipad|ipod/i.test(hint);
  }

  function initializeCommandPalette() {
    const palette = document.getElementById('commandPalette');
    const input = document.getElementById('commandInput');
    const list = document.getElementById('commandList');
    if (!palette || !input || !list) return;
    const closeButton = document.getElementById('commandPaletteClose');
    const metaKbd = palette.querySelector('.command-kbd-meta');
    if (metaKbd) {
      const isApple = isApplePlatform();
      metaKbd.textContent = isApple ? '⌘' : 'Ctrl';
      if (!isApple) {
        const footer = palette.querySelector('.command-palette-footer');
        if (footer) footer.innerHTML = '<span>Press</span> <kbd>Ctrl</kbd><kbd>K</kbd>';
      }
    }
    palette.hidden = true;
    input.setAttribute('data-dialog-initial-focus', '');
    palette.setAttribute('aria-hidden', 'true');
    Array.from(list.children).forEach(item => item.setAttribute('aria-selected', 'false'));

    const commands = Array.from(list.children);
    const visibleCommands = () => commands.filter(item => !item.hidden);

    const open = opener => {
      input.value = '';
      commands.forEach(item => {
        item.hidden = false;
        item.classList.remove('active');
        item.setAttribute('aria-selected', 'false');
      });
      input.setAttribute('aria-expanded', 'true');
      openDialog(palette, opener);
    };
    document.addEventListener('keydown', event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        modalState.active === palette ? closeCommandPalette() : open(document.activeElement);
      }
    });
    palette.addEventListener('click', event => { if (event.target === palette) closeCommandPalette(); });
    if (closeButton) closeButton.addEventListener('click', closeCommandPalette);
    list.addEventListener('click', event => {
      const command = event.target.closest('li[data-action]');
      if (command) executeCommand(command.dataset.action);
    });
    const setActive = item => {
      commands.forEach(command => {
        const active = command === item;
        command.classList.toggle('active', active);
        command.setAttribute('aria-selected', String(active));
      });
      input.setAttribute('aria-activedescendant', item ? item.id : '');
    };
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      commands.forEach(item => {
        const matches = item.textContent.toLowerCase().includes(query);
        item.hidden = !matches;
        if (!matches) item.classList.remove('active');
      });
      setActive(visibleCommands()[0] || null);
    });
    input.addEventListener('keydown', event => {
      const visible = visibleCommands();
      const current = list.querySelector('.active');
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!visible.length) return;
        const index = visible.indexOf(current);
        let next;
        if (index < 0) {
          next = event.key === 'ArrowDown' ? visible[0] : visible[visible.length - 1];
        } else {
          next = event.key === 'ArrowDown'
            ? visible[(index + 1) % visible.length]
            : visible[(index - 1 + visible.length) % visible.length];
        }
        setActive(next);
        next.scrollIntoView({ block: 'nearest' });
      } else if (event.key === 'Enter') {
        const active = list.querySelector('.active') || visible[0];
        if (active) {
          event.preventDefault();
          executeCommand(active.dataset.action);
        }
      }
    });
  }

  function closeCommandPalette() {
    const palette = document.getElementById('commandPalette');
    if (!palette) return;
    const input = document.getElementById('commandInput');
    if (input) input.setAttribute('aria-expanded', 'false');
    closeDialog(palette);
  }

  function executeCommand(action) {
    closeCommandPalette();
    if (action === 'dark-mode') toggleTheme();
    else if (action === 'videos' || action === 'creative') scrollToSection('videos');
    else scrollToSection(action);
  }

  /** Populated by initializeVideoPopup so the open/close paths do not re-query the DOM. */
  const videoPopupRefs = { popup: null, backdrop: null, player: null, title: null };

  function initializeVideoPopup() {
    const backdrop = document.getElementById('videoPopupBackdrop');
    const popup = document.getElementById('videoPopup');
    const player = document.getElementById('videoPopupPlayer');
    const close = document.getElementById('videoPopupClose');
    if (!backdrop || !popup || !player) return;

    videoPopupRefs.popup = popup;
    videoPopupRefs.backdrop = backdrop;
    videoPopupRefs.player = player;
    videoPopupRefs.title = document.getElementById('videoPopupTitle');

    backdrop.hidden = true;
    popup.hidden = true;
    popup.setAttribute('aria-hidden', 'true');
    popup.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-hidden', 'true');
    document.querySelectorAll('.btn-demo').forEach(button => {
      const card = button.closest('.project-card[data-video]');
      if (!card) return;
      button.addEventListener('click', () => openVideoPopup(card, button));
    });
    backdrop.addEventListener('click', closeVideoPopup);
    if (close) close.addEventListener('click', closeVideoPopup);
  }

  function openVideoPopup(card, opener) {
    const { popup, backdrop, player, title } = videoPopupRefs;
    const src = card.dataset.video;
    if (!popup || !backdrop || !player || !src) return;
    // The dialog is labelled by this heading, so it must never be empty.
    if (title) title.textContent = card.dataset.title || card.querySelector('.project-title')?.textContent || 'Project demo';
    player.src = src;
    // Show the card's own thumbnail instead of a black frame while the file buffers.
    const thumbnail = card.querySelector('.project-image img');
    if (thumbnail) player.poster = thumbnail.currentSrc || thumbnail.src;
    player.load();
    backdrop.hidden = false;
    backdrop.classList.add('active', 'visible');
    openDialog(popup, opener, [backdrop]);
    // Autoplay is a nicety: browsers may refuse it, and the controls still work.
    if (!motionReduced()) player.play().catch(() => {});
  }

  function closeVideoPopup() {
    const { popup, backdrop, player } = videoPopupRefs;
    if (!popup) return;
    if (player) {
      player.pause();
      player.removeAttribute('src');
      player.removeAttribute('poster');
      player.load();
    }
    if (backdrop) {
      backdrop.classList.remove('active', 'visible');
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.hidden = true;
    }
    closeDialog(popup);
  }

  /* --------------------------------------------------------------------------
     Form and easter egg
     -------------------------------------------------------------------------- */

  function initializeContactForm() {
    const form = document.getElementById('contactForm');
    const result = document.getElementById('formResult');
    if (!form) return;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = form.querySelector('.contact-submit');
      if (!button || button.disabled) return;
      const idleParts = [button.querySelector('.btn-text'), button.querySelector('.fa-paper-plane')];
      const loading = button.querySelector('.btn-loading');
      const setBusy = busy => {
        form.setAttribute('aria-busy', String(busy));
        button.disabled = busy;
        idleParts.forEach(part => { if (part) part.hidden = busy; });
        if (loading) loading.hidden = !busy;
      };
      const announce = (message, state) => {
        if (!result) return;
        result.setAttribute('role', state === 'error' ? 'alert' : 'status');
        result.textContent = message;
        result.className = state ? `form-result ${state}` : 'form-result';
      };

      setBusy(true);
      announce('Sending your message…');
      try {
        const response = await fetch(CONTACT_ENDPOINT, { method: 'POST', body: new FormData(form) });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Submission failed');
        announce("Message sent! I'll get back to you soon.", 'success');
        form.reset();
      } catch (error) {
        console.error('[portfolio] contact form submission failed', error);
        announce('Failed to send message. Please try emailing me directly.', 'error');
      } finally {
        setBusy(false);
      }
    });
  }

  function initializeEasterEgg() {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    let index = 0;
    document.addEventListener('keydown', event => {
      index = event.code === code[index] ? index + 1 : 0;
      if (index === code.length) {
        index = 0;
        activateEasterEgg();
      }
    });
  }

  function activateEasterEgg() {
    if (motionReduced()) return;
    createConfetti();
  }

  /**
   * Builds the confetti burst. Appearance lives in styles.css; only the random
   * per-piece values are set here, as custom properties.
   */
  function createConfetti() {
    const layer = document.createElement('div');
    layer.className = 'confetti-layer';
    layer.setAttribute('aria-hidden', 'true');

    for (let index = 0; index < CONFETTI_PIECES; index += 1) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.setProperty('--confetti-x', `${(Math.random() * 100).toFixed(2)}%`);
      piece.style.setProperty('--confetti-hue', String(Math.round(Math.random() * 360)));
      piece.style.setProperty('--confetti-opacity', (Math.random() * 0.5 + 0.5).toFixed(2));
      piece.style.setProperty('--confetti-duration', `${(Math.random() * 3 + 2).toFixed(2)}s`);
      layer.appendChild(piece);
    }

    document.body.appendChild(layer);
    window.setTimeout(() => layer.remove(), CONFETTI_LIFETIME_MS);
  }
})();
