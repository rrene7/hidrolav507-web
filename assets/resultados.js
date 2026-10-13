/* Resultados reales de HidroLav 507. Nunca inventar pares de fotografías. */
(async()=>{
"use strict";
const section=document.getElementById("resultados");
const grid=document.getElementById("compare-grid");
const empty=document.getElementById("results-empty");
const disclaimer=document.getElementById("results-disclaimer");
const more=document.getElementById("results-load-more");
const counter=document.getElementById("results-count");
const PAGE_SIZE=6;
if(!section||!grid||!empty)return;
function safeAsset(value){
 if(typeof value!=="string"||!value.startsWith("/assets/")||/[<>"'\\?#\u0000-\u001f]/.test(value))return false;
 let decoded;
 try{decoded=decodeURIComponent(value)}catch{return false}
 return !/[<>"'\\\u0000-\u001f]/.test(decoded)&&!decoded.split("/").some(part=>part==="."||part==="..");
}
function build(project,index){
 const card=document.createElement("article");
 card.className="compare-card";
 const visual=document.createElement("div");
 visual.className="compare-visual";
 visual.style.setProperty("--split","50%");
 const before=document.createElement("img");
 before.src=project.before;before.loading="lazy";before.decoding="async";
 before.alt=project.alt_before||"Antes de la limpieza: "+project.title;
 const after=document.createElement("img");
 after.src=project.after;after.loading="lazy";after.decoding="async";
 after.alt=project.alt_after||"Después de la limpieza: "+project.title;
 after.className="compare-after";
 for(const img of [before,after]){img.width=650;img.height=540;img.draggable=false;}
 const split=document.createElement("div");split.className="compare-divider";split.setAttribute("aria-hidden","true");
 const handle=document.createElement("span");handle.className="compare-handle";handle.textContent="↔";split.append(handle);
 const left=document.createElement("span");left.className="compare-label compare-before-label";left.textContent="Antes";
 const right=document.createElement("span");right.className="compare-label compare-after-label";right.textContent="Después";
 const range=document.createElement("input");range.type="range";range.className="compare-range";
 range.min="0";range.max="100";range.step="1";range.value="50";
 range.setAttribute("aria-label","Comparar antes y después: "+project.title);
 function setSplit(nextValue){
  const value=Math.max(0,Math.min(100,Number(nextValue)||0));
  range.value=String(value);
  visual.style.setProperty("--split",value+"%");
  const percentAfter=100-value;
  const description=value===100?"Solo ANTES: superficie sin limpiar":
   value===0?"Solo DESPUÉS: superficie limpia":
   value+"% de ANTES y "+percentAfter+"% de DESPUÉS";
  range.setAttribute("aria-valuetext",description);
 }
 range.addEventListener("input",()=>setSplit(range.value));
 setSplit(50);
 visual.append(before,after,split,left,right,range);
 const quick=document.createElement("div");quick.className="compare-quick-actions";
 const beforeOnly=document.createElement("button");beforeOnly.type="button";
 beforeOnly.className="compare-quick-btn";beforeOnly.textContent="Ver solo Antes";
 beforeOnly.setAttribute("aria-label","Mostrar completamente la superficie antes de limpiar: "+project.title);
 beforeOnly.addEventListener("click",()=>setSplit(100));
 const afterOnly=document.createElement("button");afterOnly.type="button";
 afterOnly.className="compare-quick-btn";afterOnly.textContent="Ver solo Después";
 afterOnly.setAttribute("aria-label","Mostrar completamente la superficie después de limpiar: "+project.title);
 afterOnly.addEventListener("click",()=>setSplit(0));
 quick.append(beforeOnly,afterOnly);
 const content=document.createElement("div");content.className="compare-caption";
 const title=document.createElement("h3");title.textContent=project.title;
 content.append(title);
 if(project.area){const place=document.createElement("span");place.className="compare-area";place.textContent=project.area;content.append(place)}
 if(project.description){const detail=document.createElement("p");detail.textContent=project.description;content.append(detail)}
 content.append(quick);
 const cta=document.createElement("a");cta.className="compare-quote";cta.href="#cotizar";cta.textContent="Cotizar una limpieza similar ↗";
 content.append(cta);
 card.append(visual,content);
 return card;
}
try{
 const response=await fetch("/content/resultados.json",{cache:"no-store"});
 if(!response.ok)throw Error("Archivo de resultados no disponible");
 const content=await response.json();
 if(content?.enabled===false){section.hidden=true;return}
 if(typeof content?.headline==="string"&&content.headline.trim())section.querySelector("#results-heading").textContent=content.headline.slice(0,120);
 if(typeof content?.intro==="string"&&content.intro.trim())section.querySelector(".results-heading .lead").textContent=content.intro.slice(0,350);
 const projects=Array.isArray(content.projects)?content.projects.filter(p=>
  p&&p.is_real===true&&typeof p.title==="string"&&p.title.trim()&&safeAsset(p.before)&&safeAsset(p.after)&&p.before!==p.after
 ):[];

 // Una sección vacía confunde al visitante: solo mostramos resultados documentados.
 if(!projects.length){section.hidden=true;return}
 section.hidden=false;
 empty.hidden=true;
 disclaimer.hidden=false;

 // Cada elemento del listado CMS genera SU PROPIO comparador. No hay límite de nueve.
 // Para evitar cargar muchas fotografías simultáneamente, mostramos seis por lote.
 let visible=0;
 function showMore(){
  const next=Math.min(visible+PAGE_SIZE,projects.length);
  for(let i=visible;i<next;i++)grid.append(build(projects[i],i));
  visible=next;
  if(counter){
   counter.textContent="Mostrando "+visible+" de "+projects.length+" trabajos documentados";
   counter.hidden=projects.length<=1;
  }
  if(more){
   const remaining=projects.length-visible;
   more.hidden=remaining===0;
   if(remaining>0)more.textContent="Ver "+Math.min(PAGE_SIZE,remaining)+" trabajos más ↓";
  }
 }
 more?.addEventListener("click",showMore);
 showMore();
}catch(error){section.hidden=true;console.warn("Resultados: no se pudo comprobar el contenido; se oculta el comparador.",error)}
})();