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
  var EASE = 0.12;                                  // Figma pointer smoothing
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
  function runLoader(done) {
    var loader = document.querySelector(".sp-loader");
    var showing = root.classList.contains("sp-loading");

    if (!loader || !showing || reduced) {
      root.classList.remove("sp-loading");
      try { sessionStorage.setItem("sp-seen-v14", "1"); } catch (e) {}
      done();
      return;
    }

    var DURATION = 2100;
    var start = null;

    requestAnimationFrame(function step(now) {
      if (start === null) { start = now; }
      var p = ease(span(now - start, 0, DURATION));
      loader.style.setProperty("--load", p.toFixed(3));

      if (p < 1) { requestAnimationFrame(step); return; }

      // Let the final bite land, acknowledge it once, then dissolve cleanly.
      try { sessionStorage.setItem("sp-seen-v14", "1"); } catch (e) {}
      setTimeout(function () {
        var status = loader.querySelector(".sp-loader-sub");
        if (status) {
          status.setAttribute("data-loader-copy", status.textContent);
          status.textContent = "READY.";
        }
        loader.classList.add("is-ready");
        setTimeout(function () {
          loader.classList.add("is-done");
          setTimeout(function () {
            root.classList.remove("sp-loading");
            loader.setAttribute("hidden", "");
            done();
          }, 410);
        }, 140);
      }, 110);
    });
  }

  /* ==========================================================
     2. HERO ENTRANCE — eyebrow, headline lines, copy, portrait
     ========================================================== */
  function heroEntrance() {
    var hero = document.querySelector(".hero");
    var title = document.querySelector(".hero-title");
    var character = document.querySelector(".hero-character");
    var header = document.querySelector(".site-header");

    if (!hero) { return; }

    if (reduced) {
      hero.classList.add("is-role-in", "is-title-in", "is-character-in",
        "is-copy-in", "is-actions-in", "is-proof-in");
      if (title) { title.classList.add("is-in"); title.classList.remove("is-masked"); }
      if (character) { character.classList.add("is-in"); }
      if (header) { header.classList.add("is-hero-ready"); }
      return;
    }

    requestAnimationFrame(function () { hero.classList.add("is-role-in"); });
    setTimeout(function () {
      hero.classList.add("is-title-in");
      if (title) { title.classList.add("is-in"); }
    }, 110);
    setTimeout(function () {
      hero.classList.add("is-character-in");
      if (character) { character.classList.add("is-in"); }
    }, 360);
    setTimeout(function () { hero.classList.add("is-copy-in"); }, 500);
    setTimeout(function () { hero.classList.add("is-actions-in"); }, 650);
    setTimeout(function () { hero.classList.add("is-proof-in"); }, 760);
    setTimeout(function () { if (header) { header.classList.add("is-hero-ready"); } }, 840);
    // Once the lines have landed, drop the clip so hover annotations can breathe.
    setTimeout(function () { if (title) { title.classList.remove("is-masked"); } }, 1180);
  }

  /* ==========================================================
     3. HERO — hidden comic thinking layer + micro parallax
     ========================================================== */
  function heroInteractions() {
    var hero = document.querySelector(".hero");
    var sketch = document.querySelector(".hero-sketch");
    var art = document.querySelector(".hero-art");
    var speeches = [].slice.call(document.querySelectorAll(".hero-character .speech"));
    if (!hero || reduced || !finePointer || window.innerWidth <= 768) { return; }

    var target = { x: 0, y: 0, on: 0 };
    var current = { x: 0, y: 0, on: 0 };
    var rect = null;
    var leaveTimer = null;

    function measure() { rect = hero.getBoundingClientRect(); }

    hero.addEventListener("pointerenter", function () {
      clearTimeout(leaveTimer);
      measure();
      hero.classList.add("is-exploring");
      target.on = 1;
    });
    hero.addEventListener("pointerleave", function () {
      target.on = 0;
      target.x = 0; target.y = 0;                 // layers glide home
      leaveTimer = setTimeout(function () {
        hero.classList.remove("is-exploring");
      }, 110);
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
        s.style.transform = "rotate(" + rot + "deg) translate3d(" +
          (nx * 5).toFixed(2) + "px," + (ny * 5).toFixed(2) + "px,0)";
      }
    });
  }

  /* ==========================================================
     3b. HEADLINE EMPHASIS
     Only COMPLEXITY and CLARITY respond. The rest of each line makes a
     few pixels of room, so emphasis never becomes a letter-by-letter party.
     ========================================================== */
  function headlineEmphasis() {
    var title = document.querySelector(".hero-title");
    if (!title || reduced || !finePointer || window.innerWidth <= 768) { return; }

    var focusWords = [].slice.call(title.querySelectorAll(".sp-word"));
    if (!focusWords.length) { return; }

    var boxes = [];
    var dirty = true;
    var RADIUS = 80;

    function measure() {
      var sx = window.scrollX, sy = window.scrollY;
      boxes = focusWords.map(function (word, index) {
        var r = word.getBoundingClientRect();
        return {
          el: word,
          line: word.closest(".line"),
          px: r.left + r.width / 2 + sx,
          py: r.top + r.height / 2 + sy,
          halfW: r.width / 2,
          halfH: r.height / 2,
          max: index === 0 ? 1.10 : 1.08,
          v: 0
        };
      });
      dirty = false;
    }

    function resetSiblings(line) {
      if (!line) { return; }
      [].slice.call(line.querySelectorAll(".wd")).forEach(function (word) {
        if (!word.classList.contains("sp-word")) { word.style.setProperty("--wd-x", "0px"); }
      });
    }

    window.addEventListener("resize", function () { dirty = true; }, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { dirty = true; });
    }
    setTimeout(function () { dirty = true; }, 1250);

    addJob(function () {
      if (!ptr.has) { return; }
      if (dirty) { measure(); }

      var sx = window.scrollX, sy = window.scrollY;
      for (var i = 0; i < boxes.length; i++) {
        var b = boxes[i];
        var cx = b.px - sx, cy = b.py - sy;
        var dx = Math.max(0, Math.abs(ptr.x - cx) - b.halfW);
        var dy = Math.max(0, Math.abs(ptr.y - cy) - b.halfH);
        var d = Math.sqrt(dx * dx + dy * dy);
        var t = d < RADIUS ? 1 - d / RADIUS : 0;
        t = t * t * (3 - 2 * t);
        b.v = lerp(b.v, t, t > b.v ? 0.24 : 0.16);
        if (b.v < 0.002) { b.v = 0; }

        b.el.style.setProperty("--wd-s", (1 + (b.max - 1) * b.v).toFixed(3));
        resetSiblings(b.line);
        if (b.line && b.v > 0) {
          [].slice.call(b.line.querySelectorAll(".wd:not(.sp-word)")).forEach(function (word) {
            var r = word.getBoundingClientRect();
            var direction = r.left < cx ? -1 : 1;
            word.style.setProperty("--wd-x", (direction * 5 * b.v).toFixed(2) + "px");
          });
        }
      }
    });
  }

  /* ==========================================================
     4. CUSTOM CURSOR — a dot that turns into a comic annotation
     ========================================================== */
  function customCursor() {
    var el = document.querySelector(".sp-cursor");
    if (!el || !finePointer || reduced || window.innerWidth <= 768) { return; }

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
    var words = [].slice.call(document.querySelectorAll(".sp-word:not(.hero-title .sp-word)"));
    if (!words.length || reduced || !finePointer || window.innerWidth <= 768) { return; }

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

      var stageH = stage.offsetHeight;
      var room = window.innerHeight - PIN_TOP - 40;
      // The stage has to fit on screen while pinned, with the lead cover
      // scaled up. If it does not, fall back to a plain staggered reveal.
      if (stageH > room) { teardown(); return; }

      cards.forEach(function (c) { c.classList.remove("settle-in", "is-visible"); });
      if (settleObserver) { settleObserver.disconnect(); settleObserver = null; }

      var gridRect = grid.getBoundingClientRect();
      var gridCentre = gridRect.left + gridRect.width / 2;

      geo = {
        stageH: stageH,
        lead: Math.min(1.12, room / stageH),
        offsets: cards.map(function (c) {
          var r = c.getBoundingClientRect();
          return gridCentre - (r.left + r.width / 2);
        })
      };

      travel = Math.round(Math.min(window.innerHeight * 1.15, 940));
      track.style.height = (stageH + travel) + "px";
      stage.style.position = "sticky";
      stage.style.top = PIN_TOP + "px";
      pinned = true;
      cards[0].style.zIndex = "3";   // Guardian One owns the opening beat
      cards[1].style.zIndex = "2";
      cards[2].style.zIndex = "1";
      draw();
    }

    function draw() {
      if (!pinned || !geo) { return; }

      var top = track.getBoundingClientRect().top;   // relative to viewport
      var p = clamp((PIN_TOP - top) / travel, 0, 1);

      // Guardian One begins centred and dominant. It calmly returns to its
      // final Figma position while GrayQuest and Embibe arrive behind it.
      var leadP = ease(span(p, 0.12, 0.66));
      var middleP = ease(span(p, 0.34, 0.76));
      var rightP = ease(span(p, 0.56, 0.94));

      setCard(cards[0], lerp(geo.offsets[0], 0, leadP), lerp(geo.lead, 1, leadP), 0, 1);
      cards[0].style.boxShadow = "";
      setCard(cards[1], lerp(geo.offsets[1], 0, middleP), lerp(0.90, 1, middleP),
        0, clamp(middleP * 1.65, 0, 1));
      setCard(cards[2], lerp(geo.offsets[2], 0, rightP), lerp(0.90, 1, rightP),
        0, clamp(rightP * 1.65, 0, 1));

      var settled = p > 0.97;
      grid.classList.toggle("is-staging", !settled);
      grid.style.pointerEvents = settled ? "" : "none";

      // While the covers are still arriving they overlap, so the stack order
      // matters. Once they are settled it is dropped, or that inline order
      // decides which raised artwork wins on hover instead of the pointer.
      if (settled !== stacked) {
        stacked = settled;
        cards[0].style.zIndex = settled ? "" : "3";   // the anchor cover
        cards[1].style.zIndex = settled ? "" : "2";
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
    var targets = [].slice.call(document.querySelectorAll(".sp-reveal, .sp-settle, .reveal-on-scroll"));
    var squiggles = [].slice.call(document.querySelectorAll(".squiggle"));

    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-visible"); });
      squiggles.forEach(function (el) { el.classList.add("is-drawn"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        if (entry.target.classList.contains("board")) {
          var boards = [].slice.call(entry.target.parentNode.querySelectorAll(".board"));
          var boardIndex = Math.max(0, boards.indexOf(entry.target));
          entry.target.style.transitionDelay = (boardIndex * 110) + "ms";
          setTimeout(function (board) {
            board.style.removeProperty("transition-delay");
          }.bind(null, entry.target), 760 + boardIndex * 110);
        }
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

    function measure() {
      geo = tears.map(function (t) {
        var top = 0, el = t;
        while (el) { top += el.offsetTop; el = el.offsetParent; }
        return { el: t, top: top, done: t.classList.contains("is-torn") };
      });
      dirty = false;
    }

    function draw() {
      if (dirty) { measure(); }
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
    if (!shelf || reduced || !finePointer) { return; }
    var all = [].slice.call(shelf.querySelectorAll(".book"));

    all.forEach(function (book, i) {
      book.addEventListener("pointerenter", function () {
        shelf.classList.add("is-active");
        all.forEach(function (other, j) {
          other.classList.remove("is-picked", "is-nudge-l", "is-nudge-r");
          if (j === i) { other.classList.add("is-picked"); }
          else if (j < i) { other.classList.add("is-nudge-l"); }
          else { other.classList.add("is-nudge-r"); }
        });
      });
    });

    shelf.addEventListener("pointerleave", function () {
      shelf.classList.remove("is-active");
      all.forEach(function (b) { b.classList.remove("is-picked", "is-nudge-l", "is-nudge-r"); });
    });
  }

  /* ==========================================================
     10. MUSIC — official Spotify playback, explicit click only
     The existing card remains the interface. The official controller is
     mounted lazily and no copyrighted audio is stored in this repository.
     ========================================================== */
  function music() {
    var player = document.querySelector(".player");
    var button = document.querySelector(".ctrl-main");
    var state = document.querySelector(".music-state");
    if (!player || !button || !state) { return; }

    var TRACK_ID = "62bOmKYxYg7dhrC6gH9vFn";
    var START_MS = 36000;
    var stateText = state.querySelector(".music-label");
    var bar = player.querySelector(".player-progress span");
    var host = document.createElement("div");
    var controller = null;
    var playing = false;
    var requested = false;
    var apiRequested = false;
    var hasStarted = false;
    var needsSeek = false;

    host.className = "spotify-shell";
    host.id = "spotify-embed";
    host.setAttribute("aria-hidden", "true");
    player.appendChild(host);

    function paint(label) {
      player.classList.toggle("is-playing", playing);
      state.classList.toggle("is-playing", playing);
      button.innerHTML = playing ? "&#10074;&#10074;" : "&#9654;";
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", playing ? "Pause Bye Bye Bye" : "Play Bye Bye Bye");
      button.setAttribute("data-cursor", playing ? "PAUSE ♪" : "PLAY ♪");
      if (stateText) { stateText.textContent = label || (playing ? "MUSIC ON" : "MUSIC OFF"); }
    }

    function remember() {
      try { sessionStorage.setItem("sp-music-started", hasStarted ? "1" : "0"); } catch (e) {}
    }

    function playbackUpdate(data) {
      if (!data) { return; }
      playing = !data.isPaused;
      hasStarted = true;
      if (needsSeek && controller && data.duration) {
        if (data.duration > START_MS + 5000 && data.position < START_MS - 1500) {
          needsSeek = false;
          try { if (controller.seek) { controller.seek(START_MS); } } catch (e) {}
        } else if (data.duration <= START_MS + 5000) {
          // Logged-out Spotify embeds can expose only a short legal preview.
          // In that case play the available preview instead of seeking past it.
          needsSeek = false;
        }
      }
      if (bar && data.duration) {
        bar.style.width = (clamp(data.position / data.duration, 0, 1) * 100).toFixed(2) + "%";
      }
      paint();
      remember();
    }

    function beginRequestedTrack() {
      if (!controller || !requested) { return; }
      requested = false;
      hasStarted = true;
      needsSeek = true;
      try { if (controller.setVolume) { controller.setVolume(0.18); } } catch (e) {}
      try { controller.play(); } catch (e) { paint("OPEN IN SPOTIFY"); return; }
      paint("STARTING…");
      remember();
    }

    function connectSpotify() {
      if (apiRequested) { return; }
      apiRequested = true;
      window.onSpotifyIframeApiReady = function (IFrameAPI) {
        IFrameAPI.createController(host, {
          width: 80,
          height: 80,
          uri: "spotify:track:" + TRACK_ID
        }, function (nextController) {
          controller = nextController;
          if (controller.addListener) {
            controller.addListener("ready", beginRequestedTrack);
            controller.addListener("playback_update", function (event) {
              playbackUpdate(event && event.data);
            });
          }
          beginRequestedTrack();
        });
      };
      var script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.onerror = function () { requested = false; paint("OPEN IN SPOTIFY"); };
      document.head.appendChild(script);
    }

    function toggle() {
      hasStarted = true;
      if (!controller) {
        requested = true;
        paint("CONNECTING…");
        remember();
        connectSpotify();
        return;
      }
      try {
        if (controller.togglePlay) { controller.togglePlay(); }
        else if (playing) { controller.pause(); }
        else { controller.play(); }
      } catch (e) { paint("OPEN IN SPOTIFY"); }
    }

    button.addEventListener("click", function (e) { e.preventDefault(); toggle(); });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden || !playing || !controller) { return; }
      try { controller.pause(); } catch (e) {}
      playing = false;
      paint();
    });

    // A previous interaction may be remembered for UI context, but audio never
    // resumes after reload without another explicit click.
    try { hasStarted = sessionStorage.getItem("sp-music-started") === "1"; } catch (e) {}
    paint();
  }

  /* ==========================================================
     11. FOOTER — the last surprise
     ========================================================== */
  function footer() {
    var foot = document.querySelector(".site-footer");
    if (!foot) { return; }
    var giant = foot.querySelector(".footer-giant");
    var hosts = [].slice.call(foot.querySelectorAll("[data-giant]"));
    if (!giant || reduced || !finePointer) { return; }

    hosts.forEach(function (host) {
      host.addEventListener("pointerenter", function () {
        giant.textContent = host.getAttribute("data-giant");
        foot.classList.add("is-shouting");
        if (host.hasAttribute("data-bubble")) { foot.classList.add("is-talking"); }
      });
      host.addEventListener("pointerleave", function () {
        foot.classList.remove("is-shouting", "is-talking");
      });
    });
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
     Boot
     ========================================================== */
  function boot() {
    try { stickyNav(); } catch (e) {}
    try { reveals(); } catch (e) {}
    try { paperTear(); } catch (e) {}
    try { caseStudies(); } catch (e) {}
    try { heroInteractions(); } catch (e) {}
    try { customCursor(); } catch (e) {}
    try { magneticWords(); } catch (e) {}
    try { headlineEmphasis(); } catch (e) {}
    try { books(); } catch (e) {}
    try { music(); } catch (e) {}
    try { footer(); } catch (e) {}
    try { easterEggs(); } catch (e) {}
  }

  function start() {
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
