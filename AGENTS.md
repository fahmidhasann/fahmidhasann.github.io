# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Overview

This is a static portfolio website with no build process. It's a single-page application using plain HTML, CSS, and JavaScript — no frameworks, no package manager, no compilation step.

## Development

**To preview locally**, open `index.html` directly in a browser or use any static file server:
```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

**Deployment**: Pushing to `main` on GitHub triggers Vercel deployment automatically. Security headers and asset caching are configured in `vercel.json`.

## Architecture

All site logic lives in three files:

- [index.html](index.html) — Single-page markup with all sections (hero, projects, videos, contact, command palette)
- [styles.css](styles.css) — All styles using CSS custom properties for theming
- [script.js](script.js) — All interactivity, initialized via a sequence of `initialize*()` functions called on `DOMContentLoaded`

**External dependencies** are loaded via CDN (no local install needed):
- `particles.js` — hero background animation
- `GSAP` + `ScrollTrigger` — scroll-triggered card animations
- `Font Awesome` — icons
- `Google Fonts` — Cormorant Garamond (headings), Inter (body)

## Theming

CSS variables are defined at the `:root` level and overridden via `[data-theme="dark"]` on the `<html>` element. Theme preference is persisted in `localStorage`. When adding new components, always use the existing CSS variables rather than hardcoded colors.

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
