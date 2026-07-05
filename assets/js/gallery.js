/* Hillside — gallery engine
   Justified rows from a pre-baked manifest (no layout shift), lazy
   three-tier images over dominant-color placeholders, chapter rail with
   scrollspy, and a keyboard/touch lightbox with #pN deep links. */

(() => {
  "use strict";

  const ROOT = document.querySelector("[data-gallery]");
  if (!ROOT) return;

  const GAP = 6;
  const DIR = "assets/gallery";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    photos: [],        // manifest records, global order
    scenes: [],
    items: [],         // <a.g-item> in global order
    chapters: [],      // { name, anchor, el, grid, photos }
    lightboxIdx: -1,
    pushedState: false,
  };

  const pad = (n) => String(n).padStart(3, "0");
  const srcFor = (n, tier) => `${DIR}/${tier}/${pad(n)}.webp`;
  const anchorFor = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  /* ------------------------------------------------------------------
     Build
     ------------------------------------------------------------------ */
  fetch(`${DIR}/manifest.json`)
    .then((r) => r.json())
    .then((manifest) => {
      state.photos = manifest.photos;
      state.scenes = manifest.scenes;
      build();
      layout();
      observeLoads();
      scrollspy();
      window.addEventListener("resize", debounce(onResize, 160));
      openFromHash();
    })
    .catch((err) => {
      ROOT.innerHTML =
        '<p class="meta" style="padding:2rem var(--gutter)">The gallery could not be loaded. Please refresh.</p>';
      console.error("gallery:", err);
    });

  function build() {
    const railInner = document.querySelector("[data-chapter-rail]");
    const frag = document.createDocumentFragment();

    state.scenes.forEach((name, sIdx) => {
      const photos = state.photos.filter((p) => p.s === sIdx);
      if (!photos.length) return;

      const anchor = anchorFor(name);

      // Chapter section
      const section = document.createElement("section");
      section.className = "gchapter";
      section.id = anchor;

      const head = document.createElement("header");
      head.className = "gchapter__head container";
      head.innerHTML = `<h2>${name}</h2><span class="count num">${photos.length} photographs</span>`;
      section.appendChild(head);

      const grid = document.createElement("div");
      grid.className = "grid-justified container";
      grid.style.setProperty("--g-gap", GAP + "px");
      section.appendChild(grid);
      frag.appendChild(section);

      // Items
      photos.forEach((p) => {
        const globalIdx = state.items.length;
        const a = document.createElement("a");
        a.className = "g-item";
        a.href = `#p${p.n}`;
        a.style.setProperty("--ph", p.c);
        a.dataset.idx = globalIdx;
        a.setAttribute(
          "aria-label",
          `Open photograph ${p.n} of ${state.photos.length} — ${name}`
        );

        const img = document.createElement("img");
        img.alt = `${name} — photograph ${p.n}, Hillside 2026`;
        img.decoding = "async";
        img.loading = globalIdx < 8 ? "eager" : "lazy";
        if (globalIdx < 4) img.fetchPriority = "high";
        img.width = p.w;
        img.height = p.h;
        img.srcset = `${srcFor(p.n, "thumb")} 480w, ${srcFor(p.n, "mid")} 1024w, ${srcFor(p.n, "full")} 1600w`;
        img.sizes = "300px"; // corrected during layout()

        a.appendChild(img);
        a.addEventListener("click", (e) => {
          e.preventDefault();
          openLightbox(globalIdx, true);
        });

        state.items.push(a);
        grid.appendChild(a);
      });

      state.chapters.push({ name, anchor, el: section, grid, photos });

      // Rail link
      if (railInner) {
        const link = document.createElement("a");
        link.href = `#${anchor}`;
        link.innerHTML = `${name} <span class="count num">${photos.length}</span>`;
        railInner.appendChild(link);
      }
    });

    ROOT.appendChild(frag);

    const totalEl = document.querySelector("[data-photo-total]");
    if (totalEl) totalEl.textContent = state.photos.length;
  }

  /* ------------------------------------------------------------------
     Justified layout — rows from known aspect ratios
     ------------------------------------------------------------------ */
  function targetRowHeight(w) {
    if (w <= 560) return w / 2.1;
    if (w <= 900) return w / 3.3;
    if (w <= 1280) return w / 4.4;
    return w / 5.1;
  }

  function layout() {
    state.chapters.forEach((ch) => {
      const width = ch.grid.clientWidth;
      if (!width) return;
      const target = targetRowHeight(width);

      // Chunk into rows
      const rows = [];
      let row = [], sumAR = 0;
      ch.photos.forEach((p, i) => {
        const ar = p.w / p.h;
        row.push({ p, ar, el: state.items[globalIndex(ch, i)] });
        sumAR += ar;
        if (sumAR * target >= width - GAP * (row.length - 1)) {
          rows.push({ row, sumAR });
          row = []; sumAR = 0;
        }
      });
      if (row.length) rows.push({ row, sumAR, last: true });

      // Apply — move items into row wrappers (idempotent on resize)
      const frag = document.createDocumentFragment();
      rows.forEach(({ row, sumAR, last }) => {
        const gaps = GAP * (row.length - 1);
        let h = (width - gaps) / sumAR;
        if (last) h = Math.min(h, target * 1.12);
        const rowEl = document.createElement("div");
        rowEl.className = "g-row";
        rowEl.style.height = h + "px";
        rowEl.style.containIntrinsicSize = `auto ${Math.round(h)}px`;
        row.forEach(({ ar, el }) => {
          const w = ar * h;
          el.style.width = w + "px";
          el.querySelector("img").sizes = Math.ceil(w) + "px";
          rowEl.appendChild(el);
        });
        frag.appendChild(rowEl);
      });

      // Clear old rows, keep items (they were just moved into frag)
      ch.grid.querySelectorAll(".g-row").forEach((r) => r.remove());
      ch.grid.appendChild(frag);
    });
  }

  function globalIndex(ch, localIdx) {
    let offset = 0;
    for (const c of state.chapters) {
      if (c === ch) break;
      offset += c.photos.length;
    }
    return offset + localIdx;
  }

  let lastWidth = window.innerWidth;
  function onResize() {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    layout();
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  /* ------------------------------------------------------------------
     Image fade-ins
     ------------------------------------------------------------------ */
  function observeLoads() {
    state.items.forEach((a) => {
      const img = a.querySelector("img");
      const done = () => img.classList.add("is-loaded");
      if (img.complete && img.naturalWidth) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    });
  }

  /* ------------------------------------------------------------------
     Chapter rail scrollspy
     ------------------------------------------------------------------ */
  function scrollspy() {
    const links = Array.from(
      document.querySelectorAll("[data-chapter-rail] a")
    );
    if (!links.length) return;
    const byAnchor = new Map(
      links.map((l) => [l.getAttribute("href").slice(1), l])
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove("is-active"));
            byAnchor.get(entry.target.id)?.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    state.chapters.forEach((ch) => io.observe(ch.el));
  }

  /* ------------------------------------------------------------------
     Lightbox
     ------------------------------------------------------------------ */
  const lb = document.querySelector(".lightbox");
  const lbImg = lb.querySelector(".lightbox__img");
  const lbCounter = lb.querySelector(".lightbox__counter");
  const lbScene = lb.querySelector(".lightbox__scene");
  const lbClose = lb.querySelector(".lightbox__close");
  const lbPrev = lb.querySelector(".lightbox__nav--prev");
  const lbNext = lb.querySelector(".lightbox__nav--next");
  let returnFocus = null;

  function openLightbox(idx, viaClick) {
    const wasOpen = state.lightboxIdx >= 0;
    state.lightboxIdx = (idx + state.photos.length) % state.photos.length;
    const p = state.photos[state.lightboxIdx];

    lbImg.classList.remove("is-ready");
    lbImg.src = srcFor(p.n, "full");
    lbImg.alt = `${state.scenes[p.s]} — photograph ${p.n}, Hillside 2026`;
    if (lbImg.complete && lbImg.naturalWidth) lbImg.classList.add("is-ready");
    else lbImg.addEventListener("load", () => lbImg.classList.add("is-ready"), { once: true });

    lbCounter.textContent = `${state.lightboxIdx + 1} / ${state.photos.length}`;
    lbScene.textContent = state.scenes[p.s];

    if (!wasOpen) {
      returnFocus = viaClick ? document.activeElement : null;
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      lbClose.focus();
    }

    // history: push once on open, replace while browsing
    const hash = `#p${p.n}`;
    if (!wasOpen && viaClick) {
      history.pushState({ lb: true }, "", hash);
      state.pushedState = true;
    } else {
      history.replaceState(state.pushedState ? { lb: true } : null, "", hash);
    }

    // preload neighbors
    [state.lightboxIdx + 1, state.lightboxIdx - 1].forEach((i) => {
      const q = state.photos[(i + state.photos.length) % state.photos.length];
      new Image().src = srcFor(q.n, "full");
    });
  }

  function closeLightbox(fromPop) {
    if (state.lightboxIdx < 0) return;
    state.lightboxIdx = -1;
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    lbImg.removeAttribute("src");
    if (returnFocus) returnFocus.focus();
    if (!fromPop) {
      if (state.pushedState) history.back();
      else history.replaceState(null, "", location.pathname + location.search);
    }
    state.pushedState = false;
  }

  const step = (d) => openLightbox(state.lightboxIdx + d);

  lbClose.addEventListener("click", () => closeLightbox(false));
  lbPrev.addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
  lbNext.addEventListener("click", (e) => { e.stopPropagation(); step(1); });
  lb.addEventListener("click", (e) => {
    if (e.target === lb || e.target.classList.contains("lightbox__stage"))
      closeLightbox(false);
  });

  document.addEventListener("keydown", (e) => {
    if (state.lightboxIdx < 0) return;
    if (e.key === "Escape") closeLightbox(false);
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "Tab") {
      // minimal focus trap across the three controls
      const order = [lbClose, lbPrev, lbNext];
      const i = order.indexOf(document.activeElement);
      e.preventDefault();
      const next = e.shiftKey
        ? order[(i - 1 + order.length) % order.length]
        : order[(i + 1) % order.length];
      next.focus();
    }
  });

  // touch swipe
  let touchX = 0, touchY = 0;
  lb.addEventListener("pointerdown", (e) => { touchX = e.clientX; touchY = e.clientY; });
  lb.addEventListener("pointerup", (e) => {
    const dx = e.clientX - touchX;
    const dy = e.clientY - touchY;
    if (Math.abs(dx) > 48 && Math.abs(dy) < 80) step(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dx) < 60) closeLightbox(false);
  });

  window.addEventListener("popstate", () => {
    if (state.lightboxIdx >= 0 && !location.hash.startsWith("#p")) {
      closeLightbox(true);
    } else if (location.hash.startsWith("#p")) {
      openFromHash();
    }
  });

  function openFromHash() {
    const m = location.hash.match(/^#p(\d+)$/);
    if (!m) return;
    const n = parseInt(m[1], 10);
    const idx = state.photos.findIndex((p) => p.n === n);
    if (idx >= 0) {
      openLightbox(idx, false);
      // let the grid settle underneath, then bring the item into view
      const item = state.items[idx];
      if (item) item.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }

  /* Smooth-scroll rail links with sticky offset handled by scroll-margin */
  document.querySelectorAll("[data-chapter-rail]").forEach((rail) => {
    rail.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      e.preventDefault();
      document.getElementById(a.getAttribute("href").slice(1))
        ?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth" });
    });
  });
})();
