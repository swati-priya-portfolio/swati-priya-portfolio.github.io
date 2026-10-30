(()=>{
  const mobile=matchMedia('(max-width:760px)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const root=document.querySelector('#main');
  if(!root)return;
  const opening=root.querySelector('#section-1');
  let observer, frame=0, initialized=false;
  function updatePaper(){
    frame=0;
    if(!mobile.matches || reduced.matches){opening?.style.removeProperty('--mobile-paper-lift');return;}
    const distance=Math.min(56,Math.max(0,window.scrollY*.24));
    opening?.style.setProperty('--mobile-paper-lift',`${-distance}px`);
  }
  function onScroll(){if(!frame)frame=requestAnimationFrame(updatePaper);}
  function setup(){
    if(!mobile.matches || reduced.matches){observer?.disconnect();observer=null;updatePaper();return;}
    if(!initialized){
      initialized=true;
      addEventListener('scroll',onScroll,{passive:true});
    }
    if('IntersectionObserver' in window && !observer){
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        entry.target.classList.add('mobile-enter');
        observer.unobserve(entry.target);
      }),{threshold:.08,rootMargin:'0px 0px -24px 0px'});
      root.querySelectorAll('.chapter-tag,.gq-section-head,.problem-grid>.paper-card,.journey>li,.screen-card,.reason,.parent-question,.mobile-next-issue').forEach(el=>{
        if(!el.classList.contains('mobile-enter'))observer.observe(el);
      });
    }
    updatePaper();
  }
  mobile.addEventListener('change',setup);reduced.addEventListener('change',setup);setup();
})();
