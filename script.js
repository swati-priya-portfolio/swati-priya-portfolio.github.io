/* script.js — Swati Priya portfolio
   Core page utilities + a lightweight motion-polish layer. */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     0. FIRST-VISIT LOADER — keep the signature, lose the wait
     The large motion engine used to hold the page for ~2.5s before even
     starting the hero. We hand the loader off early so motion.js boots
     immediately behind it, then clear the loader in under one second.
     ---------------------------------------------------------- */
  (function quickLoaderHandoff() {
    var root = document.documentElement;
    var loader = document.querySelector(".sp-loader");
    if (!loader || reducedMotion || !root.classList.contains("sp-loading")) { return; }

    /* Prevent motion.js from running its long loader branch. */
    root.classList.remove("sp-loading");
    try { sessionStorage.setItem("sp-seen-v15", "1"); } catch (e) {}

    /* Keep the same loader artwork visible while the hero starts behind it. */
    root.style.overflow = "hidden";
    loader.style.display = "grid";
    loader.style.position = "fixed";
    loader.style.inset = "0";
    loader.style.zIndex = "9999";
    loader.style.placeContent = "center";
    loader.style.justifyItems = "center";
    loader.style.gap = "10px";
    loader.style.padding = "0 24px";
    loader.style.background = "#000000";
    loader.style.textAlign = "center";

    setTimeout(function () {
      loader.classList.add("is-done");
    }, 760);

    setTimeout(function () {
      loader.setAttribute("hidden", "");
      loader.removeAttribute("style");
      root.style.removeProperty("overflow");
    }, 980);
  })();

  /* ----------------------------------------------------------
     0b. CALMER PARALLAX HIERARCHY
     Page-over-page paper motion is the hero. These inner layers now support
     it rather than competing with it.
     ---------------------------------------------------------- */
  (function calmParallax() {
    if (reducedMotion) { return; }

    var presets = [
      [".hero-copy", -18],
      [".section-head", -14],
      [".case-card:nth-child(1)", 16],
      [".case-card:nth-child(2)", 24],
      [".case-card:nth-child(3)", 30],
      [".behind-head", -14],
      [".board:nth-child(1)", 14],
      [".board:nth-child(2)", 20],
      [".board:nth-child(3)", 18],
      [".board:nth-child(4)", 24],
      [".about-grid > .polaroid-col", 18],
      [".about-grid > .story-col", -14],
      [".timeline-item:nth-child(1)", 6],
      [".timeline-item:nth-child(2)", 10],
      [".timeline-item:nth-child(3)", 8],
      [".timeline-item:nth-child(4)", 12],
      [".drives-title", -10],
      [".drives-list", 14],
      [".footer-story", -16]
    ];

    presets.forEach(function (preset) {
      document.querySelectorAll(preset[0]).forEach(function (el) {
        el.setAttribute("data-parallax", String(preset[1]));
      });
    });
  })();

  /* ----------------------------------------------------------
     0c. EDIT THE BUSY BEATS, NOT THE DESIGN
     - Reminder notes arrive as one idea, not three rapid micro-beats.
     - Footer contact actions appear as soon as the lede is readable.
     motion.js still owns the actual scroll clock.
     ---------------------------------------------------------- */
  (function simplifySecondaryBeats() {
    if (!("MutationObserver" in window)) { return; }

    var behind = document.querySelector("#behind");
    if (behind) {
      var finalBoard = behind.querySelector(".board:nth-child(4)");
      var reminders = behind.querySelectorAll(".reminder");
      if (finalBoard && reminders.length) {
        var syncReminders = function () {
          var show = finalBoard.classList.contains("is-beat-reached");
          reminders.forEach(function (note) {
            note.classList.toggle("is-beat-reached", show);
          });
        };

        new MutationObserver(function () {
          requestAnimationFrame(syncReminders);
        }).observe(behind, { subtree: true, attributes: true, attributeFilter: ["class"] });
      }
    }

    var footer = document.querySelector(".site-footer");
    if (footer) {
      var syncFooterActions = function () {
        if (footer.classList.contains("is-lede-reached")) {
          footer.classList.add("is-actions-reached");
        }
      };

      new MutationObserver(function () {
        requestAnimationFrame(syncFooterActions);
      }).observe(footer, { attributes: true, attributeFilter: ["class"] });
    }
  })();

  /* ----------------------------------------------------------
     0d. MOBILE-ONLY POLISH
     Desktop remains untouched. On phones, Pick an episode becomes a real
     comic stack and the nav behaves like a stable floating control.
     ---------------------------------------------------------- */
  (function mobileOnlyPolish() {
    var mobile = window.matchMedia("(max-width: 767px)");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function smooth(t) {
      t = clamp(t, 0, 1);
      return t * t * (3 - 2 * t);
    }
    function span(v, a, b) { return clamp((v - a) / (b - a), 0, 1); }

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
        card.style.removeProperty("opacity");
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

        cards.forEach(function (card) {
          card.classList.remove("settle-in");
          card.style.opacity = "1";
        });

        var headerH = header ? header.getBoundingClientRect().height : 60;
        stackTop = Math.max(76, Math.round(headerH + 12));
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

        var second = smooth(span(p, 0.14, 0.46));
        var third = smooth(span(p, 0.56, 0.88));

        setCard(cards[0],
          -6 * second - 5 * third,
          1 - 0.026 * second - 0.014 * third,
          -0.45 * second - 0.20 * third,
          1);

        setCard(cards[1],
          lerp(startY, 10, second) - 5 * third,
          lerp(0.985, 1, second) - 0.024 * third,
          lerp(1.1, 0.15, second) - 0.55 * third,
          2);

        setCard(cards[2],
          lerp(startY + 24, 20, third),
          lerp(0.985, 1, third),
          lerp(-1.0, 0, third),
          3);

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

  /* ----------------------------------------------------------
     1. Scroll-triggered reveals
     Adds .is-visible to any .reveal-on-scroll element that
     enters the viewport, which CSS then animates.
     ---------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(".reveal-on-scroll");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    // No animation wanted (or very old browser): just show everything.
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target); // animate once, then stop watching
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ----------------------------------------------------------
     2. Mobile navigation toggle
     ---------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.getElementById("nav-links");

  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    // Close the menu after tapping a link on mobile
    navLinks.addEventListener("click", function (event) {
      if (event.target.closest(".nav-link")) {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* ----------------------------------------------------------
     3. Highlight the nav link for the section you're reading
     ---------------------------------------------------------- */
  var sections = document.querySelectorAll("main section[id], footer[id]");
  var linkFor = {};

  document.querySelectorAll(".nav-link").forEach(function (link) {
    var id = link.getAttribute("href").replace("#", "");
    if (id) { linkFor[id] = link; }
  });

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = linkFor[entry.target.id];
          if (!link || !entry.isIntersecting) { return; }

          document.querySelectorAll(".nav-link").forEach(function (el) {
            el.classList.remove("is-active");
          });
          link.classList.add("is-active");
        });
      },
      // Fires when a section crosses the upper third of the screen
      { rootMargin: "-30% 0px -60% 0px" }
    );

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }
})();
