from pathlib import Path

# --- motion.js ---
p = Path('motion.js')
s = p.read_text()

# 1) Simplify the Origin reading beat on desktop: one compact scroll moment,
# then reserve the rest of the scroll for the professional journey.
old = '''        reached(eyebrow, p >= .03);\n        reached(curiosity, p >= .07);\n        var points = [.14,.22,.30,.38];\n        steps.forEach(function (step, i) { reached(step, p >= (points[i] || .38)); });\n        arrows.forEach(function (arrow, i) { reached(arrow, p >= (points[i + 1] || .38)); });\n        reached(design, p >= .44);\n        reached(body, p >= .50);\n\n        var line = ease(span(p, .52, .91));\n        furthestLine = line;\n        story.style.setProperty("--timeline-draw", line.toFixed(4));\n        var itemPoints = [.60,.70,.80,.89];\n        items.forEach(function (item, i) { reached(item, p >= (itemPoints[i] || .89)); });\n        if (p >= .95) { showAll(); }'''
new = '''        /* Reading beat: the Origin copy should be understood in one natural\n           scroll gesture, not rationed out line by line. */\n        var readingOn = p >= .055;\n        reached(eyebrow, readingOn);\n        reached(curiosity, readingOn);\n        steps.forEach(function (step) { reached(step, readingOn); });\n        arrows.forEach(function (arrow) { reached(arrow, readingOn); });\n        reached(design, p >= .095);\n        reached(body, p >= .135);\n\n        /* The professional journey is the sequential part. The line follows\n           scroll continuously in both directions; each role gets its own beat. */\n        var line = ease(span(p, .24, .92));\n        furthestLine = line;\n        story.style.setProperty("--timeline-draw", line.toFixed(4));\n        var itemPoints = [.34,.50,.67,.84];\n        items.forEach(function (item, i) { reached(item, p >= (itemPoints[i] || .84)); });\n        if (p >= .96) { showAll(); }'''
if old not in s:
    raise SystemExit('desktop Origin block not found')
s = s.replace(old, new, 1)

# 2) Mobile/tablet Origin: reading content arrives together as it enters, while
# the existing role thresholds remain sequential.
old = '''        reached(eyebrow, y >= eyebrowThreshold);\n        reached(curiosity, y >= curiosityThreshold);\n        steps.forEach(function (step, i) { reached(step, y >= stepThresholds[i]); });\n        arrows.forEach(function (arrow, i) { reached(arrow, y >= (stepThresholds[i + 1] || designThreshold)); });\n        reached(design, y >= designThreshold);\n        reached(body, y >= bodyThreshold);'''
new = '''        var readingThreshold = Math.min(eyebrowThreshold, curiosityThreshold);\n        var readingOn = y >= readingThreshold;\n        reached(eyebrow, readingOn);\n        reached(curiosity, readingOn);\n        steps.forEach(function (step) { reached(step, readingOn); });\n        arrows.forEach(function (arrow) { reached(arrow, readingOn); });\n        reached(design, y >= readingThreshold + 26);\n        reached(body, y >= readingThreshold + 58);'''
if old not in s:
    raise SystemExit('mobile Origin block not found')
s = s.replace(old, new, 1)

# 3) Add subtle Hero-style pointer depth to the visible career rows.
anchor = '''  /* ==========================================================\n     12. EASTER EGGS — marginalia for people who wander\n     ========================================================== */'''
career_fn = r'''  /* ==========================================================
     11c. CAREER DEPTH — subtle pointer response, never a second Hero
     The Hero is playful; career stays readable. Only existing children move:
     logo + body drift toward the pointer, date drifts slightly away.
     ========================================================== */
  function careerDepth() {
    var timeline = document.querySelector(".timeline");
    if (!timeline || reduced || !finePointer) { return; }

    var items = [].slice.call(timeline.querySelectorAll(".timeline-item"));
    if (!items.length) { return; }

    var active = false;
    var current = items.map(function () { return { v: 0, x: 0, y: 0 }; });

    timeline.addEventListener("pointerenter", function () { active = true; });
    timeline.addEventListener("pointerleave", function () { active = false; });

    function write(item, state) {
      var logo = item.querySelector(".tl-logo");
      var body = item.querySelector(".tl-body");
      var date = item.querySelector(".tl-date");

      var lx = state.x * 4.2 * state.v;
      var ly = state.y * 3.6 * state.v;
      var bx = state.x * 2.3 * state.v;
      var by = state.y * 2.1 * state.v;
      var dx = state.x * -1.4 * state.v;
      var dy = state.y * -1.2 * state.v;

      if (logo) {
        logo.style.setProperty("--career-x", lx.toFixed(2) + "px");
        logo.style.setProperty("--career-y", ly.toFixed(2) + "px");
      }
      if (body) {
        body.style.setProperty("--career-x", bx.toFixed(2) + "px");
        body.style.setProperty("--career-y", by.toFixed(2) + "px");
      }
      if (date) {
        date.style.setProperty("--career-x", dx.toFixed(2) + "px");
        date.style.setProperty("--career-y", dy.toFixed(2) + "px");
      }
    }

    addJob(function () {
      if (!ptr.has) { return; }

      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var state = current[i];
        var targetV = 0;
        var targetX = 0;
        var targetY = 0;

        /* Do not animate unrevealed career rows. */
        if (active && item.classList.contains("is-reached")) {
          var r = item.getBoundingClientRect();
          if (r.bottom > -80 && r.top < window.innerHeight + 80) {
            var cx = r.left + r.width * 0.5;
            var cy = r.top + r.height * 0.5;
            var dx = ptr.x - cx;
            var dy = ptr.y - cy;
            var d = Math.sqrt(dx * dx * 0.28 + dy * dy);
            var radius = Math.max(145, Math.min(230, r.height * 1.9));
            var t = d < radius ? 1 - d / radius : 0;
            t = t * t * (3 - 2 * t);
            targetV = t;
            targetX = clamp(dx / Math.max(r.width * 0.5, 1), -1, 1);
            targetY = clamp(dy / Math.max(r.height * 0.72, 1), -1, 1);
          }
        }

        state.v = lerp(state.v, targetV, active ? 0.16 : 0.12);
        state.x = lerp(state.x, targetX, 0.16);
        state.y = lerp(state.y, targetY, 0.16);
        if (state.v < 0.002) { state.v = 0; }
        write(item, state);
      }
    });
  }

'''
if anchor not in s:
    raise SystemExit('career insertion anchor not found')
s = s.replace(anchor, career_fn + anchor, 1)

# 4) Boot career depth after Origin is initialized. Hero + Footer systems stay
# exactly as they are, preserving the intended hierarchy.
old = '''    try { sectionStories(); } catch (e) {}\n    try { originStory(); } catch (e) {}\n    try { scrollParallax(); } catch (e) {}\n    try { footer(); } catch (e) {}\n    try { easterEggs(); } catch (e) {}'''
new = '''    try { sectionStories(); } catch (e) {}\n    try { originStory(); } catch (e) {}\n    try { careerDepth(); } catch (e) {}\n    try { scrollParallax(); } catch (e) {}\n    try { footer(); } catch (e) {}\n    try { easterEggs(); } catch (e) {}'''
if old not in s:
    raise SystemExit('boot insertion point not found')
s = s.replace(old, new, 1)

p.write_text(s)

# --- motion.css ---
p = Path('motion.css')
c = p.read_text()
old = '''.sp-js .timeline-item { transition: transform 380ms var(--ep); }\n.sp-js .timeline-item:hover { transform: translateX(5px); }\n.sp-js .tl-logo { transition: transform 380ms var(--ep); }\n.sp-js .timeline-item:hover .tl-logo { transform: scale(1.06) rotate(-2deg); }'''
new = '''.sp-js .timeline-item { transition: transform 380ms var(--ep); }\n.sp-js .timeline-item:hover { transform: translateX(5px); }\n.sp-js .tl-logo { transition: transform 380ms var(--ep); }\n.sp-js .timeline-item:hover .tl-logo { transform: scale(1.06) rotate(-2deg); }\n\n/* Career uses the individual translate property so its subtle cursor depth\n   composes with the existing row hover and logo scale/rotation instead of\n   overwriting them. Final/resting layout remains unchanged. */\n.sp-js .timeline-item .tl-logo,\n.sp-js .timeline-item .tl-body,\n.sp-js .timeline-item .tl-date {\n  translate: var(--career-x, 0px) var(--career-y, 0px);\n  will-change: translate;\n}\n@media (pointer: coarse), (prefers-reduced-motion: reduce) {\n  .sp-js .timeline-item .tl-logo,\n  .sp-js .timeline-item .tl-body,\n  .sp-js .timeline-item .tl-date { translate: 0 0 !important; }\n}'''
if old not in c:
    raise SystemExit('career css insertion point not found')
c = c.replace(old, new, 1)
p.write_text(c)

print('Origin reading + sequential career + subtle career pointer depth applied')
