(function(){
  "use strict";

  var body=document.body;
  var loader=document.querySelector(".scene1-loader");
  var started=performance.now();
  var initialHash=location.hash;
  var wantsSceneOne=!initialHash || initialHash==="#scene-1";
  var bound=false;

  function reducedMotion(){
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function bindSceneOne(){
    if(bound)return true;
    var scene=document.querySelector("#scene-1");
    if(!scene)return false;

    var next=scene.querySelector(".scene1-key--next");
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
    return true;
  }

  function reveal(){
    if(!document.querySelector("#scene-1.is-current"))return false;
    bindSceneOne();

    var elapsed=performance.now()-started;
    var minimum=reducedMotion()?0:720;
    var wait=Math.max(0,minimum-elapsed);

    window.setTimeout(function(){
      body.classList.remove("scene1-boot");
      body.classList.add("scene1-ready","scene1-enter");
      if(loader){
        loader.classList.add("is-leaving");
        window.setTimeout(function(){ loader.hidden=true; },reducedMotion()?0:330);
      }
    },wait);
    return true;
  }

  if(!wantsSceneOne){
    body.classList.remove("scene1-boot");
    body.classList.add("scene1-ready","scene1-enter");
    if(loader)loader.hidden=true;
  }

  var observer=new MutationObserver(function(){
    bindSceneOne();
    if(wantsSceneOne && reveal()) observer.disconnect();
  });

  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
  bindSceneOne();
  if(wantsSceneOne) reveal();

  addEventListener("hashchange",function(){
    window.setTimeout(function(){
      bindSceneOne();
      if(body.classList.contains("cs-scene-1")){
        body.classList.add("scene1-enter");
      }
    },0);
  });
})();