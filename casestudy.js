/* ============================================================
   CASE STUDY READER
   Steps through the scenes with the arrow keys, a click, or a
   swipe, and keeps the chrome — crumb, counter, progress, up
   next — in step with wherever you are.

   The scene content is plain HTML in the page; this file only
   decides which one is current. Without JS every scene is still
   in the document and readable, which is why the no-JS state
   leaves them all visible.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reader = document.querySelector(".cs-reader");
  var stage = document.querySelector(".cs-stage");
  if (!reader || !stage) { return; }

  var scenes = [].slice.call(stage.querySelectorAll(".cs-scene"));
  if (!scenes.length) { return; }

  var crumb = document.querySelector(".cs-crumb");
  var count = document.querySelector(".cs-count");
  var fill = document.querySelector(".cs-fill");
  var upnext = document.querySelector(".cs-upnext");
  var upnextLabel = upnext && upnext.querySelector(".txt");
  var viewDesign = document.querySelector(".cs-view-design");
  var prevBtn = document.querySelector(".cs-prev");
  var nextBtn = document.querySelector(".cs-next");

  var total = scenes.length;
  var index = 0;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var flowMedia = window.matchMedia("(max-width: 899px)");

  root.classList.add("cs-js");

  /* ---------- Fit the 1440x700 frame into whatever room is left ---------- */
  function fit() {
    if (flowMedia.matches) {
      stage.style.removeProperty("--cs-scale");
      return;
    }
    var styles = getComputedStyle(document.documentElement);
    var w = parseFloat(styles.getPropertyValue("--cs-w")) || 1440;
    var h = parseFloat(styles.getPropertyValue("--cs-h")) || 700;
    var box = reader.getBoundingClientRect();
    // A little breathing room so the frame never touches the window edge.
    var scale = Math.min((box.width - 40) / w, (box.height - 40) / h);
    scale = Math.max(Math.min(scale, 1), 0.2);
    stage.style.setProperty("--cs-scale", scale.toFixed(4));
    // The top rail lives outside the scaled frame, so it has to be told how
    // wide the frame ended up or it stops lining up with the scene edges.
    reader.style.setProperty("--cs-bar", Math.round((w - 100) * scale) + "px");
  }

  /* ---------- Which scene is showing ---------- */
  function show(next, viaHash) {
    next = Math.max(0, Math.min(total - 1, next));
    if (next === index && viaHash !== "init") { return; }

    reader.classList.toggle("is-reversing", next < index);
    index = next;

    scenes.forEach(function (scene, i) {
      var current = i === index;
      scene.classList.toggle("is-current", current);
      // Only the scene you are on should be reachable by tab or read out.
      scene.setAttribute("aria-hidden", current ? "false" : "true");
      if (!flowMedia.matches) { scene.inert = !current; }
    });

    var scene = scenes[index];

    if (crumb) {
      crumb.innerHTML = "Case study &middot; <b>Guardian One</b> &middot; " +
        (scene.getAttribute("data-section") || "");
    }
    if (count) { count.textContent = "Scene " + pad(index + 1) + " / " + pad(total); }
    if (fill) { fill.style.setProperty("--cs-progress", ((index + 1) / total).toFixed(4)); }

    if (viewDesign) {
      var link = scene.getAttribute("data-design");
      viewDesign.classList.toggle("is-on", !!link);
      if (link) { viewDesign.href = link; }
    }

    if (upnext) {
      var label = scene.getAttribute("data-next");
      var last = index === total - 1;
      upnext.hidden = last || !label;
      if (upnextLabel && label) { upnextLabel.textContent = label; }
    }

    if (prevBtn) { prevBtn.disabled = index === 0; }
    if (nextBtn) { nextBtn.disabled = index === total - 1; }

    var hash = "#scene-" + (index + 1);
    if (viaHash !== "hash" && window.location.hash !== hash) {
      try { history.replaceState(null, "", hash); } catch (e) {}
    }

    // Let a keyboard user land inside the scene they just moved to.
    if (viaHash === "key" || viaHash === "click") {
      scene.setAttribute("tabindex", "-1");
      scene.focus({ preventScroll: true });
    }
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function go(delta, how) { show(index + delta, how || "click"); }

  /* ---------- Input ---------- */
  document.addEventListener("keydown", function (e) {
    if (flowMedia.matches) { return; }
    if (e.metaKey || e.ctrlKey || e.altKey) { return; }
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") { return; }

    switch (e.key) {
      case "ArrowRight": case "ArrowDown": case "PageDown": case " ":
        e.preventDefault(); go(1, "key"); break;
      case "ArrowLeft": case "ArrowUp": case "PageUp":
        e.preventDefault(); go(-1, "key"); break;
      case "Home": e.preventDefault(); show(0, "key"); break;
      case "End":  e.preventDefault(); show(total - 1, "key"); break;
      default: break;
    }
  });

  // A click anywhere on the stage advances, the way the design says it does.
  // Anything genuinely clickable inside a scene keeps its own behaviour.
  stage.addEventListener("click", function (e) {
    if (flowMedia.matches) { return; }
    if (e.target.closest("a, button, input, select, textarea, [data-no-advance]")) { return; }
    go(1, "click");
  });

  if (prevBtn) { prevBtn.addEventListener("click", function () { go(-1); }); }
  if (nextBtn) { nextBtn.addEventListener("click", function () { go(1); }); }
  if (upnext) { upnext.addEventListener("click", function (e) { e.preventDefault(); go(1); }); }

  // Swipe, for trackpads and touch screens that still get the slide view.
  var touchX = null;
  stage.addEventListener("touchstart", function (e) {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (touchX === null || flowMedia.matches) { return; }
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 46) { go(dx < 0 ? 1 : -1); }
  }, { passive: true });

  /* ---------- Deep links ---------- */
  function fromHash(how) {
    var m = /^#scene-(\d+)$/.exec(window.location.hash || "");
    if (!m) { return false; }
    show(parseInt(m[1], 10) - 1, how);
    return true;
  }
  window.addEventListener("hashchange", function () { fromHash("hash"); });

  /* ---------- Boot ---------- */
  window.addEventListener("resize", fit, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", fit, { passive: true });
  }
  if (flowMedia.addEventListener) {
    flowMedia.addEventListener("change", function () {
      fit();
      // Coming back to the slide view, re-assert who is current.
      show(index, "init");
    });
  }

  fit();
  if (!fromHash("init")) { show(0, "init"); }

  // Fonts land after first paint and change how much room the frame needs.
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(fit); }
  window.addEventListener("load", fit);

  if (reduced) { reader.classList.add("is-reduced"); }
})();
