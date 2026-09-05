(function () {
  "use strict";
  var manifests = [
    ["01-title.html","Overview"], ["02-meet-priya.html","Meet Priya"],
    ["03-two-sides.html","Two sides"], ["04-decision-matrix.html","Decision matrix"],
    ["05-research.html","Research evidence"], ["06-feature-audit.html","Feature audit"],
    ["07-calculator-questions.html","Calculator questions"], ["08-calculator-result.html","Calculator result"],
    ["09-compare-flow.html","Compare flow"], ["10-comparison-table.html","Comparison table"],
    ["11-report-journey.html","Report journey"], ["12-report-anatomy.html","Report anatomy"],
    ["13-launch.html","Launch and measurement"], ["14-reflection.html","Reflection"]
  ];
  var reader=document.querySelector(".cs-reader");
  var stage=document.querySelector(".cs-stage");
  var crumb=document.querySelector(".cs-crumb");
  var count=document.querySelector(".cs-count");
  var fill=document.querySelector(".cs-fill");
  var viewDesign=document.querySelector(".cs-view-design");
  var next=document.querySelector(".cs-upnext");
  var nextName=document.querySelector(".cs-upnext-name");
  var mobilePrev=document.querySelector(".cs-mobile-prev");
  var mobileNext=document.querySelector(".cs-mobile-next");
  var mobilePosition=document.querySelector(".cs-mobile-position");
  var current=0, scenes=[], startX=0;

  function reducedMotion(){
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function fit(){
    var header=document.querySelector(".site-header");
    var responsive=matchMedia("(max-width:1280px)").matches;
    var head=header ? Math.ceil(header.getBoundingClientRect().height) : 82;

    document.body.classList.toggle("is-flow",responsive);
    document.documentElement.style.setProperty("--cs-head",head+"px");
    document.documentElement.style.removeProperty("--cs-topbar-top");

    if(responsive){
      document.documentElement.style.setProperty("--cs-scale","1");
      return;
    }

    /* Browser-first rule: width controls scene scale; height never makes the
       typography smaller. A short viewport simply gets a little vertical
       scrolling below the fixed portfolio navbar and case-study rail. */
    var usable=Math.min(1440,Math.max(960,innerWidth-48));
    var scale=usable/1440;
    document.documentElement.style.setProperty("--cs-scale",scale.toFixed(4));
  }

  function indexFromHash(){
    var m=location.hash.match(/^#scene-(\d+)$/);
    return m ? Math.max(0,Math.min(manifests.length-1,Number(m[1])-1)) : 0;
  }

  function animateCount(){
    if(!count)return;
    count.classList.remove("is-changing");
    void count.offsetWidth;
    count.classList.add("is-changing");
    window.setTimeout(function(){count.classList.remove("is-changing");},240);
  }

  function show(index,opts){
    if(!scenes.length)return;
    index=Math.max(0,Math.min(scenes.length-1,index));
    reader.classList.toggle("is-reversing",index<current);

    scenes.forEach(function(scene,i){
      var active=i===index;
      scene.classList.toggle("is-current",active);
      scene.setAttribute("aria-hidden",active?"false":"true");
      scene.tabIndex=active?0:-1;
    });

    current=index;
    document.body.classList.toggle("is-overview",index===0);
    document.body.classList.toggle("cs-deep",index>0);
    Array.from(document.body.classList).forEach(function(name){
      if(/^cs-scene-\d+$/.test(name)) document.body.classList.remove(name);
    });
    document.body.classList.add("cs-scene-"+(index+1));

    var scene=scenes[index], section=scene.dataset.section || manifests[index][1];
    crumb.innerHTML="Case study · <b>Guardian One</b> · "+section;
    count.textContent="Scene "+String(index+1).padStart(2,"0")+" / "+String(scenes.length).padStart(2,"0");
    animateCount();
    fill.style.setProperty("--cs-progress",(index+1)/scenes.length);

    if(viewDesign){
      var design=scene.dataset.design;
      viewDesign.classList.toggle("is-on",!!design);
      if(design){ viewDesign.href=design; }
    }

    next.hidden=index===scenes.length-1 || scene.hasAttribute("data-no-upnext");
    nextName.textContent=scene.dataset.next || (manifests[index+1]&&manifests[index+1][1]) || "";

    if(mobilePrev){
      mobilePrev.disabled=index===0;
      mobilePrev.setAttribute("aria-label",index===0?"This is the first scene":"Go to previous scene: "+manifests[index-1][1]);
    }
    if(mobileNext){
      mobileNext.disabled=index===scenes.length-1;
      mobileNext.setAttribute("aria-label",index===scenes.length-1?"This is the final scene":"Go to next scene: "+manifests[index+1][1]);
    }
    if(mobilePosition){
      mobilePosition.textContent=String(index+1).padStart(2,"0")+" / "+String(scenes.length).padStart(2,"0");
    }

    if(!opts || !opts.fromHash) history.replaceState(null,"","#scene-"+(index+1));

    if(!opts || !opts.silent){
      if(document.body.classList.contains("is-flow")){
        window.setTimeout(function(){
          scene.scrollIntoView({behavior:reducedMotion()?"auto":"smooth",block:"start"});
        },40);
      }else{
        /* Desktop can be taller than the viewport. When the user advances from
           a slightly scrolled position, return to the start of the new scene
           rather than leaving its heading hidden behind the fixed navbar. */
        if(window.scrollY>12){
          window.scrollTo({top:0,behavior:reducedMotion()?"auto":"smooth"});
        }
        window.setTimeout(function(){scene.focus({preventScroll:true});},80);
      }
    }
  }

  function init(){
    scenes=Array.from(stage.querySelectorAll(".cs-scene"));
    scenes.forEach(function(scene,i){
      scene.dataset.sceneLabel="Scene "+String(i+1).padStart(2,"0")+" / "+String(scenes.length).padStart(2,"0");
    });

    fit();
    show(indexFromHash(),{fromHash:true,silent:true});

    next.addEventListener("click",function(){show(current+1);});
    if(mobilePrev){mobilePrev.addEventListener("click",function(){show(current-1);});}
    if(mobileNext){mobileNext.addEventListener("click",function(){show(current+1);});}

    addEventListener("resize",fit,{passive:true});
    addEventListener("hashchange",function(){show(indexFromHash(),{fromHash:true,silent:true});});

    addEventListener("keydown",function(e){
      if(["ArrowRight","ArrowDown","PageDown"," "].includes(e.key)){e.preventDefault();show(current+1);}
      if(["ArrowLeft","ArrowUp","PageUp"].includes(e.key)){e.preventDefault();show(current-1);}
      if(e.key==="Home"){e.preventDefault();show(0);}
      if(e.key==="End"){e.preventDefault();show(scenes.length-1);}
    });

    stage.addEventListener("click",function(e){
      var stepButton=e.target.closest("[data-step]");
      if(stepButton){
        e.preventDefault();
        show(current+Number(stepButton.dataset.step||0));
      }
    });

    stage.addEventListener("pointerdown",function(e){startX=e.clientX;});
    stage.addEventListener("pointerup",function(e){
      var dx=e.clientX-startX;
      if(Math.abs(dx)>70)show(current+(dx<0?1:-1));
    });
  }

  Promise.all(manifests.map(function(item){
    return fetch("slides/"+item[0]+"?v=16").then(function(r){if(!r.ok)throw new Error(item[0]);return r.text();});
  })).then(function(parts){
    stage.querySelector(".cs-loading").remove();
    next.insertAdjacentHTML("beforebegin",parts.join("\n"));
    init();
  }).catch(function(err){
    stage.innerHTML='<div class="cs-load-error"><strong>The story could not load.</strong><br>Refresh the page or open it from the published site.</div>';
    console.error(err);
  });
})();
