/* Chat real para HidroLav 507. Se activa SOLO cuando el Worker responde /health. */
(()=>{"use strict";
const q=id=>document.getElementById(id);
let endpoint="",history=[],busy=false;
function bubble(text,role){
 const item=document.createElement("p");item.className="ai-chat-bubble "+role;item.textContent=text;
 const feed=q("ai-chat-feed");feed.append(item);feed.scrollTop=feed.scrollHeight;return item;
}
function setOpen(open){
 const panel=q("ai-chat-panel"),launch=q("ai-chat-launch");
 panel.hidden=!open;launch.setAttribute("aria-expanded",String(open));
 if(open){q("ai-chat-input").focus()}else{launch.focus()}
 if(open&&window.innerWidth<=740){
  const nav=q("navlinks"),toggle=q("menu-toggle");
  nav?.classList.remove("open");toggle?.setAttribute("aria-expanded","false");if(toggle)toggle.textContent="☰";
 }
}
async function ask(text){
 const clean=String(text||"").trim().slice(0,900);
 if(!clean||busy||!endpoint)return;
 const input=q("ai-chat-input"),send=q("ai-chat-send");
 busy=true;send.disabled=true;input.disabled=true;
 const previous=history.slice(-6);
 bubble(clean,"user");
 history.push({role:"user",content:clean});
 const progress=bubble("Pensando…","status");
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),28000);
 try{
  const response=await fetch(endpoint,{method:"POST",mode:"cors",credentials:"omit",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({message:clean,history:previous}),signal:controller.signal});
  let payload=null;try{payload=await response.json()}catch{}
  if(!response.ok||typeof payload?.reply!=="string")throw Error(payload?.error||"No se recibió una respuesta.");
  progress.remove();
  const reply=payload.reply.trim().slice(0,1600);
  if(!reply)throw Error("Respuesta vacía. Prueba de nuevo.");
  bubble(reply,"assistant");
  history.push({role:"assistant",content:reply});
  history=history.slice(-12);
 }catch(err){
  progress.remove();
  history.pop();
  const msg=err?.name==="AbortError"?"La respuesta tardó demasiado. Intenta de nuevo.":String(err?.message||"No se pudo conectar");
  bubble(msg+" Puedes cotizar por el formulario o escribir al WhatsApp +507 6273-0591.","status");
 }finally{
  clearTimeout(timeout);busy=false;send.disabled=false;input.disabled=false;input.value="";
  input.focus();
 }
}
async function init(){
 const launch=q("ai-chat-launch"),panel=q("ai-chat-panel"),form=q("ai-chat-form");
 if(!launch||!panel||!form)return;
 let config;
 try{
  const r=await fetch("/content/assistant.json",{cache:"no-store"});
  if(!r.ok)return;
  config=await r.json();
 }catch{return}
 // No mostrar una IA ficticia: hasta tener un Worker real y verificado, se conserva el FAQ.
 if(config?.enabled!==true||typeof config.endpoint!=="string")return;
 const candidate=config.endpoint.trim();
 let url;
 try{url=new URL(candidate)}catch{return}
 if(url.protocol!=="https:"||!url.hostname.endsWith(".workers.dev")||url.pathname!=="/chat"||url.search)return;
 try{
  const health=new URL("/health",url);
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9000);
  let response;
  try{response=await fetch(health.toString(),{mode:"cors",credentials:"omit",signal:controller.signal,cache:"no-store"})}
  finally{clearTimeout(timer)}
  const data=response.ok?await response.json():null;
  if(!data?.ai||!data?.rate_limit)return;
 }catch{return}
 endpoint=url.toString();
 q("ai-chat-notice").textContent=typeof config.notice==="string"?config.notice.slice(0,260):"Asistente con IA. No incluyas datos sensibles.";
 const greeting=typeof config.greeting==="string"&&config.greeting.trim()?config.greeting.trim():"¡Hola! Soy la IA de HidroLav 507. ¿En qué puedo ayudarte?";
 bubble(greeting.slice(0,480),"assistant");
 launch.hidden=false;
 launch.addEventListener("click",()=>setOpen(panel.hidden));
 q("ai-chat-close").addEventListener("click",()=>setOpen(false));
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden)setOpen(false)});
 form.addEventListener("submit",e=>{e.preventDefault();ask(q("ai-chat-input").value)});
 q("ai-chat-input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
 panel.querySelectorAll("[data-chat-question]").forEach(el=>el.addEventListener("click",()=>{
  if(!busy)ask(el.getAttribute("data-chat-question")||el.textContent);
 }));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();