/* Lab — small, dependency-free behaviour. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Year */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* Back to top (the #top header is fixed, so a plain anchor can't scroll to it) */
  document.querySelectorAll('a[href="#top"]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
  }));

  /* Header: solid once scrolled */
  const header = document.querySelector('.lab-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const setMenu = (open) => {
    if (!header || !toggle) return;
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    // tap outside the open menu, or scroll the page away, closes it
    document.addEventListener('click', (e) => {
      if (header.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
    });
    let openY = 0;
    toggle.addEventListener('click', () => { openY = window.scrollY; });
    window.addEventListener('scroll', () => {
      if (header.classList.contains('is-open') && Math.abs(window.scrollY - openY) > 60) setMenu(false);
    }, { passive: true });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  /* Active section in the nav */
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* Reveal on scroll */
  const reveals = Array.from(document.querySelectorAll('.reveal, .featured'));
  if (!('IntersectionObserver' in window) || reduce.matches) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
    // safety net: never leave content hidden
    window.addEventListener('load', () => setTimeout(() => {
      reveals.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
      });
    }, 400));
  }

  /* Rails: arrow buttons + disabled state */
  document.querySelectorAll('[data-rail]').forEach((rail) => {
    const controls = document.querySelector(`[data-rail-controls="${rail.dataset.rail}"]`);
    if (!controls) return;
    const [prev, next] = controls.querySelectorAll('button');
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth - 2;
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft >= max;
      controls.hidden = max <= 0;
    };
    const step = () => {
      const item = rail.querySelector(':scope > li');
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      return item ? item.getBoundingClientRect().width + gap : rail.clientWidth * 0.8;
    };
    controls.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      rail.scrollBy({ left: Number(b.dataset.dir) * step(), behavior: reduce.matches ? 'auto' : 'smooth' });
    }));
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* Demo video dialog */
  const player = document.getElementById('player');
  const video = document.getElementById('playerVideo');
  const title = document.getElementById('playerTitle');
  let lastTrigger = null;
  if (player && video && typeof player.showModal === 'function') {
    document.querySelectorAll('[data-video]').forEach((btn) => btn.addEventListener('click', () => {
      lastTrigger = btn;
      video.src = btn.dataset.video;
      title.textContent = btn.dataset.title || 'Project demo';
      player.showModal();
      video.play().catch(() => {});
    }));
    const close = () => player.close();
    player.querySelector('[data-close]').addEventListener('click', close);
    player.addEventListener('click', (e) => { if (e.target === player) close(); });
    player.addEventListener('close', () => {
      video.pause(); video.removeAttribute('src'); video.load();
      if (lastTrigger) lastTrigger.focus();
    });
  } else {
    document.querySelectorAll('[data-video]').forEach((btn) => btn.addEventListener('click', () => window.open(btn.dataset.video, '_blank', 'noopener')));
  }

  /* Contact form → Web3Forms */
  const form = document.getElementById('contactForm');
  const result = document.getElementById('formResult');
  if (form && result) {
    const say = (msg, kind) => { result.textContent = msg; result.className = 'form-result' + (kind ? ' is-' + kind : ''); };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let firstBad = null;
      form.querySelectorAll('[required]').forEach((f) => {
        const bad = !f.value.trim() || (f.type === 'email' && !f.checkValidity());
        f.setAttribute('aria-invalid', String(bad));
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) { say('Please fill in your name, a valid email and a message.', 'error'); firstBad.focus(); return; }
      if (form.botcheck && form.botcheck.checked) return;

      const btn = form.querySelector('.form-submit');
      const label = btn.querySelector('.btn-label');
      btn.disabled = true; form.setAttribute('aria-busy', 'true'); label.textContent = 'Sending…'; say('');
      try {
        const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error(data.message || 'Submission failed');
        form.reset();
        form.querySelectorAll('[aria-invalid]').forEach((f) => f.removeAttribute('aria-invalid'));
        say("Message sent! I'll get back to you soon.", 'ok');
      } catch {
        say('Failed to send message. Please try emailing me directly.', 'error');
      } finally {
        btn.disabled = false; form.setAttribute('aria-busy', 'false'); label.textContent = 'Send message';
      }
    });
  }
})();
