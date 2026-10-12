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
const injection="globalThis.__hidrobotFlows={guideIntent,directProperty,concise,contactGuide,propertyGuide,chooseProperty,chooseService};";
assert.ok(script.includes("function bubble(text,role){"));
// Leemos la exportación temporal desde el contexto aislado, no añadimos APIs a producción.
const sandbox={document,window:{},URL,Date,encodeURIComponent};
vm.runInNewContext(script.replace("function bubble(text,role){",injection+"\nfunction bubble(text,role){"),sandbox,{timeout:2500});
const {guideIntent,directProperty,concise,contactGuide,propertyGuide}=sandbox.__hidrobotFlows;
function choicesFromLastMessage(){
 const last=feed.children.at(-1);assert.ok(last,"No hubo mensaje");
 const container=last.querySelector(".ai-chat-choices");assert.ok(container,"No hubo opciones");
 return container.children;
}
test("intenciones naturales llevan a flujos guiados; plan usa el modelo",()=>{
 assert.equal(guideIntent("¿De qué forma puedo contactarlos?"),"contact");
 assert.equal(guideIntent("Quiero escribirles por WhatsApp"),"contact");
 assert.equal(guideIntent("¿Cómo contacto por correo?"),"contact");
 assert.equal(guideIntent("¿Qué servicios ofrecen?"),"services");
 assert.equal(guideIntent("Necesito limpiar una casa"),"services");
 assert.equal(guideIntent("¿Cuánto cuesta una cotización con fotos?"),"quote");
 assert.equal(guideIntent("Me interesa el Plan 5+1"),"");
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
 assert.ok(conversion.some(x=>x.textContent.includes("Plan 5+1")));
});

