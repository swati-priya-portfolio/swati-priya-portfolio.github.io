from pathlib import Path

# Keep the approved layout untouched. This patch changes motion.js + motion.css only.
js_path = Path('motion.js')
js = js_path.read_text()

# 1) Hero: make the existing pointer depth a little more visible, not dramatic.
repls = {
    '(nx * 3.5).toFixed(2)': '(nx * 5.5).toFixed(2)',
    '(ny * 2.5).toFixed(2)': '(ny * 4.0).toFixed(2)',
    '(nx * 12).toFixed(2)': '(nx * 18).toFixed(2)',
    '(ny * 9).toFixed(2)': '(ny * 13).toFixed(2)',
    '(nx * 0.65).toFixed(3)': '(nx * 1.0).toFixed(3)',
    '(1 + current.on * 0.006).toFixed(4)': '(1 + current.on * 0.009).toFixed(4)',
    '(nx * -4).toFixed(2)': '(nx * -6).toFixed(2)',
    '(ny * -3).toFixed(2)': '(ny * -4.5).toFixed(2)',
    '(nx * -8).toFixed(2)': '(nx * -10).toFixed(2)',
    '(ny * -6).toFixed(2)': '(ny * -8).toFixed(2)',
}
for old, new in repls.items():
    if old not in js:
        raise SystemExit(f'Hero token not found: {old}')
    js = js.replace(old, new, 1)

# 2) Origin: one scroll trigger starts the whole reading sequence. CSS handles
# the internal timed stagger, so each thought does NOT require another scroll.
old_desktop = '''        reached(eyebrow, p >= .025);\n        reached(curiosity, p >= .045);\n        var readingPoints = [.070,.105,.140,.175];\n        var arrowPoints = [.090,.125,.160];\n        steps.forEach(function (step, i) {\n          reached(step, p >= (readingPoints[i] || .175));\n        });\n        arrows.forEach(function (arrow, i) {\n          reached(arrow, p >= (arrowPoints[i] || .160));\n        });\n        reached(design, p >= .205);\n        reached(body, p >= .235);\n\n        /* Professional journey: still one-by-one, but all within the same\n           continuous scroll sequence rather than one wheel gesture per role. */\n        var line = ease(span(p, .285, .94));\n        furthestLine = line;\n        story.style.setProperty("--timeline-draw", line.toFixed(4));\n        var itemPoints = [.375,.525,.675,.825];\n        items.forEach(function (item, i) { reached(item, p >= (itemPoints[i] || .825)); });'''
new_desktop = '''        /* One scroll trigger starts the reading choreography. The individual\n           thoughts then stagger automatically in CSS: WHY -> LISTEN -> OBSERVE\n           -> THEN I DESIGN -> DESIGN FOLLOWED -> body. No extra wheel gestures. */\n        var readingOn = p >= .045;\n        reached(eyebrow, readingOn);\n        reached(curiosity, readingOn);\n        steps.forEach(function (step) { reached(step, readingOn); });\n        arrows.forEach(function (arrow) { reached(arrow, readingOn); });\n        reached(design, readingOn);\n        reached(body, readingOn);\n\n        /* Career still arrives in order, but the four roles are compressed into\n           one continuous scroll passage instead of one scroll per company. */\n        var line = ease(span(p, .20, .68));\n        furthestLine = line;\n        story.style.setProperty("--timeline-draw", line.toFixed(4));\n        var itemPoints = [.30,.40,.50,.60];\n        items.forEach(function (item, i) { reached(item, p >= (itemPoints[i] || .60)); });'''
if old_desktop not in js:
    raise SystemExit('Origin desktop block not found')
js = js.replace(old_desktop, new_desktop, 1)

old_mobile = '''        reached(eyebrow, readingOn);\n        reached(curiosity, readingOn);\n        steps.forEach(function (step) { reached(step, readingOn); });\n        arrows.forEach(function (arrow) { reached(arrow, readingOn); });\n        reached(design, y >= readingThreshold + 26);\n        reached(body, y >= readingThreshold + 58);'''
new_mobile = '''        reached(eyebrow, readingOn);\n        reached(curiosity, readingOn);\n        steps.forEach(function (step) { reached(step, readingOn); });\n        arrows.forEach(function (arrow) { reached(arrow, readingOn); });\n        reached(design, readingOn);\n        reached(body, readingOn);'''
if old_mobile not in js:
    raise SystemExit('Origin mobile reading block not found')
js = js.replace(old_mobile, new_mobile, 1)

# 3) Add mouse depth to the existing About portrait cluster and Footer cover.
anchor = '''  /* ==========================================================\n     12. EASTER EGGS — marginalia for people who wander\n     ========================================================== */'''
insert = r'''  /* ==========================================================
     11d. ABOUT POINTER DEPTH — the "That's me!" cluster responds to mouse
     Existing scroll parallax remains; this only adds a small x/y depth layer.
     ========================================================== */
  function aboutPointerDepth() {
    var section = document.querySelector(".about");
    if (!section || reduced || !finePointer) { return; }

    var targets = [
      { el: section.querySelector(".thats-me"), x: 11, y: 8 },
      { el: section.querySelector(".thats-me-arrow"), x: 8, y: 6 },
      { el: section.querySelector(".polaroid"), x: 6, y: 5 },
      { el: section.querySelector(".sticky-note"), x: -8, y: -6 },
      { el: section.querySelector(".tools"), x: 4, y: 3 }
    ].filter(function (t) { return !!t.el; });
    if (!targets.length) { return; }

    var active = false;
    var rect = null;
    var tx = 0, ty = 0, cx = 0, cy = 0;

    function measure() { rect = section.getBoundingClientRect(); }
    section.addEventListener("pointerenter", function () { active = true; measure(); });
    section.addEventListener("pointerleave", function () { active = false; tx = 0; ty = 0; });
    section.addEventListener("pointermove", function (e) {
      if (!rect) { measure(); }
      tx = clamp(((e.clientX - rect.left) / Math.max(rect.width, 1) - .5) * 2, -1, 1);
      ty = clamp(((e.clientY - rect.top) / Math.max(rect.height, 1) - .5) * 2, -1, 1);
    }, { passive: true });
    window.addEventListener("resize", function () { rect = null; }, { passive: true });
    window.addEventListener("scroll", function () { rect = null; }, { passive: true });

    addJob(function () {
      var gx = active ? tx : 0;
      var gy = active ? ty : 0;
      cx = lerp(cx, gx, .13);
      cy = lerp(cy, gy, .13);
      targets.forEach(function (t) {
        t.el.style.setProperty("--about-x", (cx * t.x).toFixed(2) + "px");
        t.el.style.setProperty("--about-y", (cy * t.y).toFixed(2) + "px");
      });
    });
  }

  /* ==========================================================
     11e. FOOTER POINTER DEPTH — headline still dances like Hero; the existing
     cover gets a quieter physical response so the final page also feels alive.
     ========================================================== */
  function footerPointerDepth() {
    var foot = document.querySelector(".site-footer");
    var cover = foot && foot.querySelector(".footer-cover");
    if (!foot || !cover || reduced || !finePointer) { return; }

    var card = cover.querySelector(".cover-card");
    var caption = cover.querySelector(".cover-caption");
    var water = cover.querySelector(".footer-water");
    var active = false;
    var rect = null;
    var tx = 0, ty = 0, cx = 0, cy = 0;

    function measure() { rect = cover.getBoundingClientRect(); }
    cover.addEventListener("pointerenter", function () { active = true; measure(); });
    cover.addEventListener("pointerleave", function () { active = false; tx = 0; ty = 0; });
    cover.addEventListener("pointermove", function (e) {
      if (!rect) { measure(); }
      tx = clamp(((e.clientX - rect.left) / Math.max(rect.width, 1) - .5) * 2, -1, 1);
      ty = clamp(((e.clientY - rect.top) / Math.max(rect.height, 1) - .5) * 2, -1, 1);
    }, { passive: true });
    window.addEventListener("resize", function () { rect = null; }, { passive: true });
    window.addEventListener("scroll", function () { rect = null; }, { passive: true });

    addJob(function () {
      var gx = active ? tx : 0;
      var gy = active ? ty : 0;
      cx = lerp(cx, gx, .14);
      cy = lerp(cy, gy, .14);
      if (card) {
        card.style.setProperty("--footer-depth-x", (cx * 10).toFixed(2) + "px");
        card.style.setProperty("--footer-depth-y", (cy * 7).toFixed(2) + "px");
      }
      if (caption) {
        caption.style.setProperty("--footer-depth-x", (cx * -4).toFixed(2) + "px");
        caption.style.setProperty("--footer-depth-y", (cy * -3).toFixed(2) + "px");
      }
      if (water) {
        water.style.setProperty("--footer-depth-x", (cx * 5).toFixed(2) + "px");
        water.style.setProperty("--footer-depth-y", (cy * 4).toFixed(2) + "px");
      }
    });
  }

'''
if anchor not in js:
    raise SystemExit('Pointer-depth insertion anchor not found')
js = js.replace(anchor, insert + anchor, 1)

# Boot both new pointer-depth systems. No HTML/layout changes.
old_boot = '''    try { originStory(); } catch (e) {}\n    try { careerDepth(); } catch (e) {}\n    try { scrollParallax(); } catch (e) {}\n    try { footer(); } catch (e) {}'''
new_boot = '''    try { originStory(); } catch (e) {}\n    try { careerDepth(); } catch (e) {}\n    try { aboutPointerDepth(); } catch (e) {}\n    try { scrollParallax(); } catch (e) {}\n    try { footer(); } catch (e) {}\n    try { footerPointerDepth(); } catch (e) {}'''
if old_boot not in js:
    raise SystemExit('Boot block not found')
js = js.replace(old_boot, new_boot, 1)

js_path.write_text(js)

# --- CSS motion tuning ---
css_path = Path('motion.css')
css = css_path.read_text()

# Compose About mouse depth with the existing reversible scroll parallax.
about_css = r'''
/* About mouse depth composes with data-parallax instead of replacing it. */
.sp-js .about [data-parallax] {
  translate: var(--about-x, 0px) calc(var(--parallax-y, 0px) + var(--about-y, 0px));
}
@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  .sp-js .about [data-parallax] { --about-x: 0px !important; --about-y: 0px !important; }
}
'''
marker = '/* Hand-drawn squiggles draw themselves in when the section arrives */'
if marker not in css:
    raise SystemExit('About CSS marker not found')
css = css.replace(marker, about_css + '\n' + marker, 1)

# Remove company-name underline/drawn stroke while keeping footer-social strokes.
remove_company_underline = r'''
/* Career company names stay clean: no hover underline / marker stroke. */
.sp-js .tl-role a { text-decoration: none !important; }
.sp-js .tl-role a::after { content: none !important; display: none !important; }
'''
marker2 = '/* ============================================================\n   13. FOOTER — the last surprise'
if marker2 not in css:
    raise SystemExit('Footer marker not found')
css = css.replace(marker2, remove_company_underline + '\n' + marker2, 1)

# Automatic stagger for Origin reading: one scroll threshold, timed internal motion.
origin_stagger = r'''
/* One scroll event starts the Origin reading beat; these delays make the
   existing lines arrive automatically one-by-one without extra scrolling. */
.sp-js .story-col.is-origin-ready .story-head .eyebrow.is-reached { transition-delay: 0ms; }
.sp-js .story-col.is-origin-ready .origin-curiosity.is-reached { transition-delay: 60ms; }
.sp-js .story-col.is-origin-ready .origin-step:nth-of-type(1).is-reached { transition-delay: 150ms; }
.sp-js .story-col.is-origin-ready .origin-arrow:nth-of-type(1).is-reached { transition-delay: 235ms; }
.sp-js .story-col.is-origin-ready .origin-step:nth-of-type(2).is-reached { transition-delay: 320ms; }
.sp-js .story-col.is-origin-ready .origin-arrow:nth-of-type(2).is-reached { transition-delay: 405ms; }
.sp-js .story-col.is-origin-ready .origin-step:nth-of-type(3).is-reached { transition-delay: 490ms; }
.sp-js .story-col.is-origin-ready .origin-arrow:nth-of-type(3).is-reached { transition-delay: 575ms; }
.sp-js .story-col.is-origin-ready .origin-step:nth-of-type(4).is-reached { transition-delay: 660ms; }
.sp-js .story-col.is-origin-ready .origin-design.is-reached { transition-delay: 790ms; }
.sp-js .story-col.is-origin-ready .story-body.is-reached { transition-delay: 920ms; }
'''
origin_marker = '.sp-js .story-col.is-origin-ready .origin-design .underlined {'
if origin_marker not in css:
    raise SystemExit('Origin stagger marker not found')
css = css.replace(origin_marker, origin_stagger + '\n' + origin_marker, 1)

# Company logos gently drift after they are revealed; autonomous, not scroll-driven.
career_idle = r'''
/* Company icons breathe very slowly after reveal. This is autonomous motion,
   not tied to scrolling, and stays intentionally tiny. */
@keyframes sp-career-logo-drift {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  38% { transform: translateY(-2.5px) rotate(-0.7deg); }
  70% { transform: translateY(1px) rotate(0.55deg); }
}
.sp-js .timeline-item.is-reached .tl-logo img {
  animation: sp-career-logo-drift 5.2s ease-in-out infinite;
  transform-origin: center center;
}
.sp-js .timeline-item:nth-child(2).is-reached .tl-logo img { animation-delay: -1.25s; animation-duration: 5.8s; }
.sp-js .timeline-item:nth-child(3).is-reached .tl-logo img { animation-delay: -2.4s; animation-duration: 6.2s; }
.sp-js .timeline-item:nth-child(4).is-reached .tl-logo img { animation-delay: -3.1s; animation-duration: 5.6s; }
'''
career_marker = '/* Hand-drawn squiggles draw themselves in when the section arrives */'
css = css.replace(career_marker, career_idle + '\n' + career_marker, 1)

# What Drives Me: text itself moves on hover, after it has revealed.
drives_hover = r'''
/* What Drives Me stays a calm strip, but its copy responds when explored. */
@media (pointer: fine) {
  .sp-js .drives.is-drives-ready .drives-list li.is-beat-reached:hover p {
    transition-delay: 0ms;
    transform: translateY(-5px) scale(1.025);
  }
  .sp-js .drives.is-drives-ready .drives-list li:nth-child(1).is-beat-reached:hover p { transform: translate(-2px, -5px) rotate(-.45deg) scale(1.025); }
  .sp-js .drives.is-drives-ready .drives-list li:nth-child(2).is-beat-reached:hover p { transform: translate(2px, -5px) rotate(.35deg) scale(1.025); }
  .sp-js .drives.is-drives-ready .drives-list li:nth-child(3).is-beat-reached:hover p { transform: translate(-1px, -5px) rotate(-.3deg) scale(1.025); }
  .sp-js .drives.is-drives-ready .drives-list li:nth-child(4).is-beat-reached:hover p { transform: translate(2px, -5px) rotate(.45deg) scale(1.025); }
  .sp-js .drives.is-drives-ready.is-title-reached .drives-title:hover h3 { transform: translateY(-2px) rotate(-.25deg); }
  .sp-js .drives.is-drives-ready .drives-title h3 { transition: transform 320ms var(--ep); }
}
'''
drives_marker = '/* Final chapter: scale the complete title'
if drives_marker not in css:
    raise SystemExit('Drives hover marker not found')
css = css.replace(drives_marker, drives_hover + '\n' + drives_marker, 1)

# Footer cover depth uses individual translate, so hover transform still works.
footer_depth = r'''
/* Footer cover gets a quieter mouse-depth response beneath the dancing title. */
.sp-js .footer-cover .cover-card,
.sp-js .footer-cover .cover-caption,
.sp-js .footer-cover .footer-water {
  translate: var(--footer-depth-x, 0px) var(--footer-depth-y, 0px);
  will-change: translate;
}
@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  .sp-js .footer-cover .cover-card,
  .sp-js .footer-cover .cover-caption,
  .sp-js .footer-cover .footer-water { translate: 0 0 !important; animation: none !important; }
  .sp-js .timeline-item .tl-logo img { animation: none !important; }
}
'''
footer_css_marker = '/* The cover card peeks over the bubble */'
if footer_css_marker not in css:
    raise SystemExit('Footer depth marker not found')
css = css.replace(footer_css_marker, footer_depth + '\n' + footer_css_marker, 1)

css_path.write_text(css)
print('Final motion tuning applied without layout changes')
