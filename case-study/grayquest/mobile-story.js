(()=>{
  const card=document.querySelector('#main .mobile-next-issue');
  if(!card || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const observer=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){
      card.classList.add('mobile-enter');
      observer.disconnect();
    }
  },{threshold:.12});
  observer.observe(card);
})();
