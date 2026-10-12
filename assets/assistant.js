/* HidroBot 507 · Chat real con Cloudflare Workers AI; no se guardan mensajes localmente. */
(()=>{"use strict";
const q=id=>document.getElementById(id);
const face="/assets/hidrobot507-avatar.webp";
const planWaLink="https://wa.me/50762730591?text="+encodeURIComponent("Hola, quiero consultar las condiciones del Plan Cliente Frecuente 5+1 de HidroLav 507.");
let endpoint="",history=[],busy=false,activeTrigger=null;
const launchers=()=>[q("ai-chat-launch"),q("ai-chat-launch-mobile")].filter(Boolean);
const panel=()=>q("ai-chat-panel");

/* El chat no es un canal de captura de teléfonos: no enviar números a Workers AI. */
function looksLikePhone(value){
 const spans=String(value||"").match(/\+?[\d\s().-]{8,24}/g)||[];
 return spans.some(part=>{
  const digits=part.replace(/\D/g,"");
  return (digits.length===8&&/^[236789]/.test(digits))||
    (digits.length===11&&digits.startsWith("507")&&/^[236789]/.test(digits.slice(3)));
 });
}

function bubble(text,role){
 const feed=q("ai-chat-feed");
 const row=document.createElement("div");row.className="ai-chat-row "+role;
 if(role!=="user"){
  const img=document.createElement("img");img.className="ai-chat-mini-avatar";img.src=face;
  img.alt="";img.width=32;img.height=32;row.append(img);
 }
 const message=document.createElement("div");message.className="ai-chat-message";
 const item=document.createElement("p");item.className="ai-chat-bubble "+role;item.textContent=text;
 const time=document.createElement("time");time.className="ai-chat-time";
 const now=new Date();time.dateTime=now.toISOString();
 time.textContent=now.toLocaleTimeString("es-PA",{hour:"numeric",minute:"2-digit"});
 message.append(item,time);row.append(message);feed.append(row);feed.scrollTop=feed.scrollHeight;
 return row;
}
function positionPanel(){
 const trigger=window.innerWidth<=1279?q("ai-chat-launch-mobile"):q("ai-chat-launch");
 if(!trigger||!panel()||panel().hidden)return;
 const rect=trigger.getBoundingClientRect();
 panel().style.setProperty("--hidrobot-top",Math.round(Math.max(6,Math.min(rect.bottom+12,window.innerHeight-255)))+"px");
 panel().style.setProperty("--hidrobot-right",Math.round(Math.max(12,window.innerWidth-rect.right))+"px");
}
function setOpen(open,trigger,restoreFocus=true){
 const dialog=panel();
 dialog.hidden=!open;
 if(trigger)activeTrigger=trigger;
 launchers().forEach(el=>el.setAttribute("aria-expanded",String(open)));
 if(open){
  if(window.innerWidth<=1279){
   const nav=q("navlinks"),toggle=q("menu-toggle");
   nav?.classList.remove("open");toggle?.setAttribute("aria-expanded","false");if(toggle)toggle.textContent="☰";
  }
  positionPanel();q("ai-chat-input").focus({preventScroll:true});
 }else if(restoreFocus){(activeTrigger||launchers()[0])?.focus({preventScroll:true})}
}
function concise(text){
 const s=String(text||"").trim();
 // Respeta los enlaces y palabras, pero evita párrafos interminables.
 const parts=s.match(/[^.!?\n]+[.!?]+|[^.!?\n]+$/g)||[s];
 return parts.slice(0,3).join(" ").replace(/\s+/g," ").trim().slice(0,500);
}
async function ask(text,interest=""){
 const clean=String(text||"").trim().slice(0,900);
 if(!clean||busy||!endpoint)return;
 const input=q("ai-chat-input"),send=q("ai-chat-send");
 if(looksLikePhone(clean)){
  // Mensaje privado: no se muestra ni se comparte el número tecleado.
  bubble("Quiero contactar a HidroLav 507","user");
  bubble("Por seguridad no compartas tu teléfono aquí. Pulsa «Cotización» y envía la solicitud, o «Hablar por WhatsApp» para escribirnos directamente.","assistant");
  input.value="";
  return;
 }
 const previous=history.slice(-6);
 busy=true;send.disabled=true;input.disabled=true;panel().classList.add("is-thinking");
 bubble(clean,"user");history.push({role:"user",content:clean});
 const progress=bubble("HidroBot está pensando… 💧","status");
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),28000);
 try{
  const response=await fetch(endpoint,{method:"POST",mode:"cors",credentials:"omit",
   headers:{"Content-Type":"application/json"},body:JSON.stringify({message:clean,history:previous}),
   signal:controller.signal});
  let payload=null;try{payload=await response.json()}catch{}
  if(!response.ok||typeof payload?.reply!=="string")throw Error(payload?.error||"No se recibió una respuesta.");
  const reply=concise(payload.reply);
  if(!reply)throw Error("Respuesta vacía. Intenta de nuevo.");
  progress.remove();
  const answerRow=bubble(reply,"assistant");
  if(interest==="plan5+1"){
   const link=document.createElement("a");
   link.className="ai-chat-conversion";link.href=planWaLink;
   link.target="_blank";link.rel="noopener noreferrer";
   link.textContent="Consultar el Plan 5+1 por WhatsApp ↗";
   link.title="Abre WhatsApp con un mensaje preparado; debes enviarlo tú mismo.";
   answerRow.querySelector(".ai-chat-message")?.append(link);
  }
  history.push({role:"assistant",content:reply});history=history.slice(-12);
 }catch(err){
  progress.remove();history.pop();
  const msg=err?.name==="AbortError"?"La respuesta tardó demasiado. Inténtalo nuevamente.":String(err?.message||"No se pudo conectar");
  bubble(msg+" También puedes cotizar con fotografías o escribir al WhatsApp +507 6273-0591.","status");
  if(interest==="plan5+1"){
   const link=document.createElement("a");
   link.className="ai-chat-conversion";link.href=planWaLink;
   link.target="_blank";link.rel="noopener noreferrer";
   link.textContent="Consultar el Plan 5+1 por WhatsApp ↗";
   q("ai-chat-feed").lastElementChild?.querySelector(".ai-chat-message")?.append(link);
  }
 }finally{
  clearTimeout(timer);busy=false;send.disabled=false;input.disabled=false;
  panel().classList.remove("is-thinking");input.value="";
  if(!panel().hidden)input.focus({preventScroll:true});
 }
}
async function init(){
 const dialog=panel(),form=q("ai-chat-form"),buttons=launchers();
 if(!dialog||!form||buttons.length===0)return;
 let config;
 try{const r=await fetch("/content/assistant.json",{cache:"no-store"});if(!r.ok)return;config=await r.json()}catch{return}
 if(config?.enabled!==true||typeof config.endpoint!=="string")return;
 let url;
 try{url=new URL(config.endpoint.trim())}catch{return}
 if(url.protocol!=="https:"||!url.hostname.endsWith(".workers.dev")||url.pathname!=="/chat"||url.search)return;
 try{
  const health=new URL("/health",url),controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),9000);
  let response;
  try{response=await fetch(health.toString(),{mode:"cors",credentials:"omit",signal:controller.signal,cache:"no-store"})}
  finally{clearTimeout(timer)}
  const data=response.ok?await response.json():null;
  if(!data?.ai||!data?.rate_limit)return;
 }catch{return}
 endpoint=url.toString();
 q("ai-chat-notice").textContent=typeof config.notice==="string"?config.notice.slice(0,240):"Respondo en 2 o 3 frases. Una pregunta a la vez.";
 const greeting=typeof config.greeting==="string"&&config.greeting.trim()?config.greeting.trim():"¡Hola! Soy HidroBot 507. Te ayudo con cotizaciones y consultas. 😊";
 bubble(concise(greeting),"assistant");
 bubble("¿Deseas cotizar una limpieza o conocer el Plan 5+1?","assistant");
 buttons.forEach(el=>{
  el.hidden=false;
  el.addEventListener("click",()=>setOpen(dialog.hidden,el));
 });
 q("ai-chat-close").addEventListener("click",()=>setOpen(false));
 document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!dialog.hidden)setOpen(false)});
 window.addEventListener("resize",positionPanel,{passive:true});
 window.addEventListener("scroll",positionPanel,{passive:true});
 form.addEventListener("submit",event=>{event.preventDefault();ask(q("ai-chat-input").value)});
 q("ai-chat-input").addEventListener("keydown",event=>{
  if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();form.requestSubmit()}
 });
 dialog.querySelectorAll("[data-chat-question]").forEach(el=>el.addEventListener("click",()=>{
  if(!busy)ask(el.getAttribute("data-chat-question")||el.textContent,el.classList.contains("plan-highlight")?"plan5+1":"");
 }));
 dialog.querySelectorAll("[data-chat-close],#ai-chat-attach").forEach(el=>
  el.addEventListener("click",()=>setOpen(false,null,false)));
 document.addEventListener("pointerdown",event=>{
  if(dialog.hidden||dialog.contains(event.target)||buttons.some(el=>el.contains(event.target)))return;
  setOpen(false,null,false);
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();