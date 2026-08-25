from pathlib import Path
p = Path('motion.css')
s = p.read_text()
repls = {
    'transform: translate3d(-10px, 7px, 0) rotate(-0.7deg) scale(.992);': 'transform: translate3d(-4px, 3px, 0) rotate(-0.28deg) scale(.996);',
    'filter: blur(.45px);': 'filter: blur(.18px);',
    'transition: opacity 420ms linear,\n              transform 760ms cubic-bezier(.22,1,.36,1),\n              filter 520ms ease;': 'transition: opacity 380ms linear,\n              transform 650ms cubic-bezier(.22,1,.36,1),\n              filter 420ms ease;',
    'transform: translate3d(-7px, 8px, 0) rotate(-.35deg);\n  transition-delay: 120ms;': 'transform: translate3d(-4px, 5px, 0) rotate(-.18deg);\n  transition-delay: 140ms;',
    'transform: translate3d(6px, 8px, 0) rotate(.24deg);\n  transition-delay: 330ms;': 'transform: translate3d(4px, 5px, 0) rotate(.14deg);\n  transition-delay: 300ms;',
    'transform: translate3d(-5px, 8px, 0) rotate(-.2deg);\n  transition-delay: 540ms;': 'transform: translate3d(-3px, 5px, 0) rotate(-.12deg);\n  transition-delay: 460ms;',
    'transform: translate3d(4px, 7px, 0) rotate(.14deg);\n  transition-delay: 760ms;': 'transform: translate3d(3px, 4px, 0) rotate(.08deg);\n  transition-delay: 620ms;',
    'transition-delay: 250ms; }': 'transition-delay: 220ms; }',
    'transition-delay: 460ms; }': 'transition-delay: 380ms; }',
    'transition-delay: 670ms; }': 'transition-delay: 540ms; }',
    'transition-delay: 250ms; }\n.sp-js .story-col.is-origin-ready .origin-arrow:nth-of-type(2) path { transition-delay: 460ms; }\n.sp-js .story-col.is-origin-ready .origin-arrow:nth-of-type(3) path { transition-delay: 670ms; }': 'transition-delay: 220ms; }\n.sp-js .story-col.is-origin-ready .origin-arrow:nth-of-type(2) path { transition-delay: 380ms; }\n.sp-js .story-col.is-origin-ready .origin-arrow:nth-of-type(3) path { transition-delay: 540ms; }',
    'transition: opacity 380ms linear 980ms,\n              transform 700ms cubic-bezier(.22,1,.36,1) 980ms,\n              filter 460ms ease 980ms;': 'transition: opacity 360ms linear 820ms,\n              transform 620ms cubic-bezier(.22,1,.36,1) 820ms,\n              filter 400ms ease 820ms;',
    'transition: opacity 420ms linear 1160ms,\n              transform 650ms cubic-bezier(.22,1,.36,1) 1160ms;': 'transition: opacity 400ms linear 980ms,\n              transform 600ms cubic-bezier(.22,1,.36,1) 980ms;',
}
for old, new in repls.items():
    if old not in s:
        print('WARN missing:', old[:80])
    else:
        s = s.replace(old, new, 1)
p.write_text(s)
