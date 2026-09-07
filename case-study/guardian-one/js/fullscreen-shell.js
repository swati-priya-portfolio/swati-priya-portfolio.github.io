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
    var sceneTop,railTop,usableH,scale;

    if(body.classList.contains("cs-scene-1")){
      /* Cover remains browser-native. Keep its rail close to the compact nav
         without forcing the cover itself into the 1440×700 scaler. */
      railTop=navBottom+10;
      sceneTop=railTop+24+8;
      scale=1;
      root.style.removeProperty("--cs-bar");
    }else{
      /* Scenes 02–14 now share ONE presentation model. The 1440×700 Figma
         frames place their rail at native y≈40, so the shared web rail is
         overlaid at that same scaled position for every scene. This removes
         the old 02/03/04/09 exception and keeps rail → headline spacing stable. */
      sceneTop=navBottom+8;
      usableH=Math.max(320,innerHeight-sceneTop-bottomSafe);
      scale=Math.min(1,usableW/1440,usableH/700);
      railTop=sceneTop+(40*scale);
      root.style.setProperty("--cs-bar",Math.min(1340*scale,Math.max(720,innerWidth-100)).toFixed(2)+"px");
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
