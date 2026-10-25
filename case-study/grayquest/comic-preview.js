(()=>{'use strict';
const desktop=matchMedia('(min-width:761px)');
const root=document.querySelector('#desktop-main');
if(!root)return;
let built=false;
function build(){if(!desktop.matches||built)return;built=true;
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const hero=root.querySelector('.gq-hero'),copy=hero.querySelector('.hero-copy');
hero.querySelector('.eyebrow').textContent='ISSUE 02 / GRAYQUEST / THE CLARITY ISSUE';
hero.querySelector('h1').innerHTML='SCHOOL FEES.<span>CLEAR CHOICES.</span>';
const actions=document.createElement('div');actions.className='comic-actions';actions.innerHTML='<a class="comic-btn" href="#d-section-1">Read the story <span class="comic-arrow" aria-hidden="true">↗</span></a><a class="comic-btn secondary" href="#d-journey">Explore the journey <span class="comic-arrow" aria-hidden="true">↓</span></a>';
copy.querySelector('.project-facts').before(actions);

// Original panoramic illustration: three deliberate atmospheric beats.
const landscape=document.createElement('div');landscape.className='ink-landscape';landscape.setAttribute('aria-hidden','true');hero.prepend(landscape);
const bridge=document.createElement('div');bridge.className='landscape-bridge';bridge.setAttribute('aria-hidden','true');bridge.innerHTML='<span>THE NEXT CHAPTER</span><p>From choosing a plan<br>to knowing what comes next.</p>';root.querySelector('#d-checks').before(bridge);
// Light travels from the comic cover toward the landscape, connecting story to setting.
const atmosphere=document.createElement('div');atmosphere.className='story-atmosphere';atmosphere.setAttribute('aria-hidden','true');
atmosphere.innerHTML='<div class="story-halo"></div><svg class="story-light-path" viewBox="0 0 1200 800" preserveAspectRatio="none"><path class="light-base" d="M950 360 C1120 470 1050 600 825 625 S555 705 725 758"/><path class="light-tracer" d="M950 360 C1120 470 1050 600 825 625 S555 705 725 758"/></svg>';
[[68,18],[92,22],[64,37],[94,46],[86,64],[73,70],[57,78],[92,78],[47,85],[81,88]].forEach(([x,y],i)=>{const dot=document.createElement('i');dot.className='story-mote';dot.style.cssText=`left:${x}%;top:${y}%;--delay:${-i*1.7}s;--duration:${7+i%4*2}s;--size:${i%3===0?4:2}px`;atmosphere.append(dot)});hero.prepend(atmosphere);
const motionControl=document.createElement('button');motionControl.className='atmosphere-control';motionControl.type='button';motionControl.setAttribute('aria-pressed','false');motionControl.textContent='Pause atmosphere';hero.append(motionControl);
let userPaused=false;function setAtmosphere(){const paused=userPaused||reduced.matches;hero.classList.toggle('atmosphere-paused',paused);motionControl.setAttribute('aria-pressed',String(paused));motionControl.textContent=paused?'Play atmosphere':'Pause atmosphere';motionControl.hidden=reduced.matches;}
motionControl.addEventListener('click',()=>{userPaused=!userPaused;setAtmosphere()});reduced.addEventListener('change',setAtmosphere);setAtmosphere();
const atmosphereObserver=new IntersectionObserver(entries=>entries.forEach(e=>hero.classList.toggle('atmosphere-offscreen',!e.isIntersecting)),{threshold:0});atmosphereObserver.observe(hero);
addEventListener('pagehide',()=>atmosphereObserver.disconnect());addEventListener('pageshow',e=>{if(e.persisted)atmosphereObserver.observe(hero)});
// A short first-entry flourish, never a readiness or network gate.
let seenIntro=false;try{seenIntro=sessionStorage.getItem('gq-ink-intro')==='1'}catch{}
const backEntry=performance.getEntriesByType('navigation')[0]?.type==='back_forward';
if(!seenIntro&&!location.hash&&!backEntry&&!reduced.matches){
 const intro=document.createElement('div');intro.className='ink-intro';intro.setAttribute('aria-label','Opening the GrayQuest story');
 intro.innerHTML='<div class="ink-shutter left"></div><div class="ink-shutter right"></div><div class="intro-mark" aria-hidden="true"><svg viewBox="0 0 80 64"><path d="M40 10Q24 2 8 8V53Q24 47 40 56Q56 47 72 53V8Q56 2 40 10Z"/><path class="spine" d="M40 10V56"/></svg><span>GRAYQUEST</span><small>THE STORY UNFOLDS</small></div><button type="button">Skip intro ↗</button>';
 root.append(intro);let closeTimer,failSafe;
 const dismiss=()=>{clearTimeout(closeTimer);clearTimeout(failSafe);const focused=intro.contains(document.activeElement);intro.remove();if(focused){const a=hero.querySelector('.comic-actions a');a?.focus({preventScroll:true})}};
 intro.querySelector('button').addEventListener('click',dismiss);intro.addEventListener('keydown',e=>{if(e.key==='Escape')dismiss()});
 closeTimer=setTimeout(dismiss,1050);failSafe=setTimeout(dismiss,1500);
 reduced.addEventListener('change',dismiss,{once:true});desktop.addEventListener('change',dismiss,{once:true});addEventListener('pagehide',dismiss,{once:true});
 try{sessionStorage.setItem('gq-ink-intro','1')}catch{}
}

// Preserve the original comic cover and its source artwork.
const scene=hero.querySelector('.cover');scene.classList.add('cinema-cover');
scene.querySelector('img').setAttribute('fetchpriority','high');
root.querySelectorAll('.journey-question').forEach(question=>{const br=question.querySelector('br');const text=br?.nextSibling;if(text?.nodeType===Node.TEXT_NODE){const mark=document.createElement('span');mark.className='question-highlight';mark.textContent=text.textContent.trim();text.replaceWith(mark)}});
// Consistent evidence stages; enlarge controls remain bound to the existing viewer.
const moments=root.querySelector('#d-section-2');

moments.querySelectorAll('.grid.three>.paper-card').forEach((card,i)=>{
 const stage=document.createElement('div');stage.className='moment-stage';const content=card.querySelector('.mini-plans')||card.querySelector('.evidence');content.before(stage);stage.append(content);


});
const section=root.querySelector('#d-section-6'),board=section.querySelector('.compare-grid>.paper-card');
const controls=document.createElement('div');controls.className='comic-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Highlight comparable plan details');
controls.innerHTML='<span>COMPARE THE DETAILS</span><button type="button" data-focus="monthly" aria-pressed="false">Monthly amount</button><button type="button" data-focus="today" aria-pressed="false">Payable today</button><button type="button" data-focus="duration" aria-pressed="false">Duration</button>';
board.querySelector('h3').after(controls);
board.querySelectorAll('.evidence').forEach(screen=>['monthly','today','duration'].forEach(key=>{const spot=document.createElement('span');spot.className='comic-spot '+key;spot.setAttribute('aria-hidden','true');screen.append(spot)}));
function highlight(key){board.dataset.focus=key;controls.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.focus===key)))}
controls.addEventListener('click',e=>{const b=e.target.closest('button');if(b)highlight(board.dataset.focus===b.dataset.focus?'':b.dataset.focus)});
section.querySelectorAll('.reason').forEach((reason,i)=>{const key=['monthly','today','today'][i];reason.tabIndex=0;reason.addEventListener('mouseenter',()=>highlight(key));reason.addEventListener('focus',()=>highlight(key));});
const routes=root.querySelector('.applicant-route'),articles=routes.querySelectorAll('.applicant-branches article'),routeControls=document.createElement('div');routeControls.className='comic-controls';routeControls.setAttribute('role','group');routeControls.setAttribute('aria-label','Highlight applicant route');routeControls.innerHTML='<span>FOLLOW A ROUTE</span><button type="button" aria-pressed="false">Parent / guardian</button><button type="button" aria-pressed="false">Student</button>';
routes.querySelector('.applicant-branches').before(routeControls);
routeControls.querySelectorAll('button').forEach((b,i)=>b.addEventListener('click',()=>{const selected=b.getAttribute('aria-pressed')!=='true';routeControls.querySelectorAll('button').forEach((el,j)=>el.setAttribute('aria-pressed',String(selected&&i===j)));articles.forEach((a,j)=>a.classList.toggle('is-highlighted',selected&&i===j))}));
const closing=root.querySelector('.closing-links'),outro=document.createElement('aside');outro.className='comic-outro';outro.setAttribute('aria-label','Next case study');outro.innerHTML='<div><span class="small-label">THE STORY CONTINUES / ISSUE 01</span><h3>WHAT IF EDUCATION<br>HAD A SAFETY NET?</h3><p>Explore Guardian One: the next story in making complex financial decisions easier to understand.</p><a class="comic-btn" href="../guardian-one/">Explore Guardian One <span class="comic-arrow" aria-hidden="true">↗</span></a></div><img src="../../images/case-guardian-one.png" alt="Guardian One comic cover" loading="lazy">';closing.before(outro);closing.querySelector('a').remove();const allWork=document.createElement('a');allWork.className='comic-btn secondary';allWork.href='../../index.html#case-studies';allWork.textContent='Back to all work ↗';closing.prepend(allWork);
root.querySelectorAll('.comic-actions a').forEach(a=>a.addEventListener('click',e=>{const target=document.querySelector(a.hash);if(!target)return;e.preventDefault();history.pushState(null,'',a.hash);target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'})}));
// Decorative motion has no bearing on content visibility or reading order.
const chapterIds=['d-section-1','d-journey','d-choose','d-checks','d-pay','d-section-13','d-section-16'];
chapterIds.forEach((id,i)=>{const el=root.querySelector('#'+id);if(el){el.classList.add('cinema-chapter');el.dataset.act=String(i+1).padStart(2,'0')}});
const journeyRows=[...root.querySelectorAll('.journey>li')];
const observers=[];let activeAnimations=[];
function play(el,frames,options){if(!el||!desktop.matches||reduced.matches)return;const animation=el.animate(frames,options);activeAnimations.push(animation);animation.finished.catch(()=>{}).finally(()=>{activeAnimations=activeAnimations.filter(a=>a!==animation)})}
const enter=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target;el.classList.add('scene-entered');
if(el.classList.contains('cinema-chapter')){play(el.querySelector('h2'),[{opacity:.6,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:480,easing:'cubic-bezier(.2,.7,.3,1)'});}
else play(el,[{opacity:.65,transform:'translateY(8px) scale(.98)'},{opacity:1,transform:'none'}],{duration:380,easing:'cubic-bezier(.2,.7,.3,1)'});
enter.unobserve(el);});},{threshold:.1});observers.push(enter);
root.querySelectorAll('.cinema-chapter,.parent-question,.narrator,.comic-outro').forEach(el=>enter.observe(el));
const rowObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){journeyRows.forEach(row=>row.classList.toggle('reading-panel',row===entry.target));}})},{rootMargin:'-22% 0px -48% 0px',threshold:0});observers.push(rowObserver);journeyRows.forEach(row=>rowObserver.observe(row));
const quick=document.createElement('nav');quick.className='journey-quick';quick.setAttribute('aria-label','Jump from journey to product screens');quick.innerHTML='<span>EXPLORE THE SCREENS</span>'+['Choose a plan','Complete checks','Review & pay','Set up & track'].map((label,i)=>`<a href="${['#d-choose','#d-checks','#d-pay','#d-section-13'][i]}">${String(i+1).padStart(2,'0')} / ${label} <span aria-hidden="true">↗</span></a>`).join('');root.querySelector('.journey').after(quick);
const finale=root.querySelector('#d-section-16');finale.classList.add('cinema-finale');
// Intro is a non-blocking reveal, never a timed loading gate.
if(!location.hash){play(scene,[{opacity:.55,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0)'}],{duration:750,easing:'cubic-bezier(.2,.7,.3,1)'});play(hero.querySelector('h1'),[{opacity:.6,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:600,easing:'cubic-bezier(.2,.7,.3,1)'});}
let pointerFrame=0;
function resetLight(){hero.style.removeProperty('--glow-x');hero.style.removeProperty('--glow-y');}
function pointerMove(e){if(!desktop.matches||reduced.matches||e.pointerType!=='mouse'||pointerFrame)return;pointerFrame=requestAnimationFrame(()=>{pointerFrame=0;const rect=hero.getBoundingClientRect();hero.style.setProperty('--glow-x',`${(e.clientX-rect.left)/rect.width*100}%`);hero.style.setProperty('--glow-y',`${(e.clientY-rect.top)/rect.height*100}%`);});}
hero.addEventListener('pointermove',pointerMove,{passive:true});hero.addEventListener('pointerleave',resetLight);
function stopMotion(){activeAnimations.forEach(a=>a.cancel());activeAnimations=[];cancelAnimationFrame(pointerFrame);pointerFrame=0;resetLight();}
reduced.addEventListener('change',()=>{if(reduced.matches)stopMotion()});desktop.addEventListener('change',()=>{if(!desktop.matches)stopMotion()});
addEventListener('pagehide',()=>{stopMotion();observers.forEach(o=>o.disconnect())});
addEventListener('pageshow',e=>{if(e.persisted){journeyRows.forEach(row=>rowObserver.observe(row));root.querySelectorAll('.cinema-chapter:not(.scene-entered),.parent-question:not(.scene-entered),.narrator:not(.scene-entered),.comic-outro:not(.scene-entered)').forEach(el=>enter.observe(el));}});

}
build();desktop.addEventListener('change',build);
})();
