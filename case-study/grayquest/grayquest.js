/* Lightweight reading progress, chapter navigation and accessible evidence zoom. */
(() => {
  'use strict';
  const dialog = document.getElementById('evidence-dialog');
  const preview = dialog.querySelector('img');
  const caption = dialog.querySelector('.dialog-caption');
  let opener;
  document.querySelectorAll('[data-zoom]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      const source = button.querySelector('img');
      preview.src = source.currentSrc || source.src;
      preview.alt = source.alt;
      caption.textContent = source.alt;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      dialog.querySelector('.dialog-close').focus();
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    preview.removeAttribute('src');
    opener?.focus({preventScroll:true});
  });
  const progress = document.querySelector('.reading-progress');
  const links = [...document.querySelectorAll('.chapter-nav a')];
  const chapters = links.map(a => document.querySelector(a.getAttribute('href')));
  let pending = false;
  function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? Math.min(100, Math.max(0, scrollY / max * 100)) : 0}%`;
    let active = -1;
    chapters.forEach((chapter, i) => { if (chapter.getBoundingClientRect().top <= 180) active = i; });
    links.forEach((a,i) => { if (i === active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); });
    pending = false;
  }
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(update); } }, {passive:true});
  addEventListener('resize', update);
  update();
})();
