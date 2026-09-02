# The Marquee — working preview

Eight real pages, not mockups. Local only, uncommitted, gitignored — the live
site is untouched.

## Run it

```bash
python3 "/Users/primary/Desktop/Hillside/Hillside Website/tools/dev-server.py" 8137
```

Then open **http://127.0.0.1:8137/preview-marquee/**

| Page | URL |
|---|---|
| Home | `/preview-marquee/` |
| About | `/preview-marquee/about.html` |
| The Foundation | `/preview-marquee/foundation.html` |
| Sponsors | `/preview-marquee/sponsors.html` |
| Artists | `/preview-marquee/artists.html` |
| The Night | `/preview-marquee/night.html` |
| Walk | `/preview-marquee/walk.html` |
| Donate | `/preview-marquee/donate.html` |

**The preview is fully self-contained.** Every nav link is internal; the only
external links are mailto:, Instagram, the grantees, and tylergfoundation.org —
all opening in a new tab. Nothing can strand you in the old site.

## The Night — the curated selection

`night.html` replaces the 596-photo archive. It is **77 photographs (13% of the
shoot)** in three chapters — Arrival, The Room, The Party (the film-crew stills
were cut on Ryan's call) — laid out
as masonry so every frame keeps its own proportions (a uniform square crop
decapitates people in group shots). Click any photograph for a full-size
lightbox; arrow keys move, Escape closes. Each tile carries its own average
colour, so a frame still loading reads as a colour block, never a hole.

Ryan's 23 selections are all included — core: 211, 217, 284, 332, 337, 412,
422, 438, 446, 460, 488, 513, 526, 536, 554; plus 304, 311, 335, 409, 440, 479,
531, 551.

The full list, in page order:

```
Arrival     5 9 12 21 24 36 40 45 64 68 74 81 88 93 96 101 118 121 132 135 165 170 178 181
The Room    211 215 217 219 220 263 268 272 280 284 285 287
The Party   298 304 307 308 311 325 328 332 335 337 355 357 358 366 367 371 409 412 417 422
            438 440 442 446 451 460 464 468 479 483 488 501 502 513 520 526 527 531 536 551 554
```

To change it, give me numbers to add or drop and I'll regenerate the page.

## Where to tweak

Everything visual lives in **`marquee.css`**. The tokens at the top of that file
drive all five pages — change one value, every page follows:

| Token | Now | Controls |
|---|---|---|
| `--paper` | `#F1EBDE` | the warm ground |
| `--ink` | `#191813` | type and the heavy rules |
| `--forest` | `#1F3D2A` | **the only accent** — links, buttons, the italic word |
| `--forest-deep` | `#16301F` | the full-bleed band |
| `--hero` | `clamp(2.9rem,10.8vw,10rem)` | the poster headline |
| `--title` | `clamp(2.7rem,9.4vw,8.5rem)` | interior page titles |
| `--gut` | `clamp(1.25rem,4.2vw,3.5rem)` | page margins |
| `--rule-w` | `2px` | rule weight — the whole page's structure |

**Two names, both correct.** The org is "The Tyler G. Foundation" in prose and
navigation, but the donate page's fine print says "Hillside in Support of the
Tyler Gwozdz Foundation" — that is the registered legal name from the IRS
determination letter and must stay exactly as written there. Don't "fix" it.

**Never let a browser fake a weight.** Instrument Serif ships weight 400 only.
`font-synthesis:none` is set on body and every display-font element carries an
explicit `font-weight:400` — h1, b, and strong default to bold in every browser
and will otherwise render a smeared faux-bold (this shipped once; Ryan caught it).

**Ryan's core imagery is placed deliberately** — home strip: 217 438 446 460 526
536 (native 3:2, uncropped) + plate 412; About: plate 554 + trio 332 335 304
(native 2:3); Sponsors: plate 531; Artists: duo 211+284. Don't swap these for
non-core photos.

**Why interior titles are set so large.** Instrument Serif is a *display* face:
it looks elegant at 100px+ and heavy, cramped, almost bold at 45px. Interior
titles therefore run close to hero scale. If a heading ever looks "bolder" than
the homepage, it's set too small — raise it rather than reaching for a lighter
weight (there isn't one).

**The desktop composition holds down to 660px** so a half-width laptop window
keeps the two-column look, scaled down, instead of dropping to the stacked
phone layout. Below 860px the inline nav is replaced by the Menu panel.

**One caution on `--hero`.** The headline's longest line ("showing up." in
italic) measures about 4.6× the font size. The current cap is set so that line
always clears the photograph beside it, with 41–334px of slack from 900px wide
up to 1920px. Raise the cap and the type will start colliding with the photo at
some widths — if you want it bigger, narrow the photo column too
(`.hero` `grid-template-columns`, currently `1.45fr / 1fr`).

## What's real

- The hero is the actual **vertical short** (`hillside-26-short-1.mp4`),
  autoplaying muted on loop, with its poster frame behind it.
- Working email capture — same Formspree form as the live site, with the mailto
  fallback. **It posts to the real inbox**, so treat submissions as real.
- Real photography at full resolution, not the compressed canvas copies.
- Instrument Serif is now self-hosted in `assets/fonts/` (~15KB per face), so
  the page makes no external font requests — same rule as the rest of the site.
- **Motion reveals on scroll, deterministically.** Blocks below the fold rise
  gently and photographs wipe in, once, ≤620ms, revealed by a timestamp-throttled
  scroll sweep — no IntersectionObserver, no requestAnimationFrame, no timers
  racing the reader. Only below-fold elements are ever hidden, and the same
  script that hides them is the one that reveals them, so a dead script means
  nothing was ever hidden. (An earlier version un-armed everything on a 2.4s
  timer — by the time you scrolled down, the animation had already spent itself.
  Don't bring that back.) **The rule: nothing may hide its own content except
  the scroll sweep that will reveal it.** The Menu panel toggles on `display`.

## Checked

Zero horizontal overflow and zero broken images at 320 · 375 · 844×390
landscape · 1280 · 1440 · 1920. All nav and arrow links are ≥44px touch
targets. Every class used in the HTML is styled, and no CSS is orphaned. No
console errors from these pages.

## Not built yet

Deliberately — these need your calls first:

- The Walk checkout URL: `walk.html` is built (2026-09-02, v44 — the Shatterproof
  Walk, Sun 25 Oct 2026, Pier 76; $50 · 30 places; ticket as one ledger row) but
  its **Get tickets** button falls back to a mailto until Ryan creates the
  Zeffy/Givebutter event. Search `TICKET_URL` in walk.html and replace the href.
  Facts, copy, Apple Invites spec and the follow-up email live in
  `Desktop/Hillside/Walk 2026/WALK-2026.md`. "Walk" sits in the nav before
  Donate on every page; the home bill has a third row for it.
- The sponsorship pitch page from the earlier branch, restyled into this system.
- The full 2026 film. The hero runs the vertical short; the feature cut
  (`hillside-26-film.mp4`) has no home yet — it could be a band on the home
  page or live on The Night.

## 2026 gallery — state as of 2026-09-01 evening (v43)

- `night.html` is two chapters, no editorial subtitles, opened by the film
  (`/assets/video/hillside-26-film.mp4`, 17MB web encode, click-to-play with
  sound, credited to Henry Asker). **97 tiles**: The Room = ids ≤ 292 (30),
  The Party = ids > 292 (67). Ryan's picks live in `Desktop/Photos to Use/`
  (+ `definitely use/` for the ones that "stood out a lot"); every id in
  that folder is now in the gallery. `398-1.webp` there is Ryan's own crop of
  398 — the archive's 398 is used; swap in his crop only if he asks.
- Tiles are inserted in numeric (chronological) order per chapter; each tile
  carries its average colour as `background` so lazy-loaded frames read as
  colour blocks, never holes. The Room's original 12 are eager, additions lazy.
- To add more: put the id's `mid/` + `full/` webp in the archive (all 596 are
  already there), then merge by id into the right chapter with the same tile
  markup (`data-n`, avg-colour bg, width/height, alt).
