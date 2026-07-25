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

Node and npm are only used for development tooling (linting and browser tests).
They are excluded from the deployment via `.vercelignore`.

## Getting started

Preview the site with any static file server:

```bash
npm start          # serves the repo on http://127.0.0.1:4173
```

Or without npm:

```bash
python3 -m http.server 4173
```

## Development tooling

Install the dev dependencies once:

```bash
npm install
npm run test:install   # downloads the Chromium build Playwright needs
```

Then:

| Command             | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `npm run lint`      | Runs all three linters below.                          |
| `npm run lint:js`   | ESLint over the site scripts and tests.                |
| `npm run lint:css`  | Stylelint over both stylesheets.                       |
| `npm run lint:html` | html-validate over both editions' markup.              |
| `npm test`          | Playwright smoke tests against a local static server.  |

`npm run lint` and `npm test` also run in CI on every push and pull request
(see `.github/workflows/ci.yml`).

## Layout

```
index.html          Classic edition markup
styles.css          Classic edition styles
script.js           Classic edition behaviour
v2/                 Terminal edition (same three-file structure)
assets/             Images and demo videos shared by both editions
tests/smoke.spec.js Playwright smoke tests covering both editions
vercel.json         Security headers and asset caching
```

## Deployment

Pushing to `main` deploys to Vercel automatically. `vercel.json` sets the
security headers and long-lived caching for `/assets/*`.

## Contributing notes

Conventions for adding projects, videos, and command-palette entries live in
[AGENTS.md](AGENTS.md).
