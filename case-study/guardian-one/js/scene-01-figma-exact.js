(function(){
  "use strict";

  var root=document.documentElement;
  var body=document.body;
  var shell=document.querySelector(".cs-stage-shell");
  var header=document.querySelector(".site-header");
  var queued=false;

  function isDesktop(){ return matchMedia("(min-width:900px)").matches; }
  function isSceneOne(){ return body.classList.contains("cs-scene-1"); }

  function fit(){
    if(!isDesktop() || !isSceneOne()) return;

    body.classList.remove("is-flow");

    var navRect=header ? header.getBoundingClientRect() : {bottom:66};
    var artboardTop=Math.ceil(navRect.bottom || 66)+12;
    var availableWidth=Math.max(720,innerWidth-80);
    var availableHeight=Math.max(320,innerHeight-artboardTop);
    var scale=Math.min(1,availableWidth/1440,availableHeight/700);
    var w=1440*scale;
    var h=700*scale;

    root.style.setProperty("--scene1-exact-top",artboardTop+"px");
    root.style.setProperty("--scene1-exact-scale",scale.toFixed(5));
    root.style.setProperty("--scene1-exact-w",w.toFixed(2)+"px");
    root.style.setProperty("--scene1-exact-h",h.toFixed(2)+"px");

    if(shell){
      shell.style.width=w.toFixed(2)+"px";
      shell.style.height=h.toFixed(2)+"px";
    }

    if(window.scrollX || window.scrollY) window.scrollTo(0,0);
  }

  function queueFit(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(function(){
      queued=false;
      fit();
    });
  }

  var observer=new MutationObserver(queueFit);
  observer.observe(body,{attributes:true,attributeFilter:["class"],childList:true,subtree:true});

  addEventListener("resize",queueFit,{passive:true});
  addEventListener("orientationchange",queueFit,{passive:true});
  addEventListener("hashchange",queueFit,{passive:true});
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(queueFit);

  queueFit();
  setTimeout(queueFit,0);
  setTimeout(queueFit,80);
  setTimeout(queueFit,240);
})();
