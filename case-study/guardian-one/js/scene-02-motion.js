(function(){
  "use strict";

  var scene=null;
  var bound=false;
  var observer=null;

  function nodes(sel){return Array.prototype.slice.call(scene.querySelectorAll(sel));}
  function addClass(list,cls){list.forEach(function(n){if(n)n.classList.add(cls);});}
  function removeClass(list,cls){list.forEach(function(n){if(n)n.classList.remove(cls);});}

  function setup(){
    scene=document.querySelector("#scene-2");
    if(!scene || bound)return !!scene;

    var labels=nodes(".who-label");
    var parentLabels=labels.filter(function(n){return n.textContent.trim().toLowerCase()==="parent";});
    var designLabels=labels.filter(function(n){return n.textContent.trim().toLowerCase()==="design";});
    var parentAv=nodes(".av-parent");
    var designAv=nodes(".av-design");
    var parentBub=nodes(".bub-parent");
    var designBub=nodes(".bub-design");
    var verdict=scene.querySelector(".verdict");
    var portrait=scene.querySelector(".portrait");

    var parents=[0,1,2].map(function(i){return [parentLabels[i],parentAv[i],parentBub[i]].filter(Boolean);});
    var designs=[0,1].map(function(i){return [designLabels[i],designAv[i],designBub[i]].filter(Boolean);});
    var all=[];
    parents.forEach(function(g){all=all.concat(g)});
    designs.forEach(function(g){all=all.concat(g)});
    if(verdict)all.push(verdict);
    addClass(all,"scene2-pair-node");

    parents.forEach(function(group,i){addClass(group,"scene2-parent-"+(i+1));});
    designs.forEach(function(group,i){addClass(group,"scene2-design-"+(i+1));});

    function clear(){
      scene.classList.remove("scene2-pairing");
      removeClass(all,"scene2-pair-active");
    }

    function activate(i){
      clear();
      scene.classList.add("scene2-pairing");
      addClass(parents[i]||[],"scene2-pair-active");
      if(i<2)addClass(designs[i]||[],"scene2-pair-active");
      else if(verdict)verdict.classList.add("scene2-pair-active");
    }

    parents.forEach(function(group,i){
      group.forEach(function(el){
        el.addEventListener("mouseenter",function(){activate(i)});
        el.addEventListener("mouseleave",clear);
      });
    });
    designs.forEach(function(group,i){
      group.forEach(function(el){
        el.addEventListener("mouseenter",function(){activate(i)});
        el.addEventListener("mouseleave",clear);
      });
    });
    if(verdict){
      verdict.addEventListener("mouseenter",function(){activate(2)});
      verdict.addEventListener("mouseleave",clear);
    }

    if(portrait){
      portrait.addEventListener("mouseenter",function(){scene.classList.add("scene2-portrait-hover")});
      portrait.addEventListener("mouseleave",function(){scene.classList.remove("scene2-portrait-hover")});
    }

    bound=true;
    return true;
  }

  function play(){
    if(!setup() || !scene.classList.contains("is-current"))return;
    scene.classList.remove("scene2-motion-ready");
    void scene.offsetWidth;
    requestAnimationFrame(function(){scene.classList.add("scene2-motion-ready")});
  }

  function check(){
    setup();
    if(scene && scene.classList.contains("is-current") && !scene.classList.contains("scene2-motion-ready"))play();
  }

  observer=new MutationObserver(check);
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
  addEventListener("hashchange",function(){setTimeout(play,0)});
  setTimeout(check,0);
  setTimeout(check,120);
})();
