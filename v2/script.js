/* Terminal edition — progressive enhancement only. All content is in the HTML,
   so the page stays usable if this file never loads. */

(function() {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SECTIONS = ['home', 'projects', 'creative', 'contact'];
  const CONSOLE_MAX_LINES = 240;
  const MATRIX_MS = 6000;
  const CONTACT_ENDPOINT = 'https://api.web3forms.com/submit';

  const dom = {};
  const popupState = { opener: null };

  document.addEventListener('DOMContentLoaded', () => {
    cacheDom();

    const boot = (name, fn) => {
      try {
        fn();
      } catch (error) {
        console.error(`[terminal] ${name} failed`, error);
      }
    };

    boot('theme', initTheme);
    boot('editionSwitch', initEditionSwitch);
    boot('reveals', initReveals);
    boot('anchors', initAnchors);
    boot('scrollState', initScrollState);
    boot('carousels', initCarousels);
    boot('filters', initFilters);
    boot('videoPopup', initVideoPopup);
    boot('contactForm', initContactForm);
    boot('prompt', initPrompt);
    boot('bootSequence', initBootSequence);
  });

  function cacheDom() {
    dom.titlebar = document.querySelector('.titlebar');
    dom.promptbar = document.querySelector('.promptbar');
    dom.prompt = document.getElementById('prompt');
    dom.ghostTyped = document.querySelector('.ghost-typed');
    dom.ghostRest = document.querySelector('.ghost-rest');
    dom.console = document.getElementById('console');
    dom.consoleLines = document.getElementById('consoleLines');
    dom.consoleClear = document.getElementById('consoleClear');
    dom.themeToggle = document.getElementById('themeToggle');
    dom.themeLabel = document.getElementById('themeLabel');
    dom.progress = document.getElementById('scrollProgress');
    dom.navLinks = Array.from(document.querySelectorAll('.navlink'));
    dom.projects = Array.from(document.querySelectorAll('.proj'));
    dom.flags = Array.from(document.querySelectorAll('.flag'));
    dom.flagEcho = document.getElementById('activeFlagEcho');
    dom.projectsList = document.getElementById('projectsList');
    dom.projectsCarousel = dom.projectsList && dom.projectsList.closest('[data-carousel]');
    dom.projectsTotal = document.getElementById('projectsTotal');
    dom.filterStatus = document.getElementById('projectsFilterStatus');
    dom.popup = document.getElementById('videoPopup');
    dom.popupBackdrop = document.getElementById('videoPopupBackdrop');
    dom.popupTitle = document.getElementById('videoPopupTitle');
    dom.popupPlayer = document.getElementById('videoPopupPlayer');
    dom.popupClose = document.getElementById('videoPopupClose');
  }

  function motionOff() { return reduceMotion.matches; }

  function scrollBehavior() { return motionOff() ? 'auto' : 'smooth'; }

  /* --------------------------------------------------------------------------
     Coalesced scroll and resize dispatch

     The progress bar, the current-section highlight and every carousel react to
     the same two event streams. Subscribing here keeps that to one listener per
     stream and one batch of layout reads per animation frame.
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
          console.error(`[terminal] ${eventName} subscriber failed`, error);
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
     Preference storage

     Reading or writing storage throws outright in some privacy modes, so every
     access goes through these helpers and degrades to "no preference saved".
     -------------------------------------------------------------------------- */

  function readStored(store, key) {
    try {
      return store.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStored(store, key, value) {
    try {
      store.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  /* --------------------------------------------------------------------------
     Theme
     -------------------------------------------------------------------------- */

  function initTheme() {
    syncThemeButton(currentTheme());
    dom.themeToggle?.addEventListener('click', () => {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  function currentTheme() {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    writeStored(localStorage, 'theme', theme);
    syncThemeButton(theme);
  }

  function syncThemeButton(theme) {
    if (dom.themeLabel) dom.themeLabel.textContent = theme;
    dom.themeToggle?.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  function rememberEdition(edition) {
    if (edition !== 'classic' && edition !== 'terminal') return false;
    writeStored(localStorage, 'portfolioEdition', edition);
    return true;
  }

  function goClassic() {
    rememberEdition('classic');
    window.location.assign('/');
  }

  function isCurrentEditionPath(edition) {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (edition === 'classic') return path === '' || path === '/' || path.endsWith('/index.html');
    if (edition === 'terminal') return path === '/v2' || path.endsWith('/v2') || path.includes('/v2/');
    return false;
  }

  function initEditionSwitch() {
    document.querySelectorAll('.edition-switch[data-edition]').forEach(link => {
      if (link.dataset.editionReady) return;
      link.dataset.editionReady = 'true';
      link.addEventListener('click', (event) => {
        const edition = link.dataset.edition;
        if (!rememberEdition(edition)) return;
        // Save first, then navigate ourselves so the preference always sticks
        // even if something else interrupts the default link behaviour.
        event.preventDefault();
        if (isCurrentEditionPath(edition)) return;
        window.location.assign(link.href);
      });
    });
  }

  /* --------------------------------------------------------------------------
     Scroll reveals
     -------------------------------------------------------------------------- */

  function initReveals() {
    const items = Array.from(document.querySelectorAll('.reveal'));
    if (!items.length || motionOff() || !('IntersectionObserver' in window)) return;

    let observer;
    try {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    } catch {
      return;
    }

    // `js-ready` is what hides un-revealed cards, so only set it once the
    // observer that reveals them again is known to exist.
    document.documentElement.classList.add('js-ready');
    items.forEach(item => observer.observe(item));
  }

  /* --------------------------------------------------------------------------
     In-page navigation
     -------------------------------------------------------------------------- */

  function stickyOffset() {
    const bars = (dom.titlebar?.offsetHeight || 0) + (dom.promptbar?.offsetHeight || 0);
    const log = dom.console && !dom.console.hidden ? dom.console.offsetHeight : 0;
    return bars + log + 16;
  }

  function goToSection(id) {
    const target = document.getElementById(id);
    if (!target) return false;
    const top = target.getBoundingClientRect().top + window.scrollY - stickyOffset();
    window.scrollTo({ top: Math.max(top, 0), behavior: scrollBehavior() });
    return true;
  }

  function initAnchors() {
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href').slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      goToSection(id);
      window.history.replaceState(null, '', `#${id}`);

      // A skip link has to move focus, not just the viewport.
      if (link.classList.contains('skip-link')) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  }

  function initScrollState() {
    const update = () => {
      updateProgress();
      updateCurrentSection();
    };
    onScroll(update);
    onResize(update);
  }

  function updateProgress() {
    if (!dom.progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
    const cells = 14;
    const filled = Math.round(ratio * cells);
    const bar = '█'.repeat(filled) + '·'.repeat(cells - filled);
    dom.progress.textContent = `[${bar}] ${String(Math.round(ratio * 100)).padStart(3, ' ')}%`;
  }

  function updateCurrentSection() {
    // A little slack so a section counts as current the moment it lands under
    // the sticky bars, however the scroll was triggered.
    const line = stickyOffset() + 48;
    let active = SECTIONS[0];
    SECTIONS.forEach(id => {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= line) active = id;
    });
    dom.navLinks.forEach(link => {
      link.classList.toggle('current', link.dataset.section === active);
    });
  }

  /* --------------------------------------------------------------------------
     Carousels
     -------------------------------------------------------------------------- */

  // Keyed by the carousel shell so filtering can drive a carousel it does not own,
  // without hanging custom properties off the DOM node.
  const carouselControllers = new WeakMap();

  function initCarousels() {
    const carousels = Array.from(document.querySelectorAll('[data-carousel]'));
    if (!carousels.length) return;

    const getStep = (track) => {
      const item = Array.from(track.children).find(child => !child.hidden && child.offsetParent !== null);
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
      track.scrollBy({ left: getStep(track) * direction, behavior: scrollBehavior() });
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
        update: () => updateChrome(carousel, track, prevBtn, nextBtn),
        reset: () => {
          track.scrollTo({ left: 0, behavior: 'auto' });
          track.scrollLeft = 0;
          updateChrome(carousel, track, prevBtn, nextBtn);
        }
      });

      updateChrome(carousel, track, prevBtn, nextBtn);
    });
  }

  /* --------------------------------------------------------------------------
     Project filtering
     -------------------------------------------------------------------------- */

  const FILTERS = ['all', 'ai', 'automation', 'data'];
  // Long enough for the browser to re-lay-out the track after cards are hidden.
  const FILTER_RELAYOUT_MS = 40;
  let activeFilter = 'all';

  function initFilters() {
    dom.flags.forEach(flag => {
      flag.addEventListener('click', () => applyFilter(flag.dataset.filter));
    });
    applyFilter('all', { silent: true });
  }

  function applyFilter(filter, { silent = false } = {}) {
    if (!FILTERS.includes(filter)) return 0;
    activeFilter = filter;

    let shown = 0;
    dom.projects.forEach(project => {
      const match = filter === 'all' || project.dataset.category === filter;
      project.hidden = !match;
      if (!match) return;
      shown += 1;
      // A card revealed by filtering may never have crossed the observer.
      if (!silent) project.classList.add('in');
    });

    dom.flags.forEach(flag => {
      const on = flag.dataset.filter === filter;
      flag.classList.toggle('active', on);
      flag.setAttribute('aria-pressed', String(on));
    });

    if (dom.flagEcho) dom.flagEcho.textContent = `--filter=${filter}`;
    if (dom.projectsTotal) dom.projectsTotal.textContent = String(shown);
    if (dom.filterStatus && !silent) {
      dom.filterStatus.textContent = `${shown} project${shown === 1 ? '' : 's'} shown for filter ${filter}.`;
    }

    const carousel = dom.projectsCarousel && carouselControllers.get(dom.projectsCarousel);
    if (carousel) {
      carousel.reset();
      // Hiding cards changes the track width, but not until layout settles.
      if (!silent) window.setTimeout(carousel.update, FILTER_RELAYOUT_MS);
    } else if (dom.projectsList) {
      dom.projectsList.scrollLeft = 0;
    }

    return shown;
  }

  /* --------------------------------------------------------------------------
     Video popup
     -------------------------------------------------------------------------- */

  function initVideoPopup() {
    document.querySelectorAll('.btn-demo').forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.proj');
        if (card) openDemo(card, button);
      });
    });

    dom.popupClose?.addEventListener('click', closeDemo);
    dom.popupBackdrop?.addEventListener('click', closeDemo);

    document.addEventListener('keydown', event => {
      if (dom.popup?.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDemo();
        return;
      }
      if (event.key === 'Tab') trapFocus(event, dom.popup);
    });
  }

  function openDemo(card, opener) {
    const source = card.dataset.video;
    if (!source || !dom.popup) return;

    dom.popupTitle.textContent = card.dataset.title || card.querySelector('.proj-title')?.textContent || 'Demo';
    dom.popupPlayer.src = source;
    dom.popupBackdrop.hidden = false;
    dom.popup.hidden = false;
    document.body.classList.add('locked');
    popupState.opener = opener || null;
    dom.popupClose?.focus();
    dom.popupPlayer.play?.().catch(() => { /* autoplay may be blocked */ });
  }

  function closeDemo() {
    if (!dom.popup || dom.popup.hidden) return;
    dom.popupPlayer.pause?.();
    dom.popupPlayer.removeAttribute('src');
    dom.popupPlayer.load?.();
    dom.popup.hidden = true;
    dom.popupBackdrop.hidden = true;
    document.body.classList.remove('locked');
    popupState.opener?.focus?.();
    popupState.opener = null;
  }

  function trapFocus(event, container) {
    const focusable = Array.from(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.getClientRects().length > 0);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* --------------------------------------------------------------------------
     Contact form (Web3Forms)
     -------------------------------------------------------------------------- */

  function initContactForm() {
    const form = document.getElementById('contactForm');
    const result = document.getElementById('formResult');
    if (!form) return;

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = form.querySelector('.contact-submit');
      if (!button || button.disabled) return;

      const label = button.querySelector('.btn-text');
      const loading = button.querySelector('.btn-loading');

      form.setAttribute('aria-busy', 'true');
      button.disabled = true;
      if (label) label.hidden = true;
      if (loading) loading.hidden = false;
      setFormResult(result, 'sending message', 'is-pending');

      try {
        const response = await fetch(CONTACT_ENDPOINT, { method: 'POST', body: new FormData(form) });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'Submission failed');
        setFormResult(result, "[ok] message sent — I'll get back to you soon.", 'is-ok');
        form.reset();
      } catch (error) {
        console.error('[terminal] contact form submission failed', error);
        setFormResult(result, '[error] could not send. Please email fahmidhasantaohid@gmail.com directly.', 'is-err');
      } finally {
        form.setAttribute('aria-busy', 'false');
        button.disabled = false;
        if (label) label.hidden = false;
        if (loading) loading.hidden = true;
      }
    });
  }

  function setFormResult(node, message, className) {
    if (!node) return;
    node.textContent = message;
    node.className = `formresult ${className}`;
    node.setAttribute('role', className === 'is-err' ? 'alert' : 'status');
  }

  /* --------------------------------------------------------------------------
     Console output
     -------------------------------------------------------------------------- */

  function showConsole() {
    if (!dom.console) return;
    dom.console.hidden = false;
  }

  function printLine(text = '', variant = 'is-out') {
    if (!dom.consoleLines) return null;
    showConsole();
    const line = document.createElement('div');
    line.className = `console-line ${variant}`;
    line.textContent = text;
    dom.consoleLines.appendChild(line);
    trimConsole();
    dom.consoleLines.scrollTop = dom.consoleLines.scrollHeight;
    return line;
  }

  function printLines(lines, variant = 'is-out') {
    lines.forEach(line => printLine(line, variant));
  }

  function printGap() {
    if (!dom.consoleLines) return;
    showConsole();
    const gap = document.createElement('div');
    gap.className = 'console-gap';
    dom.consoleLines.appendChild(gap);
  }

  function printLink(label, href, { external = false } = {}) {
    const line = printLine('', 'is-out');
    if (!line) return;
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.textContent = label;
    if (external) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
    line.appendChild(anchor);
  }

  function trimConsole() {
    while (dom.consoleLines.childElementCount > CONSOLE_MAX_LINES) {
      dom.consoleLines.firstElementChild.remove();
    }
  }

  function clearConsole() {
    if (!dom.consoleLines) return;
    dom.consoleLines.replaceChildren();
    dom.console.hidden = true;
  }

  /* --------------------------------------------------------------------------
     Command registry
     -------------------------------------------------------------------------- */

  function projectIndex() {
    return dom.projects.map(project => ({
      slug: project.dataset.slug,
      category: project.dataset.category,
      title: project.querySelector('.proj-title')?.textContent?.trim() || project.dataset.slug,
      hasVideo: Boolean(project.dataset.video),
      node: project
    }));
  }

  function demoSlugs() {
    return projectIndex().filter(item => item.hasVideo).map(item => item.slug);
  }

  const COMMANDS = {
    help: {
      summary: 'list every command',
      run() {
        printLine('available commands', 'is-dim');
        Object.keys(COMMANDS).sort().forEach(name => {
          const command = COMMANDS[name];
          const signature = command.usage ? `${name} ${command.usage}` : name;
          printLine(`  ${signature.padEnd(22, ' ')}${command.summary}`);
        });
        printGap();
        printLine('tab completes · ↑ ↓ walks history · ⌘K or ctrl+K focuses the prompt', 'is-dim');
        printLine('tip: type classic (or use Classic | Terminal above) to leave this edition', 'is-dim');
      }
    },

    classic: {
      summary: 'open the classic portfolio edition',
      run() {
        printLine('switching to classic edition...', 'is-ok');
        goClassic();
      }
    },

    ls: {
      summary: 'list a directory — projects, creative',
      usage: '[dir]',
      args: () => ['projects', 'creative'],
      run(args) {
        const target = (args[0] || '').replace(/^~?\/?/, '').replace(/\/$/, '');

        if (!target || target === '.') {
          printLines([
            'drwxr-xr-x  projects   7 items',
            'drwxr-xr-x  creative   8 items',
            '-rw-r--r--  about.txt',
            '-rw-r--r--  contact.txt'
          ]);
          return;
        }

        if (target === 'projects') {
          const items = projectIndex().filter(item => activeFilter === 'all' || item.category === activeFilter);
          printLine(`total ${items.length}  (filter: ${activeFilter})`, 'is-dim');
          items.forEach(item => {
            printLine(`  ${item.category.padEnd(11, ' ')}${item.slug.padEnd(18, ' ')}${item.title}`);
          });
          return;
        }

        if (target === 'creative' || target === 'creative/personal' || target === 'creative/client') {
          const personal = Array.from(document.querySelectorAll('.film-title')).map(node => node.textContent.trim());
          const client = Array.from(document.querySelectorAll('.reel-title')).map(node => node.textContent.trim());
          if (target !== 'creative/client') {
            printLine(`personal/  ${personal.length} items`, 'is-dim');
            personal.forEach(title => printLine(`  ${title}`));
          }
          if (target !== 'creative/personal') {
            if (target === 'creative') printGap();
            printLine(`client/  ${client.length} items`, 'is-dim');
            client.forEach(title => printLine(`  ${title}`));
          }
          return;
        }

        printLine(`ls: cannot access '${target}': no such directory`, 'is-err');
      }
    },

    open: {
      summary: 'jump to home, projects, creative or contact',
      usage: '<section>',
      args: () => SECTIONS,
      run(args) {
        const target = (args[0] || '').replace(/^~?\/?/, '');
        if (!target) {
          printLine('open: which section? try: open projects', 'is-err');
          return;
        }
        if (!goToSection(target)) {
          printLine(`open: no section named '${target}'`, 'is-err');
          return;
        }
        printLine(`→ ~/${target}`, 'is-ok');
      }
    },

    cat: {
      summary: 'print about.txt or contact.txt',
      usage: '<file>',
      args: () => ['about.txt', 'contact.txt'],
      run(args) {
        const file = (args[0] || '').replace(/\.txt$/, '');
        if (file === 'about') {
          document.querySelectorAll('#home .prose').forEach(node => {
            printLine(node.textContent.trim());
            printGap();
          });
          return;
        }
        if (file === 'contact') {
          printLine('email     fahmidhasantaohid@gmail.com');
          printLine('whatsapp  +880 1732 021592');
          printLine('reply     usually within 24h');
          return;
        }
        printLine(`cat: ${args[0] || ''}: no such file`, 'is-err');
      }
    },

    whoami: {
      summary: 'print the short bio',
      run() {
        printLine('fahmid hasan', 'is-ok');
        printLine('builder · AI automation · visual storytelling');
        printLine('AI agents, RAG systems, workflow automation · videography and short films');
        printLine('status: available for client work', 'is-dim');
      }
    },

    filter: {
      summary: 'filter projects — all, ai, automation, data',
      usage: '<category>',
      args: () => FILTERS,
      run(args) {
        const value = args[0];
        if (!FILTERS.includes(value)) {
          printLine(`filter: unknown category '${value || ''}' — try: ${FILTERS.join(', ')}`, 'is-err');
          return;
        }
        const shown = applyFilter(value);
        printLine(`filter=${value} → ${shown} project${shown === 1 ? '' : 's'}`, 'is-ok');
        goToSection('projects');
      }
    },

    demo: {
      summary: 'play a project demo video',
      usage: '<project>',
      args: demoSlugs,
      run(args) {
        const slug = args[0];
        const available = demoSlugs();
        if (!slug) {
          printLine(`demo: pick one of: ${available.join(', ')}`, 'is-err');
          return;
        }
        const match = projectIndex().find(item => item.slug === slug && item.hasVideo);
        if (!match) {
          printLine(`demo: no video for '${slug}' — available: ${available.join(', ')}`, 'is-err');
          return;
        }
        printLine(`playing ${slug}`, 'is-ok');
        openDemo(match.node, dom.prompt);
      }
    },

    theme: {
      summary: 'switch colour theme — dark or light',
      usage: '[mode]',
      args: () => ['dark', 'light'],
      run(args) {
        const value = args[0];
        if (value && !['dark', 'light'].includes(value)) {
          printLine(`theme: '${value}' is not a theme — try dark or light`, 'is-err');
          return;
        }
        const next = value || (currentTheme() === 'dark' ? 'light' : 'dark');
        setTheme(next);
        printLine(`theme=${next}`, 'is-ok');
      }
    },

    social: {
      summary: 'print social links',
      run() {
        printLink('linkedin   /in/fahmid-hasan-taohid', 'https://www.linkedin.com/in/fahmid-hasan-taohid/', { external: true });
        printLink('github     /fahmidhasann', 'https://github.com/fahmidhasann', { external: true });
        printLink('instagram  /fahmid_hasann', 'https://www.instagram.com/fahmid_hasann/', { external: true });
        printLink('facebook   /fahmiddhasann', 'https://www.facebook.com/fahmiddhasann', { external: true });
      }
    },

    neofetch: {
      summary: 'show the system card',
      run() {
        const projects = projectIndex().length;
        const films = document.querySelectorAll('.film').length;
        const reels = document.querySelectorAll('.reel').length;
        printLines([
          '   ▄▄▄▄▄▄▄    fahmid@portfolio',
          '   █ ▄▄▄ █    ---------------',
          `   █ ███ █    projects : ${projects}`,
          `   █▄▄▄▄▄█    films    : ${films}`,
          `   ▄▄▄▄▄▄▄    reels    : ${reels}`,
          `   █ ▀▀▀ █    theme    : ${currentTheme()}`,
          '   █▄▄▄▄▄█    shell    : terminal edition v2'
        ]);
      }
    },

    clear: {
      summary: 'clear this output',
      run() { clearConsole(); }
    },

    sudo: {
      summary: 'nice try',
      run() {
        if (motionOff()) {
          printLine('sudo: visitor is not in the sudoers file. This incident has been reported.', 'is-err');
          return;
        }
        printLine(`sudo: permission granted for exactly ${MATRIX_MS / 1000} seconds`, 'is-ok');
        runMatrix(MATRIX_MS);
      }
    }
  };

  /* --------------------------------------------------------------------------
     Prompt engine
     -------------------------------------------------------------------------- */

  const cmdHistory = { entries: [], index: -1, draft: '' };

  function initPrompt() {
    const input = dom.prompt;
    if (!input) return;

    dom.consoleClear?.addEventListener('click', () => {
      clearConsole();
      input.focus();
    });

    input.addEventListener('input', updateGhost);
    input.addEventListener('blur', clearGhost);
    input.addEventListener('focus', updateGhost);

    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitPrompt(input.value);
        return;
      }
      if (event.key === 'Tab') {
        const completion = suggestFor(input.value);
        if (completion) {
          event.preventDefault();
          input.value = completion;
          updateGhost();
        }
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        stepHistory(-1);
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        stepHistory(1);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        if (input.value) {
          input.value = '';
          updateGhost();
        } else {
          input.blur();
        }
      }
    });

    document.addEventListener('keydown', event => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        focusPrompt();
        return;
      }
      const popupOpen = dom.popup && !dom.popup.hidden;
      if (event.key === '/' && !meta && !isTyping(event.target) && !popupOpen) {
        event.preventDefault();
        focusPrompt();
      }
    });
  }

  function isTyping(node) {
    if (!node) return false;
    const tag = node.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable;
  }

  function focusPrompt() {
    dom.prompt?.focus();
    dom.prompt?.select();
  }

  function submitPrompt(raw) {
    const entry = raw.trim();
    dom.prompt.value = '';
    clearGhost();

    printLine(`visitor@fahmid:~$ ${entry}`, 'is-echo');
    if (!entry) return;

    cmdHistory.entries.push(entry);
    cmdHistory.index = -1;
    cmdHistory.draft = '';

    const [name, ...args] = entry.split(/\s+/);
    const command = COMMANDS[name.toLowerCase()];

    if (!command) {
      printLine(`command not found: ${name} — type 'help' for the list`, 'is-err');
    } else {
      try {
        command.run(args.map(arg => arg.toLowerCase()));
      } catch (error) {
        console.error(`[terminal] ${name} failed`, error);
        printLine(`${name}: unexpected error`, 'is-err');
      }
    }

    // `clear` empties and hides the console, so do not reopen it with a gap.
    if (dom.console && !dom.console.hidden) printGap();
  }

  function stepHistory(direction) {
    const input = dom.prompt;
    if (!cmdHistory.entries.length) return;

    if (cmdHistory.index === -1) {
      if (direction > 0) return;
      cmdHistory.draft = input.value;
      cmdHistory.index = cmdHistory.entries.length - 1;
    } else {
      const next = cmdHistory.index + direction;
      if (next < 0) return;
      if (next >= cmdHistory.entries.length) {
        cmdHistory.index = -1;
        input.value = cmdHistory.draft;
        updateGhost();
        return;
      }
      cmdHistory.index = next;
    }

    input.value = cmdHistory.entries[cmdHistory.index];
    input.setSelectionRange(input.value.length, input.value.length);
    updateGhost();
  }

  function suggestFor(value) {
    if (!value) return null;

    const parts = value.split(/\s+/);

    // Still typing the command name.
    if (parts.length === 1) {
      const partial = parts[0].toLowerCase();
      const match = Object.keys(COMMANDS).sort().find(name => name.startsWith(partial) && name !== partial);
      return match || null;
    }

    // Typing the first argument.
    if (parts.length > 2) return null;
    const name = parts[0].toLowerCase();
    const command = COMMANDS[name];
    if (!command || typeof command.args !== 'function') return null;

    const partial = parts[1].toLowerCase();
    const match = command.args().find(option => option.startsWith(partial) && option !== partial);
    return match ? `${name} ${match}` : null;
  }

  function updateGhost() {
    const input = dom.prompt;
    if (!input || !dom.ghostTyped || !dom.ghostRest) return;

    const value = input.value;
    const suggestion = value ? suggestFor(value) : null;

    if (!suggestion || !suggestion.startsWith(value) || input.scrollLeft > 0) {
      clearGhost();
      return;
    }

    dom.ghostTyped.textContent = value;
    dom.ghostRest.textContent = suggestion.slice(value.length);
  }

  function clearGhost() {
    if (dom.ghostTyped) dom.ghostTyped.textContent = '';
    if (dom.ghostRest) dom.ghostRest.textContent = '';
  }

  /* --------------------------------------------------------------------------
     Boot sequence
     -------------------------------------------------------------------------- */

  const BOOT_KEY = 'v2:booted';
  const BOOT_LINE_MS = 110;
  const BOOT_FAILSAFE_MS = 2600;
  const BOOT_FADE_MS = 400;

  function initBootSequence() {
    if (readStored(sessionStorage, BOOT_KEY) === '1' || motionOff()) return;

    writeStored(sessionStorage, BOOT_KEY, '1');

    const projects = document.querySelectorAll('.proj').length;
    const films = document.querySelectorAll('.film').length + document.querySelectorAll('.reel').length;
    const lines = [
      'fahmid-portfolio bios v2.0 — terminal edition',
      '> mounting /home/fahmid ............... [ ok ]',
      `> loading projects (${projects}) ................ [ ok ]`,
      `> loading creative work (${films}) ........... [ ok ]`,
      '> starting shell ...................... [ ok ]',
      '> tip: type classic — or use Classic | Terminal above',
      'ready.'
    ];

    const overlay = document.createElement('div');
    overlay.className = 'boot';
    overlay.setAttribute('aria-hidden', 'true');

    const skip = document.createElement('p');
    skip.className = 'boot-skip';
    skip.textContent = 'press any key to skip';
    overlay.appendChild(skip);

    document.body.appendChild(overlay);
    document.body.classList.add('locked');

    let index = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearInterval(timer);
      window.clearTimeout(failsafe);
      document.removeEventListener('keydown', finish);
      document.removeEventListener('pointerdown', finish);
      document.body.classList.remove('locked');
      overlay.dataset.done = 'true';
      window.setTimeout(() => overlay.remove(), BOOT_FADE_MS);
    };

    const timer = window.setInterval(() => {
      if (index >= lines.length) {
        finish();
        return;
      }
      const line = document.createElement('p');
      line.className = 'boot-line';
      line.textContent = lines[index];
      overlay.insertBefore(line, skip);
      index += 1;
    }, BOOT_LINE_MS);

    const failsafe = window.setTimeout(finish, BOOT_FAILSAFE_MS);
    document.addEventListener('keydown', finish);
    document.addEventListener('pointerdown', finish);
  }

  /* --------------------------------------------------------------------------
     Matrix rain (sudo easter egg)
     -------------------------------------------------------------------------- */

  function runMatrix(duration) {
    const existing = document.querySelector('.matrix');
    if (existing) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'matrix';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const context = canvas.getContext('2d');
    if (!context) {
      canvas.remove();
      return;
    }

    const glyphs = 'アイウエオカキクケコサシスセソ01</>{}$#*+=—|';
    let columns = 0;
    let drops = [];
    const size = 14;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.ceil(canvas.width / size);
      drops = new Array(columns).fill(0).map(() => Math.random() * -40);
    };
    resize();
    window.addEventListener('resize', resize);

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3dfc7a';
    const fade = currentTheme() === 'light' ? 'rgba(244, 241, 234, .16)' : 'rgba(10, 14, 10, .16)';

    let raf = 0;
    const draw = () => {
      context.fillStyle = fade;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = accent;
      context.font = `${size}px monospace`;
      drops.forEach((y, column) => {
        const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
        context.fillText(glyph, column * size, y * size);
        drops[column] = y * size > canvas.height && Math.random() > .975 ? 0 : y + 1;
      });
      raf = window.requestAnimationFrame(draw);
    };
    draw();

    window.setTimeout(() => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.remove();
    }, duration);
  }
})();
