import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

// Tests offline del flujo conversacional. No usan Cloudflare ni envían datos.
class FakeEl {
 constructor(tag){this.tagName=tag;this.children=[];this.attributes={};this.events={};this.className="";this.textContent="";this.scrollHeight=500;}
 append(...kids){this.children.push(...kids)}
 setAttribute(key,value){this.attributes[key]=value}
 addEventListener(key,fn){this.events[key]=fn}
 querySelector(query){
  const cls=query.startsWith(".")?query.slice(1):null;
  if(cls&&this.className.split(/\s+/).includes(cls))return this;
  for(const child of this.children){const found=child.querySelector?.(query);if(found)return found}
  return null;
 }
}
const feed=new FakeEl("div");
const document={
 readyState:"loading",addEventListener(){},
 getElementById(id){return id==="ai-chat-feed"?feed:null},
 createElement(tag){return new FakeEl(tag)}
};
const script=readFileSync("assets/assistant.js","utf8");
const injection="globalThis.__hidrobotFlows={guideIntent,directProperty,concise,contactGuide,propertyGuide,chooseProperty,chooseService,showPlans,choosePlan};";
assert.ok(script.includes("function bubble(text,role){"));
// Leemos la exportación temporal desde el contexto aislado, no añadimos APIs a producción.
const sandbox={document,window:{},URL,Date,encodeURIComponent};
vm.runInNewContext(script.replace("function bubble(text,role){",injection+"\nfunction bubble(text,role){"),sandbox,{timeout:2500});
const {guideIntent,directProperty,concise,contactGuide,propertyGuide,showPlans}=sandbox.__hidrobotFlows;
function choicesFromLastMessage(){
 const last=feed.children.at(-1);assert.ok(last,"No hubo mensaje");
 const container=last.querySelector(".ai-chat-choices");assert.ok(container,"No hubo opciones");
 return container.children;
}
test("intenciones naturales guían a los tres planes oficiales",()=>{
 assert.equal(guideIntent("¿De qué forma puedo contactarlos?"),"contact");
 assert.equal(guideIntent("Quiero escribirles por WhatsApp"),"contact");
 assert.equal(guideIntent("¿Cómo contacto por correo?"),"contact");
 assert.equal(guideIntent("¿Qué servicios ofrecen?"),"services");
 assert.equal(guideIntent("Necesito limpiar una casa"),"services");
 assert.equal(guideIntent("¿Cuánto cuesta una cotización con fotos?"),"quote");
 assert.equal(guideIntent("Me interesa el Plan 2+1"),"plans");
 assert.equal(guideIntent("¿Qué promocion tienen?"),"plans");
 assert.equal(guideIntent("Deseo el plan 6+1"),"plans");
 assert.equal(directProperty("Necesito un edificio PH").name,"Edificio / PH");
 assert.equal(directProperty("plaza comercial").form,"Local o plaza comercial");
 assert.equal(directProperty("en una casa").form,"Casa");
});
test("respuestas libres limitadas a máximo dos frases",()=>{
 assert.equal(concise("Hola. Segunda frase. Tercera frase."),"Hola. Segunda frase.");
 assert.ok(concise("Una ".repeat(120)).length<=270);
});
test("contacto ofrece enlaces clicables correctos y ningún envío automático",()=>{
 contactGuide();
 const options=choicesFromLastMessage();
 assert.equal(options.length,4);
 const hrefs=options.map(x=>x.href);
 assert.ok(hrefs.some(x=>x.startsWith("https://wa.me/50762730591?text=")));
 assert.ok(hrefs.some(x=>x.startsWith("https://mail.google.com/mail/?view=cm")));
 assert.ok(hrefs.includes("mailto:contactohidrolav507.com@gmail.com"));
 assert.ok(hrefs.includes("#cotizar"));
 assert.ok(options.every(x=>x.tagName==="a"));
});
test("servicios muestra tipos de inmueble y opciones enlazadas a cotizar",()=>{
 propertyGuide();
 const properties=choicesFromLastMessage();
 assert.equal(properties.length,6);
 const labels=properties.map(x=>x.textContent);
 assert.ok(labels.some(x=>x.includes("Casa")));
 assert.ok(labels.some(x=>x.includes("Edificio / PH")));
 assert.ok(labels.some(x=>x.includes("Plaza comercial")));
 const ph=properties.find(x=>x.textContent.includes("Edificio / PH"));
 ph.events.click();
 const services=choicesFromLastMessage();
 assert.ok(services.some(x=>x.textContent==="Áreas comunes de PH"));
 const common=services.find(x=>x.textContent==="Áreas comunes de PH");
 common.events.click();
 const conversion=choicesFromLastMessage();
 assert.ok(conversion.some(x=>x.href==="#cotizar"));
 assert.ok(conversion.some(x=>x.href?.startsWith("https://wa.me/50762730591?text=")));
 assert.ok(conversion.some(x=>x.textContent.includes("Ver planes")));
});

test("promociones: 2+1 en 3 meses, 4+1 en 5 meses y 6+1 en 6 meses",()=>{
 showPlans();
 const options=choicesFromLastMessage();
 assert.equal(options.length,3);
 assert.deepEqual(Array.from(options,x=>x.textContent),[
  "⭐ 2+1 · 3 meses","⭐ 4+1 · 5 meses","⭐ 6+1 · 6 meses"
 ]);
 const codes=["2+1","4+1","6+1"],months=[3,5,6],paid=[2,4,6];
 for(let i=0;i<options.length;i++){
  options[i].events.click();
  const text=feed.children.at(-1).querySelector(".ai-chat-bubble").textContent;
  assert.ok(text.includes(codes[i]));
  assert.ok(text.includes(paid[i]+" limpiezas"));
  assert.ok(text.includes(months[i]+" meses"));
  const links=choicesFromLastMessage();
  const wa=links.find(x=>x.href?.startsWith("https://wa.me/50762730591?text="));
  assert.ok(wa,"Enlace a WhatsApp no disponible");
  const decoded=decodeURIComponent(wa.href);
  assert.ok(decoded.includes("Plan "+codes[i]));
  assert.ok(decoded.includes(months[i]+" meses"));
  assert.ok(links.some(x=>x.href==="#cotizar"));
 }
});
