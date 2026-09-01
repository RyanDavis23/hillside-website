/* Hillside — "The Marquee" preview
   Three jobs: the menu panel, subtle scroll motion, and the email
   capture. None of it gates the display of content — with this file
   missing or broken every page still renders complete. */
(function () {
  'use strict';

  /* ── menu panel ──────────────────────────────────────────────── */
  var btn = document.getElementById('menuBtn');
  var panel = document.getElementById('menuPanel');
  if (btn && panel) {
    var lastFocus = null;
    var open = function () {
      lastFocus = document.activeElement;
      panel.classList.add('open');
      document.body.classList.add('menu-open');
      btn.setAttribute('aria-expanded', 'true');
      var first = panel.querySelector('a, button');
      if (first) first.focus();
    };
    var close = function () {
      panel.classList.remove('open');
      document.body.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', 'false');
      if (lastFocus) lastFocus.focus();
    };
    btn.addEventListener('click', open);
    panel.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !panel.classList.contains('open')) return;
      close();
    });
    /* keep focus inside the panel while it is open */
    panel.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = panel.querySelectorAll('a[href], button');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    /* if the viewport grows past the inline-nav breakpoint, drop the panel */
    matchMedia('(min-width:860px)').addEventListener('change', function (m) {
      if (m.matches && panel.classList.contains('open')) close();
    });
  }

  /* ── motion: subtle, once, revealed BY scrolling ──────────────────
     Deterministic on purpose: a timestamp-throttled sweep on scroll —
     no observers, no requestAnimationFrame, no global timers. Only
     elements starting below the fold are armed (first paint is never
     empty), and the sweep that reveals them is this same script — so
     the animation fires exactly when the block scrolls into view, and
     a dead script simply means nothing was ever hidden. */
  var reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var pendingMotion = [];
  if (!reduced) {
    [].slice.call(document.querySelectorAll('.lift, .wipe')).forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
        el.classList.add('armed');
        pendingMotion.push(el);
      }
    });
  }
  if (pendingMotion.length) {
    /* timestamp throttle, NOT requestAnimationFrame — rAF can stall in
       embedded/background contexts and the reveal must depend on
       nothing beyond the scroll event itself */
    var lastSweep = 0, sweepTimer = 0;
    var sweep = function () {
      var vh = window.innerHeight;
      for (var i = pendingMotion.length - 1; i >= 0; i--) {
        var r = pendingMotion[i].getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > 0) {
          pendingMotion[i].classList.add('in');
          pendingMotion.splice(i, 1);
        }
      }
      if (!pendingMotion.length) {
        removeEventListener('scroll', queueSweep);
        removeEventListener('resize', queueSweep);
      }
    };
    var queueSweep = function () {
      var now = Date.now();
      if (now - lastSweep > 80) { lastSweep = now; sweep(); }
      else if (!sweepTimer) {
        sweepTimer = setTimeout(function () { sweepTimer = 0; lastSweep = Date.now(); sweep(); }, 90);
      }
    };
    addEventListener('scroll', queueSweep, { passive: true });
    addEventListener('resize', queueSweep);
    addEventListener('pageshow', queueSweep);
    sweep();
  }

  /* ── lightbox (the night) ─────────────────────────────────────
     Progressive enhancement: without JS every tile is a plain link
     to the full-size photograph, which still works. */
  var lb = document.getElementById('lightbox');
  var tiles = [].slice.call(document.querySelectorAll('.mason a'));
  if (lb && tiles.length) {
    var lbImg = document.getElementById('lbImg');
    var lbCap = document.getElementById('lbCap');
    var at = 0, opener = null;

    var show = function (i) {
      at = (i + tiles.length) % tiles.length;
      var a = tiles[at];
      lbImg.src = a.getAttribute('href');
      lbImg.alt = a.querySelector('img').alt;
      lbCap.textContent = '№ ' + a.dataset.n + '  ·  ' + (at + 1) + ' of ' + tiles.length;
    };
    var openLb = function (i, from) {
      opener = from || null;
      show(i);
      lb.classList.add('open');
      document.body.classList.add('menu-open');
      lb.querySelector('[data-lb-close]').focus();
    };
    var closeLb = function () {
      lb.classList.remove('open');
      document.body.classList.remove('menu-open');
      lbImg.src = '';
      if (opener) opener.focus();
    };

    tiles.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        e.preventDefault();
        openLb(i, a);
      });
    });
    lb.querySelector('[data-lb-close]').addEventListener('click', closeLb);
    lb.querySelector('[data-lb-prev]').addEventListener('click', function () { show(at - 1); });
    lb.querySelector('[data-lb-next]').addEventListener('click', function () { show(at + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = lb.querySelectorAll('button');
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') show(at - 1);
      else if (e.key === 'ArrowRight') show(at + 1);
    });
  }

  /* ── clip pockets: looping windows of the films ────────────────
     Several <video> elements share the same source file, each looping
     its own [start, end) window — many little films, one download per
     source. Fails safe: without JS or with reduced motion, each pocket
     is a still poster frame. */
  var pockets = [].slice.call(document.querySelectorAll('.clip-pocket video'));
  if (pockets.length && reduced) {
    pockets.forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); });
  }
  if (pockets.length && !reduced) {
    pockets.forEach(function (v) {
      var start = parseFloat(v.dataset.clipStart) || 0;
      var end = parseFloat(v.dataset.clipEnd) || 0;
      var arm = function () {
        if (end > start) {
          v.currentTime = start;
          v.addEventListener('timeupdate', function () {
            if (v.currentTime >= end || v.ended) v.currentTime = start;
          });
        } else {
          v.loop = true;
        }
        v.play().catch(function () {});
      };
      if (v.readyState >= 1) arm();
      else v.addEventListener('loadedmetadata', arm, { once: true });
    });

    /* play only what's on screen; browsers defer offscreen autoplay
       anyway, so this makes the resume explicit and saves battery */
    var lastPocketSweep = 0, pocketTimer = 0;
    var pocketSweep = function () {
      var vh = window.innerHeight;
      pockets.forEach(function (v) {
        var r = v.getBoundingClientRect();
        var visible = r.bottom > 0 && r.top < vh;
        if (visible && v.paused) v.play().catch(function () {});
        else if (!visible && !v.paused) v.pause();
      });
    };
    var queuePocketSweep = function () {
      var now = Date.now();
      if (now - lastPocketSweep > 150) { lastPocketSweep = now; pocketSweep(); }
      else if (!pocketTimer) {
        pocketTimer = setTimeout(function () { pocketTimer = 0; lastPocketSweep = Date.now(); pocketSweep(); }, 160);
      }
    };
    addEventListener('scroll', queuePocketSweep, { passive: true });
    pocketSweep();
  }

  /* ── zelle copy (donate) ─────────────────────────────────────── */
  var zelle = document.getElementById('zelleBtn');
  if (zelle) {
    var zelleLabel = zelle.textContent;
    zelle.addEventListener('click', function () {
      var done = function () {
        zelle.textContent = 'Copied — thank you';
        setTimeout(function () { zelle.textContent = zelleLabel; }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('events@hillsidenewyork.com').then(done, done);
      } else { done(); }
    });
  }

  /* ── email capture ───────────────────────────────────────────── */
  var form = document.getElementById('stayForm');
  if (!form) return;
  form.setAttribute('novalidate', '');   /* JS owns validation now; without JS the form's action/method still work */
  var status = document.getElementById('stayStatus');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var email = form.email.value.trim();
    if (!email || email.indexOf('@') < 0) { status.textContent = 'Please enter your email.'; return; }
    status.textContent = 'Sending…';
    fetch('https://formspree.io/f/xdeneakp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email: email, list: 'Hillside 2027 updates' })
    }).then(function (r) {
      if (!r.ok) throw new Error();
      status.textContent = 'You’re on the list — thank you.';
      form.reset();
    }).catch(function () {
      status.textContent = 'Something hiccuped — opening email instead.';
      location.href = 'mailto:events@hillsidenewyork.com?subject=Hillside%20updates&body=' + encodeURIComponent(email);
    });
  });
})();
