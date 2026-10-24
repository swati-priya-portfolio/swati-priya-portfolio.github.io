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

// One continuous illustrated world; all product content remains upright.
const scene=document.createElement('figure');scene.className='story-world';
scene.innerHTML=`<div class="world-kicker">A GRAYQUEST STORY <span>VOL. 02</span></div>
<svg viewBox="0 0 600 560" role="img" aria-label="An illustrated education city connected by a golden path, from school to college">
<defs><radialGradient id="world-light"><stop stop-color="#ffc53d" stop-opacity=".3"/><stop offset="1" stop-color="#ffc53d" stop-opacity="0"/></radialGradient><pattern id="world-dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#f5efe3" opacity=".15"/></pattern></defs>
<rect width="600" height="560" fill="#17120b"/><circle cx="340" cy="235" r="240" fill="url(#world-light)"/><rect width="600" height="560" fill="url(#world-dots)"/>
<g stroke="#ffc53d" opacity=".2"><path d="M310 270L0 60M310 270L95 0M310 270L280 0M310 270L490 0M310 270L600 80M310 270L600 260M310 270L600 490M310 270L120 560M310 270L0 390"/></g>
<circle cx="440" cy="100" r="42" fill="#f5efe3"/><path d="M60 370V230H112V190H165V260H195V170H250V270H290V210H350V300H400V220H460V180H510V250H560V370Z" fill="#342b20"/>
<g fill="#f5efe3" stroke="#17120b" stroke-width="4"><path d="M55 300L160 232L265 300Z"/><path d="M72 300H248V438H72Z"/><path d="M355 248L460 182L565 248Z"/><path d="M370 248H550V390H370Z"/></g>
<g fill="#ffc53d" stroke="#17120b" stroke-width="3"><path d="M138 438V370H182V438"/><path d="M438 390V315H482V390"/><path d="M90 321H118V351H90ZM140 321H168V351H140ZM190 321H218V351H190ZM390 269H417V299H390ZM446 269H473V299H446ZM502 269H529V299H502Z"/></g>
<g font-family="Inter,sans-serif" font-size="12" font-weight="800" fill="#17120b" text-anchor="middle"><text x="160" y="290">SCHOOL</text><text x="460" y="238">COLLEGE</text></g>
<path d="M0 480Q130 412 265 465T600 420V560H0Z" fill="#251f17"/>
<path class="world-path" d="M155 440C150 490 340 508 330 420S449 440 460 392" fill="none" stroke="#ffc53d" stroke-width="5" stroke-linecap="round"/>
<g fill="#ffc53d"><circle cx="155" cy="440" r="8"/><circle cx="330" cy="420" r="8"/><circle cx="460" cy="392" r="8"/></g>
<g stroke="#f5efe3" stroke-width="2"><path d="M68 100v16m-8-8h16M330 65v12m-6-6h12M540 140v14m-7-7h14"/></g>
</svg><div class="world-question"><img src="assets/parent@3x.webp" alt=""/><p>“Where do we<br>go from here?”<small>ILLUSTRATIVE PARENT QUESTION</small></p></div><figcaption>EVERY CLEAR CHOICE OPENS THE NEXT CHAPTER.</figcaption>`;
hero.querySelector('.cover').replaceWith(scene);
root.querySelectorAll('.journey-question').forEach(question=>{const br=question.querySelector('br');const text=br?.nextSibling;if(text?.nodeType===Node.TEXT_NODE){const mark=document.createElement('span');mark.className='question-highlight';mark.textContent=text.textContent.trim();text.replaceWith(mark)}});
// Consistent evidence stages; enlarge controls remain bound to the existing viewer.
const moments=root.querySelector('#d-section-2');

moments.querySelectorAll('.grid.three>.paper-card').forEach((card,i)=>{
 const stage=document.createElement('div');stage.className='moment-stage';const content=card.querySelector('.mini-plans')||card.querySelector('.evidence');content.before(stage);stage.append(content);


});
// No permanent movement: one reveal, then a quiet reading state.
if(!reduced.matches){scene.animate([{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}],{duration:850,easing:'cubic-bezier(.2,.7,.3,1)'});scene.addEventListener('pointermove',e=>{const box=scene.getBoundingClientRect();scene.style.setProperty('--light-x',`${(e.clientX-box.left)/box.width*100}%`);scene.style.setProperty('--light-y',`${(e.clientY-box.top)/box.height*100}%`)});}

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
if(!reduced.matches){[hero.querySelector('h1'),hero.querySelector('.hero-subtitle'),actions,scene].forEach((el,i)=>el.animate([{opacity:0,translate:'0 16px'},{opacity:1,translate:'0 0'}],{duration:550,delay:i*100,easing:'cubic-bezier(.2,.7,.3,1)',fill:'backwards'}));const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.animate([{opacity:.4,translate:'0 14px'},{opacity:1,translate:'0 0'}],{duration:350,easing:'ease-out'});io.unobserve(e.target)}}),{threshold:.15});root.querySelectorAll('.chapter-tag,.parent-question,.comic-outro').forEach(el=>io.observe(el));}
}
build();desktop.addEventListener('change',build);
})();
