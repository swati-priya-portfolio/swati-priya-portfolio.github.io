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
    var bottomSafe=10;
    var railTop=navBottom+10;
    var usableW=Math.min(1440,Math.max(720,innerWidth-80));
    var sceneTop,scale;

    if(body.classList.contains("cs-scene-1")){
      /* Scene 01 defines the web rail spacing: 10px below the portfolio nav. */
      scale=1;
      sceneTop=railTop+24+8;
    }else{
      /* Keep that exact rail Y for every scene, but preserve the native Figma
         relationship between each frame's own header and content. Most scenes
         use y=40; Scene 13's Figma header is y=26. */
      var nativeRailY=body.classList.contains("cs-scene-13") ? 26 : 40;
      var provisionalTop=railTop-nativeRailY;
      var usableH=Math.max(320,innerHeight-provisionalTop-bottomSafe);
      scale=Math.min(1,usableW/1440,usableH/700);
      sceneTop=railTop-(nativeRailY*scale);
    }

    var stageW=1440*scale;
    var stageH=700*scale;

    root.style.setProperty("--cs-head",navBottom+"px");
    root.style.setProperty("--cs-rail-top",railTop.toFixed(2)+"px");
    root.style.setProperty("--cs-scene-top",sceneTop.toFixed(2)+"px");
    root.style.setProperty("--cs-scale",scale.toFixed(4));
    root.style.setProperty("--cs-stage-w",stageW.toFixed(2)+"px");
    root.style.setProperty("--cs-stage-h",stageH.toFixed(2)+"px");
    root.style.setProperty("--cs-bar",Math.min(1320,Math.max(720,innerWidth-100)).toFixed(2)+"px");

    if(shell){
      if(body.classList.contains("cs-scene-1")){
        shell.style.width="";
        shell.style.height="";
      }else{
        shell.style.width=stageW.toFixed(2)+"px";
        shell.style.height=stageH.toFixed(2)+"px";
      }
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
