# V2 Projects cards + carousel

- [x] Remove blurb under Projects & Research heading
- [x] Restructure `#projects` into carousel + vertical project cards in `v2/index.html`
- [x] Restyle `.proj` as terminal cards and add carousel chrome in `v2/styles.css`
- [x] Add `initCarousels` + filter scroll reset in `v2/script.js`
- [x] Verify filters, carousel controls, demo popup, light/dark, mobile overflow

## Review

Projects & Research in `v2/` is now a peek card carousel (terminal chrome):

- Removed the prose line under the heading
- Cards: image on top, title/desc/tags/actions below, hard 1px borders, zero radii
- Carousel: `‹` / `›` buttons, edge fades, keyboard arrows, filter resets scroll to start
- Verified: `--ai` shows 4, scroll resets, demo popup opens, no page overflow at 390px, light theme OK
