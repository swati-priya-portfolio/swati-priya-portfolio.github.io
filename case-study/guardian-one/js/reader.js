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
  var next=document.querySelector(".cs-upnext");
  var nextName=document.querySelector(".cs-upnext-name");
  var current=0, scenes=[], busy=false, startX=0;

  function fit(){
    var header=document.querySelector(".site-header");
    var head=header ? Math.ceil(header.getBoundingClientRect().height) : 86;
    var mobile=matchMedia("(max-width: 899px)").matches;
    document.body.classList.toggle("is-flow",mobile);
    document.documentElement.style.setProperty("--cs-head",head+"px");
    if(mobile){document.documentElement.style.setProperty("--cs-scale","1");return;}
    var roomW=Math.max(320,innerWidth-28);
    var roomH=Math.max(280,innerHeight-head-74);
    /* Let the fixed Figma frame grow on large monitors as well as shrink on
       laptops. The height and width ratios remain hard limits, so no scene
       can be clipped; 1.24 is simply an optical ceiling for readable type. */
    var scale=Math.min(1.24,roomW/1440,roomH/700);
    document.documentElement.style.setProperty("--cs-scale",scale.toFixed(4));
    document.documentElement.style.setProperty("--cs-bar",Math.min(1340,roomW/scale)+"px");
  }

  function indexFromHash(){
    var m=location.hash.match(/^#scene-(\d+)$/);
    return m ? Math.max(0,Math.min(manifests.length-1,Number(m[1])-1)) : 0;
  }

  function show(index,opts){
    if(!scenes.length)return;
    index=Math.max(0,Math.min(scenes.length-1,index));
    reader.classList.toggle("is-reversing",index<current);
    scenes.forEach(function(scene,i){
      var active=i===index;
      scene.classList.toggle("is-current",active);
      if(document.body.classList.contains("is-flow")){
        /* Mobile is one continuous document: every scene is visible and must
           remain available to assistive technology as the reader scrolls. */
        scene.setAttribute("aria-hidden","false");
        scene.removeAttribute("tabindex");
      }else{
        scene.setAttribute("aria-hidden",active?"false":"true");
        scene.tabIndex=active?0:-1;
      }
    });
    current=index;
    document.body.classList.toggle("is-overview",index===0);
    var scene=scenes[index], section=scene.dataset.section || manifests[index][1];
    crumb.innerHTML="Case study · <b>Guardian One</b> · "+section;
    count.textContent="Scene "+String(index+1).padStart(2,"0")+" / "+String(scenes.length).padStart(2,"0");
    fill.style.setProperty("--cs-progress",(index+1)/scenes.length);
    next.hidden=index===scenes.length-1 || scene.hasAttribute("data-no-upnext");
    nextName.textContent=scene.dataset.next || (manifests[index+1]&&manifests[index+1][1]) || "";
    if(!opts || !opts.fromHash) history.replaceState(null,"","#scene-"+(index+1));
    if((!opts || !opts.silent) && !document.body.classList.contains("is-flow")){
      window.setTimeout(function(){scene.focus({preventScroll:true});},80);
    }
  }

  function init(){
    scenes=Array.from(stage.querySelectorAll(".cs-scene"));
    fit(); show(indexFromHash(),{fromHash:true,silent:true});
    next.addEventListener("click",function(){show(current+1);});
    addEventListener("resize",fit,{passive:true});
    addEventListener("hashchange",function(){show(indexFromHash(),{fromHash:true,silent:true});});
    addEventListener("keydown",function(e){
      if(document.body.classList.contains("is-flow"))return;
      if(["ArrowRight","ArrowDown","PageDown"," "].includes(e.key)){e.preventDefault();show(current+1);}
      if(["ArrowLeft","ArrowUp","PageUp"].includes(e.key)){e.preventDefault();show(current-1);}
      if(e.key==="Home"){e.preventDefault();show(0);}
      if(e.key==="End"){e.preventDefault();show(scenes.length-1);}
    });
    stage.addEventListener("pointerdown",function(e){startX=e.clientX;});
    stage.addEventListener("pointerup",function(e){
      var dx=e.clientX-startX; if(Math.abs(dx)>70)show(current+(dx<0?1:-1));
    });
  }

  Promise.all(manifests.map(function(item){
    return fetch("slides/"+item[0]+"?v=12").then(function(r){if(!r.ok)throw new Error(item[0]);return r.text();});
  })).then(function(parts){
    stage.querySelector(".cs-loading").remove();
    next.insertAdjacentHTML("beforebegin",parts.join("\n"));
    init();
  }).catch(function(err){
    stage.innerHTML='<div class="cs-load-error"><strong>The story could not load.</strong><br>Refresh the page or open it from the published site.</div>';
    console.error(err);
  });
})();
