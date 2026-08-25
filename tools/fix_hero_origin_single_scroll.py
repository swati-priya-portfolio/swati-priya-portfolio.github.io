from pathlib import Path

# Motion JS: strengthen Hero mouse response, compress Origin into one continuous scroll,
# keep the career sequence one-by-one, and make career depth visible but restrained.
p = Path('motion.js')
s = p.read_text()

# HERO: grab the wrapper too so the full character/laptop composition has a visible
# depth response while the art inside it travels a little further.
old = '''    var hero = document.querySelector(".hero");
    var sketch = document.querySelector(".hero-sketch");
    var art = document.querySelector(".hero-art");
    var speeches = [].slice.call(document.querySelectorAll(".hero-character .speech"));
    if (!hero || reduced || !finePointer) { return; }
'''
new = '''    var hero = document.querySelector(".hero");
    var sketch = document.querySelector(".hero-sketch");
    var character = document.querySelector(".hero-character");
    var art = document.querySelector(".hero-art");
    var speeches = [].slice.call(document.querySelectorAll(".hero-character .speech"));
    if (!hero || reduced || !finePointer) { return; }
'''
if old not in s:
    raise SystemExit('hero variables block not found')
s = s.replace(old, new, 1)

old = '''      // Depth: nothing chases the cursor, everything drifts a few pixels.
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
        s.style.setProperty("--speech-rot", rot + "deg");
        s.style.setProperty("--speech-x", (nx * 5).toFixed(2) + "px");
        s.style.setProperty("--speech-y", (ny * 5).toFixed(2) + "px");
      }
'''
new = '''      /* Hero is the strongest mouse-interaction zone. The previous 3px drift
         was technically working but visually imperceptible. Keep it controlled,
         but make the illustrated character/laptop clearly respond to the cursor.
         current.on makes the return to rest glide rather than snap. */
      var rawNx = clamp((current.x / rect.width - 0.5) * 2, -1, 1);
      var rawNy = clamp((current.y / rect.height - 0.5) * 2, -1, 1);
      var nx = rawNx * current.on;
      var ny = rawNy * current.on;

      if (character) {
        character.style.setProperty("--hero-shell-x", (nx * 3.5).toFixed(2) + "px");
        character.style.setProperty("--hero-shell-y", (ny * 2.5).toFixed(2) + "px");
      }
      if (art) {
        art.style.setProperty("--px", (nx * 12).toFixed(2) + "px");
        art.style.setProperty("--py", (ny * 9).toFixed(2) + "px");
        art.style.setProperty("--hero-tilt", (nx * 0.65).toFixed(3) + "deg");
        art.style.setProperty("--hero-scale", (1 + current.on * 0.006).toFixed(4));
      }
      if (sketch) {
        sketch.style.setProperty("--bx", (nx * -4).toFixed(2) + "px");
        sketch.style.setProperty("--by", (ny * -3).toFixed(2) + "px");
      }
      for (var i = 0; i < speeches.length; i++) {
        var s = speeches[i];
        var rot = s.getAttribute("data-rot") || "0";
        s.style.setProperty("--speech-rot", rot + "deg");
        /* Speech sits in a shallower plane, moving opposite the character. */
        s.style.setProperty("--speech-x", (nx * -8).toFixed(2) + "px");
        s.style.setProperty("--speech-y", (ny * -6).toFixed(2) + "px");
      }
'''
if old not in s:
    raise SystemExit('hero depth block not found')
s = s.replace(old, new, 1)

# ORIGIN: one viewport-ish continuous scroll window. Reading still has tiny staged
# beats so it feels authored, but the visitor does not need separate gestures.
old = '''        /* Keep the original Origin design, but use a shorter viewport window.
           The previous clock left a large black void while valid content was
           still intentionally hidden. */
        var start = sectionTop - vh * .72;
        var end = sectionTop + sectionHeight - vh * .62;
        if (end <= start) { end = start + Math.max(vh * .72, 520); }
        var p = clamp((y - start) / Math.max(end - start, 1), 0, 1);
        /* Reading beat: the Origin copy should be understood in one natural
           scroll gesture, not rationed out line by line. */
        var readingOn = p >= .055;
        reached(eyebrow, readingOn);
        reached(curiosity, readingOn);
        steps.forEach(function (step) { reached(step, readingOn); });
        arrows.forEach(function (arrow) { reached(arrow, readingOn); });
        reached(design, p >= .095);
        reached(body, p >= .135);

        /* The professional journey is the sequential part. The line follows
           scroll continuously in both directions; each role gets its own beat. */
        var line = ease(span(p, .24, .92));
        furthestLine = line;
        story.style.setProperty("--timeline-draw", line.toFixed(4));
        var itemPoints = [.34,.50,.67,.84];
        items.forEach(function (item, i) { reached(item, p >= (itemPoints[i] || .84)); });
        if (p >= .96) { showAll(); }
'''
new = '''        /* ONE CONTINUOUS SCROLL: the whole Origin chapter runs over roughly
           one viewport of travel. Tiny thresholds create a progressive reveal
           inside that same gesture; they are not separate scroll stops. */
        var start = sectionTop - vh * .72;
        var travel = clamp(vh * .92, 640, 920);
        var p = clamp((y - start) / travel, 0, 1);

        reached(eyebrow, p >= .025);
        reached(curiosity, p >= .045);
        var readingPoints = [.070,.105,.140,.175];
        var arrowPoints = [.090,.125,.160];
        steps.forEach(function (step, i) {
          reached(step, p >= (readingPoints[i] || .175));
        });
        arrows.forEach(function (arrow, i) {
          reached(arrow, p >= (arrowPoints[i] || .160));
        });
        reached(design, p >= .205);
        reached(body, p >= .235);

        /* Professional journey: still one-by-one, but all within the same
           continuous scroll sequence rather than one wheel gesture per role. */
        var line = ease(span(p, .285, .94));
        furthestLine = line;
        story.style.setProperty("--timeline-draw", line.toFixed(4));
        var itemPoints = [.375,.525,.675,.825];
        items.forEach(function (item, i) { reached(item, p >= (itemPoints[i] || .825)); });
        if (p >= .96) { showAll(); }
'''
if old not in s:
    raise SystemExit('desktop origin block not found')
s = s.replace(old, new, 1)

# CAREER: make the subtle response actually visible, while keeping it far quieter
# than Hero.
s = s.replace('''      var lx = state.x * 4.2 * state.v;
      var ly = state.y * 3.6 * state.v;
      var bx = state.x * 2.3 * state.v;
      var by = state.y * 2.1 * state.v;
      var dx = state.x * -1.4 * state.v;
      var dy = state.y * -1.2 * state.v;''',
'''      var lx = state.x * 6.5 * state.v;
      var ly = state.y * 5.2 * state.v;
      var bx = state.x * 3.8 * state.v;
      var by = state.y * 3.2 * state.v;
      var dx = state.x * -2.2 * state.v;
      var dy = state.y * -1.8 * state.v;''', 1)
s = s.replace('''            var radius = Math.max(145, Math.min(230, r.height * 1.9));''',
'''            var radius = Math.max(220, Math.min(320, r.height * 3.2));''', 1)

p.write_text(s)

# Motion CSS: compose stronger Hero motion with the existing floating paper animation.
p = Path('motion.css')
c = p.read_text()
old = '''/* Parallax layers — JS writes the offsets, max 5px */
.sp-js .hero-art       { will-change: transform; transform: translate3d(var(--px, 0px), var(--py, 0px), 0); }
.sp-js .hero-character .speech { will-change: transform; }
.sp-js .hero-sketch    { transform: translate3d(var(--bx, 0px), var(--by, 0px), 0); }
'''
new = '''/* Hero mouse depth. The wrapper makes the character visibly responsive;
   the art inside travels further, while speech/sketch live on shallower planes. */
.sp-js .hero-character.is-in {
  translate: var(--hero-shell-x, 0px) var(--hero-shell-y, 0px);
  will-change: translate;
}
.sp-js .hero-art {
  will-change: transform;
  transform: translate3d(var(--px, 0px), var(--py, 0px), 0)
             rotate(var(--hero-tilt, 0deg)) scale(var(--hero-scale, 1));
  transform-origin: center 58%;
}
.sp-js .hero-character .speech { will-change: transform; }
.sp-js .hero-sketch { transform: translate3d(var(--bx, 0px), var(--by, 0px), 0); }

@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  .sp-js .hero-character.is-in { translate: 0 0 !important; }
  .sp-js .hero-art { transform: none !important; }
}
'''
if old not in c:
    raise SystemExit('hero css block not found')
c = c.replace(old, new, 1)
p.write_text(c)

print('Hero + one-scroll Origin refinement applied')
