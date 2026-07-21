# Responsive card polish across devices

- [x] Even out Projects & Research cards (description clamp, tablet/phone spacing)
- [x] Restyle Personal Projects as stacked 16:9 media cards at ≤900px
- [x] Cap tablet reels; phone horizontal scroll-snap; radius/hidden-card polish
- [x] Screenshot desktop/tablet/phone (+ dark) and fix any remaining issues
- [x] Run graphify update .

## Review

CSS-only polish in `styles.css`:

- **Projects:** descriptions clamped to 3 lines → equal card heights in a row; tablet 2-col spacing/title tweaks; `object-position: center` on media
- **Personal films:** desktop keeps cinematic side-by-side rows; ≤900 becomes stacked 16:9 media cards with surface border (no more ~94px thumbs)
- **Client reels:** tablet capped at `max-width: 32rem`; ≤680 uses horizontal scroll-snap (~11rem cards) with client label + description restored; radii use design tokens; `.reel-card.hidden-card` supported

Verified via local server metrics: desktop equal project heights (537px), tablet stacked thumbs ~705×396 + capped reel grid, phone scroll-snap carousel + 1-col projects.
