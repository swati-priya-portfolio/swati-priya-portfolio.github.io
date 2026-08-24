from pathlib import Path

# Remove the artificial footer runway. The footer should animate while it
# naturally enters the viewport, then end when its real content ends.
css_path = Path('motion.css')
css = css_path.read_text()
old_css = '''@media (min-width: 1024px) {
  .behind { min-height: 155vh; }
  .behind-stage {
    position: sticky;
    top: 88px;
    min-height: 630px;
  }

  .site-footer { min-height: 160vh; }
  .site-footer .footer-body {
    position: sticky;
    top: 72px;
  }
}'''
new_css = '''@media (min-width: 1024px) {
  .behind { min-height: 155vh; }
  .behind-stage {
    position: sticky;
    top: 88px;
    min-height: 630px;
  }

  /* Footer keeps its approved layout but no longer manufactures an extra
     160vh scroll tail. Its motion runs while the real footer enters. */
  .site-footer { min-height: 0; }
  .site-footer .footer-body {
    position: relative;
    top: auto;
  }
}'''
if old_css not in css:
    raise SystemExit('footer runway block not found')
css = css.replace(old_css, new_css, 1)
css_path.write_text(css)

# Tighten the Origin story clock so the right side does not sit empty while
# existing content is still hidden. No markup, layout or design is changed.
js_path = Path('motion.js')
js = js_path.read_text()
old_origin = '''        var start = sectionTop - vh * .78;
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
        if (p >= .985) { showAll(); }'''
new_origin = '''        /* Keep the original Origin design, but use a shorter viewport window.
           The previous clock left a large black void while valid content was
           still intentionally hidden. */
        var start = sectionTop - vh * .72;
        var end = sectionTop + sectionHeight - vh * .62;
        if (end <= start) { end = start + Math.max(vh * .72, 520); }
        var p = clamp((y - start) / Math.max(end - start, 1), 0, 1);
        reached(eyebrow, p >= .03);
        reached(curiosity, p >= .07);
        var points = [.14,.22,.30,.38];
        steps.forEach(function (step, i) { reached(step, p >= (points[i] || .38)); });
        arrows.forEach(function (arrow, i) { reached(arrow, p >= (points[i + 1] || .38)); });
        reached(design, p >= .44);
        reached(body, p >= .50);

        var line = ease(span(p, .52, .91));
        furthestLine = Math.max(furthestLine, line);
        story.style.setProperty("--timeline-draw", furthestLine.toFixed(4));
        var itemPoints = [.60,.70,.80,.89];
        items.forEach(function (item, i) { reached(item, p >= (itemPoints[i] || .89)); });
        if (p >= .95) { showAll(); }'''
if old_origin not in js:
    raise SystemExit('origin clock block not found')
js = js.replace(old_origin, new_origin, 1)
js_path.write_text(js)
