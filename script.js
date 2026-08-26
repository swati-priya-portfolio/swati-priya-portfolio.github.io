/* script.js — Swati Priya portfolio
   Core utilities + motion polish. */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile preview stylesheet is loaded at high priority so repeat visits do
     not visibly settle into the mobile layout after first paint. */
  if (window.matchMedia("(max-width: 767px)").matches) {
    var mobileStyle = document.createElement("link");
    mobileStyle.rel = "stylesheet";
    mobileStyle.href = "mobile-preview.css?v=6";
    mobileStyle.fetchPriority = "high";
    document.head.appendChild(mobileStyle);
  }

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

    var isPhone = window.matchMedia("(max-width: 767px)").matches;
    var fadeAt = isPhone ? 620 : 760;
    var removeAt = isPhone ? 840 : 980;

    setTimeout(function () { loader.classList.add("is-done"); }, fadeAt);
    setTimeout(function () {
      loader.setAttribute("hidden", "");
      loader.removeAttribute("style");
      root.style.removeProperty("overflow");
    }, removeAt);
  })();

  (function calmParallax() {
    if (reducedMotion) { return; }
    var phone = window.matchMedia("(max-width: 767px)").matches;
    var presets = phone ? [
      [".hero-copy", -4], [".section-head", -4],
      [".case-card:nth-child(1)", 0], [".case-card:nth-child(2)", 0], [".case-card:nth-child(3)", 0],
      [".behind-head", -3], [".board:nth-child(1)", 1], [".board:nth-child(2)", 1],
      [".board:nth-child(3)", 1], [".board:nth-child(4)", 1],
      [".about-grid > .polaroid-col", 0], [".about-grid > .story-col", 0],
      [".drives-title", -2], [".drives-list", 2], [".footer-story", -3]
    ] : [
      [".hero-copy", -18], [".section-head", -14],
      [".case-card:nth-child(1)", 16], [".case-card:nth-child(2)", 24], [".case-card:nth-child(3)", 30],
      [".behind-head", -14], [".board:nth-child(1)", 14], [".board:nth-child(2)", 20],
      [".board:nth-child(3)", 18], [".board:nth-child(4)", 24],
      [".about-grid > .polaroid-col", 18], [".about-grid > .story-col", -14],
      [".timeline-item:nth-child(1)", 6], [".timeline-item:nth-child(2)", 10],
      [".timeline-item:nth-child(3)", 8], [".timeline-item:nth-child(4)", 12],
      [".drives-title", -10], [".drives-list", 14], [".footer-story", -16]
    ];
    presets.forEach(function (preset) {
      document.querySelectorAll(preset[0]).forEach(function (el) {
        el.setAttribute("data-parallax", String(preset[1]));
      });
    });
  })();

  (function simplifySecondaryBeats() {
    if (!("MutationObserver" in window)) { return; }
    var behind = document.querySelector("#behind");
    if (behind) {
      var finalBoard = behind.querySelector(".board:nth-child(4)");
      var reminders = behind.querySelectorAll(".reminder");
      if (finalBoard && reminders.length) {
        var syncReminders = function () {
          var show = finalBoard.classList.contains("is-beat-reached");
          reminders.forEach(function (note) { note.classList.toggle("is-beat-reached", show); });
        };
        new MutationObserver(function () { requestAnimationFrame(syncReminders); })
          .observe(behind, { subtree: true, attributes: true, attributeFilter: ["class"] });
      }
    }
    var footer = document.querySelector(".site-footer");
    if (footer) {
      var syncFooterActions = function () {
        if (footer.classList.contains("is-lede-reached")) { footer.classList.add("is-actions-reached"); }
      };
      new MutationObserver(function () { requestAnimationFrame(syncFooterActions); })
        .observe(footer, { attributes: true, attributeFilter: ["class"] });
    }
  })();

  (function mobileOnlyPolish() {
    var mobile = window.matchMedia("(max-width: 767px)");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
    function span(v, a, b) { return clamp((v - a) / Math.max(b - a, 0.0001), 0, 1); }

    function mobileEpisodeSequence() {
      var track = document.querySelector(".case-track");
      var stage = document.querySelector(".case-stage");
      var grid = document.querySelector(".case-grid");
      var header = document.querySelector(".site-header");
      if (!track || !stage || !grid) { return; }
      var cards = [].slice.call(grid.querySelectorAll(".case-card"));
      if (cards.length < 3) { return; }

      var enabled = false, cardH = 0, travel = 0, top = 78, queued = false, resizeTimer = 0;

      function cleanCard(card) {
        ["--m-y", "--m-s", "--m-r", "--m-o"].forEach(function (p) { card.style.removeProperty(p); });
        card.classList.remove("is-mobile-active");
      }
      function disable() {
        enabled = false;
        track.classList.remove("mobile-episode-v2", "mobile-episode-stack");
        ["--mobile-v2-card-h", "--mobile-v2-top", "--mobile-v2-track-h"].forEach(function (p) { track.style.removeProperty(p); });
        cards.forEach(cleanCard);
      }
      function setCard(card, y, scale, rotate, opacity) {
        card.style.setProperty("--m-y", y.toFixed(1) + "px");
        card.style.setProperty("--m-s", scale.toFixed(4));
        card.style.setProperty("--m-r", rotate.toFixed(2) + "deg");
        card.style.setProperty("--m-o", opacity.toFixed(3));
      }
      function measure() {
        if (!mobile.matches || reduced.matches) { disable(); return; }
        enabled = true;
        track.classList.remove("mobile-episode-stack");
        track.classList.add("mobile-episode-v2");
        cards.forEach(function (card) {
          card.classList.remove("settle-in");
          card.style.opacity = ""; card.style.pointerEvents = ""; card.style.transform = ""; card.style.zIndex = "";
        });
        var headerH = header ? header.getBoundingClientRect().height : 58;
        top = Math.max(74, Math.round(headerH + 10));
        cardH = Math.round(cards[0].getBoundingClientRect().height || cards[0].offsetHeight || 480);
        travel = Math.round(Math.max(window.innerHeight * 1.58, 860));
        var finalHold = Math.round(Math.min(62, window.innerHeight * 0.09));
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
        var incomingY = Math.min(window.innerHeight * 0.60, Math.max(230, cardH * 0.62));
        var gray = smooth(span(p, 0.12, 0.38));
        var embibe = smooth(span(p, 0.45, 0.71));
        var grayOpacity = smooth(span(p, 0.12, 0.20));
        var embibeOpacity = smooth(span(p, 0.45, 0.53));
        setCard(cards[0], -7 * gray - 6 * embibe, 1 - 0.016 * gray - 0.016 * embibe, -0.22 * gray - 0.16 * embibe, 1);
        setCard(cards[1], lerp(incomingY, 0, gray) - 6 * embibe, lerp(0.988, 1, gray) - 0.016 * embibe, lerp(0.65, 0, gray) - 0.22 * embibe, grayOpacity);
        setCard(cards[2], lerp(incomingY, 0, embibe), lerp(0.988, 1, embibe), lerp(-0.65, 0, embibe), embibeOpacity);
        var active = p < 0.30 ? 0 : (p < 0.62 ? 1 : 2);
        cards.forEach(function (card, index) { card.classList.toggle("is-mobile-active", index === active); });
      }
      function requestDraw() {
        if (!enabled || queued) { return; }
        queued = true; requestAnimationFrame(draw);
      }
      window.addEventListener("scroll", requestDraw, { passive: true });
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer); resizeTimer = setTimeout(measure, 120);
      }, { passive: true });
      if (mobile.addEventListener) {
        mobile.addEventListener("change", measure); reduced.addEventListener("change", measure);
      }
      measure();
    }

    function mobileSpacing() {
      if (!mobile.matches) { return; }
      function set(selector, property, value, priority) {
        document.querySelectorAll(selector).forEach(function (el) {
          el.style.setProperty(property, value, priority || "");
        });
      }
      set("#case-studies .section-head", "margin-bottom", "26px", "important");
      set("#behind .behind-head", "margin-bottom", "34px", "important");
      set("#behind .board-grid", "gap", "42px", "important");
      set("#about .about-grid", "gap", "44px", "important");
      set("#about .story-head", "gap", "24px", "important");
      set("#about .story-body", "margin-top", "32px", "important");
      set("#about .timeline", "margin-top", "34px", "important");
      set("#about .timeline", "display", "grid", "important");
      set("#about .timeline", "gap", "18px", "important");
      set("#about .timeline-item", "padding-top", "14px", "important");
      set("#about .timeline-item", "padding-bottom", "14px", "important");
      set("#about .drives", "margin-top", "42px", "important");
      set(".site-footer .footer-body", "gap", "38px", "important");
      set(".site-footer .footer-story", "gap", "17px", "important");
    }

    function mobileFocusReveals() {
      if (!mobile.matches) { return; }
      var selectors = [
        "#case-studies .section-head",
        "#behind .behind-head",
        "#behind .board",
        "#about .polaroid",
        "#about .sticky-note",
        "#about .tools",
        "#about .story-head",
        "#about .story-body",
        "#about .timeline-item",
        "#about .drives",
        ".site-footer .footer-story",
        ".site-footer .footer-cover"
      ];
      var seen = new Set(), targets = [];
      selectors.forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (el) {
          if (!seen.has(el)) { seen.add(el); targets.push(el); }
        });
      });
      if (!targets.length) { return; }

      function hidden(el) {
        el.classList.add("mobile-focus-ready");
        el.style.setProperty("opacity", "0", "important");
        el.style.setProperty("transform", "translateY(24px)", "important");
        el.style.setProperty("transition", "opacity 520ms linear, transform 680ms cubic-bezier(0.22,1,0.36,1)", "important");
      }
      function show(el) {
        el.classList.add("mobile-focus-in");
        el.style.setProperty("opacity", "1", "important");
        el.style.setProperty("transform", "translateY(0)", "important");
      }

      targets.forEach(hidden);
      if (reduced.matches || !("IntersectionObserver" in window)) {
        targets.forEach(show); return;
      }

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          show(entry.target);
          io.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -30% 0px" });
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
        if (mobile.matches && links.classList.contains("is-open") && !header.contains(event.target)) { close(); }
      });
      document.addEventListener("keydown", function (event) { if (event.key === "Escape") { close(); } });
      var lastY = window.scrollY;
      window.addEventListener("scroll", function () {
        var y = window.scrollY;
        if (mobile.matches && links.classList.contains("is-open") && Math.abs(y - lastY) > 24) { close(); }
        lastY = y;
      }, { passive: true });
    }

    function boot() {
      mobileSpacing();
      mobileEpisodeSequence();
      mobileFocusReveals();
      mobileNav();
    }
    if (document.readyState === "complete") { setTimeout(boot, 0); }
    else { window.addEventListener("load", function () { setTimeout(boot, 0); }, { once: true }); }
  })();

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
        document.querySelectorAll(".nav-link").forEach(function (el) { el.classList.remove("is-active"); });
        link.classList.add("is-active");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }
})();
