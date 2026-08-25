/* mobile-motion.js — mobile-only interaction layer.
   Desktop motion is intentionally untouched. */
(function () {
  "use strict";

  var mobile = window.matchMedia("(max-width: 767px)");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }
  function span(v, a, b) { return clamp((v - a) / (b - a), 0, 1); }

  /* ----------------------------------------------------------
     1. PICK AN EPISODE — mobile comic stack
     One issue is readable at a time. The next issue rises over it,
     leaving a small paper edge behind so the sequence reads as a stack.
     ---------------------------------------------------------- */
  function mobileEpisodeStack() {
    var track = document.querySelector(".case-track");
    var stage = document.querySelector(".case-stage");
    var grid = document.querySelector(".case-grid");
    var header = document.querySelector(".site-header");
    if (!track || !stage || !grid) { return; }

    var cards = [].slice.call(grid.querySelectorAll(".case-card"));
    if (cards.length < 3) { return; }

    var enabled = false;
    var cardH = 0;
    var travel = 0;
    var startY = 0;
    var stackTop = 82;
    var queued = false;

    function clearCard(card) {
      card.style.removeProperty("transform");
      card.style.removeProperty("z-index");
      card.style.removeProperty("pointer-events");
    }

    function disable() {
      if (!enabled) { return; }
      enabled = false;
      track.classList.remove("mobile-episode-stack");
      track.style.removeProperty("height");
      track.style.removeProperty("--mobile-card-h");
      track.style.removeProperty("--mobile-stack-top");
      cards.forEach(clearCard);
    }

    function measure() {
      if (!mobile.matches || reduced.matches) {
        disable();
        return;
      }

      enabled = true;
      track.classList.add("mobile-episode-stack");

      /* motion.js gives small-screen cards a settle-in class. The stack owns
         their movement instead, so keep the content fully readable. */
      cards.forEach(function (card) {
        card.classList.remove("settle-in");
        card.style.opacity = "1";
      });

      var headerH = header ? header.getBoundingClientRect().height : 60;
      stackTop = Math.max(76, Math.round(headerH + 12));

      /* Measure before the track height changes. Aspect ratio keeps this
         stable across the 320–767px range. */
      cardH = Math.round(cards[0].getBoundingClientRect().height || cards[0].offsetHeight || 480);
      travel = Math.round(Math.max(window.innerHeight * 1.55, 980));
      startY = Math.round(Math.max(cardH * 0.72, Math.min(window.innerHeight * 0.78, 640)));

      track.style.setProperty("--mobile-card-h", cardH + "px");
      track.style.setProperty("--mobile-stack-top", stackTop + "px");
      track.style.height = Math.round(cardH + travel) + "px";

      draw();
    }

    function setCard(card, y, scale, rotate, z) {
      card.style.zIndex = String(z);
      card.style.transform =
        "translate3d(0," + y.toFixed(1) + "px,0) " +
        "rotate(" + rotate.toFixed(2) + "deg) " +
        "scale(" + scale.toFixed(4) + ")";
    }

    function draw() {
      queued = false;
      if (!enabled) { return; }

      var rect = track.getBoundingClientRect();
      var p = clamp((stackTop - rect.top) / Math.max(travel, 1), 0, 1);

      /* Each incoming issue gets its own scroll chapter with a short hold
         between chapters so the visitor can actually read the cover. */
      var second = smooth(span(p, 0.14, 0.46));
      var third = smooth(span(p, 0.56, 0.88));

      var firstScale = 1 - 0.026 * second - 0.014 * third;
      var firstY = -6 * second - 5 * third;
      var firstR = -0.45 * second - 0.20 * third;

      var secondY = lerp(startY, 10, second) - 5 * third;
      var secondScale = lerp(0.985, 1, second) - 0.024 * third;
      var secondR = lerp(1.1, 0.15, second) - 0.55 * third;

      var thirdY = lerp(startY + 24, 20, third);
      var thirdScale = lerp(0.985, 1, third);
      var thirdR = lerp(-1.0, 0, third);

      setCard(cards[0], firstY, firstScale, firstR, 1);
      setCard(cards[1], secondY, secondScale, secondR, 2);
      setCard(cards[2], thirdY, thirdScale, thirdR, 3);

      /* Only the issue visually on top should accept a tap. */
      cards[0].style.pointerEvents = second < 0.72 ? "auto" : "none";
      cards[1].style.pointerEvents = second >= 0.72 && third < 0.72 ? "auto" : "none";
      cards[2].style.pointerEvents = third >= 0.72 ? "auto" : "none";
    }

    function requestDraw() {
      if (!enabled || queued) { return; }
      queued = true;
      requestAnimationFrame(draw);
    }

    window.addEventListener("scroll", requestDraw, { passive: true });
    window.addEventListener("resize", function () {
      requestAnimationFrame(function () { requestAnimationFrame(measure); });
    }, { passive: true });

    if (mobile.addEventListener) {
      mobile.addEventListener("change", measure);
      reduced.addEventListener("change", measure);
    }

    measure();
  }

  /* ----------------------------------------------------------
     2. MOBILE NAV — stable pill + floating menu
     CSS handles the visual layout. This adds the mobile interaction polish:
     close on outside tap, Escape, or once the user resumes scrolling.
     ---------------------------------------------------------- */
  function mobileNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var links = document.getElementById("nav-links");
    if (!header || !toggle || !links) { return; }

    function close() {
      if (!links.classList.contains("is-open")) { return; }
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }

    document.addEventListener("click", function (event) {
      if (!mobile.matches || !links.classList.contains("is-open")) { return; }
      if (!header.contains(event.target)) { close(); }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { close(); }
    });

    var lastY = window.scrollY;
    window.addEventListener("scroll", function () {
      if (!mobile.matches || !links.classList.contains("is-open")) {
        lastY = window.scrollY;
        return;
      }
      if (Math.abs(window.scrollY - lastY) > 24) { close(); }
    }, { passive: true });
  }

  function boot() {
    mobileEpisodeStack();
    mobileNav();
  }

  if (document.readyState === "complete") { boot(); }
  else { window.addEventListener("load", boot, { once: true }); }
})();
