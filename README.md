# Hillside

A New York charity built in memory of Tyler Gwozdz. We bring people together at gatherings and direct every dollar raised to that year's beneficiary partner — beginning with the Tyler G. Foundation.

🌐 [View live](https://darkstarnews.github.io/hillside-website/)

## Pages

- `index.html` — Home: hero, Tyler, the 2026 event, the film, gallery teaser, donate
- `gallery.html` — All 596 photographs from the inaugural, in four chapters
- `tyler-g-foundation.html` — Tyler's story, One of Ten, the Foundation timeline
- `sponsors.html` — Inaugural sponsors
- `donate.html` — Make a gift
- `404.html` — Not-found page (GitHub Pages)

## Stack

Zero-dependency static site. Semantic HTML, one CSS design system
(`assets/css/site.css`), vanilla JS (`assets/js/main.js`, `assets/js/gallery.js`).
No build step, no frameworks, no external requests — fonts are self-hosted
variable WOFF2s.

### The gallery engine

`assets/gallery/manifest.json` carries every photo's dimensions, average color,
and chapter. `gallery.js` computes justified rows from the known aspect ratios
(zero layout shift), lazy-loads three WebP tiers (`thumb/` 480px · `mid/` 1024px
· `full/` 1600px) behind dominant-color placeholders, and drives the lightbox
(keyboard, swipe, `#pNNN` deep links, neighbor preloading).
`content-visibility: auto` keeps scrolling smooth with 596 images in the DOM.

### Video

`assets/video/` holds web encodes (1080p H.264) of the film and two shorts,
plus poster frames. Source masters stay out of git (`Video/`, ignored).

## Development

```bash
python3 tools/dev-server.py 8137
# → http://127.0.0.1:8137
```

The dev server supports HTTP Range requests (needed for `<video>` seeking —
`python3 -m http.server` does not).

## Media pipeline

Rebuild gallery assets from the photographer's pic-time gallery:

```bash
python3 tools/download_gallery.py   # pulls all originals (1600px tier) + index
python3 tools/process_photos.py     # emits three WebP tiers + manifest.json
```

Requires Pillow. Scene structure, capture order, and filenames come from
pic-time's gallery metadata.

## Inaugural

02 May 2026 · The Bowery Hotel · 355 guests · 14 states · 5 countries

Photography by Ricky Rodriguez.
