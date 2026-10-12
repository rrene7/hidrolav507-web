(()=>{"use strict";
const $=s=>document.querySelector(s);
const get=async p=>{try{const r=await fetch(p,{cache:"no-store"});return r.ok?await r.json():null}catch{return null}};
const valid=s=>typeof s==="string"&&s.startsWith("/assets/")&&!s.includes("..")&&!/[<>\\]/.test(s);
async function initCarousel(){
 const c=await get("/content/carousel.json");const frame=$(".hero-media .frame");
 if(!c?.enabled||!frame||!Array.isArray(c.slides))return;
 const slides=c.slides.filter(x=>valid(x.image));if(!slides.length)return;
 let idx=0,timer;
 const wrapper=document.createElement("div");wrapper.className="hero-carousel";
 const pictures=slides.map((s,i)=>{const im=document.createElement("img");im.src=s.image;im.alt=s.alt||s.caption||"Servicio de hidrolavado";im.className="slide"+(i===0?" active":"");im.loading=i?"lazy":"eager";wrapper.append(im);return im});
 const controls=document.createElement("div");controls.className="slider-controls";
 const label=document.createElement("div");label.className="slider-caption";
 const name=document.createElement("span"),kind=document.createElement("span");label.append(name,kind);
 const dots=document.createElement("div");dots.className="slider-dots";
 function show(n){idx=(n+slides.length)%slides.length;pictures.forEach((im,i)=>im.classList.toggle("active",i===idx));buttons.forEach((b,i)=>b.setAttribute("aria-current",String(i===idx)));name.textContent=slides[idx].caption||"HidroLav 507";kind.textContent=slides[idx].is_real?"Trabajo real":"Imagen ilustrativa"}
 const stop=()=>clearInterval(timer);const start=()=>{stop();if(slides.length>1&&!matchMedia("(prefers-reduced-motion: reduce)").matches)timer=setInterval(()=>{if(!document.hidden)show(idx+1)},Math.max(4,Math.min(15,c.interval_seconds||6))*1000)};
 for(const [symbol,delta,title] of [["‹",-1,"Anterior"],["›",1,"Siguiente"]]){const b=document.createElement("button");b.type="button";b.className="slider-btn";b.textContent=symbol;b.setAttribute("aria-label",title);b.onclick=()=>{show(idx+delta);start()};controls.append(b)}
 const buttons=slides.map((_,i)=>{const b=document.createElement("button");b.type="button";b.setAttribute("aria-label","Ver imagen "+(i+1));b.onclick=()=>{show(i);start()};dots.append(b);return b});
 wrapper.append(controls,dots,label);frame.replaceChildren(wrapper);
 wrapper.addEventListener("mouseenter",stop);wrapper.addEventListener("mouseleave",start);
 wrapper.addEventListener("focusin",stop);wrapper.addEventListener("focusout",e=>{if(!wrapper.contains(e.relatedTarget))start()});
 show(0);start();
}
async function initLoyalty(){
 const c=await get("/content/loyalty.json");if(!c?.enabled)return;
 const tab=document.createElement("button");tab.className="offer-tab";tab.type="button";tab.textContent="★ "+(c.mini_label||"Plan 5+1");tab.setAttribute("aria-expanded","false");
 const panel=document.createElement("aside");panel.id="loyalty-panel";panel.className="offer-panel";panel.hidden=true;
 tab.setAttribute("aria-controls",panel.id);
 const close=document.createElement("button");close.className="panel-close";close.type="button";close.textContent="×";close.setAttribute("aria-label","Cerrar promoción");
 const small=document.createElement("span");small.className="offer-kicker";small.textContent=c.eyebrow||"Cliente frecuente";
 const title=document.createElement("h3");title.textContent=c.headline||"Plan 5+1";
 const desc=document.createElement("p");desc.textContent=c.description||"Consulta los beneficios.";
 const details=document.createElement("details"),summary=document.createElement("summary"),terms=document.createElement("p");
 summary.textContent="Condiciones del plan";terms.textContent=c.terms||"Sujeto a evaluación y acuerdo.";details.append(summary,terms);
 const site=await get("/content/site.json");
 const configured=String(site?.whatsapp||"50762730591").replace(/\\D/g,"");
 const phone=/^507\\d{8}$/.test(configured)?configured:"50762730591";
 const question="Hola HidroLav 507 Panamá. Quiero consultar las condiciones del Plan Cliente Frecuente 5+1 (cinco limpiezas pagadas y la sexta de cortesía). Mi propiedad está en: ";
 const primary=new URL("https://api.whatsapp.com/send");
 primary.searchParams.set("phone",phone);
 primary.searchParams.set("text",question);
 const a=document.createElement("a");a.href=primary.toString();
 a.className="offer-cta";a.target="_blank";a.rel="noopener noreferrer";a.textContent=c.cta||"Consultar por WhatsApp";
 const backup=document.createElement("div");backup.className="offer-backup";
 const help=document.createElement("p");help.textContent="¿No se abre el mensaje?";
 const direct=document.createElement("a");direct.href="https://wa.me/"+phone;
 direct.target="_blank";direct.rel="noopener noreferrer";direct.textContent="Abrir chat directo sin mensaje ↗";
 const number=document.createElement("span");number.textContent="Número: +507 "+phone.slice(3,7)+"-"+phone.slice(7);
 backup.append(help,direct,number);
 panel.append(close,small,title,desc,details,a,backup);
 const actions=document.querySelector(".hero .actions");
 if(!actions)return;
 const slot=document.createElement("div");slot.className="hero-offer-slot";
 slot.setAttribute("aria-label","Programa de fidelidad");
 slot.append(tab,panel);
 actions.insertAdjacentElement("afterend",slot);
 const set=open=>{panel.hidden=!open;tab.setAttribute("aria-expanded",String(open));if(open)close.focus();else tab.focus()};
 tab.onclick=()=>set(panel.hidden);close.onclick=()=>set(false);document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden)set(false)});
}
document.addEventListener("DOMContentLoaded",()=>{initCarousel();initLoyalty()});
})();