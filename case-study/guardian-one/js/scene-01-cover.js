(function(){
  "use strict";

  var body=document.body;
  var loader=document.querySelector(".scene1-loader");
  var started=performance.now();
  var initialHash=location.hash;
  var wantsSceneOne=!initialHash || initialHash==="#scene-1";
  var revealBound=false;

  function reducedMotion(){
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function syncChrome(){
    if(!body.classList.contains("cs-scene-1"))return;
    var header=document.querySelector(".site-header");
    var height=header?Math.ceil(header.getBoundingClientRect().height):78;
    document.documentElement.style.setProperty("--scene1-head",height+"px");
  }

  function bindReveal(scene){
    if(revealBound || !scene)return;
    revealBound=true;
    var center=scene.querySelector(".scene1-center");
    if(!center)return;

    center.addEventListener("pointermove",function(e){
      if(e.pointerType && e.pointerType!=="mouse")return;
      var rect=scene.getBoundingClientRect();
      scene.style.setProperty("--reveal-x",(e.clientX-rect.left).toFixed(1)+"px");
      scene.style.setProperty("--reveal-y",(e.clientY-rect.top).toFixed(1)+"px");
      var art=scene.querySelector(".scene1-understory");
      if(art){
        art.style.setProperty("--reveal-x",(e.clientX-rect.left).toFixed(1)+"px");
        art.style.setProperty("--reveal-y",(e.clientY-rect.top).toFixed(1)+"px");
      }
      scene.classList.add("is-revealing");
    });

    center.addEventListener("pointerleave",function(){
      scene.classList.remove("is-revealing");
    });
  }

  function releaseLoader(){
    var scene=document.querySelector("#scene-1.is-current");
    if(!scene)return false;

    syncChrome();
    bindReveal(scene);

    var elapsed=performance.now()-started;
    var minimum=reducedMotion()?0:860;
    var wait=Math.max(0,minimum-elapsed);

    window.setTimeout(function(){
      body.classList.remove("scene1-boot");
      body.classList.add("scene1-ready");
      if(loader){
        loader.classList.add("is-leaving");
        window.setTimeout(function(){ loader.hidden=true; },reducedMotion()?0:350);
      }
    },wait);
    return true;
  }

  if(!wantsSceneOne){
    body.classList.remove("scene1-boot");
    if(loader)loader.hidden=true;
  }else{
    body.classList.add("scene1-boot");
    var observer=new MutationObserver(function(){
      if(releaseLoader())observer.disconnect();
    });
    observer.observe(body,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
    releaseLoader();
  }

  addEventListener("resize",function(){
    syncChrome();
  },{passive:true});

  addEventListener("hashchange",function(){
    window.setTimeout(function(){
      syncChrome();
      if(body.classList.contains("cs-scene-1")){
        bindReveal(document.querySelector("#scene-1"));
      }
    },0);
  });
})();
