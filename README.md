# Hillside

A New York charity built in memory of Tyler Gwozdz. We bring people together at gatherings and direct every dollar raised to that year's beneficiary partner — beginning with the Tyler G. Foundation.

🌐 [View live](https://darkstarnews.github.io/hillside-website/)

## Pages

- `index.html` — Home: hero, the season bill, the media grid, 100%, memorial, email capture
- `about.html` — Behind Hillside: founders, the room, socials
- `foundation.html` — The Tyler G. Foundation
- `sponsors.html` — The credits
- `artists.html` — Art at Hillside
- `night.html` — 2026: the film and the photographs
- `walk.html` — Walk with us: the Shatterproof Walk, 25 October 2026
- `donate.html` — Do the right thing
- `privacy.html`, `terms.html`, `404.html`
- `preview-marquee/*`, `gallery.html`, `tyler-g-foundation.html`, `preview/` — redirect stubs for old URLs

## Stack

Zero-dependency static site: `marquee.css` (tokens at the top are the tweak
surface — see `DESIGN.md`), `marquee.js` (menu, reveals, clip windows). Fonts
self-hosted in `assets/fonts`. Cache-bust `?v=` on every css/js link — bump
it on all pages whenever either file changes.
