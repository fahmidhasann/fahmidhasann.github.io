# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static portfolio website for Fahmid Hasan Taohid — a vanilla HTML/CSS/JS single-page application with no build step. Deployed on Vercel. The site focuses on AI/ML, data science, and web projects.

## Development

No build process. To develop locally, open `index.html` directly in a browser or use a local server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Deployment is automatic via Vercel on push to `main`.

## Architecture

All content lives in three files:

- **`index.html`** — Single page with sections: Hero, Projects, Videos, Contact, Footer. Navigation is anchor-based (`#projects`, `#videos`, `#contact`).
- **`styles.css`** — All styling. Uses CSS custom properties for theming; dark/light mode is toggled by swapping `[data-theme="dark"]` on `<html>`.
- **`script.js`** — All interactivity. Organized as 11 `init*()` functions called on `DOMContentLoaded`. Theme preference is persisted via `localStorage`.

### External Libraries (CDN, no npm)

- **GSAP 3.12.2** + ScrollTrigger — scroll-driven animations
- **Typed.js 2.0.12** — typing effect in hero section
- **particles.js 2.0.0** — interactive particle background in hero
- **Font Awesome 6.4.0** — icons
- **Google Fonts** — Cormorant Garamond (headings), Inter (body)

### Theming

CSS variables are defined on `:root` for light mode and `[data-theme="dark"]` for dark mode. Core palette:
- Primary: `#1B2A4A` (navy)
- Accent: `#C4704B` (terracotta)
- Background light: `#FAFAF8`, dark: `#1A1A1A`

### Project Filtering

Projects are tagged with `data-category` attributes (`ai-ml`, `web`, `data`). Filter buttons in the Projects section toggle visibility via JS.

### Command Palette

`Ctrl/Cmd+K` opens a command palette. Commands are defined in the `initCommandPalette()` function in `script.js`.

## Key Customization Points

- **Add a project**: Add a `.project-card` element in the `#projects` section of `index.html` with the appropriate `data-category` attribute and an image in `assets/Project/`.
- **Update typed strings**: Edit the `strings` array inside `initTypedAnimation()` in `script.js`.
- **Change color palette**: Update CSS variables in `styles.css` under `:root` and `[data-theme="dark"]`.
- **Vercel headers/caching**: Edit `vercel.json`.
