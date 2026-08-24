from pathlib import Path
import re

# Remove only the artificial footer runway/sticky mechanics. Do not touch the
# footer layout, typography, artwork or any approved design rules.
css_path = Path('motion.css')
css = css_path.read_text()
css, n1 = re.subn(r'(?m)^\s*\.site-footer\s*\{\s*min-height:\s*160vh;\s*\}\s*$',
                  '  .site-footer { min-height: 0; }', css, count=1)
css, n2 = re.subn(r'(?ms)^\s*\.site-footer \.footer-body\s*\{\s*position:\s*sticky;\s*top:\s*72px;\s*\}\s*',
                  '  .site-footer .footer-body {\n    position: relative;\n    top: auto;\n  }\n', css, count=1)
if not (n1 and n2):
    raise SystemExit(f'footer rules not found: min-height={n1}, sticky={n2}')
css_path.write_text(css)

# Tighten only the Origin reveal clock so the existing right-side content is
# not kept invisible across a large empty viewport.
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
new_origin = '''        /* Same Origin design, shorter reveal runway: existing content fills
           the viewport instead of leaving a long black void. */
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
