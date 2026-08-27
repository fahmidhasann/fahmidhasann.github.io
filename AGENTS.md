# AGENTS.md

This file is the single source of truth for coding agents working in this repository. `CLAUDE.md` points here.

## Overview

This is a static portfolio website with no build process — plain HTML, CSS, and JavaScript, no frameworks and no compilation step. It ships two editions of the same content:

- **Classic** at `/` — `index.html`, `styles.css`, `script.js`
- **Terminal** at `/v2/` — `v2/index.html`, `v2/styles.css`, `v2/script.js`

Visitors choose an edition on first visit; the choice is stored in `localStorage` under `portfolioEdition` and both editions redirect accordingly.

## Development

There is no build step and no package manager. Preview with any static server:

```bash
python3 -m http.server 4173
```

This repository carries **no linters, tests, or CI** — they were deliberately removed. Nothing checks your work automatically, so before you consider a change done:

1. Load `/` and `/v2/` and watch the browser console for errors.
2. Open devtools **Network**, filter to `Img`/`Media`, and confirm no `404`s.
3. Exercise what you touched: filters, carousels, demo popups, the terminal prompt, the contact form.
4. Check both themes and a narrow (~375px) viewport.

If you reintroduce tooling, `git log -- package.json` recovers the old setup.

## Architecture

Each edition is three files:

- [index.html](index.html) — Single-page markup with all sections (hero, projects, videos, contact, command palette)
- [styles.css](styles.css) — All styles using CSS custom properties for theming
- [script.js](script.js) — All interactivity, wrapped in an IIFE and initialized via a sequence of `initialize*()` functions called on `DOMContentLoaded`. Each initializer runs inside a `runInit()` wrapper so one failure cannot take down the rest of the page. `v2/script.js` follows the same shape with shorter `init*()` names and a `boot()` wrapper.

Patterns both scripts share, and that new code should follow:

- **Scroll and resize work goes through `onScroll()` / `onResize()`**, not a fresh `addEventListener`. They batch every subscriber into one animation frame.
- **Storage goes through the preference helpers** (`readPreference`/`writePreference`, or `readStored`/`writeStored` in v2). Touching `localStorage` directly throws in some privacy modes.
- **Anything that covers the page calls `setPageInert()`** and pairs it with `clearPageInert()` on the way out. A Tab trap alone still leaves the background reachable by pointer and screen reader.
- **Per-element state lives in a `WeakMap`**, not as a custom property on the DOM node — see `carouselControllers`.

**External dependencies** are loaded via CDN (no local install needed):
- `particles.js` — hero background animation
- `GSAP` + `ScrollTrigger` — scroll-triggered card animations
- `Font Awesome` — icons
- `Google Fonts` — Cormorant Garamond (headings), Inter (body)

CDN `<script>` and `<link rel="stylesheet">` tags carry `integrity` + `crossorigin` attributes. **If you change a CDN URL or version, you must regenerate its Subresource Integrity hash**, otherwise the browser will refuse to load it:
```bash
curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A
```
The `Content-Security-Policy` in `vercel.json` also allowlists the CDN hosts — add any new host there too.

**Inline scripts are allowlisted by hash**, not by `'unsafe-inline'`. If you edit the inline `<script>` in either `index.html` or `v2/index.html`, its `sha256-` entry in `script-src` **must** be regenerated or the browser silently refuses to run it — the edition redirect and theme setup break in production while looking fine locally, because the local server does not apply the policy.

There is no longer a test guarding this. Recompute both hashes by hand and compare them against `vercel.json`:

```bash
node <<'JS'
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
for (const page of ['index.html', 'v2/index.html']) {
  const html = readFileSync(page, 'utf8');
  for (const m of html.matchAll(/<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    const type = /\stype\s*=\s*["']([^"']+)["']/.exec(m[1])?.[1];
    if (type && !/^(module|text\/javascript|application\/javascript)$/i.test(type)) continue;
    console.log(page, 'sha256-' + createHash('sha256').update(m[2]).digest('base64'));
  }
}
JS
```

## Theming

CSS variables are defined at the `:root` level and overridden via `[data-theme="dark"]` on the `<html>` element (the terminal edition inverts this: dark is its default and `[data-theme="light"]` is the override). Theme preference is shared between the editions under the `theme` key in `localStorage`.

When adding new components, always use the existing CSS variables rather than hardcoded colors — including the `--z-*` stacking scale near the top of each stylesheet instead of ad-hoc `z-index` numbers.

## Project Filtering

Projects in the HTML have `data-category` attributes (`ai`, `automation`, `data`). The filter buttons in `script.js` toggle visibility by matching this attribute. Matching cards live in a horizontal peek carousel (`#projectsGrid`); filtering resets the track to the start. Adding a new project requires:
1. Adding the card to the `#projectsGrid` carousel track in `index.html` with the correct `data-category`
2. No JS changes needed unless adding a new category

## Creative Work

The `#videos` section has two subsections in `index.html`, each in its own peek carousel:
- **Personal Projects** — `#personalVideosGrid` (`.video-grid` / `.video-card-link`)
- **Client Projects** — `#clientVideosGrid` (`.reel-grid` / `.reel-card`)

Add new video cards to the matching track. Project media lives under `assets/project/`, client reel thumbnails under `assets/client/`. Carousel chrome (edge fades, prev/next arrows, keyboard) is initialized by `initializeCarousels()` for every `[data-carousel]` shell.

## Command Palette

Accessible via `Cmd+K` / `Ctrl+K`. Commands are defined as an array in `script.js` inside `initializeCommandPalette()`. Add new navigation targets there.

## Repository hygiene

- `graphify-out/`, `.firecrawl/`, and `tasks/` are deliberately untracked. The knowledge graph is regenerated with `graphify update .`, never committed — re-adding it puts 90+ generated files back into every diff.
- `node_modules/`, `package.json`, the linter configs, `tests/`, and `.github/` were intentionally deleted. Do not recreate them unless asked.
- Assets are lowercase kebab-case with no spaces or `&`. Project media lives in `assets/project/`, client reels in `assets/client/`; everything else sits at the `assets/` root.

## graphify

`graphify-out/` is not checked in and is absent by default. Generate it on demand with `graphify update .` to get a knowledge graph with god nodes, community structure, and cross-file relationships; the rules below apply only once it exists.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
