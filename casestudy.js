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
  var caps = [].slice.call(document.querySelectorAll(".cs-keys .cap[data-step]"));

  var total = scenes.length;
  var index = 0;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var flowMedia = window.matchMedia("(max-width: 899px)");

  root.classList.add("cs-js");

  /* ---------- Fit the 1440x700 frame into whatever room is left ---------- */
  function fit() {
    var head = document.querySelector(".site-header");
    if (head) {
      // On the root, so the fixed top rail and the reader both read the same
      // number regardless of where they sit in the tree.
      root.style.setProperty("--cs-head", Math.ceil(head.getBoundingClientRect().height) + "px");
    }
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
    root.style.setProperty("--cs-bar", Math.round((w - 100) * scale) + "px");
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

    // A key that cannot take you anywhere should say so.
    caps.forEach(function (cap) {
      var step = parseInt(cap.getAttribute("data-step"), 10);
      cap.disabled = (step < 0 && index === 0) || (step > 0 && index === total - 1);
    });

    var hash = "#scene-" + (index + 1);
    // In reading mode the whole story is one scroll, so stamping a scene hash
    // on load only gives the browser a fragment to jump to — which pushed the
    // top of the page up under the header. Deep links still work; we just do
    // not write one for you.
    var stampsHash = !(flowMedia.matches && viaHash === "init");
    if (viaHash !== "hash" && stampsHash && window.location.hash !== hash) {
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

  // Clicking the page does NOT advance. The story moves on the arrow keys and
  // on the keycaps that are drawn on the scene, and nothing else — a stray
  // click while reading should never skip a scene.
  caps.forEach(function (cap) {
    cap.addEventListener("click", function () {
      go(parseInt(cap.getAttribute("data-step"), 10) || 0, "click");
    });
  });

  if (upnext) { upnext.addEventListener("click", function (e) { e.preventDefault(); go(1); }); }

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
