# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- `Typed.js` — hero typing animation
- `Font Awesome` — icons
- `Google Fonts` — Cormorant Garamond (headings), Inter (body)

## Theming

CSS variables are defined at the `:root` level and overridden via `[data-theme="dark"]` on the `<html>` element. Theme preference is persisted in `localStorage`. When adding new components, always use the existing CSS variables rather than hardcoded colors.

## Project Filtering

Projects in the HTML have `data-category` attributes (`ai`, `web`, `data`). The filter buttons in `script.js` toggle visibility by matching this attribute. Adding a new project requires:
1. Adding the card to the `#projects` grid in `index.html` with the correct `data-category`
2. No JS changes needed unless adding a new category

## Command Palette

Accessible via `Cmd+K` / `Ctrl+K`. Commands are defined as an array in `script.js` inside `initializeCommandPalette()`. Add new navigation targets there.
