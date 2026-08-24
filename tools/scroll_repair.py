from pathlib import Path

path = Path('motion.js')
s = path.read_text()

s = s.replace(
    'travel = Math.round(Math.min(window.innerHeight * 1.22, 980));',
    'travel = Math.round(Math.min(window.innerHeight * 1.34, 1040));'
)
s = s.replace(
    'var guardianP = ease(span(p, 0.18, 0.52));\n      var embibeP = ease(span(p, 0.52, 0.82));\n      var settleP = ease(span(p, 0.82, 1));',
    'var guardianP = ease(span(p, 0.18, 0.50));\n      var embibeP = ease(span(p, 0.56, 0.84));\n      var settleP = ease(span(p, 0.84, 1));'
)

old = '''    title.addEventListener("pointerenter", function () { active = true; dirty = true; });
    title.addEventListener("pointerleave", function () { active = false; });
    window.addEventListener("resize", function () { dirty = true; }, { passive: true });'''
new = '''    title.addEventListener("pointerenter", function () { active = true; dirty = true; });
    title.addEventListener("pointerleave", function () { active = false; });
    window.addEventListener("resize", function () { dirty = true; }, { passive: true });
    window.addEventListener("scroll", function () { if (active) { dirty = true; } }, { passive: true });'''
if old in s:
    s = s.replace(old, new, 1)

section_start = s.index('  function sectionStories() {')
section_end = s.index('\n  /* ==========================================================\n     11b. SUBTLE SCROLL PARALLAX', section_start)
section_fn = r'''  function sectionStories() {
    var behind = document.querySelector(".behind");
    var drives = document.querySelector(".drives");
    var footerEl = document.querySelector(".site-footer");
    if (!behind && !drives && !footerEl) { return; }

    var boards = behind ? [].slice.call(behind.querySelectorAll(".board")) : [];
    var reminders = behind ? [].slice.call(behind.querySelectorAll(".reminder")) : [];
    var principles = drives ? [].slice.call(drives.querySelectorAll(".drives-list li")) : [];
    var geometry = {};
    var dirty = true;
    var queued = false;

    if (behind) { behind.classList.add("is-behind-ready"); }
    if (drives) { drives.classList.add("is-drives-ready"); }
    if (footerEl) { footerEl.classList.add("is-footer-story-ready"); }

    function layoutTop(el) {
      var top = 0;
      var node = el;
      while (node) { top += node.offsetTop || 0; node = node.offsetParent; }
      return top;
    }

    function reveal(el) {
      if (el) { el.classList.add("is-beat-reached"); }
    }

    function measure() {
      var vh = window.innerHeight;
      var staged = window.innerWidth >= 1024;
      if (behind) {
        geometry.behind = {
          top: layoutTop(behind),
          height: Math.max(behind.offsetHeight, 1),
          staged: staged,
          board: boards.map(function (board) { return layoutTop(board) - vh * .82; }),
          reminder: reminders.map(function (item) { return layoutTop(item) - vh * .82; })
        };
      }
      if (drives) {
        var track = drives.closest(".drives-track") || drives;
        geometry.drives = {
          top: layoutTop(track),
          height: Math.max(track.offsetHeight, 1),
          staged: staged,
          items: principles.map(function (item) { return layoutTop(item) - vh * .82; })
        };
      }
      if (footerEl) {
        geometry.footer = { top: layoutTop(footerEl), height: Math.max(footerEl.offsetHeight, 1) };
      }
      dirty = false;
      draw();
    }

    function stagedProgress(g, y, vh, enterAt) {
      var start = g.top - vh * enterAt;
      var end = g.top + g.height - vh;
      if (end <= start) { end = start + vh * .72; }
      return clamp((y - start) / Math.max(end - start, 1), 0, 1);
    }

    function finishFooter() {
      if (!footerEl) { return; }
      ["is-kicker-reached", "is-title-reached", "is-title-max", "is-lede-reached",
       "is-actions-reached", "is-cover-reached", "is-social-reached"].forEach(function (name) {
        footerEl.classList.add(name);
      });
      footerEl.style.setProperty("--footer-title-scale", "1");
      footerEl.style.setProperty("--footer-title-lift", "0px");
    }

    function draw() {
      if (dirty) { measure(); return; }
      var y = window.scrollY;
      var vh = window.innerHeight;
      var doc = document.documentElement;
      var nearBottom = y + vh >= doc.scrollHeight - 8;

      if (behind) {
        var bh = geometry.behind;
        if (bh.staged) {
          var bp = stagedProgress(bh, y, vh, .78);
          [[.02,"is-eyebrow-reached"],[.05,"is-line-one-reached"],[.08,"is-accent-reached"],
           [.11,"is-work-reached"],[.14,"is-intro-reached"]].forEach(function (beat) {
            if (reduced || bp >= beat[0]) { behind.classList.add(beat[1]); }
          });
          [.24,.43,.62,.80].forEach(function (point, i) {
            if (reduced || bp >= point) { reveal(boards[i]); }
          });
          [.90,.95,.985].forEach(function (point, i) {
            if (reduced || bp >= point) { reveal(reminders[i]); }
          });
        } else {
          var introStart = bh.top - vh * .78;
          [[0,"is-eyebrow-reached"],[28,"is-line-one-reached"],[56,"is-accent-reached"],
           [84,"is-work-reached"],[112,"is-intro-reached"]].forEach(function (beat) {
            if (reduced || y >= introStart + beat[0]) { behind.classList.add(beat[1]); }
          });
          boards.forEach(function (board, i) {
            if (reduced || y >= bh.board[i]) { reveal(board); }
          });
          reminders.forEach(function (item, i) {
            if (reduced || y >= bh.reminder[i]) { reveal(item); }
          });
        }
      }

      if (drives) {
        var dg = geometry.drives;
        if (dg.staged) {
          var dStart = dg.top - vh * .76;
          var dp = clamp((y - dStart) / Math.max(vh * .62, 420), 0, 1);
          if (reduced || dp >= .04) { drives.classList.add("is-border-reached"); }
          if (reduced || dp >= .14) { drives.classList.add("is-title-reached"); }
          [.30,.48,.66,.84].forEach(function (point, i) {
            if (reduced || dp >= point) { reveal(principles[i]); }
          });
        } else {
          if (reduced || y >= dg.top - vh * .79) { drives.classList.add("is-border-reached"); }
          if (reduced || y >= dg.top - vh * .70) { drives.classList.add("is-title-reached"); }
          principles.forEach(function (item, i) {
            if (reduced || y >= dg.items[i]) { reveal(item); }
          });
        }
      }

      if (footerEl) {
        var fg = geometry.footer;
        var footerStaged = window.innerWidth >= 1024 && fg.height > vh * 1.05;
        var p;
        if (reduced) {
          p = 1;
        } else if (footerStaged) {
          p = stagedProgress(fg, y, vh, .82);
        } else {
          var fStart = fg.top - vh * .82;
          p = clamp((y - fStart) / Math.max(vh * .90, 1), 0, 1);
        }
        if (nearBottom) { p = 1; }

        var grow = ease(span(p, .10, .44));
        var settle = ease(span(p, .44, .54));
        var peak = lerp(window.innerWidth < 768 ? .84 : .74, 1.06, grow);
        footerEl.style.setProperty("--footer-title-scale", (reduced ? 1 : lerp(peak, 1, settle)).toFixed(4));
        footerEl.style.setProperty("--footer-title-lift", (reduced ? 0 : lerp(12, 0, grow)).toFixed(2) + "px");

        [[.04,"is-kicker-reached"],[.10,"is-title-reached"],[.44,"is-title-max"],
         [.55,"is-lede-reached"],[.64,"is-actions-reached"],[.72,"is-cover-reached"],
         [.82,"is-social-reached"]].forEach(function (beat) {
          if (reduced || p >= beat[0]) { footerEl.classList.add(beat[1]); }
        });
        if (p >= .985 || nearBottom) { finishFooter(); }
      }
    }

    function schedule() {
      if (queued) { return; }
      queued = true;
      requestAnimationFrame(function () { queued = false; draw(); });
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", function () { dirty = true; schedule(); }, { passive: true });
    window.addEventListener("load", function () { dirty = true; schedule(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { dirty = true; schedule(); });
    }
    if ("MutationObserver" in window) {
      [].slice.call(document.querySelectorAll(".paper-sheet")).forEach(function (sheet) {
        var settled = sheet.classList.contains("is-sheet-settled");
        new MutationObserver(function () {
          var next = sheet.classList.contains("is-sheet-settled");
          if (next !== settled) { settled = next; dirty = true; schedule(); }
        }).observe(sheet, { attributes: true, attributeFilter: ["class"] });
      });
    }
    measure();
  }
'''
s = s[:section_start] + section_fn + s[section_end:]

origin_start = s.index('  function originStory() {')
origin_end = s.index('\n  /* ==========================================================\n     12. EASTER EGGS', origin_start)
origin_fn = r'''  function originStory() {
    var section = document.querySelector(".about");
    var story = section && section.querySelector(".story-col");
    if (!section || !story) { return; }

    var steps = [].slice.call(story.querySelectorAll(".origin-step"));
    var arrows = [].slice.call(story.querySelectorAll(".origin-arrow"));
    var eyebrow = story.querySelector(".eyebrow");
    var curiosity = story.querySelector(".origin-curiosity");
    var bubble = story.querySelector(".thought-bubble");
    var design = story.querySelector(".origin-design");
    var body = story.querySelector(".story-body");
    var timeline = story.querySelector(".timeline");
    var items = [].slice.call(story.querySelectorAll(".timeline-item"));

    function showAll() {
      [eyebrow, curiosity, design, body].concat(steps, arrows, items).forEach(function (el) {
        if (el) { el.classList.add("is-reached"); }
      });
      story.style.setProperty("--timeline-draw", "1");
    }

    if (reduced) { showAll(); return; }
    story.classList.add("is-origin-ready");

    var sectionTop = 0;
    var sectionHeight = 1;
    var desktopFlow = false;
    var eyebrowThreshold = 0;
    var curiosityThreshold = 0;
    var stepThresholds = [];
    var designThreshold = 0;
    var bodyThreshold = 0;
    var itemThresholds = [];
    var lineStart = 0;
    var lineLength = 1;
    var furthestLine = 0;

    function layoutTop(el) {
      var top = 0;
      var node = el;
      while (node) { top += node.offsetTop || 0; node = node.offsetParent; }
      return top;
    }
    function pageTop(el) { return layoutTop(el); }

    function measure() {
      var vh = window.innerHeight;
      desktopFlow = window.innerWidth >= 1024;
      sectionTop = layoutTop(section);
      sectionHeight = Math.max(section.offsetHeight, 1);

      var gap = clamp(vh * .085, 54, 76);
      var bubbleTop = pageTop(bubble || story);
      var firstStep = bubbleTop - vh * .72;
      eyebrowThreshold = pageTop(story) - vh * .78;
      curiosityThreshold = eyebrowThreshold + gap * .72;
      stepThresholds = steps.map(function (_, i) {
        return Math.max(firstStep + gap * i, curiosityThreshold + gap * (i + 1));
      });
      designThreshold = (stepThresholds[stepThresholds.length - 1] || firstStep) + gap * .95;
      bodyThreshold = Math.max(pageTop(body) - vh * .72, designThreshold + gap * .85);

      var timelineTop = pageTop(timeline);
      lineStart = timelineTop + 40;
      lineLength = Math.max((timeline ? timeline.offsetHeight : 1) - 80, 1);
      itemThresholds = items.map(function (item, i) {
        var marker = pageTop(item) + item.offsetHeight * .5 - vh * .68;
        return Math.max(marker, bodyThreshold + gap * .9 + i * gap * .55);
      });
      draw();
    }

    function reached(el, yes) {
      if (el && yes && !el.classList.contains("is-reached")) { el.classList.add("is-reached"); }
    }

    function draw() {
      var y = window.scrollY;
      var vh = window.innerHeight;
      if (desktopFlow) {
        var start = sectionTop - vh * .78;
        var end = sectionTop + sectionHeight - vh * .18;
        var p = clamp((y - start) / Math.max(end - start, 1), 0, 1);
        reached(eyebrow, p >= .04);
        reached(curiosity, p >= .09);
        var points = [.18,.27,.36,.45];
        steps.forEach(function (step, i) { reached(step, p >= (points[i] || .45)); });
        arrows.forEach(function (arrow, i) { reached(arrow, p >= (points[i + 1] || .45)); });
        reached(design, p >= .52);
        reached(body, p >= .59);

        var line = ease(span(p, .60, .96));
        furthestLine = Math.max(furthestLine, line);
        story.style.setProperty("--timeline-draw", furthestLine.toFixed(4));
        var itemPoints = [.68,.77,.86,.94];
        items.forEach(function (item, i) { reached(item, p >= (itemPoints[i] || .94)); });
        if (p >= .985) { showAll(); }
      } else {
        reached(eyebrow, y >= eyebrowThreshold);
        reached(curiosity, y >= curiosityThreshold);
        steps.forEach(function (step, i) { reached(step, y >= stepThresholds[i]); });
        arrows.forEach(function (arrow, i) { reached(arrow, y >= (stepThresholds[i + 1] || designThreshold)); });
        reached(design, y >= designThreshold);
        reached(body, y >= bodyThreshold);

        var playhead = y + vh * .68;
        var lineRaw = clamp((playhead - lineStart) / lineLength, 0, 1);
        var mobileLine = lineRaw * lineRaw * (3 - 2 * lineRaw);
        furthestLine = Math.max(furthestLine, mobileLine);
        story.style.setProperty("--timeline-draw", furthestLine.toFixed(4));
        items.forEach(function (item, i) { reached(item, y >= itemThresholds[i] && furthestLine > 0); });
      }

      if (y + vh >= sectionTop + sectionHeight - 8) { showAll(); }
    }

    var queued = false;
    function schedule() {
      if (queued) { return; }
      queued = true;
      requestAnimationFrame(function () { queued = false; draw(); });
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("load", measure);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(measure); }
    measure();
  }
'''
s = s[:origin_start] + origin_fn + s[origin_end:]
path.write_text(s)
