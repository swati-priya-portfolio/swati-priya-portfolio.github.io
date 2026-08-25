from pathlib import Path

js_path = Path('motion.js')
css_path = Path('motion.css')
js = js_path.read_text()
css = css_path.read_text()

# Mark Origin desktop story as scroll-transform driven.
needle = '    story.classList.add("is-origin-ready");\n'
if 'is-origin-transform' not in js:
    if needle not in js:
        raise SystemExit('missing origin-ready marker')
    js = js.replace(needle, needle + '    story.classList.add("is-origin-transform");\n', 1)

# Replace only the desktop branch inside originStory(). Mobile behaviour stays unchanged.
origin_idx = js.find('  function originStory() {')
if origin_idx < 0:
    raise SystemExit('originStory not found')
desktop_idx = js.find('      if (desktopFlow) {', origin_idx)
if desktop_idx < 0:
    raise SystemExit('desktop origin branch not found')
else_idx = js.find('      } else {', desktop_idx)
if else_idx < 0:
    raise SystemExit('origin desktop else not found')

new_desktop = r'''      if (desktopFlow) {
        /* ONE STORY TRANSFORMATION, not a chain of fades.
           Curiosity begins slightly scattered, the thoughts drift together,
           THEN I DESIGN triggers the final lock, and only then the career line starts. */
        var start = sectionTop - vh * .72;
        var travel = clamp(vh * 1.12, 720, 1040);
        var p = clamp((y - start) / travel, 0, 1);

        var eyebrowP = ease(span(p, .01, .07));
        var curiosityP = ease(span(p, .03, .12));
        var thoughtsIn = ease(span(p, .07, .13));
        var driftP = ease(span(p, .10, .28));
        var snapP = ease(span(p, .28, .36));
        var orderedP = clamp(driftP * .78 + snapP * .22, 0, 1);
        var thenP = ease(span(p, .30, .37));
        var designP = ease(span(p, .40, .50));
        var bodyP = ease(span(p, .48, .56));

        reached(eyebrow, eyebrowP > .001);
        reached(curiosity, curiosityP > .001);
        steps.forEach(function (step) { reached(step, thoughtsIn > .001); });
        arrows.forEach(function (arrow) { reached(arrow, thoughtsIn > .001); });
        reached(design, designP > .001);
        reached(body, bodyP > .001);

        if (eyebrow) {
          eyebrow.style.opacity = eyebrowP.toFixed(3);
          eyebrow.style.transform = 'translateY(' + ((1 - eyebrowP) * 5).toFixed(2) + 'px)';
        }
        if (curiosity) {
          curiosity.style.opacity = curiosityP.toFixed(3);
          curiosity.style.transform = 'translate3d(' + ((1 - curiosityP) * -4).toFixed(2) + 'px,' + ((1 - curiosityP) * 3).toFixed(2) + 'px,0) rotate(' + ((1 - curiosityP) * -.28).toFixed(3) + 'deg)';
        }

        var offsets = [
          { x: -10, y: 7, r: -.45 },
          { x: 9, y: 5, r: .35 },
          { x: -8, y: 6, r: -.30 }
        ];
        var remain = 1 - orderedP;
        for (var si = 0; si < Math.min(3, steps.length); si++) {
          var step = steps[si];
          var o = offsets[si];
          step.style.opacity = thoughtsIn.toFixed(3);
          step.style.transform = 'translate3d(' + (o.x * remain).toFixed(2) + 'px,' + (o.y * remain).toFixed(2) + 'px,0) rotate(' + (o.r * remain).toFixed(3) + 'deg)';
        }
        for (var ai = 0; ai < arrows.length; ai++) {
          var arrowP = thoughtsIn * (.45 + orderedP * .55);
          arrows[ai].style.opacity = arrowP.toFixed(3);
          arrows[ai].style.transform = 'translateY(' + ((1 - orderedP) * 3).toFixed(2) + 'px) scale(' + (.94 + orderedP * .06).toFixed(3) + ')';
        }
        if (steps[3]) {
          steps[3].style.opacity = thenP.toFixed(3);
          steps[3].style.transform = 'translate3d(0,' + ((1 - thenP) * 8).toFixed(2) + 'px,0) scale(' + (.985 + thenP * .015).toFixed(3) + ')';
        }

        if (design) {
          design.style.opacity = designP.toFixed(3);
          design.style.transform = 'translate3d(0,' + ((1 - designP) * 12).toFixed(2) + 'px,0) scale(' + (.985 + designP * .015).toFixed(3) + ')';
        }
        if (body) {
          body.style.opacity = bodyP.toFixed(3);
          body.style.transform = 'translateY(' + ((1 - bodyP) * 7).toFixed(2) + 'px)';
        }
        story.classList.toggle('is-clarity-locked', designP >= .72);

        /* The career begins only after DESIGN FOLLOWED has locked into place.
           All reached companies remain at 100% opacity. */
        var line = ease(span(p, .56, .94));
        furthestLine = line;
        story.style.setProperty('--timeline-draw', line.toFixed(4));
        var itemPoints = [.63, .72, .81, .90];
        items.forEach(function (item, i) { reached(item, p >= (itemPoints[i] || .90)); });
        focusItem(-1);

        if (p >= .985) {
          showAll();
          story.classList.add('is-clarity-locked');
          focusItem(-1);
        }
'''

js = js[:desktop_idx] + new_desktop + js[else_idx:]

marker = '/* ============================================================\n   21. ORIGIN STORY — MESSY THOUGHTS TO CLARITY\n   ============================================================ */'
if marker not in css:
    css += r'''

/* ============================================================
   21. ORIGIN STORY — MESSY THOUGHTS TO CLARITY
   ============================================================ */

/* Desktop Origin is now driven continuously by scroll position. The final
   visual state is unchanged; only how the existing elements reach it changes. */
@media (min-width: 1024px) {
  .sp-js .story-col.is-origin-transform .story-head .eyebrow,
  .sp-js .story-col.is-origin-transform .origin-curiosity,
  .sp-js .story-col.is-origin-transform .origin-step,
  .sp-js .story-col.is-origin-transform .origin-arrow,
  .sp-js .story-col.is-origin-transform .origin-design,
  .sp-js .story-col.is-origin-transform .story-body {
    transition: none !important;
    filter: none !important;
    will-change: transform, opacity;
  }

  /* Do not let the previous reveal system draw DESIGN's marker early. */
  .sp-js .story-col.is-origin-transform:not(.is-clarity-locked) .origin-design .underlined {
    background-size: 0 3px, 0 2px !important;
  }
  .sp-js .story-col.is-origin-transform.is-clarity-locked .origin-design .underlined {
    background-size: 100% 3px, 88% 2px !important;
    transition: background-size 430ms var(--ep) !important;
  }

  /* Career is cumulative: reached roles never dim and no active-stop focus is used. */
  .sp-js .story-col.is-origin-transform .timeline-item.is-reached,
  .sp-js .story-col.is-origin-transform .timeline-item.is-current {
    opacity: 1 !important;
  }
}
'''

js_path.write_text(js)
css_path.write_text(css)
