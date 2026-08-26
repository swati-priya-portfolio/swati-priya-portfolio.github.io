/* script.js — Swati Priya portfolio
   Core utilities + motion polish. */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Quick first-visit loader handoff. */
  (function quickLoaderHandoff() {
    var root = document.documentElement;
    var loader = document.querySelector(".sp-loader");
    if (!loader || reducedMotion || !root.classList.contains("sp-loading")) { return; }

    root.classList.remove("sp-loading");
    try { sessionStorage.setItem("sp-seen-v15", "1"); } catch (e) {}

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

    setTimeout(function () { loader.classList.add("is-done"); }, 760);
    setTimeout(function () {
      loader.setAttribute("hidden", "");
      loader.removeAttribute("style");
      root.style.removeProperty("overflow");
    }, 980);
  })();

  /* Keep page motion dominant; secondary parallax stays restrained. */
  (function calmParallax() {
    if (reducedMotion) { return; }

    var phone = window.matchMedia("(max-width: 767px)").matches;
    var presets = phone ? [
      [".hero-copy", -4],
      [".section-head", -4],
      [".case-card:nth-child(1)", 0],
      [".case-card:nth-child(2)", 0],
      [".case-card:nth-child(3)", 0],
      [".behind-head", -4],
      [".board:nth-child(1)", 3],
      [".board:nth-child(2)", 4],
      [".board:nth-child(3)", 3],
      [".board:nth-child(4)", 4],
      [".about-grid > .polaroid-col", 0],
      [".about-grid > .story-col", 0],
      [".drives-title", -2],
      [".drives-list", 3],
      [".footer-story", -3]
    ] : [
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

  /* Reminder notes arrive together; footer CTA arrives earlier. */
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

  /* Mobile-only choreography. Desktop is not touched. */
  (function mobileOnlyPolish() {
    var mobile = window.matchMedia("(max-width: 767px)");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function smooth(t) {
      t = clamp(t, 0, 1);
      return t * t * (3 - 2 * t);
    }
    function span(v, a, b) { return clamp((v - a) / Math.max(b - a, 0.0001), 0, 1); }

    function mobileEpisodeSequence() {
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
      var top = 78;
      var queued = false;
      var resizeTimer = 0;

      function cleanCard(card) {
        card.style.removeProperty("--m-y");
        card.style.removeProperty("--m-s");
        card.style.removeProperty("--m-r");
        card.style.removeProperty("--m-o");
        card.classList.remove("is-mobile-active");
      }

      function disable() {
        enabled = false;
        track.classList.remove("mobile-episode-v2", "mobile-episode-stack");
        track.style.removeProperty("--mobile-v2-card-h");
        track.style.removeProperty("--mobile-v2-top");
        track.style.removeProperty("--mobile-v2-track-h");
        cards.forEach(cleanCard);
      }

      function setCard(card, y, scale, rotate, opacity) {
        card.style.setProperty("--m-y", y.toFixed(1) + "px");
        card.style.setProperty("--m-s", scale.toFixed(4));
        card.style.setProperty("--m-r", rotate.toFixed(2) + "deg");
        card.style.setProperty("--m-o", opacity.toFixed(3));
      }

      function measure() {
        if (!mobile.matches || reduced.matches) {
          disable();
          return;
        }

        enabled = true;
        track.classList.remove("mobile-episode-stack");
        track.classList.add("mobile-episode-v2");

        cards.forEach(function (card) {
          card.classList.remove("settle-in");
          card.style.opacity = "";
          card.style.pointerEvents = "";
          card.style.transform = "";
          card.style.zIndex = "";
        });

        var headerH = header ? header.getBoundingClientRect().height : 58;
        top = Math.max(74, Math.round(headerH + 10));
        cardH = Math.round(cards[0].getBoundingClientRect().height || cards[0].offsetHeight || 480);
        /* Two clear scroll beats, but no long empty runway. */
        travel = Math.round(Math.max(window.innerHeight * 1.62, 900));
        var finalHold = Math.round(Math.min(66, window.innerHeight * 0.10));

        track.style.setProperty("--mobile-v2-card-h", cardH + "px");
        track.style.setProperty("--mobile-v2-top", top + "px");
        track.style.setProperty("--mobile-v2-track-h", (cardH + travel + finalHold) + "px");

        draw();
      }

      function draw() {
        queued = false;
        if (!enabled) { return; }

        var rect = track.getBoundingClientRect();
        var p = clamp((top - rect.top) / Math.max(travel, 1), 0, 1);
        var incomingY = Math.min(window.innerHeight * 0.62, Math.max(240, cardH * 0.64));

        /* One issue per beat. The next issue is completely absent until its beat. */
        var gray = smooth(span(p, 0.12, 0.38));
        var embibe = smooth(span(p, 0.45, 0.71));
        var grayOpacity = smooth(span(p, 0.12, 0.20));
        var embibeOpacity = smooth(span(p, 0.45, 0.53));

        setCard(cards[0],
          -7 * gray - 6 * embibe,
          1 - 0.016 * gray - 0.016 * embibe,
          -0.22 * gray - 0.16 * embibe,
          1);

        setCard(cards[1],
          lerp(incomingY, 0, gray) - 6 * embibe,
          lerp(0.988, 1, gray) - 0.016 * embibe,
          lerp(0.65, 0, gray) - 0.22 * embibe,
          grayOpacity);

        setCard(cards[2],
          lerp(incomingY, 0, embibe),
          lerp(0.988, 1, embibe),
          lerp(-0.65, 0, embibe),
          embibeOpacity);

        var active = p < 0.30 ? 0 : (p < 0.62 ? 1 : 2);
        cards.forEach(function (card, index) {
          card.classList.toggle("is-mobile-active", index === active);
        });
      }

      function requestDraw() {
        if (!enabled || queued) { return; }
        queued = true;
        requestAnimationFrame(draw);
      }

      window.addEventListener("scroll", requestDraw, { passive: true });
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(measure, 120);
      }, { passive: true });

      if (mobile.addEventListener) {
        mobile.addEventListener("change", measure);
        reduced.addEventListener("change", measure);
      }

      measure();
    }

    function mobileFocusReveals() {
      if (!mobile.matches) { return; }

      var selectors = [
        "#case-studies .section-head",
        "#behind .behind-head",
        "#behind .board",
        "#about .polaroid-col",
        "#about .story-head",
        "#about .story-body",
        "#about .timeline-item",
        "#about .drives",
        ".site-footer .footer-story",
        ".site-footer .footer-cover"
      ];

      var seen = new Set();
      var targets = [];
      selectors.forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (el) {
          if (seen.has(el)) { return; }
          seen.add(el);
          targets.push(el);
        });
      });

      if (!targets.length) { return; }

      targets.forEach(function (el) { el.classList.add("mobile-focus-ready"); });

      if (reduced.matches || !("IntersectionObserver" in window)) {
        targets.forEach(function (el) { el.classList.add("mobile-focus-in"); });
        return;
      }

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          entry.target.classList.add("mobile-focus-in");
          io.unobserve(entry.target);
        });
      }, {
        threshold: 0.14,
        rootMargin: "0px 0px -14% 0px"
      });

      targets.forEach(function (el) { io.observe(el); });
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
        var y = window.scrollY;
        if (mobile.matches && links.classList.contains("is-open") && Math.abs(y - lastY) > 24) {
          close();
        }
        lastY = y;
      }, { passive: true });
    }

    function boot() {
      mobileEpisodeSequence();
      mobileFocusReveals();
      mobileNav();
    }

    if (document.readyState === "complete") {
      setTimeout(boot, 0);
    } else {
      window.addEventListener("load", function () { setTimeout(boot, 0); }, { once: true });
    }
  })();

  /* Generic one-time reveals. */
  var revealTargets = document.querySelectorAll(".reveal-on-scroll");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* Mobile navigation toggle. */
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.getElementById("nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });
    navLinks.addEventListener("click", function (event) {
      if (event.target.closest(".nav-link")) {
        navLinks.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* Highlight the nav link for the section currently being read. */
  var sections = document.querySelectorAll("main section[id], footer[id]");
  var linkFor = {};
  document.querySelectorAll(".nav-link").forEach(function (link) {
    var id = link.getAttribute("href").replace("#", "");
    if (id) { linkFor[id] = link; }
  });

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkFor[entry.target.id];
        if (!link || !entry.isIntersecting) { return; }
        document.querySelectorAll(".nav-link").forEach(function (el) {
          el.classList.remove("is-active");
        });
        link.classList.add("is-active");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }
})();
