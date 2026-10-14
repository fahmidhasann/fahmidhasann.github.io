/* ==========================================================
   Lab motion layer — "the page is a forward pass".
   The Studio scrolls like an edit timeline; the Lab scrolls
   like a model running: tokens stream in, attention draws,
   the loss falls as you read. Additive and self-contained:
   delete motion.css + motion.js and the Lab falls back to its
   calm original. One rAF loop that sleeps when nothing moves;
   it only writes transforms, opacity and a few custom props.
   ========================================================== */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;
  const body = document.body;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- Interactive attention (works with or without motion) ---------- */
  initAttention();

  if (reduce) return;
  root.classList.add('m-on');

  /* ---------- Atmosphere: two sage glows that drift with the story ---------- */
  const atmos = document.createElement('div');
  atmos.className = 'atmos';
  atmos.setAttribute('aria-hidden', 'true');
  atmos.innerHTML = '<div class="glow glow-a"></div><div class="glow glow-b"></div>';
  body.prepend(atmos);
  const [glowA, glowB] = atmos.children;

  /* Cursor lights up the grid it passes over (mouse / trackpad only) */
  let spot = null;
  if (fine) {
    spot = document.createElement('div');
    spot.className = 'grid-spot';
    spot.setAttribute('aria-hidden', 'true');
    body.prepend(spot);
  }

  /* ---------- Header: progress line + training readout ---------- */
  const header = $('.lab-header');
  const nav = header && $('.lab-nav', header);
  const scrub = document.createElement('span');
  scrub.className = 'scrub';
  scrub.setAttribute('aria-hidden', 'true');
  if (header) header.appendChild(scrub);
  const chip = document.createElement('span');
  chip.className = 'train';
  chip.setAttribute('aria-hidden', 'true');
  chip.innerHTML = '<i></i><span>loss 2.300</span>';
  const chipText = chip.lastChild;
  const toggleBtn = nav && $('.theme-toggle', nav);
  if (nav && toggleBtn) nav.insertBefore(chip, toggleBtn);

  /* ---------- Layer rail (wide screens): each section is a layer ---------- */
  const chapters = [
    ['hero', 'Input'], ['journey', 'Journey'], ['ai-education', 'Attention'],
    ['side-projects', 'Projects'], ['contact', 'Output']
  ].map(([id, label]) => ({ id, label, el: document.getElementById(id) })).filter((c) => c.el);
  const rail = document.createElement('nav');
  rail.className = 'layers';
  rail.setAttribute('aria-label', 'Sections');
  rail.innerHTML =
    '<span class="layers-line"></span><span class="layers-fill"></span><span class="layers-head"></span>' +
    chapters.map((c, i) => `<a class="layer" href="#${c.id === 'hero' ? 'top' : c.id}"><span>L${i} · ${c.label}</span></a>`).join('') +
    '<span class="layers-read">step 0000<br>loss 2.300</span>';
  body.appendChild(rail);
  const railFill = $('.layers-fill', rail);
  const railHead = $('.layers-head', rail);
  const railRead = $('.layers-read', rail);
  const marks = $$('.layer', rail);
  marks[0] && marks[0].addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Hero title: tokens stream in, one word at a time ---------- */
  const title = $('.hero-title');
  if (title) {
    let i = 0;
    const tokenize = (node, into) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { into.appendChild(document.createTextNode(' ')); return; }
            const tk = document.createElement('span');
            tk.className = 'tk';
            tk.style.setProperty('--i', i++);
            const inner = document.createElement('span');
            inner.textContent = part;
            tk.appendChild(inner);
            into.appendChild(tk);
          });
        } else if (n.nodeName === 'BR') {
          into.appendChild(document.createElement('br'));
        } else {
          const clone = n.cloneNode(false);
          tokenize(n, clone);
          into.appendChild(clone);
        }
      });
    };
    const frag = document.createDocumentFragment();
    tokenize(title, frag);
    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
    title.textContent = '';
    title.appendChild(frag);
    $$('.tk', title).forEach((t) => t.setAttribute('aria-hidden', 'true'));
    const caret = document.createElement('span');
    caret.className = 'caret';
    caret.setAttribute('aria-hidden', 'true');
    caret.style.setProperty('--i', i);
    (title.lastElementChild && title.lastElementChild.nodeName === 'EM' ? title.lastElementChild : title).appendChild(caret);
  }

  /* Hero: portrait locks on like a detector, then pushes in as you leave */
  const hero = $('.hero');
  const frame = $('.portrait-frame');
  const heroImg = frame && $('img', frame);
  if (frame) {
    const tag = document.createElement('span');
    tag.className = 'det-tag';
    tag.setAttribute('aria-hidden', 'true');
    tag.textContent = 'curious_human · 0.99';
    frame.appendChild(tag);
    const scan = document.createElement('span');
    scan.className = 'scan';
    scan.setAttribute('aria-hidden', 'true');
    frame.appendChild(scan);
  }

  /* ---------- Kickers decode like a model printing its answer ---------- */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/\\=';
  const decode = (el) => {
    const final = el.dataset.final;
    const out = el.querySelector('.dec');
    if (!out) return;
    const len = final.length, dur = 520 + len * 22; // ms, time-based so slow devices finish on time
    const t0 = performance.now();
    let lastSwap = 0;
    const tick = (now) => {
      const el = now - t0;
      if (el >= dur) { out.textContent = final; return; }
      if (now - lastSwap > 45) {
        lastSwap = now;
        let s = '';
        for (let k = 0; k < len; k++) {
          const ch = final[k];
          const lock = 120 + (k / len) * (dur - 160);
          s += (el >= lock || ch === ' ' || ch === '—' || ch === '·') ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        out.textContent = s;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const kickers = $$('.section-head .kicker, .contact-head > .kicker');
  kickers.forEach((k) => {
    const final = k.textContent.replace(/\s+/g, ' ').trim();
    k.dataset.final = final;
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = final;
    const dec = document.createElement('span');
    dec.className = 'dec';
    dec.setAttribute('aria-hidden', 'true');
    dec.textContent = final.replace(/[^\s—·]/g, '·');
    k.replaceChildren(sr, dec);
  });
  const kio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    kio.unobserve(e.target);
    setTimeout(() => decode(e.target), 120);
  }), { rootMargin: '0px 0px -10% 0px' });
  kickers.forEach((k) => kio.observe(k));

  /* ---------- Journey: the line is drawn by your scroll ---------- */
  const journey = $('.journey');
  const steps = journey ? $$('.journey-step', journey) : [];
  if (journey) {
    const fill = document.createElement('span');
    fill.className = 'journey-fill';
    fill.setAttribute('aria-hidden', 'true');
    journey.appendChild(fill);
  }

  /* ---------- Course stats count up (and sign-ups count down to zero) ---------- */
  const stats = $$('.stats strong');
  stats.forEach((s) => { s.dataset.to = s.textContent.trim(); });
  const runStats = () => {
    const t0 = performance.now();
    const from = stats.map((s) => (Number(s.dataset.to) === 0 ? 99 : 0));
    const step = (now) => {
      const k = clamp((now - t0) / 1500);
      const e = 1 - Math.pow(1 - k, 4);
      stats.forEach((s, i) => {
        const to = Number(s.dataset.to) || 0;
        s.textContent = String(Math.round(from[i] + (to - from[i]) * e));
      });
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const featured = $('.featured');
  if (featured && stats.length) {
    stats.forEach((s) => { s.textContent = Number(s.dataset.to) === 0 ? '99' : '0'; });
    const fio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      fio.disconnect();
      setTimeout(runStats, 350);
    }), { threshold: 0.35 });
    fio.observe(featured);
  }

  /* ---------- Project cards: the image is "scanned" in ---------- */
  const scanIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-scanned');
    scanIO.unobserve(e.target);
  }), { threshold: 0.3 });
  $$('.pimg').forEach((p) => {
    const s = document.createElement('span');
    s.className = 'scan';
    s.setAttribute('aria-hidden', 'true');
    p.appendChild(s);
    scanIO.observe(p);
  });

  /* Explainer videos slide in as a row */
  const explainers = document.getElementById('explainers');
  if (explainers) {
    const eio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      explainers.classList.add('is-in');
      eio.disconnect();
    }), { threshold: 0.2 });
    eio.observe(explainers);
  }

  /* Card spotlight follows the pointer */
  if (fine) {
    $$('.pcard, .featured, .vthumb, .form').forEach((c) => {
      c.classList.add('has-spot');
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--sx', `${e.clientX - r.left}px`);
        c.style.setProperty('--sy', `${e.clientY - r.top}px`);
      });
    });
  }

  /* Contact: a light sweep runs only while the section is on screen */
  const contact = document.getElementById('contact');
  if (contact) {
    new IntersectionObserver((es) => es.forEach((e) => contact.classList.toggle('is-live', e.isIntersecting)), { threshold: 0.2 }).observe(contact);
  }

  /* ---------- Layout cache ---------- */
  const vh = () => window.innerHeight;
  let maxScroll = 1, starts = [];
  const measure = () => {
    maxScroll = Math.max(1, root.scrollHeight - vh());
    starts = chapters.map((c) => clamp((c.el.getBoundingClientRect().top + window.scrollY - vh() * 0.35) / maxScroll));
    starts[0] = 0;
    marks.forEach((m, i) => (m.style.top = `${(i / Math.max(1, marks.length - 1)) * 100}%`));
    lp = -1;
    kick();
  };
  const railPos = (p) => {
    const n = starts.length;
    if (n < 2) return p;
    for (let i = n - 1; i >= 0; i--) {
      if (p >= starts[i]) {
        const a = starts[i], b = i < n - 1 ? starts[i + 1] : 1;
        const f = b > a ? clamp((p - a) / (b - a)) : 1;
        return clamp((i + (i < n - 1 ? f : 0)) / (n - 1));
      }
    }
    return 0;
  };

  /* The loss falls as you read: the page is one short training run */
  let lastStep = -1;
  const readout = (p) => {
    const step = Math.round(p * 1000);
    if (step === lastStep) return;
    lastStep = step;
    const loss = 2.3 * Math.exp(-4.4 * p) + 0.04 + Math.abs(Math.sin(step * 0.37)) * 0.03 * (1 - p);
    const l = loss.toFixed(3);
    chipText.textContent = `loss ${l}`;
    railRead.innerHTML = `step ${String(step).padStart(4, '0')}<br>loss ${l}`;
  };

  /* ---------- The loop ---------- */
  let running = false, lp = -1, glowY = 0, idle = 0;
  let cx = -999, cy = -999, scx = -999, scy = -999;
  const tick = () => {
    let moving = false;
    const sy = window.scrollY;
    const H = vh();
    const p = clamp(sy / maxScroll);

    if (Math.abs(p - lp) > 0.00005) {
      lp = p;
      scrub.style.transform = `scaleX(${p})`;
      const rp = railPos(p);
      railFill.style.transform = `scaleY(${rp})`;
      railHead.style.transform = `translate3d(0, ${rp * rail.clientHeight}px, 0)`;
      rail.classList.toggle('is-on', sy > H * 0.45);
      readout(p);
      let a = 0;
      for (let i = 0; i < starts.length; i++) if (p + 0.002 >= starts[i]) a = i;
      marks.forEach((m, i) => { m.classList.toggle('is-active', i === a); m.classList.toggle('is-past', i < a); });

      /* hero portrait: slow push-in while the hero leaves */
      if (heroImg && hero) {
        const k = clamp(sy / (hero.offsetHeight || 1));
        heroImg.style.transform = `translate3d(0, ${k * 7}%, 0) scale(${1.02 + k * 0.1})`;
      }

      /* journey line follows the reader */
      if (journey) {
        const r = journey.getBoundingClientRect();
        const vertical = window.innerWidth <= 680;
        const jp = vertical
          ? clamp((H * 0.62 - r.top) / Math.max(1, r.height))
          : clamp((H * 0.85 - r.top) / (H * 0.45));
        journey.style.setProperty('--jp', jp.toFixed(4));
        const n = steps.length;
        steps.forEach((s, i) => {
          const at = vertical ? (s.offsetTop + 8) / Math.max(1, r.height) : (n > 1 ? i / (n - 1) : 0) * ((n - 1) / n) + 0.02;
          s.classList.toggle('is-lit', jp >= at);
        });
      }
    }

    /* glows drift with the story, smoothed */
    glowY += (p - glowY) * 0.07;
    if (Math.abs(p - glowY) > 0.0005) moving = true;
    const t = glowY * Math.PI * 2;
    glowA.style.transform = `translate3d(${Math.sin(t) * -16}vw, ${glowY * 60}vh, 0) scale(${1 + Math.sin(t * 0.5) * 0.18})`;
    glowB.style.transform = `translate3d(${Math.cos(t) * 20}vw, ${Math.sin(t) * -22}vh, 0)`;
    glowB.style.opacity = String(0.35 + Math.abs(Math.sin(t * 1.5)) * 0.65);

    /* grid spotlight, eased toward the cursor */
    if (spot && cx > -999) {
      if (scx < -998) { scx = cx; scy = cy; }
      scx += (cx - scx) * 0.18; scy += (cy - scy) * 0.18;
      if (Math.abs(cx - scx) + Math.abs(cy - scy) > 0.5) moving = true;
      spot.style.setProperty('--cx', `${scx.toFixed(1)}px`);
      spot.style.setProperty('--cy', `${scy.toFixed(1)}px`);
    }

    if (moving) idle = 0; else idle++;
    if (idle > 3) { running = false; return; }
    requestAnimationFrame(tick);
  };
  function kick() {
    if (running) return;
    running = true; idle = 0;
    requestAnimationFrame(tick);
  }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure);
  if (spot) {
    window.addEventListener('pointermove', (e) => {
      cx = e.clientX; cy = e.clientY;
      spot.classList.add('is-on');
      kick();
    }, { passive: true });
    document.addEventListener('pointerleave', () => spot.classList.remove('is-on'));
  }
  if ('ResizeObserver' in window) {
    let rt;
    new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(measure, 120); }).observe($('main') || body);
  }
  measure();

  /* ======================================================
     Attention playground: pick any word, see where it looks.
     Weights are hand-tuned to read like a trained head.
     ====================================================== */
  function initAttention() {
    const svg = $('.attn-art');
    if (!svg) return;
    const wordEls = $$('.attn-word', svg);
    const arcsG = $('.attn-arcs', svg);
    const hit = $('.attn-hit', svg);
    const focus = $('.attn-focus', svg);
    const caption = $('.attn-caption', svg);
    if (!wordEls.length || !arcsG || !hit || !focus || !caption) return;
    const words = wordEls.map((w) => w.textContent);
    const xs = wordEls.map((w) => Number(w.getAttribute('x')));
    // rows: The cat ate the fish because it was hungry
    const W = {
      The:     [0, .58, .08, .04, .1, .03, .07, .03, .07],
      cat:     [.22, 0, .36, .05, .14, .04, .07, .03, .09],
      ate:     [.04, .4, 0, .08, .38, .03, .02, .02, .03],
      the:     [.12, .04, .1, 0, .6, .04, .03, .03, .04],
      fish:    [.04, .14, .42, .28, 0, .05, .03, .02, .02],
      because: [.03, .1, .26, .03, .1, 0, .08, .12, .28],
      it:      [.05, .62, .06, .04, .09, .05, 0, .04, .05],
      was:     [.02, .1, .04, .02, .04, .08, .34, 0, .36],
      hungry:  [.03, .44, .1, .02, .04, .08, .14, .15, 0]
    };
    const ns = 'http://www.w3.org/2000/svg';
    const base = 181;
    let current = words.indexOf('it');

    const hint = document.createElement('p');
    hint.className = 'attn-hint';
    hint.innerHTML = '<span aria-hidden="true">↳</span> Tap any word to see where it looks';
    svg.insertAdjacentElement('afterend', hint);
    svg.classList.add('is-live');

    const pill = (rect, i) => {
      const bb = wordEls[i].getBBox();
      const w = Math.max(30, bb.width + 18);
      rect.setAttribute('x', (xs[i] - w / 2).toFixed(1));
      rect.setAttribute('width', w.toFixed(1));
    };

    const draw = (fi, animate) => {
      current = fi;
      const row = W[words[fi]] || [];
      let best = 0, bestW = -1;
      row.forEach((w, j) => { if (j !== fi && w > bestW) { bestW = w; best = j; } });
      const order = row.map((w, j) => [w, j]).filter(([, j]) => j !== fi).sort((a, b) => a[0] - b[0]);
      arcsG.textContent = '';
      order.forEach(([w, j], k) => {
        const fx = xs[fi], tx = xs[j];
        const cyv = (base - 0.773 * Math.abs(fx - tx)).toFixed(1);
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', `M${fx} ${base} C${fx} ${cyv} ${tx} ${cyv} ${tx} ${base}`);
        path.setAttribute('pathLength', '1');
        path.setAttribute('class', 'attn-arc' + (j === best ? ' attn-arc-strong' : ''));
        path.setAttribute('stroke-width', (1.2 + w * 7.5).toFixed(2));
        if (j !== best) path.setAttribute('stroke-opacity', Math.min(.75, .22 + w * 1.4).toFixed(2));
        path.style.transitionDelay = `${k * 0.06}s`;
        arcsG.appendChild(path);
      });
      wordEls.forEach((el, i) => {
        el.classList.toggle('attn-word-focus', i === fi);
        el.classList.toggle('attn-word-hit', i === best);
        el.setAttribute('aria-pressed', String(i === fi));
      });
      pill(focus, fi);
      pill(hit, best);
      caption.innerHTML = '';
      const t = (s, cls) => {
        const ts = document.createElementNS(ns, 'tspan');
        if (cls) ts.setAttribute('class', cls);
        ts.textContent = s;
        caption.appendChild(ts);
      };
      t(`“${words[fi]}”`, 'attn-caption-hit');
      t(' pays the most attention to ');
      t(`“${words[best]}”`, 'attn-caption-hit');
      if (animate && root.classList.contains('m-on')) {
        arcsG.classList.add('is-redraw');
        void arcsG.getBoundingClientRect();
        requestAnimationFrame(() => arcsG.classList.remove('is-redraw'));
      }
    };

    wordEls.forEach((el, i) => {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `Show attention from “${words[i]}”`);
      el.classList.add('attn-pick');
      const go = () => { if (i !== current) draw(i, true); };
      el.addEventListener('click', go);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + wordEls.length) % wordEls.length;
          wordEls[n].focus(); draw(n, true);
        }
      });
      if (fine) el.addEventListener('pointerenter', go);
    });
    draw(current, false);
  }
})();
