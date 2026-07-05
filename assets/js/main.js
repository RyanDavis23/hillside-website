/* Hillside — shared behavior
   Header state · mobile menu · scroll reveals · hero slideshow ·
   stat count-ups · video modal · stay-close form. No dependencies. */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------
     Header — solid after scroll
     ------------------------------------------------------------------ */
  const header = document.querySelector(".site-header");
  if (header && !header.classList.contains("is-solid")) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  const menu = document.querySelector(".mobile-menu");
  const menuBtn = document.querySelector(".menu-btn");
  if (menu && menuBtn) {
    const closeBtn = menu.querySelector(".mobile-menu__close");
    let returnFocus = null;

    const openMenu = () => {
      returnFocus = document.activeElement;
      menu.classList.add("is-open");
      document.body.classList.add("menu-open");
      menuBtn.setAttribute("aria-expanded", "true");
      closeBtn.focus();
    };
    const closeMenu = () => {
      menu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      menuBtn.setAttribute("aria-expanded", "false");
      if (returnFocus) returnFocus.focus();
    };

    menuBtn.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveals (+ stagger groups)
     ------------------------------------------------------------------ */
  document.querySelectorAll("[data-reveal-stagger]").forEach((group) => {
    const step = parseInt(group.dataset.revealStagger, 10) || 70;
    Array.from(group.children).forEach((child, i) => {
      child.setAttribute("data-reveal", "");
      child.style.setProperty("--reveal-delay", `${i * step}ms`);
    });
  });

  const revealables = document.querySelectorAll("[data-reveal]");
  if (revealables.length && !reduceMotion.matches) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
    );
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add("is-in"));
  }

  /* ------------------------------------------------------------------
     Hero slideshow — slow crossfade, pauses in background tabs
     ------------------------------------------------------------------ */
  const heroSlides = document.querySelectorAll(".hero__slide");
  const heroDots = document.querySelectorAll(".hero__dot");
  if (heroSlides.length > 1 && !reduceMotion.matches) {
    let active = 0;
    let timer = null;
    const warm = (i) => {
      const img = heroSlides[i % heroSlides.length].querySelector("img");
      if (img && img.loading === "lazy") img.loading = "eager";
    };
    const show = (i) => {
      heroSlides[active].classList.remove("is-active");
      heroDots[active]?.classList.remove("is-active");
      active = i % heroSlides.length;
      heroSlides[active].classList.add("is-active");
      heroDots[active]?.classList.add("is-active");
      warm(active + 1); // stay one slide ahead of the crossfade
    };
    const start = () => { timer = setInterval(() => show(active + 1), 6400); };
    warm(1);
    const stop = () => clearInterval(timer);
    document.addEventListener("visibilitychange", () =>
      document.hidden ? stop() : start()
    );
    start();
  }

  /* ------------------------------------------------------------------
     Hero opening film — silent, plays once, settles on the still.
     Copy hides only once playback truly starts; any failure (blocked
     autoplay, error, stall) restores the still hero immediately.
     ------------------------------------------------------------------ */
  const heroEl = document.querySelector(".hero");
  const film = heroEl?.querySelector(".hero__film");
  if (film && !reduceMotion.matches) {
    let guard = null;
    const finish = () => {
      clearTimeout(guard);
      heroEl.classList.remove("has-film");
      film.classList.add("is-done");
    };
    film.src = window.matchMedia("(max-width: 760px)").matches
      ? film.dataset.srcMobile
      : film.dataset.srcDesktop;
    film.addEventListener("playing", () => {
      heroEl.classList.add("has-film");
      film.classList.add("is-playing");
      guard = setTimeout(finish, 11000); // stall guard: never trap the copy
    }, { once: true });
    film.addEventListener("ended", finish, { once: true });
    film.addEventListener("error", finish, { once: true });
    film.play().catch(finish);
  }

  /* ------------------------------------------------------------------
     Stat count-ups
     ------------------------------------------------------------------ */
  const counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const run = (el) => {
      const target = parseInt(el.dataset.countTo, 10);
      if (reduceMotion.matches) { el.textContent = target; return; }
      const dur = 1400;
      let t0 = null; // seed from the first frame's timestamp, not now()
      const tick = (now) => {
        if (t0 === null) t0 = now;
        const p = Math.min(Math.max((now - t0) / dur, 0), 1);
        el.textContent = Math.round(easeOut(p) * target);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
     Video modal
     ------------------------------------------------------------------ */
  const videoModal = document.querySelector(".video-modal");
  if (videoModal) {
    const video = videoModal.querySelector("video");
    const title = videoModal.querySelector(".video-modal__title");
    const closeBtn = videoModal.querySelector(".video-modal__close");
    let returnFocus = null;

    const open = (src, label) => {
      returnFocus = document.activeElement;
      video.src = src;
      title.textContent = label || "";
      videoModal.classList.add("is-open");
      document.body.classList.add("modal-open");
      closeBtn.focus();
      video.play().catch(() => {});
    };
    const close = () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      videoModal.classList.remove("is-open");
      document.body.classList.remove("modal-open");
      if (returnFocus) returnFocus.focus();
    };

    document.querySelectorAll("[data-video]").forEach((btn) => {
      btn.addEventListener("click", () =>
        open(btn.dataset.video, btn.dataset.videoTitle)
      );
    });
    closeBtn.addEventListener("click", close);
    videoModal.addEventListener("click", (e) => {
      if (e.target === videoModal) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && videoModal.classList.contains("is-open")) close();
    });
  }

  /* ------------------------------------------------------------------
     Stay-close form — local confirmation
     ------------------------------------------------------------------ */
  document.querySelectorAll("[data-stay-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]');
      if (!email.value || !email.checkValidity()) { email.focus(); return; }
      const thanks = document.createElement("p");
      thanks.className = "stay__thanks";
      thanks.textContent = "Thank you — we’ll write when the next gathering is set.";
      form.replaceWith(thanks);
    });
  });

  /* ------------------------------------------------------------------
     Year
     ------------------------------------------------------------------ */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
