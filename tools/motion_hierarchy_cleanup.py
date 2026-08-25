from pathlib import Path

js_path = Path('motion.js')
css_path = Path('motion.css')
js = js_path.read_text()
css = css_path.read_text()


def rep(text, old, new, label):
    if old not in text:
        raise SystemExit(f'missing patch target: {label}')
    return text.replace(old, new, 1)

# --- HERO: remove ambient float so mouse motion is the hero interaction. ---
css = rep(
    css,
    '.sp-js .hero-art { animation: sp-paper-float 6.5s ease-in-out infinite; }',
    '/* The Hero cutout no longer floats by itself. Pointer + scroll depth own the motion,\n   so the interaction reads as intentional rather than permanently animated. */\n.sp-js .hero-art { animation: none; }',
    'hero idle float'
)

# --- PICK AN EPISODE: stronger anticipation + physical stacked-paper spread. ---
js = rep(
    js,
    'travel = Math.round(Math.min(window.innerHeight * 1.34, 1040));',
    'travel = Math.round(Math.min(window.innerHeight * 1.45, 1120));',
    'case travel'
)
js = rep(
    js,
    '''      var guardianP = ease(span(p, 0.18, 0.50));
      var embibeP = ease(span(p, 0.56, 0.84));
      var settleP = ease(span(p, 0.84, 1));
      grid.style.transform = "scale(" + lerp(geo.fit, 1, settleP).toFixed(4) + ")";

      setCard(cards[0], lerp(geo.offsets[0], 0, guardianP), lerp(.97, 1, guardianP), 0, 1);
      setCard(cards[1], 0, 1, 0, 1);
      setCard(cards[2], lerp(geo.offsets[2], 0, embibeP), lerp(.97, 1, embibeP), 0, 1);''',
    '''      // A longer hold makes the single-issue opening register before the stack spreads.
      // The rear issues are slightly compressed/rotated while hidden, like real paper sheets.
      var guardianP = ease(span(p, 0.22, 0.54));
      var grayP = ease(span(p, 0.26, 0.54));
      var embibeP = ease(span(p, 0.60, 0.88));
      var settleP = ease(span(p, 0.88, 1));
      grid.style.transform = "scale(" + lerp(geo.fit, 1, settleP).toFixed(4) + ")";

      setCard(cards[0], lerp(geo.offsets[0], 0, guardianP), lerp(.985, 1, guardianP), lerp(-.35, 0, guardianP), 1);
      setCard(cards[1], 0, lerp(.965, 1, grayP), lerp(.45, 0, grayP), 1);
      setCard(cards[2], lerp(geo.offsets[2], 0, embibeP), lerp(.95, 1, embibeP), lerp(-.45, 0, embibeP), 1);''',
    'case physical spread'
)

# --- Dedicated stories must not also be handled by generic reveal. ---
js = rep(
    js,
    'return !el.matches(".behind .board, .behind .reminder, .drives, .footer-story, .footer-cover");',
    'return !el.matches(".behind .board, .behind .reminder, .drives, .footer-story, .footer-cover") && !el.closest(".story-col");',
    'generic reveal ownership'
)

# --- CAREER: no whole-row jump, no logo hover spin; pointer depth alone owns exploration. ---
css = rep(css, '.sp-js .timeline-item:hover { transform: translateX(5px); }', '.sp-js .timeline-item:hover { transform: none; }', 'career row hover')
css = rep(css, '.sp-js .timeline-item:hover .tl-logo { transform: scale(1.06) rotate(-2deg); }', '.sp-js .timeline-item:hover .tl-logo { transform: none; }', 'career logo hover')

# Remove autonomous logo float entirely.
start = css.find('/* Company icons breathe very slowly after reveal.')
end = css.find('/* Hand-drawn squiggles draw themselves in when the section arrives */', start)
if start == -1 or end == -1:
    raise SystemExit('missing patch target: career idle logo block')
css = css[:start] + '/* Company logos stay still at rest. Their only movement is subtle pointer depth. */\n\n' + css[end:]

# Reduce career pointer amplitude and make the response wider/slower.
js = rep(js, 'var lx = state.x * 6.5 * state.v;\n      var ly = state.y * 5.2 * state.v;\n      var bx = state.x * 3.8 * state.v;\n      var by = state.y * 3.2 * state.v;\n      var dx = state.x * -2.2 * state.v;\n      var dy = state.y * -1.8 * state.v;',
'''var lx = state.x * 5.0 * state.v;
      var ly = state.y * 4.0 * state.v;
      var bx = state.x * 2.6 * state.v;
      var by = state.y * 2.2 * state.v;
      var dx = state.x * -1.4 * state.v;
      var dy = state.y * -1.2 * state.v;''', 'career depth amplitude')
js = rep(js, 'var radius = Math.max(220, Math.min(320, r.height * 3.2));', 'var radius = Math.max(280, Math.min(380, r.height * 4.0));', 'career depth radius')
js = rep(js, 'state.v = lerp(state.v, targetV, active ? 0.16 : 0.12);\n        state.x = lerp(state.x, targetX, 0.16);\n        state.y = lerp(state.y, targetY, 0.16);',
'''state.v = lerp(state.v, targetV, active ? 0.12 : 0.10);
        state.x = lerp(state.x, targetX, 0.12);
        state.y = lerp(state.y, targetY, 0.12);''', 'career depth easing')

# --- ABOUT: keep That's me playful; quiet the photograph/sticky/tools. ---
js = rep(js,
'''      { el: section.querySelector(".thats-me"), x: 11, y: 8 },
      { el: section.querySelector(".thats-me-arrow"), x: 8, y: 6 },
      { el: section.querySelector(".polaroid"), x: 6, y: 5 },
      { el: section.querySelector(".sticky-note"), x: -8, y: -6 },
      { el: section.querySelector(".tools"), x: 4, y: 3 }''',
'''      { el: section.querySelector(".thats-me"), x: 12, y: 8 },
      { el: section.querySelector(".thats-me-arrow"), x: 8, y: 5 },
      { el: section.querySelector(".polaroid"), x: 2.5, y: 2.0 },
      { el: section.querySelector(".sticky-note"), x: -2.5, y: -2.0 },
      { el: section.querySelector(".tools"), x: 1.5, y: 1.2 }''',
    'about pointer hierarchy'
)

# --- WHAT DRIVES ME: tiny text-only response, no competing heading motion. ---
old_drives = '''@media (pointer: fine) {
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
}'''
new_drives = '''@media (pointer: fine) {
  .sp-js .drives.is-drives-ready .drives-list li.is-beat-reached:hover p {
    transition-delay: 0ms;
    transform: translateY(-2.5px) scale(1.01);
  }
  .sp-js .drives.is-drives-ready .drives-list li:nth-child(1).is-beat-reached:hover p { transform: translate(-1px, -2.5px) rotate(-.12deg) scale(1.01); }
  .sp-js .drives.is-drives-ready .drives-list li:nth-child(2).is-beat-reached:hover p { transform: translate(1px, -2.5px) rotate(.10deg) scale(1.01); }
  .sp-js .drives.is-drives-ready .drives-list li:nth-child(3).is-beat-reached:hover p { transform: translate(-1px, -2.5px) rotate(-.10deg) scale(1.01); }
  .sp-js .drives.is-drives-ready .drives-list li:nth-child(4).is-beat-reached:hover p { transform: translate(1px, -2.5px) rotate(.12deg) scale(1.01); }
}'''
css = rep(css, old_drives, new_drives, 'drives hover reduction')

# --- FOOTER: remove competing giant hover words; keep title dance + email note. ---
css = rep(css, '.footer-giant {\n  position: absolute;', '.footer-giant {\n  display: none !important;\n  position: absolute;', 'footer giant disable')

# The watering easter egg should move only when clicked, not with pointer depth.
css = rep(css,
'''.sp-js .footer-cover .cover-card,
.sp-js .footer-cover .cover-caption,
.sp-js .footer-cover .footer-water {
  translate: var(--footer-depth-x, 0px) var(--footer-depth-y, 0px);
  will-change: translate;
}''',
'''.sp-js .footer-cover .cover-card,
.sp-js .footer-cover .cover-caption {
  translate: var(--footer-depth-x, 0px) var(--footer-depth-y, 0px);
  will-change: translate;
}''',
'footer water pointer depth')

# Footer dancing letters only activate after the title's scroll growth has settled.
js = rep(js,
'''    var title = document.querySelector(".footer-title");
    if (!title || reduced || !finePointer) { return; }''',
'''    var title = document.querySelector(".footer-title");
    var footer = title && title.closest(".site-footer");
    if (!title || !footer || reduced || !finePointer) { return; }''',
'footer title footer ref')
js = rep(js,
'''        var t = active ? clamp(1 - Math.sqrt(dx * dx + dy * dy) / 105, 0, 1) : 0;
        t = t * t * (3 - 2 * t);
        b.v = lerp(b.v, t, active ? .24 : .16);''',
'''        var enabled = active && footer.classList.contains("is-lede-reached");
        var t = enabled ? clamp(1 - Math.sqrt(dx * dx + dy * dy) / 105, 0, 1) : 0;
        t = t * t * (3 - 2 * t);
        b.v = lerp(b.v, t, enabled ? .24 : .16);''',
'footer hover gating')

# Remove watering from JS footer pointer-depth writes as well.
js = rep(js, '    var water = cover.querySelector(".footer-water");\n', '', 'footer water var')
water_block = '''      if (water) {
        water.style.setProperty("--footer-depth-x", (cx * 5).toFixed(2) + "px");
        water.style.setProperty("--footer-depth-y", (cy * 4).toFixed(2) + "px");
      }
'''
js = rep(js, water_block, '', 'footer water write')

# --- PAPER: keep the torn-page language, but reduce the moving-sheet travel ~78%. ---
js = rep(js, 'var slide = 1 - eased;', 'var slide = (1 - eased) * 0.22;', 'paper sheet amplitude')

# Reduced-motion no longer references removed logo idle animation; harmless if present, but simplify.
css = css.replace('  .sp-js .timeline-item .tl-logo img { animation: none !important; }\n', '')

js_path.write_text(js)
css_path.write_text(css)
print('motion hierarchy cleanup applied')
