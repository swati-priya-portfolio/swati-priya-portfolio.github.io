from pathlib import Path
import re

p = Path('motion.js')
s = p.read_text()

# 1) Section-story beats should be state derived from scroll position, not latched forever.
old = '''    function reveal(el) {
      if (el) { el.classList.add("is-beat-reached"); }
    }
'''
new = '''    function reveal(el, yes) {
      if (el) { el.classList.toggle("is-beat-reached", reduced || !!yes); }
    }

    function setState(el, name, yes) {
      if (el) { el.classList.toggle(name, reduced || !!yes); }
    }
'''
if old not in s:
    raise SystemExit('section reveal helper not found')
s = s.replace(old, new, 1)

repls = {
'''            if (reduced || bp >= beat[0]) { behind.classList.add(beat[1]); }''':
'''            setState(behind, beat[1], bp >= beat[0]);''',
'''            if (reduced || bp >= point) { reveal(boards[i]); }''':
'''            reveal(boards[i], bp >= point);''',
'''            if (reduced || bp >= point) { reveal(reminders[i]); }''':
'''            reveal(reminders[i], bp >= point);''',
'''            if (reduced || y >= introStart + beat[0]) { behind.classList.add(beat[1]); }''':
'''            setState(behind, beat[1], y >= introStart + beat[0]);''',
'''            if (reduced || y >= bh.board[i]) { reveal(board); }''':
'''            reveal(board, y >= bh.board[i]);''',
'''            if (reduced || y >= bh.reminder[i]) { reveal(item); }''':
'''            reveal(item, y >= bh.reminder[i]);''',
'''          if (reduced || dp >= .04) { drives.classList.add("is-border-reached"); }''':
'''          setState(drives, "is-border-reached", dp >= .04);''',
'''          if (reduced || dp >= .14) { drives.classList.add("is-title-reached"); }''':
'''          setState(drives, "is-title-reached", dp >= .14);''',
'''            if (reduced || dp >= point) { reveal(principles[i]); }''':
'''            reveal(principles[i], dp >= point);''',
'''          if (reduced || y >= dg.top - vh * .79) { drives.classList.add("is-border-reached"); }''':
'''          setState(drives, "is-border-reached", y >= dg.top - vh * .79);''',
'''          if (reduced || y >= dg.top - vh * .70) { drives.classList.add("is-title-reached"); }''':
'''          setState(drives, "is-title-reached", y >= dg.top - vh * .70);''',
'''            if (reduced || y >= dg.items[i]) { reveal(item); }''':
'''            reveal(item, y >= dg.items[i]);''',
'''          if (reduced || p >= beat[0]) { footerEl.classList.add(beat[1]); }''':
'''          setState(footerEl, beat[1], p >= beat[0]);'''
}
for a,b in repls.items():
    if a not in s:
        raise SystemExit('missing section pattern: ' + a[:70])
    s = s.replace(a,b,1)

# 2) Origin Story is also scroll-derived. Removing a class on upward scroll lets
# the same existing CSS transition play naturally in reverse.
old = '''    function reached(el, yes) {
      if (el && yes && !el.classList.contains("is-reached")) { el.classList.add("is-reached"); }
    }
'''
new = '''    function reached(el, yes) {
      if (el) { el.classList.toggle("is-reached", reduced || !!yes); }
    }
'''
if old not in s:
    raise SystemExit('origin reached helper not found')
s = s.replace(old,new,1)

# Timeline line must follow scroll in both directions instead of remembering only
# the furthest downward position.
s = s.replace('''        furthestLine = Math.max(furthestLine, line);
        story.style.setProperty("--timeline-draw", furthestLine.toFixed(4));''',
'''        furthestLine = line;
        story.style.setProperty("--timeline-draw", line.toFixed(4));''',1)
s = s.replace('''        furthestLine = Math.max(furthestLine, mobileLine);
        story.style.setProperty("--timeline-draw", furthestLine.toFixed(4));
        items.forEach(function (item, i) { reached(item, y >= itemThresholds[i] && furthestLine > 0); });''',
'''        furthestLine = mobileLine;
        story.style.setProperty("--timeline-draw", mobileLine.toFixed(4));
        items.forEach(function (item, i) { reached(item, y >= itemThresholds[i] && mobileLine > 0); });''',1)

# 3) Hero depth was already mathematically reversible, but its early-return guard
# could skip the first upward frame when coming back from deep in the page. Always
# schedule the draw; the calculation itself is tiny and clamps safely.
s = s.replace('''    window.addEventListener("scroll", function () {
      if (queued || window.scrollY > height + window.innerHeight) { return; }
      queued = true;
      requestAnimationFrame(draw);
    }, { passive: true });''',
'''    window.addEventListener("scroll", function () {
      if (queued) { return; }
      queued = true;
      requestAnimationFrame(draw);
    }, { passive: true });''',1)

p.write_text(s)
print('Reversible scroll/parallax patch applied')
