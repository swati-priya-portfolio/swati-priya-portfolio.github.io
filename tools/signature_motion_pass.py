from pathlib import Path

js_path = Path('motion.js')
css_path = Path('motion.css')
js = js_path.read_text()
css = css_path.read_text()


def rep(text, old, new, label):
    if old not in text:
        raise SystemExit(f'missing patch target: {label}')
    return text.replace(old, new, 1)

# 1) HERO: dynamic spotlight radius based on pointer speed.
js = rep(js,
'''    var target = { x: 0, y: 0, on: 0 };
    var current = { x: 0, y: 0, on: 0 };
    var rect = null;''',
'''    var target = { x: 0, y: 0, on: 0, speed: 0 };
    var current = { x: 0, y: 0, on: 0, speed: 0 };
    var rect = null;
    var lastPointer = { x: 0, y: 0, t: 0 };''',
'hero pointer state')

js = rep(js,
'''    hero.addEventListener("pointerleave", function () {
      hero.classList.remove("is-exploring");
      target.on = 0;
      target.x = 0; target.y = 0;                 // layers glide home
    });
    hero.addEventListener("pointermove", function (e) {
      if (!rect) { measure(); }
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
    }, { passive: true });''',
'''    hero.addEventListener("pointerleave", function () {
      hero.classList.remove("is-exploring");
      target.on = 0;
      target.speed = 0;
      target.x = 0; target.y = 0;                 // layers glide home
    });
    hero.addEventListener("pointermove", function (e) {
      if (!rect) { measure(); }
      var now = performance.now();
      if (lastPointer.t) {
        var dt = Math.max(now - lastPointer.t, 16);
        var ddx = e.clientX - lastPointer.x;
        var ddy = e.clientY - lastPointer.y;
        var pxPerMs = Math.sqrt(ddx * ddx + ddy * ddy) / dt;
        target.speed = clamp(pxPerMs / 1.35, 0, 1);
      }
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;
      lastPointer.t = now;
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
    }, { passive: true });''',
'hero pointer velocity')

js = rep(js,
'''      current.x = lerp(current.x, target.x, EASE);
      current.y = lerp(current.y, target.y, EASE);
      current.on = lerp(current.on, target.on, 0.12);

      if (sketch) {
        sketch.style.setProperty("--sk-x", current.x.toFixed(1) + "px");
        sketch.style.setProperty("--sk-y", current.y.toFixed(1) + "px");
      }''',
'''      current.x = lerp(current.x, target.x, EASE);
      current.y = lerp(current.y, target.y, EASE);
      current.on = lerp(current.on, target.on, 0.12);
      current.speed = lerp(current.speed, target.speed, 0.18);
      target.speed *= 0.88;

      if (sketch) {
        sketch.style.setProperty("--sk-x", current.x.toFixed(1) + "px");
        sketch.style.setProperty("--sk-y", current.y.toFixed(1) + "px");
        /* Slow exploration opens the thinking layer; fast movement tightens it. */
        sketch.style.setProperty("--sk-r", lerp(265, 185, current.speed).toFixed(1) + "px");
      }''',
'hero spotlight radius')

# 2) HERO HEADLINE: COMPLEXITY + CLARITY zoom as whole words; other words keep dancing.
js = rep(js,
'''    var chars = [].slice.call(title.querySelectorAll(".ch"));
    if (!chars.length) { return; }

    var RADIUS = 96;''',
'''    var chars = [].slice.call(title.querySelectorAll(".ch"));
    if (!chars.length) { return; }

    var focusWords = [].slice.call(title.querySelectorAll(".wd")).filter(function (word) {
      var text = word.textContent.replace(/\\s+/g, " ").trim().toUpperCase();
      return text.indexOf("COMPLEXITY") === 0 || text === "CLARITY.";
    });
    focusWords.forEach(function (word) { word.classList.add("hero-focus-word"); });

    var RADIUS = 96;''',
'hero focus word discovery')

js = rep(js,
'''    var boxes = [];
    var dirty = true;

    function measure() {
      var sx = window.scrollX, sy = window.scrollY;
      boxes = chars.map(function (c, i) {
        var r = c.getBoundingClientRect();
        return {
          el: c,
          px: r.left + r.width / 2 + sx,
          py: r.top + r.height / 2 + sy,
          v: 0,
          reaction: reactions[i % reactions.length]
        };
      });
      dirty = false;
    }''',
'''    var boxes = [];
    var focusBoxes = [];
    var dirty = true;

    function measure() {
      var sx = window.scrollX, sy = window.scrollY;
      boxes = chars.map(function (c, i) {
        var r = c.getBoundingClientRect();
        return {
          el: c,
          px: r.left + r.width / 2 + sx,
          py: r.top + r.height / 2 + sy,
          v: 0,
          focus: !!c.closest(".hero-focus-word"),
          reaction: reactions[i % reactions.length]
        };
      });
      focusBoxes = focusWords.map(function (word) {
        var r = word.getBoundingClientRect();
        return { el: word, px: r.left + r.width / 2 + sx, py: r.top + r.height / 2 + sy, v: 0 };
      });
      dirty = false;
    }''',
'hero focus word measure')

js = rep(js,
'''      for (var i = 0; i < boxes.length; i++) {
        var b = boxes[i];
        var cy = b.py - sy;
        if (cy < -160 || cy > window.innerHeight + 160) {''',
'''      for (var i = 0; i < boxes.length; i++) {
        var b = boxes[i];
        if (b.focus) {
          b.el.style.setProperty("--c-s", "1");
          b.el.style.setProperty("--c-y", "0px");
          b.el.style.setProperty("--c-r", "0deg");
          continue;
        }
        var cy = b.py - sy;
        if (cy < -160 || cy > window.innerHeight + 160) {''',
'hero skip focus chars')

js = rep(js,
'''        b.el.style.setProperty("--c-r", (b.reaction.rotate * b.v).toFixed(2) + "deg");
      }
    });
  }''',
'''        b.el.style.setProperty("--c-r", (b.reaction.rotate * b.v).toFixed(2) + "deg");
      }

      /* COMPLEXITY and CLARITY stay typographically stable. They zoom as one
         unit instead of wobbling letter by letter. */
      for (var j = 0; j < focusBoxes.length; j++) {
        var f = focusBoxes[j];
        var fy = f.py - sy;
        var fdx = ptr.x - (f.px - sx);
        var fdy = (ptr.y - fy) * 1.15;
        var fd = Math.sqrt(fdx * fdx + fdy * fdy);
        var ft = clamp(1 - fd / 155, 0, 1);
        ft = ft * ft * (3 - 2 * ft);
        f.v = lerp(f.v, ft, 0.18);
        if (f.v < 0.002) { f.v = 0; }
        f.el.style.setProperty("--focus-s", (1 + 0.075 * f.v).toFixed(3));
      }
    });
  }''',
'hero focus zoom')

# 3) CASE STUDIES: soft overshoot and depth shadow while papers separate.
js = rep(js,
'''      setCard(cards[0], lerp(geo.offsets[0], 0, guardianP), lerp(.985, 1, guardianP), lerp(-.35, 0, guardianP), 1);
      setCard(cards[1], 0, lerp(.965, 1, grayP), lerp(.45, 0, grayP), 1);
      setCard(cards[2], lerp(geo.offsets[2], 0, embibeP), lerp(.95, 1, embibeP), lerp(-.45, 0, embibeP), 1);

      var settled = p > 0.97;''',
'''      var settleArc = Math.sin(span(p, .88, 1) * Math.PI) * 2.4;
      setCard(cards[0], lerp(geo.offsets[0], 0, guardianP), lerp(.985, 1, guardianP), lerp(-.35, 0, guardianP), 1, -settleArc);
      setCard(cards[1], 0, lerp(.965, 1, grayP), lerp(.45, 0, grayP), 1, settleArc * .45);
      setCard(cards[2], lerp(geo.offsets[2], 0, embibeP), lerp(.95, 1, embibeP), lerp(-.45, 0, embibeP), 1, -settleArc * .7);

      var settled = p > 0.97;
      if (!settled) {
        var depth = ease(span(p, .22, .88));
        cards[0].style.boxShadow = "0 " + (12 + depth * 10).toFixed(1) + "px " + (24 + depth * 14).toFixed(1) + "px rgba(0,0,0," + (0.26 + depth * .14).toFixed(3) + ")";
        cards[1].style.boxShadow = "0 " + (8 + depth * 7).toFixed(1) + "px " + (18 + depth * 10).toFixed(1) + "px rgba(0,0,0," + (0.22 + depth * .10).toFixed(3) + ")";
        cards[2].style.boxShadow = "0 " + (7 + depth * 6).toFixed(1) + "px " + (16 + depth * 9).toFixed(1) + "px rgba(0,0,0," + (0.20 + depth * .09).toFixed(3) + ")";
      } else {
        cards.forEach(function (card) { card.style.boxShadow = ""; });
      }''',
'case study weight')

js = rep(js,
'''    function setCard(card, x, scale, rot, opacity) {
      card.style.setProperty("--sx", x.toFixed(2) + "px");
      card.style.setProperty("--ss", scale.toFixed(4));
      card.style.setProperty("--sr", rot.toFixed(2) + "deg");
      card.style.setProperty("--so", opacity.toFixed(3));
    }''',
'''    function setCard(card, x, scale, rot, opacity, y) {
      card.style.setProperty("--sx", x.toFixed(2) + "px");
      card.style.setProperty("--sy", ((y || 0)).toFixed(2) + "px");
      card.style.setProperty("--ss", scale.toFixed(4));
      card.style.setProperty("--sr", rot.toFixed(2) + "deg");
      card.style.setProperty("--so", opacity.toFixed(3));
    }''',
'case study y settle')

# 4) Torn edge velocity response: tiny scroll-direction lag, independent of reveal.
insert_after = '''  function paperTear() {'''
# Insert a separate function after paperTear's closing block, right before BOOKS.
needle = '''  /* ==========================================================
     9. BOOKS — physical objects, picked up one at a time
     ========================================================== */'''
velocity_fn = '''  /* ==========================================================
     8c. TORN EDGE VELOCITY — tiny physical lag from scroll speed
     ========================================================== */
  function tearVelocity() {
    var tears = [].slice.call(document.querySelectorAll(".paper-tear"));
    if (!tears.length || reduced || window.innerWidth < 768) { return; }

    var lastY = window.scrollY;
    var lastT = performance.now();
    var target = 0;
    var current = 0;

    window.addEventListener("scroll", function () {
      var now = performance.now();
      var y = window.scrollY;
      var dt = Math.max(now - lastT, 16);
      var frameVelocity = (y - lastY) / (dt / 16.67);
      target = clamp(frameVelocity * .065, -4, 4);
      lastY = y;
      lastT = now;
    }, { passive: true });

    addJob(function () {
      current = lerp(current, target, .18);
      target *= .78;
      if (Math.abs(current) < .015) { current = 0; }
      for (var i = 0; i < tears.length; i++) {
        tears[i].style.setProperty("--tear-drift", current.toFixed(2) + "px");
      }
    });
  }

'''
if needle not in js:
    raise SystemExit('missing patch target: tear velocity insertion')
js = js.replace(needle, velocity_fn + needle, 1)

# 5) ORIGIN: focus current career stop while line travels.
js = rep(js,
'''    function reached(el, yes) {
      if (el) { el.classList.toggle("is-reached", reduced || !!yes); }
    }

    function draw() {''',
'''    function reached(el, yes) {
      if (el) { el.classList.toggle("is-reached", reduced || !!yes); }
    }

    function focusItem(index) {
      items.forEach(function (item, i) {
        item.classList.toggle("is-current", index >= 0 && i === index && item.classList.contains("is-reached"));
      });
    }

    function draw() {''',
'origin focus helper')

js = rep(js,
'''        var itemPoints = [.30,.40,.50,.60];
        items.forEach(function (item, i) { reached(item, p >= (itemPoints[i] || .60)); });
        if (p >= .96) { showAll(); }''',
'''        var itemPoints = [.30,.40,.50,.60];
        items.forEach(function (item, i) { reached(item, p >= (itemPoints[i] || .60)); });
        var activeIndex = -1;
        itemPoints.forEach(function (point, i) { if (p >= point) { activeIndex = i; } });
        focusItem(activeIndex);
        if (p >= .96) { showAll(); focusItem(items.length - 1); }''',
'origin desktop focus')

js = rep(js,
'''        items.forEach(function (item, i) { reached(item, y >= itemThresholds[i] && mobileLine > 0); });
      }

      if (y + vh >= sectionTop + sectionHeight - 8) { showAll(); }''',
'''        items.forEach(function (item, i) { reached(item, y >= itemThresholds[i] && mobileLine > 0); });
        var mobileActive = -1;
        itemThresholds.forEach(function (point, i) { if (y >= point) { mobileActive = i; } });
        focusItem(mobileActive);
      }

      if (y + vh >= sectionTop + sectionHeight - 8) { showAll(); focusItem(items.length - 1); }''',
'origin mobile focus')

# 6) FOOTER: anticipation hold before settle + stronger YOURS emphasis.
js = rep(js,
'''        var grow = ease(span(p, .10, .44));
        var settle = ease(span(p, .44, .54));
        var peak = lerp(window.innerWidth < 768 ? .84 : .74, 1.06, grow);''',
'''        /* Grow, hold briefly at the peak, then settle. The pause creates anticipation
           without adding another visual element. */
        var grow = ease(span(p, .10, .42));
        var settle = ease(span(p, .50, .60));
        var peak = lerp(window.innerWidth < 768 ? .84 : .74, 1.06, grow);''',
'footer anticipation timing')

js = rep(js,
'''        [[.04,"is-kicker-reached"],[.10,"is-title-reached"],[.44,"is-title-max"],
         [.55,"is-lede-reached"],[.64,"is-actions-reached"],[.72,"is-cover-reached"],
         [.82,"is-social-reached"]].forEach(function (beat) {''',
'''        [[.04,"is-kicker-reached"],[.10,"is-title-reached"],[.42,"is-title-max"],
         [.62,"is-lede-reached"],[.70,"is-actions-reached"],[.77,"is-cover-reached"],
         [.86,"is-social-reached"]].forEach(function (beat) {''',
'footer reveal beats')

js = rep(js,
'''        b.el.style.setProperty("--fc-y", (-7 * b.v).toFixed(2) + "px");
        b.el.style.setProperty("--fc-s", (1 + (yours ? .065 : .05) * b.v).toFixed(3));
        b.el.style.setProperty("--fc-r", (sign * (0.45 + (b.i % 3) * .35) * b.v).toFixed(2) + "deg");''',
'''        b.el.style.setProperty("--fc-y", ((yours ? -9 : -7) * b.v).toFixed(2) + "px");
        b.el.style.setProperty("--fc-s", (1 + (yours ? .085 : .05) * b.v).toFixed(3));
        b.el.style.setProperty("--fc-r", (sign * (0.45 + (b.i % 3) * .35) * b.v).toFixed(2) + "deg");''',
'footer yours emphasis')

# Boot torn edge velocity.
js = rep(js,
'''    try { paperTear(); } catch (e) {}
    try { paperSheets(); } catch (e) {}''',
'''    try { paperTear(); } catch (e) {}
    try { tearVelocity(); } catch (e) {}
    try { paperSheets(); } catch (e) {}''',
'boot tear velocity')

# CSS: headline focus words, torn-edge lag, board wake-up, timeline focus, better button press.
css = rep(css,
'''.sp-js .btn:hover, .sp-js .btn:focus-visible { transform: translateY(-4px); box-shadow: none; }
.sp-js .btn:active { transform: translateY(-1px); }''',
'''.sp-js .btn:hover, .sp-js .btn:focus-visible { transform: translateY(-2px); box-shadow: none; }
.sp-js .btn:active { transform: translateY(0) scale(.98); }''',
'button physics')

append_css = r'''

/* ============================================================
   19. SIGNATURE MOTION PASS — strong moments, no design changes
   ============================================================ */

/* COMPLEXITY and CLARITY zoom as complete ideas. Their letters stay locked,
   while I TURN / INTO retain the playful character-by-character response. */
.sp-js .hero-title .hero-focus-word {
  transform: scale(var(--focus-s, 1)) !important;
  transform-origin: center 68%;
  will-change: transform;
}
.sp-js .hero-title .hero-focus-word .ch {
  transform: none !important;
}

/* Torn edges carry only a few pixels of scroll-velocity lag. Clip-path reveal
   and settle animations still own their original transform independently. */
.sp-js .paper-tear {
  translate: 0 var(--tear-drift, 0px);
}

/* One small object wakes up after each Behind board lands. Nothing loops. */
@keyframes sp-board-object-wake {
  0%   { transform: translateY(6px) scale(.992); }
  72%  { transform: translateY(-1px) scale(1.002); }
  100% { transform: none; }
}
.sp-js .behind .board:nth-child(1).is-beat-reached .board-books {
  animation: sp-board-object-wake 620ms var(--ep) 150ms both;
}
.sp-js .behind .board:nth-child(2).is-beat-reached .player {
  animation: sp-board-object-wake 650ms var(--ep) 170ms both;
}
.sp-js .behind .board:nth-child(3).is-beat-reached .sticky-wrap {
  animation: sp-board-object-wake 620ms var(--ep) 170ms both;
}

/* The career line is a journey: reached rows stay readable, but the current
   stop carries full focus while earlier stops soften slightly. */
.sp-js .story-col.is-origin-ready .timeline-item.is-reached {
  opacity: .76;
  transition: opacity 460ms var(--ep), transform 560ms var(--ep);
}
.sp-js .story-col.is-origin-ready .timeline-item.is-current {
  opacity: 1;
}

@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  .sp-js .hero-title .hero-focus-word { transform: none !important; }
  .sp-js .paper-tear { translate: 0 0 !important; }
  .sp-js .behind .board.is-beat-reached .board-books,
  .sp-js .behind .board.is-beat-reached .player,
  .sp-js .behind .board.is-beat-reached .sticky-wrap { animation: none !important; }
  .sp-js .story-col.is-origin-ready .timeline-item.is-reached { opacity: 1 !important; }
}
'''

if 'SIGNATURE MOTION PASS' not in css:
    css += append_css

js_path.write_text(js)
css_path.write_text(css)
print('patched motion.js and motion.css')
