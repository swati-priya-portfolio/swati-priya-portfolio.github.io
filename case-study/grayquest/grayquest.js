/* Progressive evidence viewer and chapter navigation; content works without motion. */
(() => {
 'use strict';
 const dialog=document.getElementById('evidence-dialog'), image=dialog.querySelector('img'), stage=dialog.querySelector('.dialog-scroll'),caption=dialog.querySelector('.dialog-caption'),level=document.getElementById('zoom-level');
 let opener,scale=1,fit=1,mode='fit',ready=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function fitScale(){const pad=innerWidth<=760?20:32;return Math.min(1,(stage.clientWidth-pad)/image.naturalWidth,(stage.clientHeight-pad)/image.naturalHeight);}
 function render(next,reset=false){
  if(!ready)return;fit=fitScale();scale=Math.max(Math.min(fit,0.1),Math.min(3,next));
  image.style.width=`${image.naturalWidth*scale}px`;image.style.height=`${image.naturalHeight*scale}px`;
  level.value=`${Math.round(scale*100)}%`;
  dialog.querySelector('[data-view="fit"]').setAttribute('aria-pressed',String(mode==='fit'));
  dialog.querySelector('[data-view="actual"]').setAttribute('aria-pressed',String(mode==='actual'));
  if(reset){stage.scrollTop=0;stage.scrollLeft=0;}
 }
 image.addEventListener('load',()=>{ready=true;mode='fit';render(fitScale(),true);});
 document.querySelectorAll('[data-zoom]').forEach(button=>button.addEventListener('click',()=>{
  opener=button;ready=false;const source=button.querySelector('img');image.style.width='0px';image.style.height='0px';
  image.alt=button.dataset.fullAlt||source.alt;caption.textContent=button.dataset.caption||image.alt;dialog.showModal();document.body.style.overflow='hidden';
  image.src=button.dataset.fullSrc||source.currentSrc||source.src;
  dialog.querySelector('.dialog-close').focus();
  if(!reduced.matches)dialog.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:180,easing:'ease-out'});
 }));
 dialog.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
  const action=button.dataset.view;mode=action==='fit'?'fit':action==='actual'?'actual':'zoom';
  render(action==='fit'?fitScale():action==='actual'?1:scale*(action==='in'?1.35:1/1.35),action==='fit'||action==='actual');
 }));
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',()=>{ready=false;image.removeAttribute('src');document.body.style.overflow='';opener?.focus({preventScroll:true});});
 // Native touch scrolling and pinch zoom remain available; mouse drag pans larger evidence.
 let drag;
 stage.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||scale<=fit)return;drag={x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};stage.setPointerCapture(e.pointerId);stage.style.cursor='grabbing';e.preventDefault();});
 stage.addEventListener('pointermove',e=>{if(drag){stage.scrollLeft=drag.left-e.clientX+drag.x;stage.scrollTop=drag.top-e.clientY+drag.y;}});
 const stop=()=>{drag=null;stage.style.cursor='';};stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);
 const progress=document.querySelector('.reading-progress'),header=document.querySelector('.case-header');
 const menu=document.getElementById('page-menu'),menuToggle=document.querySelector('.menu-toggle');
 let menuNavigating=false;
 function closeMenu(){menu.close();}
 menuToggle.addEventListener('click',()=>{menu.showModal();menuToggle.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';menu.querySelector('.menu-close').focus();});
 menu.querySelector('.menu-close').addEventListener('click',closeMenu);
 menu.addEventListener('close',()=>{menuToggle.setAttribute('aria-expanded','false');document.body.style.overflow='';if(!menuNavigating)menuToggle.focus({preventScroll:true});menuNavigating=false;});
 menu.addEventListener('click',e=>{if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeMenu();}});
 menu.querySelectorAll('a:not([href^="#"])').forEach(a=>a.addEventListener('click',closeMenu));
 document.querySelectorAll('.chapter-nav a, #page-menu a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();const target=document.querySelector(a.hash);if(!target)return;
  if(menu.open){menuNavigating=true;closeMenu();}
  requestAnimationFrame(()=>{update();const offset=parseFloat(document.documentElement.style.getPropertyValue('--anchor-offset'));history.pushState(null,'',a.hash);target.setAttribute('tabindex','-1');target.focus({preventScroll:true});window.scrollTo({top:scrollY+target.getBoundingClientRect().top-offset,behavior:reduced.matches?'instant':'smooth'});});
 }));
 const links=[...document.querySelectorAll('.chapter-nav a, #page-menu nav a')],chapters=[...document.querySelectorAll('main>section')];let pending=false;
 function update(){
  header.classList.toggle('is-reading',scrollY>120);
  const offset=Math.ceil(header.getBoundingClientRect().height+parseFloat(getComputedStyle(header).top)+16);
  document.documentElement.style.setProperty('--anchor-offset',offset+'px');
  const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${max>0?scrollY/max*100:0}%`;
  let active=chapters[0];chapters.forEach(c=>{if(c.getBoundingClientRect().top<=offset+2)active=c;});
  if(max>0&&scrollY>=max-2)active=chapters[chapters.length-1];
  links.forEach(a=>{if(a.hash==='#'+active.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});pending=false;
 }
 addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});
 addEventListener('resize',()=>{if(innerWidth>760&&menu.open)closeMenu();update();if(dialog.open&&ready)render(mode==='fit'?fitScale():scale);});
 new ResizeObserver(update).observe(header);update();
 document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{update();if(d.open&&!reduced.matches)d.querySelector('.supporting-content').animate([{opacity:.5,transform:'translateY(-5px)'},{opacity:1,transform:'none'}],{duration:200,easing:'ease-out'});}));
 if(!reduced.matches&&'IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.animate([{opacity:.55,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:400,easing:'cubic-bezier(.22,.61,.36,1)'});io.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('main>section .gq-section-head,.journey>li,.screen-pair,.setup-overview').forEach(e=>io.observe(e));}
})();
