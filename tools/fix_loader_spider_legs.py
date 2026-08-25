from pathlib import Path
p = Path('motion.css')
s = p.read_text()
start = s.find('.spider-snack::before,\n.spider-snack::after {\n  inset: 3px 1px;')
if start < 0:
    raise SystemExit('spider gradient block not found')
end = s.find('  background-repeat: no-repeat;\n}', start)
if end < 0:
    raise SystemExit('spider gradient block end not found')
end += len('  background-repeat: no-repeat;\n}')
chunk = s[start:end]
chunk2 = chunk.replace('var(--ink)', 'var(--accent)')
if chunk2 == chunk:
    raise SystemExit('no black spider legs found to replace')
s = s[:start] + chunk2 + s[end:]
p.write_text(s)
