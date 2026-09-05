(function(){
  "use strict";

  var root=document.documentElement;
  var body=document.body;
  var loader=document.querySelector(".scene1-loader");
  var header=document.querySelector(".site-header");
  var rail=document.querySelector(".cs-topbar");
  var shell=document.querySelector(".cs-stage-shell");
  var started=performance.now();
  var initialHash=location.hash;
  var wantsSceneOne=!initialHash || initialHash==="#scene-1";
  var scene=null;
  var next=null;
  var bound=false;
  var queued=false;

  function reducedMotion(){
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isDesktop(){
    return matchMedia("(min-width:900px)").matches;
  }

  function isSceneOne(){
    return body.classList.contains("cs-scene-1");
  }

  /* Scene 01 owns its own geometry so reader.js/fullscreen-shell.js cannot
     leave a stale scale + shell width pair and crop half the artboard. */
  function fitSceneOne(){
    if(!isDesktop() || !isSceneOne()) return;

    var navRect=header ? header.getBoundingClientRect() : {bottom:66};
    var railRect=rail ? rail.getBoundingClientRect() : {bottom:(navRect.bottom||66)+38};
    var sceneTop=Math.ceil(Math.max(navRect.bottom||66,railRect.bottom||104)+12);
    var availableWidth=Math.max(640,innerWidth-80);
    var availableHeight=Math.max(320,innerHeight-sceneTop);
    var scale=Math.min(1,availableWidth/1440,availableHeight/700);
    var stageW=1440*scale;
    var stageH=700*scale;

    root.style.setProperty("--scene1-stage-top",sceneTop+"px");
    root.style.setProperty("--scene1-scale",scale.toFixed(5));
    root.style.setProperty("--scene1-stage-w",stageW.toFixed(2)+"px");
    root.style.setProperty("--scene1-stage-h",stageH.toFixed(2)+"px");

    if(shell){
      shell.style.width=stageW.toFixed(2)+"px";
      shell.style.height=stageH.toFixed(2)+"px";
    }

    if(window.scrollX || window.scrollY) window.scrollTo(0,0);
  }

  function queueFit(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(function(){
      queued=false;
      fitSceneOne();
    });
  }

  function playEntrance(){
    if(!scene || !scene.classList.contains("is-current")) return;
    body.classList.remove("scene1-enter");
    void scene.offsetWidth;
    requestAnimationFrame(function(){ body.classList.add("scene1-enter"); });
  }

  function bindReveal(){
    if(!scene || scene.dataset.revealBound==="true") return;
    scene.dataset.revealBound="true";

    scene.addEventListener("pointermove",function(e){
      if(!isDesktop() || (e.pointerType && e.pointerType!=="mouse"))return;
      var rect=scene.getBoundingClientRect();
      if(!rect.width || !rect.height)return;
      var x=(e.clientX-rect.left)*(1440/rect.width);
      var y=(e.clientY-rect.top)*(700/rect.height);
      scene.style.setProperty("--reveal-x",x.toFixed(1)+"px");
      scene.style.setProperty("--reveal-y",y.toFixed(1)+"px");
      scene.classList.add("is-revealing");
    });

    scene.addEventListener("pointerleave",function(){
      scene.classList.remove("is-revealing");
    });
  }

  function bindSceneOne(){
    scene=document.querySelector("#scene-1");
    if(!scene)return false;

    bindReveal();

    if(!bound){
      next=scene.querySelector(".scene1-key--next");
      if(next){
        next.addEventListener("click",function(e){
          e.preventDefault();
          e.stopPropagation();
          next.classList.add("is-pressing");
          window.setTimeout(function(){
            next.classList.remove("is-pressing");
            location.hash="#scene-2";
          },reducedMotion()?0:95);
        });
      }
      bound=true;
    }
    return true;
  }

  function revealInitial(){
    if(!wantsSceneOne || !document.querySelector("#scene-1.is-current"))return false;
    bindSceneOne();
    fitSceneOne();

    var elapsed=performance.now()-started;
    var minimum=reducedMotion()?0:820;
    var wait=Math.max(0,minimum-elapsed);

    window.setTimeout(function(){
      body.classList.remove("scene1-boot");
      body.classList.add("scene1-ready");

      if(loader){
        loader.classList.add("is-leaving");
        window.setTimeout(function(){ loader.hidden=true; },reducedMotion()?0:350);
      }

      /* Start after the loader has begun opening, so the entrance isn't hidden. */
      window.setTimeout(playEntrance,reducedMotion()?0:120);
    },wait);
    return true;
  }

  if(!wantsSceneOne){
    body.classList.remove("scene1-boot");
    body.classList.add("scene1-ready");
    if(loader)loader.hidden=true;
  }

  var observer=new MutationObserver(function(){
    bindSceneOne();
    queueFit();
    if(wantsSceneOne && revealInitial()) observer.disconnect();
  });
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});

  bindSceneOne();
  queueFit();
  if(wantsSceneOne)revealInitial();

  addEventListener("resize",queueFit,{passive:true});
  addEventListener("orientationchange",queueFit,{passive:true});
  if(document.fonts && document.fonts.ready)document.fonts.ready.then(queueFit);

  addEventListener("hashchange",function(){
    window.setTimeout(function(){
      bindSceneOne();
      queueFit();
      if(isSceneOne()) playEntrance();
    },0);
  });

  /* Reassert after asynchronous slide injection + shared shell mutation. */
  setTimeout(queueFit,0);
  setTimeout(queueFit,80);
  setTimeout(queueFit,240);
})();