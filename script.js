/* Portfolio interactions: progressively enhanced; content remains usable without JS/CDNs. */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const modalState = { active: null, opener: null, locks: new Set(), inerted: [] };
const CARD_FADE_MS = 280;

document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  document.documentElement.classList.add('js-ready');
  initializeNavigation();
  initializeProjectFiltering();
  initializeShowMore();
  initializeCommandPalette();
  initializeThemeToggle();
  initializeVideoPopup();
  initializeNavScroll();
  initializeContactForm();
  initializeEasterEgg();
  initializeParticles();
  initializeHeroEntrance();
  initializeScrollEffects();
  updateProgressBar();
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
    if (navMenu && navMenu.classList.contains('active')) closeMobileMenu();
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
  const items = Array.from(document.querySelectorAll('.project-card, .video-card, .contact-card, .section-header'));
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
  return Math.max(target.getBoundingClientRect().top + window.scrollY - 80, 0);
}

function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
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

function initializeProjectFiltering() {
  const buttons = Array.from(document.querySelectorAll('.filter-btn'));
  const cards = Array.from(document.querySelectorAll('.project-card'));
  const status = document.getElementById('projectsFilterStatus') || document.getElementById('projectFilterStatus');
  const showMore = document.getElementById('projectsShowMore');
  const visibleCount = 3;
  if (!buttons.length || !cards.length) return;

  const apply = (filter, { expand = null, reset = false, instant = false } = {}) => {
    const matching = cards.filter(card => filter === 'all' || card.dataset.category === filter);
    const currentExpanded = showMore && showMore.getAttribute('aria-expanded') === 'true';
    const isExpanded = reset ? false : (expand === null ? currentExpanded : expand);
    buttons.forEach(button => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    cards.forEach(card => {
      const index = matching.indexOf(card);
      setItemVisible(card, index >= 0 && (isExpanded || index < visibleCount), { instant });
    });
    if (showMore) {
      const hasMore = matching.length > visibleCount;
      showMore.hidden = !hasMore;
      showMore.style.display = hasMore ? '' : 'none';
      if (!hasMore) showMore.setAttribute('aria-expanded', 'true');
      else showMore.setAttribute('aria-expanded', String(isExpanded));
      const label = showMore.querySelector('.show-more-label');
      if (label) label.textContent = isExpanded && hasMore ? 'Show Less Projects' : 'Show More Projects';
    }
    if (status) {
      const intended = matching.filter((_, index) => isExpanded || index < visibleCount).length;
      status.textContent = `${intended} of ${matching.length} ${matching.length === 1 ? 'project' : 'projects'} shown`;
    }
    window.__portfolioProjectFilter = { filter, matching, apply };
  };

  buttons.forEach(button => button.addEventListener('click', () => apply(button.dataset.filter, { reset: true })));
  apply((buttons.find(button => button.classList.contains('active')) || buttons[0]).dataset.filter, { instant: true });
}

function initializeShowMore() {
  const visibleCount = 3;
  const setupVideos = () => {
    const grid = document.getElementById('videosGrid');
    const button = document.getElementById('videosShowMore');
    const container = document.getElementById('videosShowMoreContainer');
    if (!grid || !button) return;
    const items = Array.from(grid.children);
    const hasMore = items.length > visibleCount;
    if (container) container.hidden = !hasMore;
    button.hidden = !hasMore;
    button.style.display = hasMore ? '' : 'none';
    if (!hasMore) return;
    items.forEach((item, index) => setItemVisible(item, index < visibleCount, { instant: true }));
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      if (expanded && items.slice(visibleCount).some(item => item.contains(document.activeElement))) button.focus();
      items.forEach((item, index) => setItemVisible(item, !expanded || index < visibleCount));
      button.setAttribute('aria-expanded', String(!expanded));
      const label = button.querySelector('.show-more-label');
      if (label) label.textContent = expanded ? 'Show More Videos' : 'Show Less Videos';
    });
  };

  const projectButton = document.getElementById('projectsShowMore');
  if (projectButton) projectButton.addEventListener('click', () => {
    const state = window.__portfolioProjectFilter;
    if (!state) return;
    const expanded = projectButton.getAttribute('aria-expanded') === 'true';
    if (expanded && state.matching.slice(visibleCount).some(card => card.contains(document.activeElement))) projectButton.focus();
    state.apply(state.filter, { expand: !expanded });
  });
  setupVideos();
}

function revealProjectCard(card) {
  const allButton = document.querySelector('.filter-btn[data-filter="all"]');
  if (allButton && !allButton.classList.contains('active')) allButton.click();
  const state = window.__portfolioProjectFilter;
  if (state && state.matching.includes(card)) state.apply(state.filter, { expand: true });
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
      const next = event.key === 'ArrowDown' ? visible[(index + 1 + visible.length) % visible.length] : visible[(index - 1 + visible.length) % visible.length];
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
