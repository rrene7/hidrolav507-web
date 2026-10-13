/* Resultados reales de HidroLav 507. Nunca inventar pares de fotografías. */
(async()=>{
"use strict";
const section=document.getElementById("resultados");
const grid=document.getElementById("compare-grid");
const empty=document.getElementById("results-empty");
const disclaimer=document.getElementById("results-disclaimer");
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
 range.setAttribute("aria-valuetext","50% del resultado después");
 range.addEventListener("input",()=>{
  const value=Math.max(0,Math.min(100,Number(range.value)||0));
  visual.style.setProperty("--split",value+"%");
  range.setAttribute("aria-valuetext",value+"% del resultado después");
 });
 visual.append(before,after,split,left,right,range);
 const content=document.createElement("div");content.className="compare-caption";
 const title=document.createElement("h3");title.textContent=project.title;
 content.append(title);
 if(project.area){const place=document.createElement("span");place.className="compare-area";place.textContent=project.area;content.append(place)}
 if(project.description){const detail=document.createElement("p");detail.textContent=project.description;content.append(detail)}
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
 ).slice(0,9):[];
 for(let i=0;i<projects.length;i++)grid.append(build(projects[i],i));
 if(projects.length){
  empty.hidden=true;
  disclaimer.hidden=false;
 }
}catch(error){console.warn("Resultados: se conserva la sección informativa.",error)}
})();