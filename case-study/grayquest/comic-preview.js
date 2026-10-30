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
// Reuse the homepage spider-hero artwork; short, skippable first-entry flourish.
let introSeen=false;try{introSeen=sessionStorage.getItem('gq-snack-intro')==='1'}catch{}
if(!introSeen&&!location.hash&&!reduced.matches){
 const mount=document.createElement('div');mount.className='gq-loader-host';mount.innerHTML='<div class="sp-loader" aria-hidden="true">\n    <div class="sp-loader-scene">\n      <svg class="sp-loader-mask" viewBox="0 0 80 80" role="presentation">\n        <path class="mask-head" d="M40 5C20 5 10 20 10 40c0 21 12 35 30 35s30-14 30-35C70 20 60 5 40 5z" />\n        <path class="mask-web" d="M40 7v34M18 20l22 21 22-21M11 39h58M17 59l23-18 23 18M25 10c9 8 13 18 15 31M55 10c-9 8-13 18-15 31" />\n        <path class="mask-eye" d="M19 30c7-7 13-9 18-8-2 9-7 15-15 18zM61 30c-7-7-13-9-18-8 2 9 7 15 15 18z" />\n        <path class="mask-mouth" d="M28 53c8 7 16 7 24 0-2 12-22 12-24 0z" />\n      </svg>\n      <div class="spider-stream" aria-hidden="true">\n        <span class="spider-snack" style="--i:0"><i></i></span>\n        <span class="spider-snack" style="--i:1"><i></i></span>\n        <span class="spider-snack" style="--i:2"><i></i></span>\n        <span class="spider-snack" style="--i:3"><i></i></span>\n        <span class="spider-snack" style="--i:4"><i></i></span>\n        <span class="spider-snack" style="--i:5"><i></i></span>\n      </div>\n    </div>\n    <p class="sp-loader-sub">OPENING THE GRAYQUEST ISSUE…</p>\n    <p class="sp-loader-caption">Good stories are worth the wait.</p>\n  </div>';
 const loader=mount.firstElementChild;loader.removeAttribute('aria-hidden');loader.setAttribute('role','status');loader.setAttribute('aria-label','Opening GrayQuest');
 const skip=document.createElement('button');skip.textContent='Skip intro';skip.type='button';loader.append(skip);document.body.append(mount);
 const escapeIntro=e=>{if(e.key==='Escape')dismiss()};
 const dismiss=()=>{document.removeEventListener('keydown',escapeIntro);mount.remove();try{sessionStorage.setItem('gq-snack-intro','1')}catch{}};
 skip.addEventListener('click',dismiss);document.addEventListener('keydown',escapeIntro);
 setTimeout(dismiss,1200);desktop.addEventListener('change',dismiss,{once:true});reduced.addEventListener('change',dismiss,{once:true});
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
outro.querySelector('p').textContent='The next chapter in my product design work.';

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
const cursor=document.createElement('div');cursor.className='gq-cursor';cursor.hidden=true;cursor.setAttribute('aria-hidden','true');cursor.innerHTML='<i></i><b></b><span></span>';document.body.append(cursor);
let cursorFrame=0;
document.addEventListener('pointermove',e=>{if(!desktop.matches||reduced.matches||e.pointerType!=='mouse'){cursor.hidden=true;return}cursor.hidden=false;document.documentElement.classList.add('gq-pointer-active');cancelAnimationFrame(cursorFrame);cursorFrame=requestAnimationFrame(()=>{cursor.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0)`});const target=e.target.closest('a,button');cursor.classList.toggle('active',!!target);cursor.querySelector('span').textContent=target?.hasAttribute('data-zoom')?'VIEW SCREEN':target?'EXPLORE ↗':'';},{passive:true});
const hideCursor=()=>{cursor.hidden=true;document.documentElement.classList.remove('gq-pointer-active')};document.addEventListener('pointerleave',hideCursor);desktop.addEventListener('change',hideCursor);reduced.addEventListener('change',hideCursor);
// Restore the supplied Figma composition instead of adding another research spread.
opening.classList.remove('cream','paper-opening','printed-sheet');opening.classList.add('dark','figma-problem');
opening.querySelector('.printed-edge')?.remove();audience.remove();ownership.remove();
opening.querySelector('h2').innerHTML='PARENTS CAME TO PAY SCHOOL FEES.<span class="accent">BUT FIRST, THEY HAD TO NAVIGATE A FINANCIAL APPLICATION.</span>';
opening.querySelector('.intro').textContent='Choosing a plan was only the beginning. Parents then had to provide personal and financial details, complete checks, and authorise repayments. Each stage introduced another question about money, information, or what came next.';
opening.querySelector('.moments-label').textContent='THREE KEY MOMENTS IN THE JOURNEY';
const endNote=document.createElement('p');endNote.className='figma-caption';endNote.textContent='Each step asked parents to act. The journey needed to explain why.';opening.querySelector('.problem-grid').after(endNote);
const conclusion=document.createElement('div');conclusion.className='case-conclusion';conclusion.innerHTML='<span class="small-label">CONCLUSION / THE CLARITY ISSUE</span><h3>A clear choice.<br>A clear next step.</h3><div class="conclusion-points"><article><strong>COMPARE</strong><p>See today’s payment alongside the monthly commitment.</p></article><article><strong>CONTINUE</strong><p>Understand the check and find an applicable route forward.</p></article><article><strong>KNOW WHAT’S NEXT</strong><p>Separate payment received, repayment setup and review.</p></article></div><p class="source-note">Design takeaways · Post-release outcomes pending verification.</p>' ;outro.before(conclusion);

// Reference-led components. Dedicated class names isolate them from legacy card rules.
const challenge=root.querySelector('#d-section-3 .grid.two:not(.collaboration)');
challenge.className='challenge-pair';challenge.querySelectorAll('.paper-card').forEach(card=>{card.className='challenge-panel'});
const storyboard=journey.querySelector('.journey');storyboard.className='storyboard';
// Keep the supplied source artwork and icon assets, restoring their Figma proportions.
journeyRows.forEach(row=>{row.className='storyboard-row';row.querySelector('.chapter-number').className='storyboard-number';row.querySelector('.journey-story').className='storyboard-art';row.querySelector('.journey-actions').className='storyboard-actions';row.querySelector('.action-tiles').className='storyboard-steps';row.querySelector('.journey-question').className='storyboard-question';});
const milestoneBlock=document.createElement('section');milestoneBlock.className='milestone-explainer';milestoneBlock.setAttribute('aria-labelledby','milestone-heading');
const milestoneData=[['credit-card.svg','PAYMENT','Payment received','Confirms the amount due today has been received.'],['settings.svg','REPAYMENT','Repayment setup complete','Confirms authorisation for future EMI collections.'],['file-search.svg','APPLICATION','Application approved','Confirms approval after the application assessment.']];
milestoneBlock.innerHTML='<div class="milestone-heading"><div><span class="small-label">THE JOURNEY / KEY DISTINCTIONS</span><h3 id="milestone-heading">Payment is a milestone.<br>There’s more to complete.</h3><p>Keep payment, repayment authorisation and application approval distinct.</p></div><p class="handwritten">What happens<br>after I pay?</p></div><div class="milestone-cards">'+milestoneData.map(d=>`<article><img src="assets/${d[0]}" alt="" width="40" height="40"><span class="small-label">${d[1]}</span><h4>${d[2]}</h4><p>${d[3]}</p></article>`).join('')+'</div><p class="milestone-footnote">Each milestone needs its own confirmation. Payment alone does not establish approval.</p>';
caption.replaceWith(milestoneBlock);milestone.remove();
const branch=journey.querySelector('.journey-applicant-branch');branch.className='milestone-recovery';branch.innerHTML='<div><h4>If an application cannot proceed</h4><p>Another eligible parent, guardian or student may apply using their own details and applicable checks.</p><small>Eligibility and approval are assessed separately.</small></div><a class="comic-btn" href="#d-checks">Explore applicant routes <span aria-hidden="true">↗</span></a>';
milestoneBlock.append(branch,quick);quick.className='milestone-nav';quick.querySelector('span').textContent='EXPLORE THE FOUR CHAPTERS';
routes.className='applicant-alternatives';routes.innerHTML='<div class="alternative-heading"><span class="small-label">APPLICANT CHANGE / ILLUSTRATIVE SCENARIO</span><h3 id="applicant-route-title">A different applicant.<br>A new assessment.</h3><p>If an application cannot proceed, another eligible applicant may be considered.</p></div><div class="alternative-cards"><article><div class="alternative-copy"><span class="small-label">01 / PARENT OR GUARDIAN</span><h4>Another eligible parent or guardian applies</h4><p>For example, the father applies with his own applicant, income and verification details.</p></div><div class="applicant-portrait guardian" aria-hidden="true"></div><p class="alternative-note">Details belong to the new applicant</p></article><article><div class="alternative-copy"><span class="small-label">02 / STUDENT</span><h4>The student applies for themselves</h4><p>Where eligible, the student uses “I am the Student” and completes the applicable checks.</p></div><div class="applicant-portrait student" aria-hidden="true"></div><p class="alternative-note">Eligibility must be confirmed</p></article></div><p class="alternative-footer"><strong>Both options require applicant details and applicable checks.</strong><br>Changing the applicant does not guarantee approval.</p>';
// Remove only the duplicated applicant explanation; the two audience contexts remain.
root.querySelector('#d-checks>.chapter-inner>.grid.two .reasons .reason:last-child')?.remove();
for(const id of ['d-pay','d-section-14']){
 const pair=root.querySelector('#'+id+' .screen-pair');pair.className='reference-screen-pair';
 pair.querySelectorAll('.paired-screen').forEach(card=>{card.className='reference-screen';const evidence=card.querySelector('.evidence');evidence.classList.add('reference-evidence');});
}
const response=root.querySelector('#d-section-15');response.querySelector('h2').innerHTML='CLEARER CHOICES.<br>CLEARER NEXT STEPS.';response.querySelector('.intro').textContent='Three interface decisions that make cost, commitment and progress easier to understand.';
const responseGrid=response.querySelector('.decision-summary');responseGrid.className='response-panels';
const responses=[['COMPARE','Which plan works for me?','Compare the commitment','Keep monthly amount and duration together, with consistent placement across plans.','Monthly amount','Duration','Can parents explain total cost and fees?'],['PAYMENT','What do I pay today?','Make today’s cost visible','Show payable today beside payment methods, then explain how it relates to future EMIs.','Today','Future EMIs','Can parents distinguish the two payments?'],['STATUS','Am I actually done?','Separate action from review','Distinguish payment, repayment setup and application review. Make the next action explicit.','Your action','Under review','Can parents identify whose turn it is?']];
responseGrid.innerHTML=responses.map((d,i)=>`<article><span class="small-label">0${i+1} / ${d[0]}</span><p class="response-question">“${d[1]}”</p><h3>${d[2]}</h3><p>${d[3]}</p><div class="response-diagram" aria-label="${d[4]} and ${d[5]}"><div><strong>${d[4]}</strong><i></i><i></i></div><div><strong>${d[5]}</strong><i></i><i></i></div></div><p class="response-check">Check next: ${d[6]}</p></article>`).join('');
const responseNote=document.createElement('p');responseNote.className='response-takeaway';responseNote.innerHTML='<strong>A completed payment is one milestone in the application.</strong><br>Design intent · Outcomes still to be validated.';responseGrid.after(responseNote);
// A single personal closing principle instead of another repeated summary grid.
conclusion.className='closing-principle';conclusion.innerHTML='<span class="small-label">MY DESIGN PRINCIPLE</span><h3>Make the commitment clear.<br>Then make the next action obvious.</h3><p>Payment, repayment setup and approval each need their own explanation.</p>';
outro.className='next-issue';outro.innerHTML='<a class="issue-primary" href="../guardian-one/" aria-label="Explore Guardian One case study"><div class="issue-book" aria-hidden="true"><span class="issue-page page-back"></span><span class="issue-page page-middle"></span><span class="issue-inside"><b>NEXT ISSUE</b><strong>GUARDIAN<br>ONE</strong><span>Explore the next case study ↗</span></span><img class="issue-front" src="../../images/case-guardian-one.png" alt="" width="600" height="800" loading="lazy"></div><div class="issue-copy"><span class="small-label">UP NEXT / CASE STUDY</span><h3>GUARDIAN<br>ONE.</h3><p>Explore the next case study.</p><span class="issue-cta">Explore Guardian One <b aria-hidden="true">↗</b></span><span class="issue-annotation" aria-hidden="true">Turn the page.<svg viewBox="0 0 100 60"><path d="M90 5 Q85 43 12 45 M12 45 L29 31 M12 45 L31 55"/></svg></span></div></a><a class="issue-back" href="../../index.html#case-studies">Back to all work ↗</a>';
// Targeted desktop refinements.
routes.querySelector('h3').innerHTML='Another applicant.<br>A separate assessment.';
routes.querySelector('.alternative-heading p').textContent='If one applicant cannot proceed, another eligible family member may apply using their own details.';
const alternatives=routes.querySelectorAll('.alternative-cards article');
alternatives[0].querySelector('.small-label').textContent='PARENT OR GUARDIAN';alternatives[0].querySelector('h4').textContent='Another parent or guardian';alternatives[0].querySelector('.alternative-copy p').textContent='For example, if a mother’s application cannot proceed, the father may apply using his own details.';
alternatives[1].querySelector('.small-label').textContent='STUDENT';alternatives[1].querySelector('h4').textContent='The student themselves';alternatives[1].querySelector('.alternative-copy p').textContent='Where eligible, the student can apply and complete the applicable checks.';
routes.querySelectorAll('.alternative-note').forEach(n=>n.remove());routes.querySelector('.alternative-footer').textContent='Each applicant completes their own applicable checks. Changing applicants does not guarantee approval.';
const evidenceLinks=['#d-section-6','#d-section-11','#d-section-14'];const evidenceLabels=['See plan comparison','See payment screens','See setup and status'];
responseGrid.querySelectorAll('article').forEach((card,i)=>{card.querySelectorAll('.response-question,.response-diagram,.response-check').forEach(n=>n.remove());const a=document.createElement('a');a.href=evidenceLinks[i];a.className='response-link';a.textContent=evidenceLabels[i]+' ↗';card.append(a)});
outro.querySelector('.issue-back').remove();outro.querySelector('.issue-annotation').remove();outro.querySelector('.issue-copy>p').textContent='Explore the next chapter in family protection.';
const cover=outro.querySelector('.issue-front');const coverArt=document.createElement('div');coverArt.className='issue-front issue-custom-cover';coverArt.innerHTML='<span>NEXT ISSUE / PRODUCT DESIGN</span><strong>GUARDIAN<br>ONE.</strong><span class="issue-shield" aria-hidden="true">✦</span><em>A clearer picture of family protection.</em>';cover.replaceWith(coverArt);
const planNav=document.querySelector('.desktop-nav a[href="#d-choose"]');if(planNav)planNav.textContent='Choose';
// Desktop polish: keep each evidence disclosure in sync.
const notes=[...root.querySelectorAll('#d-section-2 .design-note')];let syncingNotes=false;notes.forEach(note=>note.addEventListener('toggle',()=>{if(syncingNotes)return;syncingNotes=true;notes.forEach(other=>{if(other!==note&&other.open!==note.open)other.open=note.open});queueMicrotask(()=>{syncingNotes=false})}));
const replacementCover=outro.querySelector('.issue-custom-cover');replacementCover.outerHTML='<img class="issue-front" src="../../images/case-guardian-one.png" alt="Guardian One case study cover" width="600" height="800" loading="lazy">';
const torn=document.createElement('div');torn.className='hero-torn-edge';torn.setAttribute('aria-hidden','true');opening.prepend(torn);
const revealIssue=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){outro.classList.add('issue-visible');revealIssue.disconnect()}},{threshold:.15});observers.push(revealIssue);revealIssue.observe(outro);

journey.querySelector('h2').textContent='FOUR CHAPTERS. ONE APPLICATION.';
journey.querySelector('.chapter-tag').textContent='THE JOURNEY';
journey.querySelector('.journey-intro').textContent='A quick map of the parent’s journey. Explore a chapter to see the decisions and product evidence.';
const chapterMap=document.createElement('nav');chapterMap.className='chapter-map';chapterMap.setAttribute('aria-label','Four chapters of the application');
const mapData=[['Choose a plan','Verify contact, confirm fees and compare the commitment.','choose','#d-choose'],['Complete checks','Identify the applicant and explain the applicable checks.','checks','#d-checks'],['Review & pay','Confirm details and understand the amount due today.','review','#d-pay'],['Set up & track','Authorise repayments and understand the next action.','track','#d-section-13']];
chapterMap.innerHTML=mapData.map((d,i)=>`<a href="${d[3]}"><span class="small-label">CHAPTER 0${i+1} <b aria-hidden="true">↗</b></span><img src="assets/journey-${d[2]}@3x.webp" alt="" width="260" height="130"><h3>${d[0]}</h3><p>${d[1]}</p></a>`).join('');storyboard.replaceWith(chapterMap);

// Intro is a non-blocking reveal, never a timed loading gate.
if(!location.hash){play(scene,[{opacity:.55,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0)'}],{duration:750,easing:'cubic-bezier(.2,.7,.3,1)'});play(hero.querySelector('h1'),[{opacity:.6,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:600,easing:'cubic-bezier(.2,.7,.3,1)'});}
let pointerFrame=0;
function resetLight(){hero.style.removeProperty('--glow-x');hero.style.removeProperty('--glow-y');}
function pointerMove(e){if(!desktop.matches||reduced.matches||e.pointerType!=='mouse'||pointerFrame)return;pointerFrame=requestAnimationFrame(()=>{pointerFrame=0;const rect=hero.getBoundingClientRect();hero.style.setProperty('--glow-x',`${(e.clientX-rect.left)/rect.width*100}%`);hero.style.setProperty('--glow-y',`${(e.clientY-rect.top)/rect.height*100}%`);});}
hero.addEventListener('pointermove',pointerMove,{passive:true});hero.addEventListener('pointerleave',resetLight);
// A quiet, cursor-following pool of light ties the next issue to the hero.
let footerFrame=0;
outro.addEventListener('pointermove',e=>{if(!desktop.matches||reduced.matches||e.pointerType!=='mouse'||footerFrame)return;const x=e.clientX,y=e.clientY;footerFrame=requestAnimationFrame(()=>{footerFrame=0;const rect=outro.getBoundingClientRect();outro.style.setProperty('--footer-x',`${(x-rect.left)/rect.width*100}%`);outro.style.setProperty('--footer-y',`${(y-rect.top)/rect.height*100}%`);});},{passive:true});
outro.addEventListener('pointerleave',()=>{cancelAnimationFrame(footerFrame);footerFrame=0;outro.style.removeProperty('--footer-x');outro.style.removeProperty('--footer-y')});

function stopMotion(){activeAnimations.forEach(a=>a.cancel());activeAnimations=[];cancelAnimationFrame(pointerFrame);pointerFrame=0;resetLight();}
reduced.addEventListener('change',()=>{if(reduced.matches)stopMotion()});desktop.addEventListener('change',()=>{if(!desktop.matches)stopMotion()});
addEventListener('pagehide',()=>{stopMotion();observers.forEach(o=>o.disconnect())});
addEventListener('pageshow',e=>{if(e.persisted){journeyRows.forEach(row=>rowObserver.observe(row));root.querySelectorAll('.cinema-chapter:not(.scene-entered),.parent-question:not(.scene-entered),.narrator:not(.scene-entered),.comic-outro:not(.scene-entered)').forEach(el=>enter.observe(el));}});

}
build();desktop.addEventListener('change',build);
})();
