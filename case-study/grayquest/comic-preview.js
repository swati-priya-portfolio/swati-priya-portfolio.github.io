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
const tenure=copy.querySelector('.tenure');const date=document.createElement('div');date.innerHTML='<dt>AT GRAYQUEST</dt><dd>FEB 2025 – JUN 2026</dd>';copy.querySelector('.project-facts').append(date);tenure.remove();


// The paper edition uses printed scenery confined to the cover composition.
const landscape=document.createElement('div');landscape.className='ink-landscape';landscape.setAttribute('aria-hidden','true');hero.prepend(landscape);
const facts=copy.querySelector('.project-facts');hero.append(facts);
const opening=root.querySelector('#d-section-1');opening.classList.remove('dark');opening.classList.add('cream','paper-opening');
['d-section-1'].forEach(id=>{const section=root.querySelector('#'+id);if(!section)return;section.classList.add('printed-sheet');const edge=document.createElement('div');edge.className='printed-edge';edge.setAttribute('aria-hidden','true');section.prepend(edge)});
// Original quiet pentatonic ambience. Audio starts only from its own control.
const sound=document.createElement('div');sound.className='story-sound';sound.innerHTML='<button type="button" aria-pressed="false">Enable sound</button><label hidden>Volume <input type="range" min="0" max="0.3" step="0.01" value="0.12" aria-label="Ambient sound volume"></label><span class="sound-status" role="status"></span>';root.append(sound);
const soundButton=sound.querySelector('button'),volume=sound.querySelector('input');let audioContext,master,soundTimer,soundOn=false,noteIndex=0;const voices=new Set();
function stopSound(){soundOn=false;clearInterval(soundTimer);voices.forEach(v=>{try{v.stop()}catch{}});voices.clear();audioContext?.suspend();soundButton.textContent='Enable sound';soundButton.setAttribute('aria-pressed','false');sound.querySelector('label').hidden=true;}
function soundNote(){if(!soundOn||document.hidden)return;const now=audioContext.currentTime;const notes=[261.63,392,329.63,523.25,440,329.63,392,293.66];const hz=notes[noteIndex++%notes.length];[1,2].forEach((multiple,i)=>{const oscillator=audioContext.createOscillator(),envelope=audioContext.createGain();oscillator.type='sine';oscillator.frequency.value=hz*multiple;envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime(i?.035:.14,now+.04);envelope.gain.exponentialRampToValueAtTime(.0001,now+3.8);oscillator.connect(envelope);envelope.connect(master);voices.add(oscillator);oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();envelope.disconnect()};oscillator.start(now);oscillator.stop(now+4)})}
soundButton.addEventListener('click',async()=>{if(soundOn){stopSound();return}try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();if(!master){master=audioContext.createGain();master.connect(audioContext.destination)}master.gain.value=Number(volume.value);await audioContext.resume();soundOn=true;soundButton.textContent='Mute sound';soundButton.setAttribute('aria-pressed','true');sound.querySelector('label').hidden=false;sound.querySelector('.sound-status').textContent='';soundNote();soundTimer=setInterval(soundNote,2100)}catch{stopSound();sound.querySelector('.sound-status').textContent='Sound unavailable in this browser.'}});
volume.addEventListener('input',()=>{if(master)master.gain.setTargetAtTime(Number(volume.value),audioContext.currentTime,.1)});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSound()});addEventListener('pagehide',stopSound);desktop.addEventListener('change',()=>{if(!desktop.matches)stopSound()});
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
// Screen evidence remains unaltered: no simulated field selection or hover overlays.
const routes=root.querySelector('.applicant-route');
routes.classList.add('illustrated-routes');
routes.querySelectorAll('.applicant-branches article').forEach((article,i)=>{const portrait=document.createElement('div');portrait.className='route-portrait '+(i?'student':'guardian');portrait.setAttribute('aria-hidden','true');article.prepend(portrait)});
routes.querySelector('.route-note').textContent='Both routes return to applicant details and applicable checks. Approval is assessed separately. Illustrative journey; the original selection screen is shown above.';
const closing=root.querySelector('.closing-links'),outro=document.createElement('aside');outro.className='comic-outro';outro.setAttribute('aria-label','Next case study');outro.innerHTML='<div><span class="small-label">THE STORY CONTINUES / ISSUE 01</span><h3>WHAT IF EDUCATION<br>HAD A SAFETY NET?</h3><p>Explore Guardian One: the next story in making complex financial decisions easier to understand.</p><a class="comic-btn" href="../guardian-one/">Explore Guardian One <span class="comic-arrow" aria-hidden="true">↗</span></a></div><img src="../../images/case-guardian-one.png" alt="Guardian One comic cover" loading="lazy">';closing.before(outro);closing.querySelector('a').remove();const allWork=document.createElement('a');allWork.className='comic-btn secondary';allWork.href='../../index.html#case-studies';allWork.textContent='Back to all work ↗';closing.prepend(allWork);
root.querySelectorAll('.comic-actions a').forEach(a=>a.addEventListener('click',e=>{const target=document.querySelector(a.hash);if(!target)return;e.preventDefault();history.pushState(null,'',a.hash);target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'})}));
// Decorative motion has no bearing on content visibility or reading order.
const chapterIds=['d-section-1','d-journey','d-choose','d-checks','d-pay','d-section-13','d-section-16'];
chapterIds.forEach((id,i)=>{const el=root.querySelector('#'+id);if(el){el.classList.add('cinema-chapter');el.dataset.act=String(i+1).padStart(2,'0')}});
const journeyRows=[...root.querySelectorAll('.journey>li')];
const observers=[];let activeAnimations=[];
function play(el,frames,options){if(!el||!desktop.matches||reduced.matches)return;const animation=el.animate(frames,options);activeAnimations.push(animation);animation.finished.catch(()=>{}).finally(()=>{activeAnimations=activeAnimations.filter(a=>a!==animation)})}
const enter=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target;el.classList.add('scene-entered');
if(el.classList.contains('cinema-chapter')){play(el.querySelector('.printed-edge'),[{transform:'translateY(18px) rotate(180deg)'},{transform:'translateY(0) rotate(180deg)'}],{duration:650,easing:'cubic-bezier(.2,.7,.3,1)'});play(el.querySelector('h2'),[{opacity:.6,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:480,easing:'cubic-bezier(.2,.7,.3,1)'});}
else play(el,[{opacity:.65,transform:'translateY(8px) scale(.98)'},{opacity:1,transform:'none'}],{duration:380,easing:'cubic-bezier(.2,.7,.3,1)'});
enter.unobserve(el);});},{threshold:.1});observers.push(enter);
root.querySelectorAll('.cinema-chapter,.parent-question,.narrator,.comic-outro').forEach(el=>enter.observe(el));
const rowObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){journeyRows.forEach(row=>row.classList.toggle('reading-panel',row===entry.target));}})},{rootMargin:'-22% 0px -48% 0px',threshold:0});observers.push(rowObserver);journeyRows.forEach(row=>rowObserver.observe(row));
const quick=document.createElement('nav');quick.className='journey-quick';quick.setAttribute('aria-label','Jump from journey to product screens');quick.innerHTML='<span>EXPLORE THE SCREENS</span>'+['Choose a plan','Complete checks','Review & pay','Set up & track'].map((label,i)=>`<a href="${['#d-choose','#d-checks','#d-pay','#d-section-13'][i]}">${String(i+1).padStart(2,'0')} / ${label} <span aria-hidden="true">↗</span></a>`).join('');root.querySelector('.journey').after(quick);
const finale=root.querySelector('#d-section-16');finale.classList.add('cinema-finale');
finale.querySelector('.takeaway').remove();
finale.querySelector('.reflection-intro p:not(.handwritten)').textContent='Payment, repayment setup and approval are separate milestones. Each needs a clear next action.';


// One purpose per spread; retain all product evidence and supporting material.
opening.querySelector('.intro').textContent='Before paying school fees, parents had to compare plans, share financial details and complete checks. Each step needed a clear reason and next action.';
opening.querySelector('.takeaway')?.remove();
opening.querySelector('.gq-section-head h2').innerHTML='PAYING SCHOOL FEES.<span class="accent">Navigating a financial application.</span>';
// Normal document flow keeps chapter links and browser history predictable.
function scrollToChapter(target,smooth=false){const header=document.querySelector('.case-header');const offset=header.getBoundingClientRect().bottom+14;window.scrollTo({top:scrollY+target.getBoundingClientRect().top-offset,behavior:smooth&&!reduced.matches?'smooth':'instant'})}
document.addEventListener('click',e=>{if(!desktop.matches)return;const link=e.target.closest('a[href^="#d-"]');if(!link)return;const target=document.querySelector(link.hash);if(!target||!root.contains(target))return;e.preventDefault();e.stopImmediatePropagation();history.pushState(null,'',link.hash);target.setAttribute('tabindex','-1');target.focus({preventScroll:true});scrollToChapter(target,true)},true);
function restoreFragment(){if(!desktop.matches||!location.hash.startsWith('#d-'))return;const target=document.querySelector(location.hash);if(target)scrollToChapter(target)}
addEventListener('popstate',restoreFragment);addEventListener('hashchange',restoreFragment);addEventListener('load',restoreFragment,{once:true});
// Three decisions offer a short route into the evidence.
const brief=document.createElement('nav');brief.className='decision-index';brief.setAttribute('aria-label','Key design decisions');brief.innerHTML='<span class="small-label">THREE DECISIONS TO EXPLORE</span><a href="#d-section-6"><span>01</span> Make plans comparable <b aria-hidden="true">↗</b></a><a href="#d-checks"><span>02</span> Keep a route forward <b aria-hidden="true">↗</b></a><a href="#d-section-13"><span>03</span> Explain what remains <b aria-hidden="true">↗</b></a>';opening.querySelector('.chapter-inner').append(brief);
const journey=root.querySelector('#d-journey');
journey.querySelector('.journey-intro').textContent='From choosing a plan to tracking the application, each stage needed a clear purpose and next action.';
journey.querySelector('.journey-applicant-branch').innerHTML='<strong>If an application cannot proceed</strong><p>Another parent, guardian or the student can apply with their own details and applicable checks.</p><a href="#d-checks">Explore applicant routes ↗</a>';
const milestone=journey.querySelector('.milestones');milestone.setAttribute('aria-label','Three separate milestones, not a completed application');milestone.querySelectorAll('span').forEach((el,i)=>el.dataset.milestone=String(i+1).padStart(2,'0'));
const caption=document.createElement('p');caption.className='milestone-caption';caption.textContent='Three separate milestones—not automatic completion after payment.';milestone.before(caption);
journey.querySelector('.narrator').remove();
// Sound stays available as a quiet footer utility, outside reading content.
closing.after(sound);
// The next issue is a real cover link with the same depth language as the hero.
const nextCover=outro.querySelector('img');const nextLink=document.createElement('a');nextLink.className='next-cover-link';nextLink.href='../guardian-one/';nextLink.setAttribute('aria-label','Explore Guardian One case study');nextCover.before(nextLink);nextLink.append(nextCover);
outro.querySelector('.small-label').textContent='NEXT ISSUE / GUARDIAN ONE';
outro.querySelector('h3').textContent='GUARDIAN ONE.';
outro.querySelector('p').textContent='A new issue. A different design challenge. Explore the next case study.';

// Research context and ownership use only the designer's confirmed account.
opening.querySelector('.gq-section-head h2').innerHTML='THE PEOPLE BEHIND<span class="accent">THE PAYMENT.</span>';
opening.querySelector('.intro').textContent='I spoke with parents and institutes to understand the school-fee journey. The platform also served undergraduate and postgraduate students applying for themselves.';
const audience=document.createElement('div');audience.className='audience-spread';audience.innerHTML='<img src="assets/parent@3x.webp" alt="Illustration of a parent considering the application" width="264" height="288" loading="lazy"><div><span class="small-label">UNDERSTANDING USERS</span><h3>Different applicants.<br>A clear route for each.</h3></div><div class="audience-types"><article><h4>PARENTS &amp; GUARDIANS</h4><p>Parents commonly managed education payments for children through Class 12.</p></article><article><h4>STUDENT APPLICANTS</h4><p>Undergraduate and postgraduate students also used the student route to complete their own application.</p></article></div>';
opening.querySelector('.moments-label').before(audience);
opening.querySelector('.moments-label').textContent='THREE QUESTIONS THAT SHAPED THE DESIGN';
const ownership=opening.querySelector('.narrator');ownership.className='project-ownership';ownership.innerHTML='<img src="../../images/avatar-nav.png" alt="Swati Priya" width="128" height="128" loading="lazy"><div><span class="small-label">MY ROLE IN THIS PROJECT</span><p>I worked with product managers on requirements, spoke with parents and institutes, explored flows and low-fidelity concepts, and refined the designs through PM and CEO feedback before developer handoff.</p></div>';
// Essential explanations stay visible; supporting notes are available on demand.
const destinations=['#d-section-6','#d-checks','#d-section-13'];
brief.remove();
opening.querySelectorAll('.problem-grid .paper-card').forEach((card,i)=>{const link=document.createElement('a');link.className='evidence-jump';link.href=destinations[i];link.textContent='See the design response ↗';card.append(link)});
root.querySelectorAll('#d-section-2 .evidence-explanation').forEach(note=>{const details=document.createElement('details');details.className='design-note';const summary=document.createElement('summary');summary.textContent='Read the design considerations';const content=document.createElement('div');content.className='supporting-content';note.before(details);details.append(summary,content);content.append(note)});
nextLink.classList.add('book-cover');

// Homepage cursor vocabulary, enabled only for desktop mouse input.
const cursor=document.createElement('div');cursor.className='gq-cursor';cursor.setAttribute('aria-hidden','true');cursor.innerHTML='<i></i><b></b><span></span>';document.body.append(cursor);
let cursorFrame=0;
document.addEventListener('pointermove',e=>{if(!desktop.matches||reduced.matches||e.pointerType!=='mouse'){cursor.hidden=true;return}cursor.hidden=false;cancelAnimationFrame(cursorFrame);cursorFrame=requestAnimationFrame(()=>{cursor.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`});const target=e.target.closest('a,button');cursor.classList.toggle('active',!!target);cursor.querySelector('span').textContent=target?.hasAttribute('data-zoom')?'VIEW SCREEN':target?'EXPLORE ↗':'';},{passive:true});
document.addEventListener('pointerleave',()=>cursor.hidden=true);desktop.addEventListener('change',()=>{if(!desktop.matches)cursor.hidden=true});
// Restore the supplied Figma composition instead of adding another research spread.
opening.classList.remove('cream','paper-opening','printed-sheet');opening.classList.add('dark','figma-problem');
opening.querySelector('.printed-edge')?.remove();audience.remove();ownership.remove();
opening.querySelector('h2').innerHTML='PARENTS CAME TO PAY SCHOOL FEES.<span class="accent">BUT FIRST, THEY HAD TO NAVIGATE A FINANCIAL APPLICATION.</span>';
opening.querySelector('.intro').textContent='Choosing a plan was only the beginning. Parents then had to provide personal and financial details, complete checks, and authorise repayments. Each stage introduced another question about money, information, or what came next.';
opening.querySelector('.moments-label').textContent='THREE KEY MOMENTS IN THE JOURNEY';
const endNote=document.createElement('p');endNote.className='figma-caption';endNote.textContent='Each step asked parents to act. The journey needed to explain why.';opening.querySelector('.problem-grid').after(endNote);
const conclusion=document.createElement('div');conclusion.className='case-conclusion';conclusion.innerHTML='<span class="small-label">CONCLUSION</span><h3>Clarity is knowing what comes next.</h3><p>The design connects plan comparison, verification, payment and repayment setup into a more explicit journey. My central learning: explain the commitment before asking for it, and distinguish completed actions from pending review.</p><p class="source-note">Post-release outcomes remain unverified. The next step is to test comprehension and recovery with parents.</p>';outro.before(conclusion);
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
