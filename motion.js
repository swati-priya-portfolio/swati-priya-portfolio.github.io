/* motion.js — Swati Priya portfolio
   The interaction layer. Design stays exactly as designed; this file only
   decides how it moves.

   House rules kept throughout:
   - transform and opacity only, everything pointer-driven runs in one rAF loop
   - every desktop flourish is off on touch and off under prefers-reduced-motion
   - nothing here is required to read the page
*/

(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var EASE = 0.16;                                  // pointer follow smoothing
  var desktop = function () { return window.innerWidth >= 1080; };

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  // easeOutQuint — the JS twin of cubic-bezier(0.22, 1, 0.36, 1)
  var ease = function (t) { return 1 - Math.pow(1 - clamp(t, 0, 1), 5); };
  // progress of v inside [a, b]
  var span = function (v, a, b) { return clamp((v - a) / (b - a), 0, 1); };

  /* Shared pointer state, written once per move, read once per frame. */
  var ptr = { x: -9999, y: -9999, has: false };
  var frameJobs = [];
  var running = false;

  function addJob(fn) { frameJobs.push(fn); startLoop(); }
  function startLoop() {
    if (running) { return; }
    running = true;
    requestAnimationFrame(function tick() {
      for (var i = 0; i < frameJobs.length; i++) { frameJobs[i](); }
      requestAnimationFrame(tick);
    });
  }

  if (finePointer) {
    window.addEventListener("pointermove", function (e) {
      ptr.x = e.clientX; ptr.y = e.clientY; ptr.has = true;
    }, { passive: true });
  }

  /* ==========================================================
     1. LOADER — comic spider-hero snack loop (once per session)
     ========================================================== */
  function primeHero() {
    var hero = document.querySelector(".hero");
    if (!hero) { return; }
    hero.classList.add("motion-primed");

    // Local fail-safe: the page-level fail-safe handles the old entrance,
    // this one also covers the refined staged elements.
    setTimeout(function () {
      [].slice.call(hero.querySelectorAll(".reveal")).forEach(function (el) {
        el.classList.add("is-stage-in");
      });
    }, 3400);
  }

  function runLoader(done) {
    var loader = document.querySelector(".sp-loader");
    var showing = root.classList.contains("sp-loading");

    if (!loader || !showing || reduced) {
      root.classList.remove("sp-loading");
      try { sessionStorage.setItem("sp-seen-v15", "1"); } catch (e) {}
      done();
      return;
    }

    var DURATION = 2100;
    var start = null;
    var ready = false;

    requestAnimationFrame(function step(now) {
      if (start === null) { start = now; }
      var raw = span(now - start, 0, DURATION);
      var p = ease(raw);
      loader.style.setProperty("--load", p.toFixed(3));

      if (!ready && raw >= 0.88) {
        ready = true;
        loader.classList.add("is-ready");
      }

      if (raw < 1) { requestAnimationFrame(step); return; }

      // The final bite fades into the hero.
      loader.classList.add("is-done");
      try { sessionStorage.setItem("sp-seen-v15", "1"); } catch (e) {}
      setTimeout(function () {
        root.classList.remove("sp-loading");
        loader.setAttribute("hidden", "");
        done();
      }, 380);
    });
  }

  /* ==========================================================
     2. HERO ENTRANCE — eyebrow, headline lines, copy, portrait
     ========================================================== */
  function heroEntrance() {
    var hero = document.querySelector(".hero");
    var role = document.querySelector(".role-strip");
    var title = document.querySelector(".hero-title");
    var sub = document.querySelector(".hero-sub");
    var actions = document.querySelector(".hero-actions");
    var character = document.querySelector(".hero-character");

    function enter(el, delay) {
      if (!el) { return; }
      setTimeout(function () { el.classList.add("is-stage-in"); }, reduced ? 0 : delay);
    }

    enter(role, 40);

    if (title) {
      setTimeout(function () {
        title.classList.add("is-stage-in", "is-in");
      }, reduced ? 0 : 170);
      // Once the lines have landed, drop the clip so hover strokes can breathe.
      setTimeout(function () { title.classList.remove("is-masked"); }, reduced ? 0 : 1280);
    }
    if (character) {
      setTimeout(function () { character.classList.add("is-in"); }, reduced ? 0 : 450);
    }
    enter(sub, 590);
    enter(actions, 760);

    if (hero) {
      setTimeout(function () { hero.classList.add("entrance-complete"); }, reduced ? 0 : 1420);
    }
  }

  /* ==========================================================
     3. HERO — hidden comic thinking layer + micro parallax
     ========================================================== */
  function heroInteractions() {
    var hero = document.querySelector(".hero");
    var sketch = document.querySelector(".hero-sketch");
    var art = document.querySelector(".hero-art");
    var speeches = [].slice.call(document.querySelectorAll(".hero-character .speech"));
    if (!hero || reduced || !finePointer) { return; }

    var target = { x: 0, y: 0, on: 0 };
    var current = { x: 0, y: 0, on: 0 };
    var rect = null;

    function measure() { rect = hero.getBoundingClientRect(); }

    hero.addEventListener("pointerenter", function () {
      measure();
      hero.classList.add("is-exploring");
      target.on = 1;
    });
    hero.addEventListener("pointerleave", function () {
      hero.classList.remove("is-exploring");
      target.on = 0;
      target.x = 0; target.y = 0;                 // layers glide home
    });
    hero.addEventListener("pointermove", function (e) {
      if (!rect) { measure(); }
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
    }, { passive: true });

    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("scroll", function () { rect = null; }, { passive: true });

    addJob(function () {
      if (!rect) { return; }
      current.x = lerp(current.x, target.x, EASE);
      current.y = lerp(current.y, target.y, EASE);
      current.on = lerp(current.on, target.on, 0.12);

      if (sketch) {
        sketch.style.setProperty("--sk-x", current.x.toFixed(1) + "px");
        sketch.style.setProperty("--sk-y", current.y.toFixed(1) + "px");
      }

      // Depth: nothing chases the cursor, everything drifts a few pixels.
      var nx = target.on ? clamp((current.x / rect.width - 0.5) * 2, -1, 1) : 0;
      var ny = target.on ? clamp((current.y / rect.height - 0.5) * 2, -1, 1) : 0;

      if (art) {
        art.style.setProperty("--px", (nx * 3).toFixed(2) + "px");
        art.style.setProperty("--py", (ny * 3).toFixed(2) + "px");
      }
      if (sketch) {
        sketch.style.setProperty("--bx", (nx * -2).toFixed(2) + "px");
        sketch.style.setProperty("--by", (ny * -2).toFixed(2) + "px");
      }
      for (var i = 0; i < speeches.length; i++) {
        var s = speeches[i];
        var rot = s.getAttribute("data-rot") || "0";
        s.style.setProperty("--speech-rot", rot + "deg");
        s.style.setProperty("--speech-x", (nx * 5).toFixed(2) + "px");
        s.style.setProperty("--speech-y", (ny * 5).toFixed(2) + "px");
      }
    });
  }

  /* Subconscious scroll depth. It is intentionally capped well below the
     mathematical ratios in the brief so the composition never detaches. */
  function heroScrollDepth() {
    var hero = document.querySelector(".hero");
    var art = document.querySelector(".hero-art");
    var sketch = document.querySelector(".hero-sketch");
    var speeches = [].slice.call(document.querySelectorAll(".hero-character .speech"));
    if (!hero || reduced || window.innerWidth < 900) { return; }

    var height = hero.offsetHeight || 1;
    var queued = false;

    function measure() { height = hero.offsetHeight || 1; draw(); }
    function draw() {
      queued = false;
      var p = clamp(window.scrollY / height, 0, 1);
      if (art) { art.style.setProperty("--scroll-art", (p * 14).toFixed(2) + "px"); }
      if (sketch) { sketch.style.setProperty("--scroll-sketch", (p * 5).toFixed(2) + "px"); }
      speeches.forEach(function (s) {
        s.style.setProperty("--scroll-speech", (-p * 8).toFixed(2) + "px");
      });
    }

    window.addEventListener("scroll", function () {
      if (queued || window.scrollY > height + window.innerHeight) { return; }
      queued = true;
      requestAnimationFrame(draw);
    }, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    draw();
  }

  /* ==========================================================
     3b. HEADLINE, CHARACTER BY CHARACTER
     Letters lift as the cursor passes them, neighbours trailing behind.
     Positions are measured once in page space and offset by the scroll
     each frame, so scrolling never triggers a layout read.
     ========================================================== */
  function headlineChars() {
    var title = document.querySelector(".hero-title");
    if (!title || reduced || !finePointer) { return; }

    var chars = [].slice.call(title.querySelectorAll(".ch"));
    if (!chars.length) { return; }

    var RADIUS = 96;          // how far the response reaches
    var reactions = [
      { lift: 1.00, scale: 0.045, rotate: -0.8 },
      { lift: 0.45, scale: 0.105, rotate: 0.0 },
      { lift: 0.30, scale: 0.040, rotate: -1.2 },
      { lift: 0.92, scale: 0.055, rotate: 0.0 },
      { lift: 0.35, scale: 0.035, rotate: 1.35 },
      { lift: 0.55, scale: 0.085, rotate: 0.0 }
    ];
    var boxes = [];
    var dirty = true;

    function measure() {
      var sx = window.scrollX, sy = window.scrollY;
      boxes = chars.map(function (c, i) {
        var r = c.getBoundingClientRect();
        return {
          el: c,
          px: r.left + r.width / 2 + sx,
          py: r.top + r.height / 2 + sy,
          v: 0,
          reaction: reactions[i % reactions.length]
        };
      });
      dirty = false;
    }

    window.addEventListener("resize", function () { dirty = true; }, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { dirty = true; });
    }
    // The entrance moves the lines, so re-measure once it has settled.
    setTimeout(function () { dirty = true; }, 1400);

    addJob(function () {
      if (!ptr.has) { return; }
      if (dirty) { measure(); }

      var sx = window.scrollX, sy = window.scrollY;
      for (var i = 0; i < boxes.length; i++) {
        var b = boxes[i];
        var cy = b.py - sy;
        if (cy < -160 || cy > window.innerHeight + 160) {
          if (b.v !== 0) {
            b.v = 0;
            b.el.style.setProperty("--c-s", "1");
            b.el.style.setProperty("--c-y", "0px");
            b.el.style.setProperty("--c-r", "0deg");
          }
          continue;
        }
        var dx = ptr.x - (b.px - sx);
        var dy = (ptr.y - cy) * 1.25;         // a little less reach vertically
        var d = Math.sqrt(dx * dx + dy * dy);

        var t = d < RADIUS ? 1 - d / RADIUS : 0;
        t = t * t * (3 - 2 * t);              // smoothstep, so the wave has shoulders
        b.v = lerp(b.v, t, 0.22);

        if (b.v < 0.002) { b.v = 0; }
        b.el.style.setProperty("--c-s", (1 + b.reaction.scale * b.v).toFixed(3));
        b.el.style.setProperty("--c-y", (-7 * b.reaction.lift * b.v).toFixed(2) + "px");
        b.el.style.setProperty("--c-r", (b.reaction.rotate * b.v).toFixed(2) + "deg");
      }
    });
  }

  /* ==========================================================
     4. CUSTOM CURSOR — a dot that turns into a comic annotation
     ========================================================== */
  function customCursor() {
    var el = document.querySelector(".sp-cursor");
    if (!el || !finePointer || reduced) { return; }

    var bubble = el.querySelector(".sp-cursor-bubble");
    root.classList.add("sp-cursor-on");

    var pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var label = "";

    function setLabel(next) {
      if (next === label) { return; }
      label = next;
      if (next) { bubble.textContent = next; el.classList.add("has-label"); }
      else { el.classList.remove("has-label"); }
    }

    document.addEventListener("pointerover", function (e) {
      var host = e.target.closest ? e.target.closest("[data-cursor]") : null;
      setLabel(host ? host.getAttribute("data-cursor") : "");
    }, { passive: true });

    document.addEventListener("pointerdown", function () { el.classList.add("is-down"); }, { passive: true });
    document.addEventListener("pointerup", function () { el.classList.remove("is-down"); }, { passive: true });
    document.addEventListener("pointerleave", function () { el.classList.add("is-off"); });
    document.addEventListener("pointerenter", function () { el.classList.remove("is-off"); });

    addJob(function () {
      if (!ptr.has) { return; }
      pos.x = lerp(pos.x, ptr.x, 0.28);
      pos.y = lerp(pos.y, ptr.y, 0.28);
      el.style.transform = "translate3d(" + pos.x.toFixed(1) + "px," + pos.y.toFixed(1) + "px,0)";
    });
  }

  /* ==========================================================
     5. MAGNETIC DISPLAY WORDS — headings only, never body copy
     ========================================================== */
  function magneticWords() {
    var words = [].slice.call(document.querySelectorAll(".sp-word:not(.hero-title .sp-word):not(.story-title .sp-word):not(.footer-title .sp-word)"));
    if (!words.length || reduced || !finePointer) { return; }

    var boxes = [];
    var dirty = true;

    function measure() {
      boxes = words.map(function (w) {
        var r = w.getBoundingClientRect();
        return { el: w, cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height };
      });
      dirty = false;
    }
    window.addEventListener("scroll", function () { dirty = true; }, { passive: true });
    window.addEventListener("resize", function () { dirty = true; }, { passive: true });

    addJob(function () {
      if (!ptr.has) { return; }
      if (dirty) { measure(); }

      for (var i = 0; i < boxes.length; i++) {
        var b = boxes[i];
        if (b.cy < -200 || b.cy > window.innerHeight + 200) { continue; }

        var dx = Math.max(0, Math.abs(ptr.x - b.cx) - b.w / 2);
        var dy = Math.max(0, Math.abs(ptr.y - b.cy) - b.h / 2);
        var d = Math.sqrt(dx * dx + dy * dy);

        var scale = 1;
        if (d === 0) { scale = 1.08; }             // directly over the word
        else if (d < 80) { scale = 1 + 0.04 * (1 - d / 80); }

        b.el.style.setProperty("--w-s", scale.toFixed(3));
      }
    });
  }

  /* ==========================================================
     6. NAVIGATION — expands in the hero, compresses everywhere else
     ========================================================== */
  function stickyNav() {
    var header = document.querySelector(".site-header");
    var hero = document.querySelector(".hero");
    if (!header || !hero) { return; }

    var threshold = 0;
    function measure() { threshold = hero.offsetTop + hero.offsetHeight - 200; }
    measure();
    window.addEventListener("resize", measure, { passive: true });

    var compact = false;
    var mini = false;
    var travelled = 0;
    var lastY = window.scrollY;
    var queued = false;

    function update() {
      queued = false;
      var y = window.scrollY;
      var delta = y - lastY;

      var nextCompact = y > Math.max(160, threshold * 0.42);
      if (nextCompact !== compact) {
        compact = nextCompact;
        header.classList.toggle("is-compact", compact);
      }

      // Distance travelled in one direction decides the state, not the last
      // frame's delta — a trackpad wobbles a pixel either way constantly.
      //
      // A jump of hundreds of pixels is an anchor link or a scrollbar drag,
      // not a reading gesture. Letting it into the tally lets one jump
      // outweigh the scroll back, which leaves the bar stuck folded.
      // Only a genuine change of direction clears the tally. Testing
      // `(delta > 0) !== (travelled > 0)` also fires on a delta of zero, and
      // a scroll gesture ends with several such frames — which wiped the
      // tally just as it was about to fold the bar.
      //
      // Nothing here may discard a large delta: one wheel notch is already
      // over 200px, so treating big deltas as jumps zeroes the tally on every
      // single scroll and the bar can never fold at all.
      if (delta !== 0) {
        if ((delta > 0 && travelled < 0) || (delta < 0 && travelled > 0)) {
          travelled = 0;
        }
        travelled += delta;
      }

      // Deliberately lopsided: folding asks for a real downward read, while
      // the smallest look back up opens it again. Even thresholds feel stuck,
      // because a wobble resets the tally before a gentle scroll up can ever
      // reach the limit.
      var nextMini = mini;
      if (y < 220) { nextMini = false; travelled = 0; }
      else if (travelled > 80) { nextMini = true; }
      else if (travelled < -24) { nextMini = false; }

      if (nextMini !== mini) {
        mini = nextMini;
        header.classList.toggle("is-mini", mini);
      }

      lastY = y;
    }

    window.addEventListener("scroll", function () {
      if (queued) { return; }
      queued = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* ==========================================================
     7. PICK AN EPISODE — one cover spreads into three
     The section pins for a short beat, the covers fan out, then the
     page keeps scrolling normally. No scroll hijacking, no trap.
     ========================================================== */
  function caseStudies() {
    var track = document.querySelector(".case-track");
    var stage = document.querySelector(".case-stage");
    var grid = document.querySelector(".case-grid");
    if (!track || !stage || !grid) { return; }

    var cards = [].slice.call(grid.querySelectorAll(".case-card"));
    if (cards.length < 3) { return; }

    var PIN_TOP = 104;
    var pinned = false;
    var geo = null;
    var travel = 0;
    var stacked = null;   // whether the spread's stack order is applied

    function reset() {
      cards.forEach(function (c) {
        c.style.removeProperty("--sx");
        c.style.removeProperty("--ss");
        c.style.removeProperty("--sr");
        c.style.removeProperty("--so");
        c.style.zIndex = "";
        c.style.boxShadow = "";
      });
      grid.classList.remove("is-staging");
      grid.style.pointerEvents = "";
      grid.style.transform = "";
      stage.style.height = "";
    }

    function teardown() {
      pinned = false;
      track.style.height = "";
      stage.style.position = "";
      stage.style.top = "";
      reset();
      cards.forEach(function (c) { c.classList.add("settle-in"); });
      observeSettle();
    }

    var settleObserver = null;
    function observeSettle() {
      if (settleObserver || !("IntersectionObserver" in window)) {
        cards.forEach(function (c) { c.classList.add("is-visible"); });
        return;
      }
      settleObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          entry.target.classList.add("is-visible");
          settleObserver.unobserve(entry.target);
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -60px 0px" });
      cards.forEach(function (c) { settleObserver.observe(c); });
    }

    function measure() {
      if (!desktop() || reduced) { teardown(); return; }

      grid.style.transform = "";
      stage.style.height = "";
      cards.forEach(function (c) {
        c.style.removeProperty("--sx");
        c.style.removeProperty("--ss");
        c.style.removeProperty("--sr");
        c.style.removeProperty("--so");
      });
      var stageH = stage.offsetHeight;
      var room = window.innerHeight - PIN_TOP - 40;
      var fit = Math.min(1, room / Math.max(stageH, 1));
      if (fit < .76) { teardown(); return; }
      grid.style.transformOrigin = "top center";
      grid.style.transform = "scale(" + fit.toFixed(4) + ")";
      stage.style.height = Math.round(stageH * fit) + "px";

      cards.forEach(function (c) { c.classList.remove("settle-in", "is-visible"); });
      if (settleObserver) { settleObserver.disconnect(); settleObserver = null; }

      var gridRect = grid.getBoundingClientRect();
      var gridCentre = gridRect.left + gridRect.width / 2;

      geo = {
        stageH: stageH * fit,
        offsets: cards.map(function (c) {
          var r = c.getBoundingClientRect();
          return (gridCentre - (r.left + r.width / 2)) / fit;
        })
      };

      travel = Math.round(Math.min(window.innerHeight * 1.15, 940));
      track.style.height = Math.round(stageH * fit + travel) + "px";
      stage.style.position = "sticky";
      stage.style.top = PIN_TOP + "px";
      pinned = true;
      cards[1].style.zIndex = "3";   // the anchor cover
      cards[0].style.zIndex = "2";
      cards[2].style.zIndex = "1";
      draw();
    }

    function draw() {
      if (!pinned || !geo) { return; }

      var top = track.getBoundingClientRect().top;   // relative to viewport
      var p = clamp((PIN_TOP - top) / travel, 0, 1);

      // The middle cover is the anchor: it opens the section alone and never
      // moves sideways. The other two slide out from behind it, left first,
      // then right, each as its own beat so nothing overlaps.
      var leftP = ease(span(p, 0.20, 0.52));
      var rightP = ease(span(p, 0.52, 0.82));

      setCard(cards[1], 0, 1, 0, 1);
      cards[1].style.boxShadow = "";

      // Side issues are always opaque physical sheets. They are invisible at
      // first only because Guardian One sits above the stack.
      setCard(cards[0], lerp(geo.offsets[0], 0, leftP), lerp(.97, 1, leftP),
        lerp(0, -1, leftP), 1);
      setCard(cards[2], lerp(geo.offsets[2], 0, rightP), lerp(.97, 1, rightP),
        lerp(0, 1, rightP), 1);

      var settled = p > 0.97;
      grid.classList.toggle("is-staging", !settled);
      grid.style.pointerEvents = settled ? "" : "none";

      // While the covers are still arriving they overlap, so the stack order
      // matters. Once they are settled it is dropped, or that inline order
      // decides which raised artwork wins on hover instead of the pointer.
      if (settled !== stacked) {
        stacked = settled;
        cards[1].style.zIndex = settled ? "" : "3";   // the anchor cover
        cards[0].style.zIndex = settled ? "" : "2";
        cards[2].style.zIndex = settled ? "" : "1";
      }
    }

    function setCard(card, x, scale, rot, opacity) {
      card.style.setProperty("--sx", x.toFixed(2) + "px");
      card.style.setProperty("--ss", scale.toFixed(4));
      card.style.setProperty("--sr", rot.toFixed(2) + "deg");
      card.style.setProperty("--so", opacity.toFixed(3));
    }

    var queued = false;
    window.addEventListener("scroll", function () {
      if (queued || !pinned) { return; }
      queued = true;
      requestAnimationFrame(function () { queued = false; draw(); });
    }, { passive: true });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 180);
    }, { passive: true });

    // Images decide the stage height, so measure once they have landed.
    measure();
    window.addEventListener("load", measure);

    /* --- Coming Soon covers must never open an empty page --- */
    cards.forEach(function (card) {
      if (!card.classList.contains("is-soon")) { return; }
      card.addEventListener("click", function (e) { e.preventDefault(); });
    });
  }

  /* ==========================================================
     8. SCROLL REVEALS — heading, then copy, then visuals. Once.
     ========================================================== */
  function reveals() {
    var targets = [].slice.call(document.querySelectorAll(".sp-reveal, .sp-settle, .reveal-on-scroll")).filter(function (el) {
      return !el.matches(".behind .board, .drives, .footer-story, .footer-cover");
    });
    var squiggles = [].slice.call(document.querySelectorAll(".squiggle"));

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      squiggles.forEach(function (el) { el.classList.add("is-drawn"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -70px 0px" });
    targets.forEach(function (el) { io.observe(el); });

    var sq = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add("is-drawn");
        sq.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    squiggles.forEach(function (el) { sq.observe(el); });
  }

  /* The proof strip is a calm, single entrance: value first, description
     second through CSS, with no counters or looping motion. */
  function metrics() {
    var strip = document.querySelector(".proof-strip");
    if (!strip) { return; }
    strip.classList.add("is-metrics-ready");

    if (reduced || !("IntersectionObserver" in window)) {
      strip.classList.add("is-visible");
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) { return; }
      strip.classList.add("is-visible");
      io.disconnect();
    }, { threshold: 0.3 });
    io.observe(strip);
  }

  /* ==========================================================
     8b. THE RIP
     The vector edge reveals left-to-right across a short scroll range. Once
     complete it is locked in place and receives one restrained settle.
     ========================================================== */
  function paperTear() {
    var tears = [].slice.call(document.querySelectorAll(".paper-tear"));
    if (!tears.length) { return; }

    if (reduced) {
      tears.forEach(function (t) {
        t.style.setProperty("--tear-reveal", "100%");
        t.classList.add("is-torn");
      });
      return;
    }

    var geo = [];
    var dirty = true;
    var knownHeight = 0;

    function measure() {
      geo = tears.map(function (t) {
        var top = 0, el = t;
        while (el) { top += el.offsetTop; el = el.offsetParent; }
        return { el: t, top: top, done: t.classList.contains("is-torn") };
      });
      knownHeight = document.documentElement.scrollHeight;
      dirty = false;
    }

    function draw() {
      // Same guard as the sheets: the page is taller after boot than during
      // it, and a stale offset tears the edge at the wrong moment.
      if (dirty || document.documentElement.scrollHeight !== knownHeight) {
        measure();
      }
      var y = window.scrollY;
      var vh = window.innerHeight;

      for (var i = 0; i < geo.length; i++) {
        var g = geo[i];
        if (g.done) { continue; }

        var fromTop = g.top - y;
        /* A short 24vh window: hidden near the viewport floor, complete well
           before the section heading becomes the focus. Only clipping moves. */
        var p = clamp((vh * 0.98 - fromTop) / (vh * 0.24), 0, 1);
        var eased = p * p * (3 - 2 * p);
        g.el.style.setProperty("--tear-reveal", (eased * 100).toFixed(1) + "%");

        if (p >= 0.999) {
          g.done = true;
          g.el.style.setProperty("--tear-reveal", "100%");
          g.el.classList.add("is-torn");
          requestAnimationFrame(function (edge) {
            edge.classList.add("is-settled");
          }.bind(null, g.el));
        }
      }
    }

    var queued = false;
    window.addEventListener("scroll", function () {
      if (queued) { return; }
      queued = true;
      requestAnimationFrame(function () { queued = false; draw(); });
    }, { passive: true });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { dirty = true; draw(); }, 160);
    }, { passive: true });

    window.addEventListener("load", function () { dirty = true; draw(); });
    draw();
  }

  /* ==========================================================
     9. BOOKS — physical objects, picked up one at a time
     ========================================================== */
  function books() {
    var shelf = document.querySelector(".board-books");
    if (!shelf || reduced) { return; }
    var all = [].slice.call(shelf.querySelectorAll(".book"));

    function pick(i) {
      shelf.classList.add("is-active");
      all.forEach(function (other, j) {
        other.classList.remove("is-picked", "is-nudge-l", "is-nudge-r");
        if (j === i) { other.classList.add("is-picked"); }
        else if (j < i) { other.classList.add("is-nudge-l"); }
        else { other.classList.add("is-nudge-r"); }
      });
    }

    function clear() {
      shelf.classList.remove("is-active");
      all.forEach(function (b) { b.classList.remove("is-picked", "is-nudge-l", "is-nudge-r"); });
    }

    all.forEach(function (book, i) {
      if (finePointer) { book.addEventListener("pointerenter", function () { pick(i); }); }
      else {
        book.setAttribute("tabindex", "0");
        book.addEventListener("click", function () {
          if (book.classList.contains("is-picked")) { clear(); }
          else { pick(i); }
        });
        book.addEventListener("keydown", function (e) {
          if (e.key !== "Enter" && e.key !== " ") { return; }
          e.preventDefault();
          if (book.classList.contains("is-picked")) { clear(); }
          else { pick(i); }
        });
      }
    });

    if (finePointer) { shelf.addEventListener("pointerleave", clear); }
  }

  /* ==========================================================
     10. MUSIC — never autoplays, remembers the session choice
     ========================================================== */
  function music() {
    var player = document.querySelector(".player");
    var button = document.querySelector(".ctrl-main");
    var state = document.querySelector(".music-state");
    if (!player || !button || !state) { return; }

    var stateText = state.querySelector(".music-label");
    var bar = document.querySelector(".player-progress span");
    var playing = false;
    var pos = 0.42;
    var angle = 0;
    var last = 0;
    var art = player.querySelector(".player-art");
    var inView = true;

    function paint() {
      player.classList.toggle("is-playing", playing);
      state.classList.toggle("is-playing", playing);
      button.innerHTML = playing ? "&#10074;&#10074;" : "&#9654;";
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", playing ? "Pause the focus track" : "Play the focus track");
      button.setAttribute("data-cursor", playing ? "PAUSE ♪" : "PLAY ♪");
      if (stateText) { stateText.textContent = playing ? "MUSIC ON" : "MUSIC OFF"; }
    }

    function toggle() {
      playing = !playing;
      try { sessionStorage.setItem("sp-music-choice", playing ? "on" : "off"); } catch (e) {}
      paint();
    }

    button.addEventListener("click", function (e) { e.preventDefault(); toggle(); });

    // A stored preference may describe the last choice, but audible/active
    // playback still requires a fresh user gesture after every page load.
    paint();
    player.style.setProperty("--music-progress", pos.toFixed(3));

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(player);
    }

    addJob(function () {
      var now = performance.now();
      if (!last) { last = now; return; }
      var dt = Math.min(now - last, 64);
      last = now;
      if (!playing || reduced || !inView) { return; }
      angle = (angle + dt * 0.012) % 360;
      pos += dt * 0.000018;
      if (pos > 1) { pos = 0; }
      if (art) { art.style.setProperty("--record-angle", angle.toFixed(2) + "deg"); }
      player.style.setProperty("--music-progress", pos.toFixed(3));
    });
  }

  /* ==========================================================
     11. FOOTER — the last surprise
     ========================================================== */
  function footer() {
    var foot = document.querySelector(".site-footer");
    if (!foot) { return; }
    var giant = foot.querySelector(".footer-giant");
    var hosts = [].slice.call(foot.querySelectorAll("[data-giant]"));
    var water = foot.querySelector(".footer-water");
    var growth = 0;

    if (!reduced && finePointer) {
      hosts.forEach(function (host) {
        host.addEventListener("pointerenter", function () {
          if (host.hasAttribute("data-bubble")) { foot.classList.add("is-talking"); }
          if (giant && foot.classList.contains("is-social-reached")) {
            giant.textContent = host.getAttribute("data-giant");
            foot.classList.add("is-shouting");
          }
        });
        host.addEventListener("pointerleave", function () {
          foot.classList.remove("is-shouting", "is-talking");
        });
      });
    }

    var bubbleHost = foot.querySelector("[data-bubble]");
    if (bubbleHost) {
      bubbleHost.addEventListener("focus", function () { foot.classList.add("is-talking"); });
      bubbleHost.addEventListener("blur", function () { foot.classList.remove("is-talking"); });
    }

    if (water && !reduced) {
      water.addEventListener("click", function () {
        if (growth >= 3) { return; }
        growth += 1;
        foot.setAttribute("data-growth", String(growth));
        if (growth === 3) {
          water.setAttribute("aria-label", "The idea is fully grown");
          water.setAttribute("data-cursor", "BLOOMED");
        }
      });
    }
  }

  /* ==========================================================
     11a. SECTION STORIES — one scroll clock, three quiet chapters
     ========================================================== */
  function sectionStories() {
    var behind = document.querySelector(".behind");
    var drives = document.querySelector(".drives");
    var footerEl = document.querySelector(".site-footer");
    if (!behind && !drives && !footerEl) { return; }

    var boards = behind ? [].slice.call(behind.querySelectorAll(".board")) : [];
    var reminders = behind ? [].slice.call(behind.querySelectorAll(".reminder")) : [];
    var principles = drives ? [].slice.call(drives.querySelectorAll(".drives-list li")) : [];
    var geometry = {};
    var dirty = true;
    var queued = false;

    if (behind) { behind.classList.add("is-behind-ready"); }
    if (drives) { drives.classList.add("is-drives-ready"); }
    if (footerEl) { footerEl.classList.add("is-footer-story-ready"); }

    function layoutTop(el) {
      return el.getBoundingClientRect().top + window.scrollY;
    }

    function reveal(el) {
      if (el) { el.classList.add("is-beat-reached"); }
    }

    function measure() {
      var vh = window.innerHeight;
      var staged = window.innerWidth >= 1080 && vh >= 760;
      if (behind) {
        geometry.behind = {
          top: layoutTop(behind),
          height: Math.max(behind.offsetHeight, 1),
          staged: staged,
          board: boards.map(function (board) { return layoutTop(board) - vh * .82; }),
          reminder: reminders.map(function (item) { return layoutTop(item) - vh * .82; })
        };
      }
      if (drives) {
        var track = drives.closest(".drives-track") || drives;
        geometry.drives = {
          top: layoutTop(track),
          height: Math.max(track.offsetHeight, 1),
          staged: staged && track.offsetHeight > vh,
          items: principles.map(function (_, i) { return layoutTop(track) - vh * .58 + i * 90; })
        };
      }
      if (footerEl) {
        geometry.footer = { top: layoutTop(footerEl), height: Math.max(footerEl.offsetHeight, 1) };
      }
      dirty = false;
      draw();
    }

    function draw() {
      if (dirty) { measure(); return; }
      var y = window.scrollY;
      var vh = window.innerHeight;

      if (behind) {
        var bh = geometry.behind;
        var bp = bh.staged ? clamp((y - bh.top) / Math.max(bh.height - vh, 1), 0, 1) : 0;
        [[.12,"is-eyebrow-reached"],[.15,"is-line-one-reached"],[.18,"is-accent-reached"],[.21,"is-work-reached"],[.24,"is-intro-reached"]].forEach(function (beat) {
          if (reduced || (bh.staged ? bp >= beat[0] : y >= bh.top - vh * .72 + beat[0] * 220)) { behind.classList.add(beat[1]); }
        });
        [.26,.48,.70,.86].forEach(function (point, i) {
          if (reduced || (bh.staged ? bp >= point : y >= bh.board[i])) { reveal(boards[i]); }
        });
        [.89,.94,.98].forEach(function (point, i) {
          if (reduced || (bh.staged ? bp >= point : y >= bh.reminder[i])) { reveal(reminders[i]); }
        });
      }

      var about = drives && drives.closest(".paper-sheet");
      if (drives && (reduced || !about || about.classList.contains("is-sheet-settled"))) {
        var dg = geometry.drives;
        var dp = dg.staged ? clamp((y - dg.top) / Math.max(dg.height - vh, 1), 0, 1) : 0;
        if (reduced || (dg.staged ? dp >= .06 : y >= dg.top - vh * .79)) { drives.classList.add("is-border-reached"); }
        if (reduced || (dg.staged ? dp >= .17 : y >= dg.top - vh * .70)) { drives.classList.add("is-title-reached"); }
        [.30,.53,.75,.91].forEach(function (point, i) {
          if (reduced || (dg.staged ? dp >= point : y >= dg.items[i])) { reveal(principles[i]); }
        });
      }

      if (footerEl && (reduced || footerEl.classList.contains("is-sheet-settled"))) {
        var fg = geometry.footer;
        var footerStaged = window.innerWidth >= 1080 && vh >= 760;
        var distance = footerStaged ? Math.max(fg.height - vh, 1) : Math.min(fg.height * .9, vh * .9);
        var p = reduced ? 1 : footerStaged ? clamp((y - fg.top) / distance, 0, 1) : clamp((y + vh - fg.top) / Math.max(distance, 1), 0, 1);
        var titleP = ease(span(p, .22, .60));
        footerEl.style.setProperty("--footer-title-scale", (reduced ? 1 : lerp(window.innerWidth < 768 ? .84 : .56, 1, titleP)).toFixed(4));
        footerEl.style.setProperty("--footer-title-lift", (reduced ? 0 : lerp(0, -18, ease(span(p, .68, .76)))).toFixed(2) + "px");
        [[.10,"is-kicker-reached"],[.22,"is-title-reached"],[.62,"is-title-max"],[.78,"is-lede-reached"],[.84,"is-actions-reached"],[.88,"is-cover-reached"],[.95,"is-social-reached"]].forEach(function (beat) {
          if (reduced || p >= beat[0]) { footerEl.classList.add(beat[1]); }
        });
        if (!finePointer && (reduced || p >= .90)) { footerEl.classList.add("is-touch-note-reached"); }
      }
    }

    function schedule() {
      if (queued) { return; }
      queued = true;
      requestAnimationFrame(function () { queued = false; draw(); });
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", function () { dirty = true; schedule(); }, { passive: true });
    window.addEventListener("load", function () { dirty = true; schedule(); });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { dirty = true; schedule(); }); }
    if ("MutationObserver" in window) {
      [].slice.call(document.querySelectorAll(".paper-sheet")).forEach(function (sheet) {
        var settled = sheet.classList.contains("is-sheet-settled");
        new MutationObserver(function () {
          var next = sheet.classList.contains("is-sheet-settled");
          if (next !== settled) { settled = next; dirty = true; schedule(); }
        }).observe(sheet, { attributes: true, attributeFilter: ["class"] });
      });
    }
    measure();
  }

  /* ==========================================================
     11b. SUBTLE SCROLL PARALLAX — selected physical objects only
     Uses the individual translate property in CSS, so existing transforms
     for paper, rotation, hover and record playback remain untouched.
     ========================================================== */
  function scrollParallax() {
    var elements = [].slice.call(document.querySelectorAll("[data-parallax]"));
    if (!elements.length) { return; }

    if (reduced) {
      elements.forEach(function (el) { el.style.setProperty("--parallax-y", "0px"); });
      return;
    }

    var geometry = [];
    var dirty = true;
    var knownHeight = 0;
    var queued = false;

    function pageTop(el) {
      var rect = el.getBoundingClientRect();
      return rect.top + window.scrollY;
    }

    function strength() {
      if (window.innerWidth < 768) { return 0; }
      if (window.innerWidth < 1080) { return 0.5; }
      return 1;
    }

    function measure() {
      var scale = strength();
      geometry = elements.map(function (el) {
        var rect = el.getBoundingClientRect();
        return {
          el: el,
          top: pageTop(el),
          height: rect.height || el.offsetHeight || 1,
          depth: (parseFloat(el.getAttribute("data-parallax")) || 0) * scale,
          last: null
        };
      });
      knownHeight = document.documentElement.scrollHeight;
      dirty = false;
    }

    function draw() {
      queued = false;
      if (dirty || document.documentElement.scrollHeight !== knownHeight) { measure(); }

      var y = window.scrollY;
      var vh = window.innerHeight;
      for (var i = 0; i < geometry.length; i++) {
        var g = geometry[i];
        if (g.depth === 0) {
          if (g.last !== 0) { g.el.style.setProperty("--parallax-y", "0px"); g.last = 0; }
          continue;
        }

        var bottom = g.top + g.height;
        if (bottom < y - vh * 0.35 || g.top > y + vh * 1.35) { continue; }

        var centre = g.top + g.height * 0.5;
        var range = vh * 0.5 + g.height * 0.5;
        var p = clamp((y + vh * 0.5 - centre) / Math.max(range, 1), -1, 1);
        /* data-parallax describes total travel, so the element only moves
           half that value to either side of its resting position. */
        var offset = p * g.depth * 0.5;
        if (g.last !== null && Math.abs(offset - g.last) < 0.04) { continue; }
        g.last = offset;
        g.el.style.setProperty("--parallax-y", offset.toFixed(2) + "px");
      }
    }

    function schedule() {
      if (queued) { return; }
      queued = true;
      requestAnimationFrame(draw);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", function () { dirty = true; schedule(); }, { passive: true });
    window.addEventListener("load", function () { dirty = true; schedule(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { dirty = true; schedule(); });
    }
    if ("MutationObserver" in window) {
      var sheetObserver = new MutationObserver(function () { dirty = true; schedule(); });
      [].slice.call(document.querySelectorAll(".paper-sheet")).forEach(function (sheet) {
        sheetObserver.observe(sheet, { attributes: true, attributeFilter: ["class"] });
      });
    }
    schedule();
  }

  /* ==========================================================
     11b. ORIGIN STORY — questions become clarity, then chapters
     ========================================================== */
  function originStory() {
    var section = document.querySelector(".about");
    var story = section && section.querySelector(".story-col");
    if (!section || !story) { return; }

    var curiosity = story.querySelector(".origin-curiosity");
    var questions = [].slice.call(story.querySelectorAll(".origin-questions span"));
    var methods = [].slice.call(story.querySelectorAll(".origin-method span"));
    var marker = story.querySelector(".marker-sweep");
    var designChapter = story.querySelector(".design-chapter");
    var design = story.querySelector(".origin-design");
    var body = story.querySelector(".story-body");
    var careerHeading = story.querySelector(".career-heading");
    var items = [].slice.call(story.querySelectorAll(".career-strip"));
    var targets = [curiosity].concat(questions, methods, [marker, design, body, careerHeading], items).filter(Boolean);

    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-reached"); });
      story.classList.add("is-origin-ready", "is-synthesizing");
      return;
    }

    story.classList.add("is-origin-ready");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add("is-reached");
        if (entry.target === marker || entry.target === design || entry.target === designChapter) {
          story.classList.add("is-synthesizing");
        }
        io.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -75% 0px" });

    targets.forEach(function (el) { io.observe(el); });
    if (designChapter) { io.observe(designChapter); }
  }

  /* ==========================================================
     12. EASTER EGGS — marginalia for people who wander
     ========================================================== */
  function easterEggs() {
    var eggs = [].slice.call(document.querySelectorAll(".sp-egg"));
    if (!eggs.length || reduced || !finePointer) { return; }

    addJob(function () {
      if (!ptr.has) { return; }
      for (var i = 0; i < eggs.length; i++) {
        var egg = eggs[i];
        var r = egg.getBoundingClientRect();
        if (r.bottom < -100 || r.top > window.innerHeight + 100) {
          if (egg.classList.contains("is-near")) { egg.classList.remove("is-near"); }
          continue;
        }
        var dx = ptr.x - (r.left + r.width / 2);
        var dy = ptr.y - (r.top + r.height / 2);
        var near = (dx * dx + dy * dy) < 200 * 200;
        egg.classList.toggle("is-near", near);
      }
    });
  }

  /* ==========================================================
     12b. SHEETS OF PAPER
     Each band below the case studies climbs over the one above it as
     you scroll. The negative margin in CSS sets the final overlap; this
     writes how much of it has been taken up, from 1 (flush) to 0 (fully
     lapped). Offsets are measured once — offsetTop is a layout value and
     is not disturbed by the transform being written back to it — so
     nothing here reads layout while scrolling.
     ========================================================== */
  function paperSheets() {
    var sheets = [].slice.call(document.querySelectorAll(".paper-sheet"));
    if (!sheets.length) { return; }

    if (reduced) {
      sheets.forEach(function (el) {
        el.style.setProperty("--slide", "0");
        el.classList.add("is-sheet-settled");
      });
      return;
    }

    var geo = [];
    var dirty = true;
    var knownHeight = 0;

    function measure() {
      geo = sheets.map(function (el) {
        var top = 0, node = el;
        while (node) { top += node.offsetTop; node = node.offsetParent; }
        return {
          el: el,
          top: top,
          last: -1,
          done: el.classList.contains("is-sheet-settled")
        };
      });
      knownHeight = document.documentElement.scrollHeight;
      dirty = false;
    }

    function draw() {
      // Measuring once is not enough. The page grows after boot — images
      // arrive, fonts swap, and the case-study track is given its pinned
      // height by script — and a stale offset fires the sheet hundreds of
      // pixels early. One cheap property read per frame catches all of it.
      if (dirty || document.documentElement.scrollHeight !== knownHeight) {
        measure();
      }
      var y = window.scrollY;
      var vh = window.innerHeight;

      for (var i = 0; i < geo.length; i++) {
        var g = geo[i];
        if (g.done) { continue; }
        var fromTop = g.top - y;

        // Begins as the sheet's edge reaches the floor of the screen and is
        // done once it has climbed to around the middle. A longer window than
        // the rest of the page's motion, so the sheet reads as having weight.
        var p = clamp((vh - fromTop) / (vh * 0.55), 0, 1);
        var eased = p * p * (3 - 2 * p);
        var slide = 1 - eased;

        // Skip the write when nothing has changed; most frames of a scroll
        // leave at least one sheet exactly where it was.
        if (Math.abs(slide - g.last) < 0.0015) { continue; }
        g.last = slide;
        g.el.style.setProperty("--slide", slide.toFixed(4));

        if (p >= 0.999) {
          g.done = true;
          g.el.style.setProperty("--slide", "0");
          g.el.classList.add("is-sheet-settled");
        }
      }
    }

    var queued = false;
    window.addEventListener("scroll", function () {
      if (queued) { return; }
      queued = true;
      requestAnimationFrame(function () { queued = false; draw(); });
    }, { passive: true });

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { dirty = true; draw(); }, 160);
    }, { passive: true });

    window.addEventListener("load", function () { dirty = true; draw(); });
    draw();
  }

  /* ==========================================================
     13. WAYFINDING
     How far through the issue you are, and a way back to page one.
     Both ride the same throttled scroll handler.
     ========================================================== */
  function wayfinding() {
    var bar = document.querySelector(".sp-progress span");
    var top = document.querySelector(".sp-top");
    if (!bar && !top) { return; }

    var shown = false;

    function draw() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var y = window.scrollY;

      if (bar) {
        bar.style.setProperty("--read", max > 0 ? clamp(y / max, 0, 1).toFixed(4) : "0");
      }
      if (top) {
        var next = y > window.innerHeight * 1.4;
        if (next !== shown) {
          shown = next;
          top.classList.toggle("is-shown", shown);
        }
      }
    }

    if (top) {
      top.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      });
    }

    var queued = false;
    window.addEventListener("scroll", function () {
      if (queued) { return; }
      queued = true;
      requestAnimationFrame(function () { queued = false; draw(); });
    }, { passive: true });
    window.addEventListener("resize", draw, { passive: true });
    draw();
  }

  /* ==========================================================
     Boot
     ========================================================== */
  function boot() {
    try { stickyNav(); } catch (e) {}
    try { reveals(); } catch (e) {}
    try { metrics(); } catch (e) {}
    try { paperTear(); } catch (e) {}
    try { paperSheets(); } catch (e) {}
    try { caseStudies(); } catch (e) {}
    try { heroInteractions(); } catch (e) {}
    try { heroScrollDepth(); } catch (e) {}
    try { customCursor(); } catch (e) {}
    try { magneticWords(); } catch (e) {}
    try { headlineChars(); } catch (e) {}
    try { books(); } catch (e) {}
    try { music(); } catch (e) {}
    try { sectionStories(); } catch (e) {}
    try { originStory(); } catch (e) {}
    try { scrollParallax(); } catch (e) {}
    try { footer(); } catch (e) {}
    try { easterEggs(); } catch (e) {}
    try { wayfinding(); } catch (e) {}
  }

  function start() {
    primeHero();
    runLoader(function () {
      heroEntrance();
      boot();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
