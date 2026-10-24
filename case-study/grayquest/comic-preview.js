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
const closing=root.querySelector('.closing-links'),outro=document.createElement('aside');outro.className='comic-outro';outro.setAttribute('aria-label','Next case study');outro.innerHTML='<div><span class="small-label">THE STORY CONTINUES / ISSUE 01</span><h3>WHAT IF EDUCATION<br>HAD A SAFETY NET?</h3><p>Explore Guardian One: the next story in making complex financial decisions easier to understand.</p><a class="comic-btn" href="../guardian-one/">Explore Guardian One <span class="comic-arrow" aria-hidden="true">↗</span></a></div><img src="../../images/case-guardian-one.png" alt="Guardian One comic cover" loading="lazy">';closing.before(outro);closing.querySelector('a').remove();
root.querySelectorAll('.comic-actions a').forEach(a=>a.addEventListener('click',e=>{const target=document.querySelector(a.hash);if(!target)return;e.preventDefault();history.pushState(null,'',a.hash);target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'})}));
if(!reduced.matches){[hero.querySelector('h1'),hero.querySelector('.hero-subtitle'),actions,hero.querySelector('.cover')].forEach((el,i)=>el.animate([{opacity:0,translate:'0 16px'},{opacity:1,translate:'0 0'}],{duration:550,delay:i*100,easing:'cubic-bezier(.2,.7,.3,1)',fill:'backwards'}));const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.animate([{opacity:.4,translate:'0 14px'},{opacity:1,translate:'0 0'}],{duration:350,easing:'ease-out'});io.unobserve(e.target)}}),{threshold:.15});root.querySelectorAll('.chapter-tag,.parent-question,.comic-outro').forEach(el=>io.observe(el));}
}
build();desktop.addEventListener('change',build);
})();
