/* Portfolio interactions: progressively enhanced; content remains usable without JS/CDNs. */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const modalState = { active: null, opener: null, locks: new Set(), inerted: [], focusFrame: 0, focusTimer: 0 };

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
  /** Journey timeline: line draw plus the last step's delay, with a little slack. */
  const JOURNEY_SETTLE_MS = 2200;

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
    runInit('initializeProjectDeepLinks', initializeProjectDeepLinks);
    runInit('initializeCommandPalette', initializeCommandPalette);
    runInit('initializeThemeToggle', initializeThemeToggle);
    runInit('initializeEditionSwitch', initializeEditionSwitch);
    runInit('initializeEditionChooser', initializeEditionChooser);
    runInit('initializeVideoPopup', initializeVideoPopup);
    runInit('initializeCalPopup', initializeCalPopup);
    runInit('initializeNavScroll', initializeNavScroll);
    runInit('initializeContactForm', initializeContactForm);
    runInit('initializeEasterEgg', initializeEasterEgg);
    runInit('initializeParticles', initializeParticles);
    runInit('initializeHeroEntrance', initializeHeroEntrance);
    runInit('initializeScrollEffects', initializeScrollEffects);
    runInit('initializeJourney', initializeJourney);
    runInit('initializeAttentionArt', initializeAttentionArt);
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
    else if (dialog.id === 'calPopup') closeCalPopup();
    else closeDialog(dialog);
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
    const host = document.getElementById('particles-js');
    const start = () => particlesJS('particles-js', {
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

    // The canvas redraws every frame, so stop it while the hero is off screen.
    const stop = () => {
      const instance = window.pJSDom && window.pJSDom[0];
      if (!instance) return;
      instance.pJS.fn.vendors.destroypJS();
      window.pJSDom = [];
    };
    if (!('IntersectionObserver' in window)) {
      start();
      return;
    }
    let running = false;
    new IntersectionObserver(entries => {
      const visible = entries[entries.length - 1].isIntersecting;
      if (visible && !running) { running = true; start(); }
      else if (!visible && running) { running = false; stop(); }
    }).observe(host);
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
      // The cards carry CSS transitions on opacity/transform; left on, they lag behind
      // every GSAP frame. Turn them off for the reveal, then hand control back to CSS
      // so hover lifts still work.
      gsap.utils.toArray(items).forEach((item, index) => gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 88%', once: true },
        y: 18, opacity: 0, duration: 0.62, delay: index % 3 * 0.07, ease: 'power2.out',
        onStart: () => { item.style.transition = 'none'; },
        clearProps: 'opacity,transform,transition'
      }));
      return;
    }

    observeRevealItems(items);
  }

  /** Draws the journey line once, the first time the timeline scrolls into view. */
  function initializeJourney() {
    const journey = document.querySelector('[data-journey]');
    if (!journey || motionReduced() || !('IntersectionObserver' in window)) return;

    journey.classList.add('is-armed');
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      journey.classList.add('is-drawn');
      // Drop the staggered transitions once played, so theme changes stay instant.
      window.setTimeout(() => journey.classList.remove('is-armed'), JOURNEY_SETTLE_MS);
    }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });
    observer.observe(journey);
  }

  /** Draws the attention lines out of "it" once, the first time the course card scrolls into view. */
  function initializeAttentionArt() {
    const art = document.querySelector('[data-attention-art]');
    if (!art || motionReduced() || !('IntersectionObserver' in window)) return;

    art.classList.add('is-armed');
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      art.classList.add('is-drawn');
    }, { threshold: 0.4 });
    observer.observe(art);
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
    const sections = document.querySelectorAll('main > section[id]');
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
     Carousels and project deep links
     -------------------------------------------------------------------------- */

  // Keyed by the carousel shell so other code can refresh a carousel it does not
  // own, without hanging custom properties off the DOM node.
  const carouselControllers = new WeakMap();

  function initializeCarousels() {
    const carousels = Array.from(document.querySelectorAll('[data-carousel]'));
    if (!carousels.length) return;

    const getStep = (track) => {
      const item = Array.from(track.children).find(child => child.offsetParent !== null);
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

    const snapToNearestCard = (track) => {
      const items = Array.from(track.children).filter(child => !child.hidden && child.offsetParent !== null);
      if (!items.length) return;
      const currentScroll = track.scrollLeft;
      let closestItem = items[0];
      let minDistance = Infinity;

      for (const item of items) {
        const itemLeft = item.offsetLeft - track.offsetLeft;
        const dist = Math.abs(itemLeft - currentScroll);
        if (dist < minDistance) {
          minDistance = dist;
          closestItem = item;
        }
      }

      if (closestItem) {
        const target = Math.max(0, Math.min(closestItem.offsetLeft - track.offsetLeft, track.scrollWidth - track.clientWidth));
        track.scrollTo({ left: target, behavior: smoothBehavior() });
      }
    };

    // After a drag the track glides to a card. Native snapping stays off until the
    // glide ends, so the two never pull in different directions.
    const createSettleController = (track) => {
      let timer = 0;
      const finish = () => {
        window.clearTimeout(timer);
        track.removeEventListener('scrollend', finish);
        track.classList.remove('is-settling');
      };
      return {
        start() {
          track.classList.add('is-settling');
          track.addEventListener('scrollend', finish, { once: true });
          window.clearTimeout(timer);
          timer = window.setTimeout(finish, 700);
        },
        cancel: finish
      };
    };

    const setupDrag = (track, settleController) => {
      let isDown = false;
      let startX = 0;
      let startY = 0;
      let startScrollLeft = 0;
      let isDragging = false;
      let directionDecided = false;
      let isHorizontal = false;
      let activePointerId = null;

      const onPointerDown = (e) => {
        // Touch and pen already pan natively; scripting them as well makes the two fight.
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        if (e.target.closest('button, input, select, textarea, .carousel-btn')) return;

        settleController.cancel();

        isDown = true;
        isDragging = false;
        directionDecided = false;
        isHorizontal = false;
        activePointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        startScrollLeft = track.scrollLeft;
      };

      const onPointerMove = (e) => {
        if (!isDown || e.pointerId !== activePointerId) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (!directionDecided) {
          if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
          directionDecided = true;
          if (Math.abs(dy) >= Math.abs(dx)) {
            isDown = false;
            return;
          }
          isHorizontal = true;
          track.classList.add('is-dragging');
          try { track.setPointerCapture(e.pointerId); } catch (_) {}
        }

        if (isHorizontal) {
          isDragging = true;
          track.scrollLeft = startScrollLeft - dx;
        }
      };

      const onPointerUp = (e) => {
        if (!isDown && !isDragging) return;
        if (activePointerId !== null && e.pointerId !== activePointerId) return;
        isDown = false;
        activePointerId = null;
        track.classList.remove('is-dragging');
        try { track.releasePointerCapture(e.pointerId); } catch (_) {}

        if (isDragging) {
          const preventClick = (clickEvt) => {
            clickEvt.preventDefault();
            clickEvt.stopPropagation();
          };
          window.addEventListener('click', preventClick, { capture: true, once: true });
          window.setTimeout(() => {
            window.removeEventListener('click', preventClick, { capture: true });
          }, 80);

          settleController.start();
          snapToNearestCard(track);
        }
        isDragging = false;
      };

      track.addEventListener('pointerdown', onPointerDown);
      track.addEventListener('pointermove', onPointerMove, { passive: true });
      track.addEventListener('pointerup', onPointerUp);
      track.addEventListener('pointercancel', onPointerUp);
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

      let scrollIdle = 0;
      const markScrolling = () => {
        if (!track.classList.contains('is-scrolling')) track.classList.add('is-scrolling');
        window.clearTimeout(scrollIdle);
        scrollIdle = window.setTimeout(() => track.classList.remove('is-scrolling'), 140);
      };

      track.addEventListener('scroll', () => {
        markScrolling();
        scheduleUpdate();
      }, { passive: true });
      onResize(scheduleUpdate);
      if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(scheduleUpdate).observe(track);
      }

      setupDrag(track, createSettleController(track));

      carouselControllers.set(carousel, {
        update: () => updateChrome(carousel, track, prevBtn, nextBtn)
      });

      updateChrome(carousel, track, prevBtn, nextBtn);
    });
  }

  function initializeProjectDeepLinks() {
    const hashId = (location.hash || '').slice(1);
    const hashCard = hashId ? document.getElementById(hashId) : null;
    if (hashCard && hashCard.classList.contains('project-card')) {
      revealProjectCard(hashCard);
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: getScrollTargetTop(hashCard), behavior: 'auto' });
      });
    }
  }

  /** Scrolls a project's carousel sideways so a deep-linked card is in view. */
  function revealProjectCard(card) {
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
    else if (action === 'explainers' || action === 'youtube') scrollToSection('youtubeExplainers');
    else if (action === 'client' || action === 'client-projects') scrollToSection('client-projects');
    else if (action === 'book-a-call' || action === 'call') openCalPopup();
    else if (action === 'cv' || action === 'resume') document.querySelector('[data-cv-link]')?.click();
    else scrollToSection(action);
  }

  /** Populated by initializeVideoPopup so the open/close paths do not re-query the DOM. */
  const videoPopupRefs = {
    popup: null,
    backdrop: null,
    player: null,
    iframe: null,
    title: null,
    badge: null,
    external: null
  };

  function resolveVideoEmbed(url) {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
    const listMatch = url.match(/[?&]list=([\w-]+)/);
    if (ytMatch) {
      const isShorts = url.includes('/shorts/');
      const embedUrl = listMatch
        ? `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?list=${listMatch[1]}&autoplay=1&rel=0`
        : `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
      return { type: 'youtube', embedUrl, platform: 'YouTube', isPortrait: isShorts };
    }
    if (listMatch) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${listMatch[1]}&autoplay=1&rel=0`,
        platform: 'YouTube',
        isPortrait: false
      };
    }
    if (url.includes('facebook.com')) {
      const isReel = url.includes('/reel/');
      return {
        type: 'facebook',
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=1`,
        platform: 'Facebook',
        isPortrait: isReel
      };
    }
    if (/\.(mp4|webm|ogg)($|\?)/i.test(url)) {
      return { type: 'local', embedUrl: url, platform: 'Demo', isPortrait: false };
    }
    return null;
  }

  function initializeVideoPopup() {
    const backdrop = document.getElementById('videoPopupBackdrop');
    const popup = document.getElementById('videoPopup');
    const player = document.getElementById('videoPopupPlayer');
    const iframe = document.getElementById('videoPopupIframe');
    const close = document.getElementById('videoPopupClose');
    if (!backdrop || !popup || (!player && !iframe)) return;

    videoPopupRefs.popup = popup;
    videoPopupRefs.backdrop = backdrop;
    videoPopupRefs.player = player;
    videoPopupRefs.iframe = iframe;
    videoPopupRefs.title = document.getElementById('videoPopupTitle');
    videoPopupRefs.badge = document.getElementById('videoPopupBadge');
    videoPopupRefs.external = document.getElementById('videoPopupExternal');

    backdrop.hidden = true;
    popup.hidden = true;
    popup.setAttribute('aria-hidden', 'true');
    popup.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-hidden', 'true');

    // Project demos (MP4)
    document.querySelectorAll('.btn-demo').forEach(button => {
      const card = button.closest('.project-card[data-video]');
      if (!card) return;
      button.addEventListener('click', () => openVideoPopup(card, button));
    });

    // Tech Explainers & Personal Projects (.video-card-link)
    document.querySelectorAll('.video-card-link').forEach(link => {
      if (link.classList.contains('yt-channel-card-link') || link.classList.contains('fb-channel-card-link')) return;
      if (link.dataset.embed === 'false') return;
      const embed = resolveVideoEmbed(link.href);
      if (!embed) return;
      link.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        openVideoPopup(link, link);
      });
    });

    // Client Projects (.reel-card)
    document.querySelectorAll('.reel-card').forEach(link => {
      if (link.dataset.embed === 'false') return;
      const embed = resolveVideoEmbed(link.href);
      if (!embed) return;
      link.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        openVideoPopup(link, link);
      });
    });

    backdrop.addEventListener('click', closeVideoPopup);
    if (close) close.addEventListener('click', closeVideoPopup);
  }

  function openVideoPopup(target, opener) {
    const { popup, backdrop, player, iframe, title, badge, external } = videoPopupRefs;
    if (!popup || !backdrop) return;

    const isElement = target instanceof Element;
    if (isElement && target.dataset.embed === 'false') return;
    const url = isElement ? (target.dataset.video || target.href) : target.url;
    const resolved = isElement ? resolveVideoEmbed(url) : (target.embed || resolveVideoEmbed(url));
    if (!resolved) return;

    const videoTitle = (isElement
      ? (target.dataset.title || target.getAttribute('aria-label')?.replace(/^Watch\s+/i, '') || target.querySelector('.project-title, .video-title, .reel-title')?.textContent)
      : target.title) || 'Video';

    const thumbnail = isElement
      ? (target.querySelector('.project-image img, .video-thumbnail img, .reel-frame img')?.currentSrc
        || target.querySelector('.project-image img, .video-thumbnail img, .reel-frame img')?.src
        || '')
      : (target.thumbnail || '');

    if (title) title.textContent = videoTitle;
    if (badge) {
      const icon = resolved.type === 'youtube' ? 'fab fa-youtube' : (resolved.type === 'facebook' ? 'fab fa-facebook' : 'fas fa-play');
      badge.innerHTML = `<i class="${icon}" aria-hidden="true"></i> ${resolved.platform === 'Local' ? 'Demo' : resolved.platform}`;
    }

    if (external) {
      if (resolved.type === 'local') {
        external.hidden = true;
      } else {
        external.href = url;
        external.hidden = false;
        const textSpan = external.querySelector('.video-popup-external-text');
        if (textSpan) textSpan.textContent = `Watch on ${resolved.platform}`;
        external.setAttribute('aria-label', `Watch "${videoTitle}" on ${resolved.platform}`);
      }
    }

    const isPortrait = target.dataset?.aspect === 'portrait' || (target.isPortrait ?? resolved.isPortrait);
    popup.classList.toggle('is-portrait', Boolean(isPortrait));
    popup.classList.toggle('is-landscape', !isPortrait);

    if (resolved.type === 'local') {
      if (iframe) {
        iframe.hidden = true;
        iframe.src = 'about:blank';
      }
      if (player) {
        player.hidden = false;
        player.src = resolved.embedUrl;
        if (thumbnail) player.poster = thumbnail;
        player.load();
        if (!motionReduced()) player.play().catch(() => {});
      }
    } else {
      if (player) {
        player.pause();
        player.removeAttribute('src');
        player.removeAttribute('poster');
        player.hidden = true;
      }
      if (iframe) {
        iframe.hidden = false;
        iframe.src = resolved.embedUrl;
      }
    }

    backdrop.hidden = false;
    backdrop.classList.add('active', 'visible');
    openDialog(popup, opener, [backdrop]);
  }

  function closeVideoPopup() {
    const { popup, backdrop, player, iframe } = videoPopupRefs;
    if (!popup) return;
    if (player) {
      player.pause();
      player.removeAttribute('src');
      player.removeAttribute('poster');
      player.load();
      player.hidden = true;
    }
    if (iframe) {
      iframe.src = 'about:blank';
      iframe.hidden = true;
    }
    popup.classList.remove('is-portrait', 'is-landscape');
    if (backdrop) {
      backdrop.classList.remove('active', 'visible');
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.hidden = true;
    }
    closeDialog(popup);
  }

  /* --------------------------------------------------------------------------
     Cal.com Booking Modal
     -------------------------------------------------------------------------- */

  const calPopupRefs = {
    popup: null,
    backdrop: null,
    iframe: null,
    loading: null,
    close: null
  };

  const CAL_BOOKING_URL = 'https://cal.com/fahmid-hasan-taohid-n2y05r/30min?embed=true';

  function initializeCalPopup() {
    const backdrop = document.getElementById('calPopupBackdrop');
    const popup = document.getElementById('calPopup');
    const iframe = document.getElementById('calPopupIframe');
    const loading = document.getElementById('calPopupLoading');
    const close = document.getElementById('calPopupClose');
    if (!backdrop || !popup || !iframe) return;

    calPopupRefs.popup = popup;
    calPopupRefs.backdrop = backdrop;
    calPopupRefs.iframe = iframe;
    calPopupRefs.loading = loading;
    calPopupRefs.close = close;

    backdrop.hidden = true;
    popup.hidden = true;
    popup.setAttribute('aria-hidden', 'true');
    popup.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-hidden', 'true');

    iframe.addEventListener('load', () => {
      if (iframe.src && !iframe.src.includes('about:blank')) {
        if (loading) loading.hidden = true;
      }
    });

    const triggerButtons = document.querySelectorAll('#heroBookCallBtn, #contactBookCallBtn, [data-trigger="cal-popup"]');
    triggerButtons.forEach(btn => {
      btn.addEventListener('click', event => {
        event.preventDefault();
        openCalPopup(btn);
      });
    });

    backdrop.addEventListener('click', closeCalPopup);
    if (close) close.addEventListener('click', closeCalPopup);
  }

  function openCalPopup(opener) {
    const { popup, backdrop, iframe, loading } = calPopupRefs;
    if (!popup || !backdrop || !iframe) return;

    if (!iframe.src || iframe.src.includes('about:blank') || !iframe.src.includes('cal.com')) {
      if (loading) loading.hidden = false;
      iframe.src = CAL_BOOKING_URL;
      // Failsafe in case network or sandbox delays load event
      window.setTimeout(() => {
        if (loading && !loading.hidden) loading.hidden = true;
      }, 4000);
    }

    backdrop.hidden = false;
    backdrop.classList.add('active', 'visible');
    openDialog(popup, opener, [backdrop]);
  }

  function closeCalPopup() {
    const { popup, backdrop } = calPopupRefs;
    if (!popup) return;
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
