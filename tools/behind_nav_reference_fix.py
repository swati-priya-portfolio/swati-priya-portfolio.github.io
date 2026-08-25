from pathlib import Path
import re

index_path = Path('index.html')
css_path = Path('motion.css')
html = index_path.read_text()
css = css_path.read_text()

# ------------------------------------------------------------
# 1. FOOTER: restore the approved footer exactly as it was
# before the previous nav/footer interpretation.
# Keep the existing Open to Senior / Lead Product Design roles line.
# ------------------------------------------------------------
html = re.sub(
    r'\n\s*<span class="footer-available-status" aria-label="Available for work">\s*\n\s*<span class="footer-available-dot" aria-hidden="true"></span>AVAILABLE FOR WORK\s*\n\s*</span>',
    '',
    html,
    count=1,
)

footer_start = html.find('<div class="footer-actions">')
if footer_start < 0:
    raise SystemExit('footer-actions not found')
footer_end = html.find('</div>', footer_start)
if footer_end < 0:
    raise SystemExit('footer-actions end not found')
footer_chunk = html[footer_start:footer_end]
footer_chunk = footer_chunk.replace("\n            Let's talk\n", "\n            Email me\n", 1)
html = html[:footer_start] + footer_chunk + html[footer_end:]

# ------------------------------------------------------------
# 2. BEHIND THE SCREENS: the supplied Figma reference does not
# include the extra CURRENT RABBIT HOLE annotation.
# ------------------------------------------------------------
html = re.sub(
    r'\n\s*<p class="sp-egg" style="right: var\(--gutter\); top: 60px;">CURRENT RABBIT HOLE &#8594;</p>\n',
    '\n',
    html,
    count=1,
)

# ------------------------------------------------------------
# 3. Remove the footer-only availability styles added in the last
# pass. YOURS zoom-only and yellow loader rules stay untouched.
# ------------------------------------------------------------
css = re.sub(
    r'\n/\* Availability sits with the existing footer CTA; no new card or section\. \*/\n\.footer-available-status \{.*?\n\}\n\.footer-available-dot \{.*?\n\}\n\n@media \(max-width: 599px\) \{\n  \.footer-available-status \{ font-size: 10px; \}\n\}\n',
    '\n',
    css,
    count=1,
    flags=re.S,
)
css = css.replace(
    '22. FOOTER FOCUS + AVAILABILITY + LOADER VISIBILITY',
    '22. FOOTER FOCUS + LOADER VISIBILITY',
)

# ------------------------------------------------------------
# 4. Add the requested compact nav state and lock Behind desktop
# layout to the 1440 reference while preserving current motions.
# ------------------------------------------------------------
marker = '/* ============================================================\n   23. NAV MINI CTA + BEHIND REFERENCE LAYOUT\n   ============================================================ */'
if marker not in css:
    css += r'''

/* ============================================================
   23. NAV MINI CTA + BEHIND REFERENCE LAYOUT
   ============================================================ */

/* The compact scrolling nav keeps the exact availability identity from the
   approved mini pill, but now also keeps the existing Let's talk action.
   Full desktop nav and mobile nav are unchanged. */
@media (min-width: 1080px) {
  .sp-js .site-header.is-mini .nav-pill {
    max-width: 430px;
    gap: 10px;
    padding: 5px 8px 5px 6px;
    justify-content: center;
  }

  .sp-js .site-header.is-mini .nav-cta {
    opacity: 1;
    max-width: 138px;
    width: auto;
    height: auto;
    min-height: 0;
    margin: 0;
    padding: 9px 10px 9px 16px;
    border-width: 1.5px;
    transform: none;
    pointer-events: auto;
    overflow: visible;
    flex-shrink: 0;
    font-size: 13px;
  }
  .sp-js .site-header.is-mini .nav-cta .btn-arrow {
    width: 24px;
    height: 24px;
    font-size: 13px;
  }
}

/* Match the supplied 1440px Behind the Screens reference exactly in its
   resting composition: 1280px content width, 80px outer gutters, four equal
   420px boards and an editorial header above. The section no longer creates
   a 155vh sticky runway. Existing reveal, book, music, sticky-note and hover
   motion systems still target the same DOM nodes and remain intact. */
@media (min-width: 1080px) {
  .sp-js .behind {
    min-height: 0 !important;
    padding-top: 96px;
    padding-bottom: 96px;
  }

  .sp-js .behind-stage {
    position: relative !important;
    top: auto !important;
    min-height: 0 !important;
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
  }

  .sp-js .behind-head {
    max-width: none;
    grid-template-columns: minmax(0, 1fr) 430px;
    align-items: center;
    gap: 24px;
    margin: 0 0 54px;
  }

  .sp-js .board-grid {
    max-width: none;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
  }

  .sp-js .board {
    height: 420px;
    min-height: 420px;
    padding: 20px 22px;
  }
}
'''

index_path.write_text(html)
css_path.write_text(css)
