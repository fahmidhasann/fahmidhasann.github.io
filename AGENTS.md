# AGENTS.md

This file is the single source of truth for coding agents working in this repository. `CLAUDE.md` points here.

## Overview

This is a static portfolio website with no build process — plain HTML, CSS, and JavaScript, no frameworks and no compilation step. It ships two editions of the same content:

- **Classic** at `/` — `index.html`, `styles.css`, `script.js`
- **Terminal** at `/v2/` — `v2/index.html`, `v2/styles.css`, `v2/script.js`

Visitors choose an edition on first visit; the choice is stored in `localStorage` under `portfolioEdition` and both editions redirect accordingly.

## Development

**To preview locally**, use any static file server:
```bash
npm start   # or: python3 -m http.server 4173
```

**Quality gates.** npm is used for development tooling only and is kept out of the deployment by `.vercelignore`:
```bash
npm install            # once
npm run test:install   # once, downloads Chromium for Playwright
npm run lint           # ESLint + Stylelint + html-validate
npm test               # Playwright smoke tests for both editions
```
Both commands run in CI (`.github/workflows/ci.yml`). Run them before committing. When you change behaviour, add or update a test in `tests/smoke.spec.js`.

**Deployment**: Pushing to `main` on GitHub triggers Vercel deployment automatically. Security headers and asset caching are configured in `vercel.json`.

## Architecture

Each edition is three files:

- [index.html](index.html) — Single-page markup with all sections (hero, projects, videos, contact, command palette)
- [styles.css](styles.css) — All styles using CSS custom properties for theming
- [script.js](script.js) — All interactivity, wrapped in an IIFE and initialized via a sequence of `initialize*()` functions called on `DOMContentLoaded`. Each initializer runs inside a `runInit()` wrapper so one failure cannot take down the rest of the page.

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

## Theming

CSS variables are defined at the `:root` level and overridden via `[data-theme="dark"]` on the `<html>` element. Theme preference is persisted in `localStorage`. When adding new components, always use the existing CSS variables rather than hardcoded colors — including the `--z-*` stacking scale near the top of `styles.css` instead of ad-hoc `z-index` numbers.

## Project Filtering

Projects in the HTML have `data-category` attributes (`ai`, `automation`, `data`). The filter buttons in `script.js` toggle visibility by matching this attribute. Matching cards live in a horizontal peek carousel (`#projectsGrid`); filtering resets the track to the start. Adding a new project requires:
1. Adding the card to the `#projectsGrid` carousel track in `index.html` with the correct `data-category`
2. No JS changes needed unless adding a new category

## Creative Work

The `#videos` section has two subsections in `index.html`, each in its own peek carousel:
- **Personal Projects** — `#personalVideosGrid` (`.video-grid` / `.video-card-link`)
- **Client Projects** — `#clientVideosGrid` (`.reel-grid` / `.reel-card`)

Add new video cards to the matching track. Client reel thumbnails live under `assets/client/`. Carousel chrome (edge fades, prev/next arrows, keyboard) is initialized by `initializeCarousels()` for every `[data-carousel]` shell.

## Command Palette

Accessible via `Cmd+K` / `Ctrl+K`. Commands are defined as an array in `script.js` inside `initializeCommandPalette()`. Add new navigation targets there.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
