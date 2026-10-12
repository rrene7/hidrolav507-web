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

/* Guía interactiva: las cuatro tarjetas principales siguen intactas.
   Sólo generamos opciones desde catálogos locales, nunca HTML de la IA. */
const contactGmail="https://mail.google.com/mail/?view=cm&fs=1&to=contactohidrolav507.com%40gmail.com";
const waMessage="https://wa.me/50762730591?text="+encodeURIComponent("Hola, quiero consultar un servicio de HidroLav 507.");
const propertyCatalog=[
 {label:"🏠 Casa",name:"Casa",form:"Casa",services:["Aceras y entradas","Patios y terrazas","Pisos de concreto","Otro servicio"]},
 {label:"🏢 Edificio / PH",name:"Edificio / PH",form:"Apartamento / PH",services:["Áreas comunes de PH","Estacionamientos","Aceras y entradas","Otro servicio"]},
 {label:"🏬 Plaza comercial",name:"Plaza comercial",form:"Local o plaza comercial",services:["Exteriores comerciales","Estacionamientos","Aceras y entradas","Otro servicio"]},
 {label:"🏘️ Apartamento",name:"Apartamento",form:"Apartamento / PH",services:["Patios y terrazas","Áreas comunes de PH","Otro servicio"]},
 {label:"🚗 Estacionamiento",name:"Estacionamiento",form:"Estacionamiento",services:["Estacionamientos","Pisos de concreto","Otro servicio"]},
 {label:"➕ Otro",name:"Otro inmueble",form:"Otro inmueble",services:["Aceras y entradas","Patios y terrazas","Pisos de concreto","Otro servicio"]}
];
function norm(text){return String(text||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}
function guideIntent(text){
 const t=norm(text);
 if(/\b(?:contactar|contacto|comunicar|comunicacion|whatsapp|telefono|correo|email|e-mail|escribir|hablar con|llamar|mensaje)\b/.test(t))return "contact";
 if(/\b(?:servicio|servicios|limpiar|limpieza|lavan|lavado|hidrolavado|casa|casas|edificio|edificios|ph|plaza|plazas|apartamento|apartamentos|comercio|comercial|estacionamiento)\b/.test(t))return "services";
 if(/\b(?:cotizar|cotizacion|cotizaciones|precio|costo|presupuesto|fotos|fotografias)\b/.test(t))return "quote";
 return "";
}
function directProperty(text){
 const t=norm(text);
 if(/\b(?:edificio|edificios|ph)\b/.test(t))return propertyCatalog[1];
 if(/\b(?:plaza|local comercial|comercio)\b/.test(t))return propertyCatalog[2];
 if(/\b(?:apartamento|apartamentos)\b/.test(t))return propertyCatalog[3];
 if(/\b(?:estacionamiento|parking)\b/.test(t))return propertyCatalog[4];
 if(/\b(?:casa|casas|residencia)\b/.test(t))return propertyCatalog[0];
 return null;
}
function addChoices(row,choices){
 const dest=row.querySelector(".ai-chat-message");if(!dest)return;
 const list=document.createElement("div");list.className="ai-chat-choices";list.setAttribute("aria-label","Opciones para continuar");
 choices.forEach(opt=>{
  const el=document.createElement(opt.href?"a":"button");
  el.className="ai-chat-choice";
  el.textContent=opt.label;
  if(opt.href){
   el.href=opt.href;
   if(opt.href.startsWith("https://")){el.target="_blank";el.rel="noopener noreferrer"}
   if(opt.href==="#cotizar"){
    el.addEventListener("click",()=>{
     if(opt.property){const field=q("property_type");if(field)field.value=opt.property.form}
     if(opt.service){const field=q("service");if(field)field.value=opt.service}
     setOpen(false,null,false);
    });
   }
  }else{
   el.type="button";el.addEventListener("click",()=>{if(!busy&&typeof opt.onClick==="function")opt.onClick()});
  }
  list.append(el);
 });
 dest.append(list);
 q("ai-chat-feed").scrollTop=q("ai-chat-feed").scrollHeight;
}
function contactGuide(prompt="¿Cómo prefieres contactarnos? Elige una opción:"){
 const row=bubble(prompt,"assistant");
 addChoices(row,[
  {label:"💬 WhatsApp",href:waMessage},
  {label:"✉ Correo",href:contactGmail},
  {label:"📷 Cotización con fotos",href:"#cotizar"}
 ]);
}
function propertyGuide(){
 const row=bubble("¿Qué tipo de propiedad necesitas limpiar?","assistant");
 addChoices(row,propertyCatalog.map(p=>({label:p.label,onClick:()=>chooseProperty(p)})));
}
function chooseProperty(property,typed=""){
 bubble(typed||property.name,"user");
 const row=bubble("Para "+property.name.toLowerCase()+" podemos evaluar distintas áreas. ¿Cuál deseas limpiar?","assistant");
 addChoices(row,property.services.map(service=>({label:service,onClick:()=>chooseService(property,service)})));
}
function chooseService(property,service){
 bubble(service,"user");
 const row=bubble("Perfecto. Evaluamos "+service.toLowerCase()+" según el área, el acceso y la ubicación. ¿Cómo deseas continuar?","assistant");
 const message="Hola, quiero cotizar "+service.toLowerCase()+" para "+property.name.toLowerCase()+" con HidroLav 507.";
 addChoices(row,[
  {label:"📷 Cotización",href:"#cotizar",property,service},
  {label:"💬 WhatsApp",href:"https://wa.me/50762730591?text="+encodeURIComponent(message)},
  {label:"⭐ Plan 5+1",onClick:()=>ask("Quiero conocer las condiciones del Plan 5+1.","plan5+1")}
 ]);
}
function guidedRequest(text){
 const type=guideIntent(text);
 if(type==="contact"){bubble(text,"user");contactGuide();return true}
 if(type==="services"){
  const prop=directProperty(text);
  if(prop)chooseProperty(prop,text);
  else {bubble(text,"user");propertyGuide()}
  return true;
 }
 if(type==="quote"){
  bubble(text,"user");
  const row=bubble("Puedes solicitar tu cotización con fotografías o hablar con nuestro equipo. ¿Cuál prefieres?","assistant");
  addChoices(row,[{label:"📷 Cotización con fotos",href:"#cotizar"},{label:"💬 WhatsApp",href:waMessage}]);
  return true;
 }
 return false;
}
function followupChoices(row,text,reply){
 const t=norm(text+" "+reply);
 if(/\b(?:plan 5|5\s*\+\s*1|promocion|cortesia)\b/.test(t)){
  addChoices(row,[
   {label:"⭐ Plan 5+1",onClick:()=>ask("Explícame las condiciones del Plan 5+1.","plan5+1")},
   {label:"📷 Cotización",href:"#cotizar"}
  ]);
 }else if(/\b(?:superficie|terreno|acera|patio|edificio|residencia|ph|estacionamiento|servicio)\b/.test(t)){
  addChoices(row,[
   {label:"🏠 Elegir propiedad",onClick:propertyGuide},
   {label:"📷 Cotización",href:"#cotizar"}
  ]);
 }else{
  addChoices(row,[{label:"📷 Cotización",href:"#cotizar"},{label:"💬 Contactar",onClick:()=>contactGuide()}]);
 }
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
 if(interest!=="plan5+1"&&guidedRequest(clean)){input.value="";return}
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
  if(interest!=="plan5+1")followupChoices(answerRow,clean,reply);
  history.push({role:"assistant",content:reply});history=history.slice(-12);
 }catch(err){
  progress.remove();history.pop();
  const msg=err?.name==="AbortError"?"La respuesta tardó demasiado. Inténtalo nuevamente.":String(err?.message||"No se pudo conectar");
  const failure=bubble(msg+" También puedes cotizar con fotografías o escribir por WhatsApp.","status");
  if(interest!=="plan5+1")addChoices(failure,[{label:"📷 Cotización",href:"#cotizar"},{label:"💬 Contactar",onClick:()=>contactGuide()}]);
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
 // Los accesos fijos se conservan; los botones contextuales aparecen en las respuestas.
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
  if(busy)return;
  if(el.classList.contains("plan-highlight"))ask(el.getAttribute("data-chat-question")||el.textContent,"plan5+1");
  else if(el.getAttribute("aria-label")==="Preguntar por nuestros servicios"){bubble("Consultar servicio","user");propertyGuide()}
  else ask(el.getAttribute("data-chat-question")||el.textContent);
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