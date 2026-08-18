/* script.js — Swati Priya portfolio
   Only three jobs live here. Everything else is CSS. */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
