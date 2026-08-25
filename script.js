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
