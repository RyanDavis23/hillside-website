# Decisions

A log of load-bearing choices, so future sessions don't re-litigate them.

## 2026-07-05 — Full rebuild

**Dropped React-CDN + Babel-in-browser for static HTML + vanilla JS.**
The old home page compiled JSX in the browser on every load and rendered
client-side only (invisible to crawlers/link previews). The site is content,
not an app; static HTML is faster, indexable, and dependency-free.

**Kept the brand system, rebuilt the execution.** Forest `#1F3D2A` / cream
`#F4EFE6` / Newsreader + DM Sans / square corners carried over from
`colors_and_type.css` into `assets/css/site.css`. Fonts are now self-hosted
variable WOFF2s (no Google Fonts request chain).

**Photos come from pic-time's public CDN at the 1600px tier.** That is the
same resolution pic-time serves guests in its own viewer. True print-res
originals require the gallery's email-gated download flow — unnecessary for
web display and would 4× the repo. The scene chapters (Cocktail Hour, Auction,
Party, Film), ordering, filenames, and capture times come from the gallery's
`gallery.json` / `gallery_meta.json`. Pipeline scripts live in `tools/`.

**Gallery ships all 596 photos as static WebP in three tiers** (480/1024/1600,
~143 MB total). Justified layout is computed from manifest aspect ratios so
nothing shifts on load; placeholders use each photo's average color.
Repo weight is acceptable for GitHub Pages (< 1 GB limit).

**Videos are re-encoded for web** (film: 1080p CRF 24 capped 4.2 Mbps ≈ 48 MB;
shorts: 810×1440 ≈ 5–6 MB). GitHub blocks files > 100 MB, so the 461 MB master
stays local in `Video/` (gitignored). Poster frames extracted at chosen
timestamps (film: the 26 s terrace establishing shot).

**Donate ladder opens prefilled email, not a payment processor.** There is no
Stripe/Givebutter/etc. account wired up anywhere in the repo. The old page's
amount buttons were dead `href="#"` links; honest mailto beats a fake checkout.
Swap in a real processor when one exists.

**Stay-close form confirms locally without a backend.** Same rationale — the
old form faked success too; kept behavior, made microcopy honest. Wire to a
list provider (Buttondown/Mailchimp) when ready.

**`tools/dev-server.py` exists because `python3 -m http.server` can't stream
video.** Chrome needs HTTP Range support and HTTP/1.1 keep-alive to play mp4;
the stock module offers neither. GitHub Pages handles this fine in production.

## Verification notes

The automated-Chrome environment used for QA cannot decode video (even MDN's
sample mp4 stalls) and doesn't tick animation frames (CSS transitions freeze
at their start value; screenshots force composites). Video playback and motion
polish therefore need a quick human spot-check in a normal browser; all
final-state layouts, the gallery engine, lightbox logic, and network behavior
were verified in-DOM.
