(function(){
  "use strict";

  var root=document.documentElement;
  var body=document.body;
  var shell=document.querySelector(".cs-stage-shell");
  var header=document.querySelector(".site-header");

  function isDesktop(){ return matchMedia("(min-width:900px)").matches; }

  function rewriteBreakpoints(){
    function walk(rules){
      Array.from(rules||[]).forEach(function(rule){
        if(rule.media && typeof rule.media.mediaText==="string"){
          var before=rule.media.mediaText;
          var after=before
            .replace(/max-width\s*:\s*1280px/gi,"max-width: 899px")
            .replace(/min-width\s*:\s*1281px/gi,"min-width: 900px");
          if(after!==before){
            try{ rule.media.mediaText=after; }catch(_e){}
          }
        }
        if(rule.cssRules){
          try{ walk(rule.cssRules); }catch(_e){}
        }
      });
    }
    Array.from(document.styleSheets).forEach(function(sheet){
      try{ walk(sheet.cssRules); }catch(_e){}
    });
  }

  function fitDesktop(){
    if(!isDesktop()){
      root.style.removeProperty("--cs-rail-top");
      root.style.removeProperty("--cs-scene-top");
      root.style.removeProperty("--cs-stage-w");
      root.style.removeProperty("--cs-stage-h");
      root.style.removeProperty("--cs-bar");
      return;
    }

    body.classList.remove("is-flow");

    var rect=header ? header.getBoundingClientRect() : {bottom:66,height:54};
    var navBottom=Math.ceil(rect.bottom || rect.height || 66);
    var bottomSafe=12;
    var usableW=Math.min(1440,Math.max(720,innerWidth-80));
    var integratedRail=body.classList.contains("cs-scene-2") || body.classList.contains("cs-scene-3") || body.classList.contains("cs-scene-4") || body.classList.contains("cs-scene-6");
    var sceneTop,railTop,usableH,scale;

    if(integratedRail){
      /* Scenes with Figma-integrated metadata keep the case-study rail at the
         original y=40 position inside the 1440×700 composition. */
      sceneTop=navBottom+8;
      usableH=Math.max(320,innerHeight-sceneTop-bottomSafe);
      scale=Math.min(1,usableW/1440,usableH/700);
      railTop=sceneTop+(40*scale);
      root.style.setProperty("--cs-bar",(1340*scale).toFixed(2)+"px");
    }else{
      railTop=navBottom+14;
      sceneTop=railTop+24+12;
      usableH=Math.max(320,innerHeight-sceneTop-bottomSafe);
      scale=Math.min(1,usableW/1440,usableH/700);
      root.style.removeProperty("--cs-bar");
    }

    var stageW=1440*scale;
    var stageH=700*scale;

    root.style.setProperty("--cs-head",navBottom+"px");
    root.style.setProperty("--cs-rail-top",railTop.toFixed(2)+"px");
    root.style.setProperty("--cs-scene-top",sceneTop.toFixed(2)+"px");
    root.style.setProperty("--cs-scale",scale.toFixed(4));
    root.style.setProperty("--cs-stage-w",stageW.toFixed(2)+"px");
    root.style.setProperty("--cs-stage-h",stageH.toFixed(2)+"px");

    if(shell){
      shell.style.width=stageW.toFixed(2)+"px";
      shell.style.height=stageH.toFixed(2)+"px";
    }
  }

  rewriteBreakpoints();
  fitDesktop();

  var queued=false;
  function queueFit(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(function(){
      queued=false;
      fitDesktop();
    });
  }

  var observer=new MutationObserver(queueFit);
  observer.observe(body,{attributes:true,attributeFilter:["class"],childList:true,subtree:true});

  addEventListener("resize",queueFit,{passive:true});
  addEventListener("orientationchange",queueFit,{passive:true});
  addEventListener("hashchange",queueFit,{passive:true});
  document.fonts && document.fonts.ready && document.fonts.ready.then(queueFit);

  setTimeout(queueFit,0);
  setTimeout(queueFit,80);
  setTimeout(queueFit,240);
})();
