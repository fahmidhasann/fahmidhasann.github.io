/* Portfolio interactions: progressively enhanced; content remains usable without JS/CDNs. */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const modalState = { active: null, opener: null, locks: new Set(), inerted: [] };
const CARD_FADE_MS = 280;

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
  // Failsafe so a broken enhancer never leaves the hero permanently invisible.
  window.setTimeout(() => document.documentElement.classList.add('hero-entered'), 2000);

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
  runInit('updateProgressBar', updateProgressBar);
  window.addEventListener('scroll', updateProgressBar, { passive: true });
});

function motionReduced() {
  return prefersReducedMotion.matches;
}

function smoothBehavior() {
  return motionReduced() ? 'auto' : 'smooth';
}

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

function openDialog(dialog, opener, extras = []) {
  if (!dialog) return;
  if (modalState.active && modalState.active !== dialog) closeDialog(modalState.active);
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
  window.requestAnimationFrame(() => {
    initialFocus.focus({ preventScroll: true });
    if (document.activeElement !== initialFocus) {
      window.setTimeout(() => initialFocus.focus({ preventScroll: true }), 50);
    }
  });
}

function closeDialog(dialog) {
  if (!dialog || modalState.active !== dialog) return;
  const opener = modalState.opener;
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
    const navMenu = document.getElementById('navMenu');
    if (navMenu && navMenu.classList.contains('active')) closeMobileMenu({ restoreFocus: true });
  }

  if (event.key !== 'Tab' || !modalState.active) return;
  const focusable = getFocusable(modalState.active);
  if (!focusable.length) {
    event.preventDefault();
    modalState.active.focus();
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
   Theme and visual effects
   -------------------------------------------------------------------------- */

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const theme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeToggle(theme, { animate: true });
}

function updateThemeToggle(theme = document.documentElement.getAttribute('data-theme'), { animate = false } = {}) {
  const toggle = document.getElementById('themeToggle') || document.querySelector('.dark-mode-toggle');
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
  }, 90);
}

function initializeThemeToggle() {
  let toggle = document.getElementById('themeToggle') || document.querySelector('.dark-mode-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = 'themeToggle';
    toggle.className = 'dark-mode-toggle';
    toggle.innerHTML = '<i aria-hidden="true"></i>';
    document.body.appendChild(toggle);
  }
  if (toggle.dataset.themeReady) return;
  toggle.dataset.themeReady = 'true';
  toggle.addEventListener('click', toggleTheme);
  updateThemeToggle();
}

function rememberEdition(edition) {
  if (edition !== 'classic' && edition !== 'terminal') return false;
  try {
    localStorage.setItem('portfolioEdition', edition);
  } catch { /* private mode / blocked storage */ }
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

  let saved = null;
  try {
    saved = localStorage.getItem('portfolioEdition');
  } catch { /* private mode / blocked storage */ }
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

  chars.forEach((char, index) => {
    char.style.transitionDelay = `${index * 45}ms`;
  });
  cascade.forEach((el, index) => {
    el.style.transitionDelay = `${chars.length * 45 + 80 + index * 100}ms`;
  });

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.classList.add('hero-entered'));
  });

  const clearDelays = () => {
    chars.forEach(char => { char.style.transitionDelay = ''; });
    cascade.forEach(el => { el.style.transitionDelay = ''; });
  };
  const longest = chars.length * 45 + 80 + Math.max(cascade.length - 1, 0) * 100 + 600;
  window.setTimeout(clearDelays, longest);
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

function updateProgressBar() {
  const bar = document.querySelector('.progress-bar');
  if (!bar) return;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const progress = height > 0 ? Math.min(100, Math.max(0, window.scrollY / height * 100)) : 0;
  bar.style.width = `${progress}%`;
  bar.setAttribute('aria-valuenow', String(Math.round(progress)));
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
}

/* --------------------------------------------------------------------------
   Navigation
   -------------------------------------------------------------------------- */

function openMobileMenu() {
  const menu = document.getElementById('navMenu');
  const toggle = document.getElementById('navToggle');
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
}

function closeMobileMenu({ restoreFocus = false } = {}) {
  const menu = document.getElementById('navMenu');
  const toggle = document.getElementById('navToggle');
  if (!menu || !toggle) return;
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
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* --------------------------------------------------------------------------
   Project filtering and disclosure
   -------------------------------------------------------------------------- */

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
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(scheduleUpdate);
      observer.observe(track);
    }

    carousel.__portfolioUpdateCarousel = () => updateChrome(carousel, track, prevBtn, nextBtn);
    carousel.__portfolioResetCarousel = () => {
      track.scrollTo({ left: 0, behavior: smoothBehavior() });
      updateChrome(carousel, track, prevBtn, nextBtn);
    };

    updateChrome(carousel, track, prevBtn, nextBtn);
  });
}

function initializeProjectFiltering() {
  const buttons = Array.from(document.querySelectorAll('.filter-btn'));
  const cards = Array.from(document.querySelectorAll('.project-card'));
  const status = document.getElementById('projectsFilterStatus') || document.getElementById('projectFilterStatus');
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
    if (projectsCarousel && typeof projectsCarousel.__portfolioUpdateCarousel === 'function') {
      if (projectsGrid) {
        projectsGrid.scrollTo({ left: 0, behavior: 'auto' });
        projectsGrid.scrollLeft = 0;
      }
      projectsCarousel.__portfolioUpdateCarousel();
      if (!instant) {
        window.setTimeout(() => {
          if (typeof projectsCarousel.__portfolioUpdateCarousel === 'function') {
            projectsCarousel.__portfolioUpdateCarousel();
          }
        }, CARD_FADE_MS + 20);
      }
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

function initializeCommandPalette() {
  const palette = document.getElementById('commandPalette');
  const input = document.getElementById('commandInput');
  const list = document.getElementById('commandList');
  if (!palette || !input || !list) return;
  const closeButton = document.getElementById('commandPaletteClose');
  const metaKbd = palette.querySelector('.command-kbd-meta');
  if (metaKbd) {
    const isApple = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
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

  const open = opener => {
    input.value = '';
    Array.from(list.children).forEach(item => {
      item.style.display = '';
      item.classList.remove('active');
      item.setAttribute('aria-selected', 'false');
    });
    openDialog(palette, opener);
  };
  window.openCommandPalette = open;
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
    Array.from(list.children).forEach(command => {
      const active = command === item;
      command.classList.toggle('active', active);
      command.setAttribute('aria-selected', String(active));
    });
    input.setAttribute('aria-activedescendant', item ? item.id : '');
  };
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    const visible = Array.from(list.children).filter(item => {
      const matches = item.textContent.toLowerCase().includes(query);
      item.style.display = matches ? '' : 'none';
      if (!matches) item.classList.remove('active');
      return matches;
    });
    setActive(visible[0] || null);
  });
  input.addEventListener('keydown', event => {
    const visible = Array.from(list.children).filter(item => item.style.display !== 'none');
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
  if (palette) closeDialog(palette);
}

function executeCommand(action) {
  closeCommandPalette();
  if (action === 'dark-mode') toggleTheme();
  else if (action === 'videos' || action === 'creative') scrollToSection('videos');
  else scrollToSection(action);
}

function initializeVideoPopup() {
  const backdrop = document.getElementById('videoPopupBackdrop');
  const popup = document.getElementById('videoPopup');
  const player = document.getElementById('videoPopupPlayer');
  const title = document.getElementById('videoPopupTitle');
  const close = document.getElementById('videoPopupClose');
  if (!backdrop || !popup || !player) return;
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
  const popup = document.getElementById('videoPopup');
  const backdrop = document.getElementById('videoPopupBackdrop');
  const player = document.getElementById('videoPopupPlayer');
  const title = document.getElementById('videoPopupTitle');
  const src = card.dataset.video;
  if (!popup || !backdrop || !player || !src) return;
  if (title) title.textContent = card.dataset.title || '';
  player.src = src;
  player.load();
  backdrop.hidden = false;
  backdrop.classList.add('active', 'visible');
  openDialog(popup, opener, [backdrop]);
  if (!motionReduced()) player.play().catch(() => {});
}

function closeVideoPopup() {
  const popup = document.getElementById('videoPopup');
  const backdrop = document.getElementById('videoPopupBackdrop');
  const player = document.getElementById('videoPopupPlayer');
  if (!popup) return;
  if (player) {
    player.pause();
    player.removeAttribute('src');
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
    const text = button.querySelector('.btn-text');
    const icon = button.querySelector('.fa-paper-plane');
    const loading = button.querySelector('.btn-loading');
    form.setAttribute('aria-busy', 'true');
    button.disabled = true;
    if (text) { text.hidden = true; text.style.display = 'none'; }
    if (icon) { icon.hidden = true; icon.style.display = 'none'; }
    if (loading) { loading.hidden = false; loading.style.display = 'inline'; }
    if (result) {
      result.setAttribute('role', 'status');
      result.textContent = 'Sending your message…';
      result.className = 'form-result';
    }
    try {
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Submission failed');
      if (result) {
        result.setAttribute('role', 'status');
        result.textContent = "Message sent! I'll get back to you soon.";
        result.className = 'form-result success';
      }
      form.reset();
    } catch {
      if (result) {
        result.setAttribute('role', 'alert');
        result.textContent = 'Failed to send message. Please try emailing me directly.';
        result.className = 'form-result error';
      }
    } finally {
      form.setAttribute('aria-busy', 'false');
      button.disabled = false;
      if (text) { text.hidden = false; text.style.removeProperty('display'); }
      if (icon) { icon.hidden = false; icon.style.removeProperty('display'); }
      if (loading) { loading.hidden = true; loading.style.display = 'none'; }
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
  document.body.classList.add('konami-activated');
  createConfetti();
  window.setTimeout(() => document.body.classList.remove('konami-activated'), 5000);
}

function createConfetti() {
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
  document.body.appendChild(container);
  for (let index = 0; index < 100; index += 1) {
    const piece = document.createElement('div');
    piece.style.cssText = `position:absolute;width:10px;height:10px;background:hsl(${Math.random() * 360} 100% 50%);top:-10px;left:${Math.random() * 100}%;opacity:${Math.random() * .5 + .5};animation:confetti-fall ${Math.random() * 3 + 2}s linear forwards;`;
    container.appendChild(piece);
  }
  const style = document.createElement('style');
  style.textContent = '@keyframes confetti-fall{to{transform:translateY(100vh) rotate(720deg)}}';
  document.head.appendChild(style);
  window.setTimeout(() => { container.remove(); style.remove(); }, 5000);
}
