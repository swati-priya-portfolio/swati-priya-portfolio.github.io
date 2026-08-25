from pathlib import Path
import re

index_path = Path('index.html')
js_path = Path('motion.js')
css_path = Path('motion.css')

html = index_path.read_text()
js = js_path.read_text()
css = css_path.read_text()

# 1) Footer CTA: add availability status before the existing primary action,
# and rename the action to Let's talk. Keep the existing mailto and cursor behavior.
if 'footer-available-status' not in html:
    target = '''        <div class="footer-actions">\n          <!-- Change your email address here -->\n          <a class="btn btn-primary btn-square" href="mailto:swatipriya4422@gmail.com"'''
    replacement = '''        <div class="footer-actions">\n          <span class="footer-available-status" aria-label="Available for work">\n            <span class="footer-available-dot" aria-hidden="true"></span>AVAILABLE FOR WORK\n          </span>\n          <!-- Change your email address here -->\n          <a class="btn btn-primary btn-square" href="mailto:swatipriya4422@gmail.com"'''
    if target not in html:
        raise SystemExit('Footer actions anchor not found')
    html = html.replace(target, replacement, 1)

# Rename only the footer primary CTA text, not nav or other buttons.
footer_start = html.find('<div class="footer-actions">')
if footer_start < 0:
    raise SystemExit('footer-actions not found')
footer_end = html.find('</div>', footer_start)
footer_chunk = html[footer_start:footer_end]
if '>\n            Email me\n' in footer_chunk:
    footer_chunk = footer_chunk.replace('>\n            Email me\n', '>\n            Let\'s talk\n', 1)
    html = html[:footer_start] + footer_chunk + html[footer_end:]
elif '>\n            Let\'s talk\n' not in footer_chunk:
    raise SystemExit('Footer CTA text not found')

# 2) Replace footerTitleChars with a clearer hierarchy:
# YOURS. is one stable focus word that only zooms; all other title letters can dance.
new_footer_fn = r'''  function footerTitleChars() {
    var title = document.querySelector(".footer-title");
    var footer = title && title.closest(".site-footer");
    if (!title || !footer || reduced || !finePointer) { return; }

    var focus = title.querySelector(".sp-word.accent.underlined");
    if (focus) { focus.classList.add("footer-focus-word"); }

    function wrapNode(node) {
      if (!node || node === focus || (focus && focus.contains(node))) { return; }
      var children = [].slice.call(node.childNodes);
      children.forEach(function (child) {
        if (child.nodeType === 3) {
          var text = child.nodeValue;
          if (!text || !text.trim()) { return; }
          var frag = document.createDocumentFragment();
          var parts = text.split(/(\s+)/);
          parts.forEach(function (part) {
            if (!part) { return; }
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            var word = document.createElement("span");
            word.className = "footer-word";
            Array.from(part).forEach(function (char) {
              var letter = document.createElement("span");
              letter.className = "footer-letter";
              letter.textContent = char;
              word.appendChild(letter);
            });
            frag.appendChild(word);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          wrapNode(child);
        }
      });
    }

    wrapNode(title);
    var letters = [].slice.call(title.querySelectorAll(".footer-letter"));
    var boxes = [];
    var focusBox = null;
    var dirty = true;
    var radius = 108;
    var focusRadius = 170;

    function measure() {
      var sx = window.scrollX, sy = window.scrollY;
      boxes = letters.map(function (el, i) {
        var r = el.getBoundingClientRect();
        return {
          el: el,
          px: r.left + r.width / 2 + sx,
          py: r.top + r.height / 2 + sy,
          v: 0,
          dir: i % 2 ? 1 : -1
        };
      });
      if (focus) {
        var fr = focus.getBoundingClientRect();
        focusBox = {
          px: fr.left + fr.width / 2 + sx,
          py: fr.top + fr.height / 2 + sy,
          v: 0
        };
      }
      dirty = false;
    }

    function reset() {
      boxes.forEach(function (b) {
        b.v = lerp(b.v, 0, .20);
        b.el.style.setProperty("--fc-y", (-8 * b.v).toFixed(2) + "px");
        b.el.style.setProperty("--fc-s", (1 + .055 * b.v).toFixed(4));
        b.el.style.setProperty("--fc-r", (b.dir * .9 * b.v).toFixed(3) + "deg");
      });
      if (focus && focusBox) {
        focusBox.v = lerp(focusBox.v, 0, .20);
        focus.style.setProperty("--footer-focus-s", (1 + .09 * focusBox.v).toFixed(4));
      }
    }

    window.addEventListener("resize", function () { dirty = true; }, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { dirty = true; });
    }

    addJob(function () {
      if (!ptr.has) { return; }
      if (dirty) { measure(); }

      /* Wait until the footer title has completed its scroll-growth settle.
         Then other words dance while YOURS. remains one zooming idea. */
      if (!footer.classList.contains("is-lede-reached")) {
        reset();
        return;
      }

      var sx = window.scrollX, sy = window.scrollY;
      boxes.forEach(function (b) {
        var dx = ptr.x - (b.px - sx);
        var dy = ptr.y - (b.py - sy);
        var dist = Math.sqrt(dx * dx + dy * dy);
        var target = clamp(1 - dist / radius, 0, 1);
        target = target * target * (3 - 2 * target);
        b.v = lerp(b.v, target, .22);
        b.el.style.setProperty("--fc-y", (-8 * b.v).toFixed(2) + "px");
        b.el.style.setProperty("--fc-s", (1 + .055 * b.v).toFixed(4));
        b.el.style.setProperty("--fc-r", (b.dir * .9 * b.v).toFixed(3) + "deg");
      });

      if (focus && focusBox) {
        var fdx = ptr.x - (focusBox.px - sx);
        var fdy = ptr.y - (focusBox.py - sy);
        var fdist = Math.sqrt(fdx * fdx + fdy * fdy);
        var ft = clamp(1 - fdist / focusRadius, 0, 1);
        ft = ft * ft * (3 - 2 * ft);
        focusBox.v = lerp(focusBox.v, ft, .18);
        focus.style.setProperty("--footer-focus-s", (1 + .09 * focusBox.v).toFixed(4));
      }
    });
  }'''

pattern = re.compile(r'  function footerTitleChars\(\) \{.*?\n  \}\n\n  /\*', re.S)
match = pattern.search(js)
if not match:
    raise SystemExit('footerTitleChars block not found')
js = js[:match.start()] + new_footer_fn + '\n\n  /*' + js[match.end():]

# 3) Loader spider visibility: keep black loader background, turn the moving spiders yellow.
# Limit replacements to the spider snack rules so the rest of the comic loader stays unchanged.
body_rule = re.compile(r'(\.spider-snack i \{.*?background:) var\(--ink\)(;.*?\})', re.S)
css, n1 = body_rule.subn(r'\1 var(--accent)\2', css, count=1)
if n1 != 1 and 'background: var(--accent);' not in css:
    raise SystemExit('spider body rule not found')

legs_start = css.find('.spider-snack::before,\n.spider-snack::after')
if legs_start < 0:
    raise SystemExit('spider legs block not found')
legs_end = css.find('}', legs_start)
legs_chunk = css[legs_start:legs_end + 1]
legs_chunk = legs_chunk.replace('var(--ink)', 'var(--accent)')
css = css[:legs_start] + legs_chunk + css[legs_end + 1:]

# 4) Add only the small supporting styles needed for the requested footer status
# and the zoom-only focus word. No layout redesign.
marker = '/* ============================================================\n   22. FOOTER FOCUS + AVAILABILITY + LOADER VISIBILITY\n   ============================================================ */'
if marker not in css:
    css += r'''

/* ============================================================
   22. FOOTER FOCUS + AVAILABILITY + LOADER VISIBILITY
   ============================================================ */

/* YOURS. behaves like COMPLEXITY / CLARITY in the Hero: one complete idea,
   zoom only. It never receives character-by-character rotation or lift. */
.sp-js .footer-title .footer-focus-word {
  display: inline-block;
  transform: scale(var(--footer-focus-s, 1));
  transform-origin: center 70%;
  will-change: transform;
}

/* Availability sits with the existing footer CTA; no new card or section. */
.footer-available-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .9px;
  color: var(--cream);
  white-space: nowrap;
}
.footer-available-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px rgba(255, 197, 61, .12);
}

@media (max-width: 599px) {
  .footer-available-status { font-size: 10px; }
}

@media (prefers-reduced-motion: reduce), (pointer: coarse) {
  .sp-js .footer-title .footer-focus-word {
    transform: none !important;
  }
}
'''

index_path.write_text(html)
js_path.write_text(js)
css_path.write_text(css)
