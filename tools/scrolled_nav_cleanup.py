from pathlib import Path

path = Path('motion.css')
css = path.read_text()
marker = '/* ============================================================\n   SCROLLED NAV — CLEAN COMPACT STATE\n   ============================================================ */'
if marker not in css:
    css += r'''

/* ============================================================
   SCROLLED NAV — CLEAN COMPACT STATE
   ============================================================ */
@media (min-width: 1080px) {
  .sp-js .site-header.is-mini {
    padding-top: 10px;
  }

  .sp-js .site-header.is-mini .nav-pill {
    max-width: 326px;
    min-height: 50px;
    gap: 8px;
    padding: 5px 6px 5px 7px;
    justify-content: center;
    border-radius: 28px;
    border-color: rgba(255, 197, 61, 0.30);
    background: rgba(18, 14, 9, 0.90);
    background-image: none;
    -webkit-backdrop-filter: blur(10px) saturate(120%);
            backdrop-filter: blur(10px) saturate(120%);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.30), inset 0 1px 0 rgba(255, 197, 61, 0.06);
    transition: max-width 420ms var(--ep), padding 420ms var(--ep),
                gap 420ms var(--ep), background-color 320ms var(--ep),
                border-color 320ms var(--ep), box-shadow 320ms var(--ep);
  }

  .sp-js .site-header.is-mini .identity-group {
    gap: 6px;
    min-width: 0;
  }

  .sp-js .site-header.is-mini .identity {
    flex: 0 0 42px;
    width: 42px;
    min-width: 42px;
    overflow: hidden;
  }

  .sp-js .site-header.is-mini .identity-avatar {
    width: 60px;
    height: 60px;
    margin: -5px -9px -13px -9px;
  }

  .sp-js .site-header.is-mini .nav-available {
    max-width: 132px;
    margin-left: 0;
    gap: 6px;
    padding: 0;
    font-size: 10.5px;
    letter-spacing: 0.55px;
    line-height: 1;
    color: var(--accent);
  }

  .sp-js .site-header.is-mini .nav-available .nav-dot {
    width: 6px;
    height: 6px;
    margin-left: 0;
    box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.16), 0 0 7px rgba(74, 222, 128, 0.72);
  }

  .sp-js .site-header.is-mini .nav-cta {
    opacity: 1;
    max-width: 108px;
    width: auto;
    height: 38px;
    min-height: 38px;
    margin: 0;
    padding: 7px 8px 7px 13px;
    gap: 7px;
    border-width: 1.5px;
    border-radius: 22px;
    transform: none;
    pointer-events: auto;
    overflow: visible;
    flex-shrink: 0;
    font-size: 12px;
    line-height: 1;
  }

  .sp-js .site-header.is-mini .nav-cta .btn-arrow {
    width: 22px;
    height: 22px;
    font-size: 12px;
  }

  .sp-js .site-header.is-mini .nav-available:hover,
  .sp-js .site-header.is-mini .nav-available:focus-visible {
    color: var(--cream);
  }

  .sp-js .site-header.is-mini .nav-cta:hover,
  .sp-js .site-header.is-mini .nav-cta:focus-visible {
    transform: translateY(-1px);
  }
}
'''
path.write_text(css)
