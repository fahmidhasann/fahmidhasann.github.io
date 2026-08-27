# Fahmid Hasan — Portfolio

A personal portfolio site available in two editions that share the same content:

| Edition      | Path    | Description                                                  |
| ------------ | ------- | ------------------------------------------------------------ |
| **Classic**  | `/`     | Editorial layout with a particle hero and card carousels.      |
| **Terminal** | `/v2/`  | Terminal/CRT-styled edition driven by a command prompt.        |

Visitors pick an edition on their first visit and the choice is remembered in
`localStorage`, so returning visitors land on the edition they chose.

## Tech

The published site is plain HTML, CSS, and JavaScript. **There is no build
step** — the files in this repository are the files that get served. Third-party
libraries (particles.js, GSAP, Font Awesome, Google Fonts) load from CDNs with
Subresource Integrity hashes.

This repository carries no linters, tests, or CI — they were removed to keep it
minimal. Verify changes by loading both editions in a browser and checking the
console and Network tab. `git log` recovers the old tooling if you want it back.

## Getting started

Preview with any static file server:

```bash
python3 -m http.server 4173     # http://127.0.0.1:4173
```

Open `/` for the Classic edition and `/v2/` for the Terminal edition.

> **Note:** open it through a server, not by double-clicking `index.html`. The
> edition redirect uses the absolute path `/v2/`, which over `file://` points at
> the root of your disk instead of this folder.

## Layout

```
index.html            Classic edition markup
styles.css            Classic edition styles
script.js             Classic edition behaviour
v2/                   Terminal edition (same three-file structure)
assets/               Images and demo videos shared by both editions
vercel.json           Security headers and asset caching
```

## Deployment

Pushing to `main` deploys to Vercel automatically. `vercel.json` sets the
security headers and long-lived caching for `/assets/*`.

## Contributing notes

Conventions for adding projects, videos, and command-palette entries live in
[AGENTS.md](AGENTS.md).
