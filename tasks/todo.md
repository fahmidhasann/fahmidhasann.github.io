# Fix mobile layout overflow

- [x] Add min-width:0 on container/creative ancestors; overflow-x on html+body
- [x] Contain ≤680px .reel-grid as true horizontal scroller without expanding page width
- [x] Bump .section scroll-margin-top to clear sticky mobile nav
- [x] Light hero hardening (min-width:0 / max-width:100%)
- [x] Verify phone/tablet/desktop; graphify update .

## Review

CSS-only fix in `styles.css` for iPhone left-squeeze + clipped reels:

- **Containment:** `overflow-x: clip` on `html` + `body`; `min-width: 0` on `.container`, `.creative-subsections`, `.creative-subsection`
- **Phone reels (≤680px):** `.reel-grid` constrained to `width/max-width: 100%` + `min-width: 0` with `overscroll-behavior-x: contain` so fixed-width cards scroll inside the scroller instead of expanding document width
- **Sticky nav:** `.section` scroll-margin raised to `5.75rem` (desktop) / `5.5rem` (≤760px)
- **Hero:** `.hero-content` / `.hero-text` get `min-width: 0` and `max-width: 100%`

Verified at 390px: `scrollWidth === clientWidth` (no page overflow), hero fills viewport, reel `scrollWidth > clientWidth` with third-card peek. At 768px: capped 3-col grid, no overflow.
