(()=>{"use strict";
const main=document.querySelector("main"), nav=document.querySelector("#navlinks");
if(!main||!nav)return;
const ids=["inicio","servicios","nosotros","galeria","resultados","preguntas","cotizar"];
const sections=new Map(ids.map(id=>[id,document.getElementById(id)]).filter(([,el])=>el));
const direct=[...main.children].filter(el=>el.matches("section,aside"));

const selectedFromHash=()=>{
 const id=decodeURIComponent(location.hash.slice(1));
 if(sections.has(id))return id;
 const target=document.getElementById(id);
 return target?.closest("main > section[id]")?.id||"inicio";
};
function activate(id,{focus=false}={}){
 if(!sections.has(id))id="inicio";
 const home=id==="inicio";
 if(!home && !main.querySelector(".panel-home-action")){
  const back=document.createElement("a");back.className="panel-home-action";back.href="#inicio";back.textContent="← Volver al inicio";main.prepend(back);
 }
 const back=main.querySelector(".panel-home-action");if(back)back.hidden=home;
 document.body.classList.toggle("interactive-panel-mode",!home);
 for(const el of direct){
  const show=home||el.id===id||(id==="galeria"&&el.id==="resultados");
  el.classList.toggle("interactive-panel-off",!show);
  if(!home&&show)el.classList.add("interactive-panel-enter");
  else el.classList.remove("interactive-panel-enter");
 }
 nav.querySelectorAll('a[href^="#"]').forEach(a=>{
  const active=a.getAttribute("href")==="#"+id;
  if(active)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");
 });
 const toggle=document.querySelector("#menu-toggle");
 nav.classList.remove("open");
 if(toggle){toggle.setAttribute("aria-expanded","false");toggle.textContent="☰";}
 if(!home){
  const target=sections.get(id);
  if(target){
   main.scrollTop=0;
   if(focus){target.setAttribute("tabindex","-1");target.focus({preventScroll:true});}
  }
 }
}
document.addEventListener("click",event=>{
 const link=event.target.closest('a[href^="#"]');
 if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const href=link.getAttribute("href");
 if(!href||href==="#")return;
 const id=href.slice(1);
 const el=document.getElementById(id);
 if(!el||!main.contains(el))return;
 const panel=el.closest("main > section[id]");
 if(!panel)return;
 event.preventDefault();
 history.pushState(null,"",href);
 activate(panel.id,{focus:true});
 if(panel.id!==id)el.focus?.({preventScroll:true});
});
window.addEventListener("popstate",()=>activate(selectedFromHash()));
window.addEventListener("hashchange",()=>activate(selectedFromHash()));
// Página completa sin JavaScript: SEO, contenidos y enlaces permanecen accesibles.
activate(selectedFromHash());
})();