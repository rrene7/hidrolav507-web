import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

class Element {
 constructor(tag="div"){
  this.tagName=tag;this.children=[];this.attributes={};this.events={};
  this.style={values:{},setProperty:(k,v)=>{this.style.values[k]=v}};
  this.textContent="";this.hidden=false;this.value="";
 }
 append(...items){this.children.push(...items)}
 setAttribute(k,v){this.attributes[k]=v}
 getAttribute(k){return this.attributes[k]}
 addEventListener(event,fn){this.events[event]=fn}
 querySelector(q){
  if(q==="#results-heading")return this.heading;
  if(q===".results-heading .lead")return this.lead;
  return null;
 }
 focus(){this.focused=true}
 dispatchEvent(){}
}
async function render(data){
 const section=new Element("section");section.heading=new Element("h2");section.lead=new Element("p");
 const grid=new Element("div"),empty=new Element("div"),disclaimer=new Element("p");
 const els={"resultados":section,"compare-grid":grid,"results-empty":empty,"results-disclaimer":disclaimer};
 const document={getElementById:id=>els[id],createElement:tag=>new Element(tag)};
 const code=readFileSync("assets/resultados.js","utf8");
 await vm.runInNewContext(code,{document,fetch:async()=>({ok:true,json:async()=>data}),decodeURIComponent,console},{timeout:2500});
 return {section,grid,empty,disclaimer};
}
test("sin trabajos reales, se mantiene explicación sin engañar al visitante",async()=>{
 const r=await render({enabled:true,projects:[]});
 assert.equal(r.grid.children.length,0);
 assert.equal(r.empty.hidden,false);
 assert.equal(r.disclaimer.hidden,false);
});
test("publica solo pares distintos y confirmados, rechaza rutas inseguras",async()=>{
 const r=await render({enabled:true,headline:"Trabajos reales",intro:"Fotos verificadas",projects:[
  {title:"Acceso de PH",before:"/assets/uploads/antes.jpg",after:"/assets/uploads/despues.jpg",area:"La Chorrera",description:"Limpieza exterior",is_real:true},
  {title:"Fotos no verificadas",before:"/assets/uploads/a.jpg",after:"/assets/uploads/b.jpg",is_real:false},
  {title:"Imagen idéntica",before:"/assets/a.webp",after:"/assets/a.webp",is_real:true},
  {title:"Ruta insegura",before:"/assets/../privacidad.html",after:"/assets/after.jpg",is_real:true}
 ]});
 assert.equal(r.grid.children.length,1);
 assert.equal(r.empty.hidden,true);
 assert.equal(r.disclaimer.hidden,false);
 assert.equal(r.section.heading.textContent,"Trabajos reales");
 const card=r.grid.children[0],visual=card.children[0],text=card.children[1];
 assert.equal(text.children[0].textContent,"Acceso de PH");
 assert.equal(visual.children[0].src,"/assets/uploads/antes.jpg");
 assert.equal(visual.children[1].src,"/assets/uploads/despues.jpg");
 const input=visual.children.at(-1);
 assert.equal(input.type,"range");
 assert.match(input.attributes["aria-label"],/antes y después/i);
 input.value="83";input.events.input();
 assert.equal(visual.style.values["--split"],"83%");
 assert.match(input.attributes["aria-valuetext"],/83%/);
});
test("sección de resultados puede desactivarse desde CMS",async()=>{
 const r=await render({enabled:false,projects:[]});
 assert.equal(r.section.hidden,true);
});
function makeForm(){
 const form=new Element("form"),feedback=new Element("p"),link=new Element("a");
 const p=new Element("select"),s=new Element("select"),loc=new Element("input"),details=new Element("textarea");
 const name=new Element("input"),phone=new Element("input");
 p.options=[{value:""},{value:"Casa"},{value:"Apartamento / PH"},{value:"Estacionamiento"}];
 s.options=[{value:""},{value:"Aceras y entradas"},{value:"Estacionamientos"}];
 const card=new Element("a");card.setAttribute("data-quote-property","Estacionamiento");
 const fields={"quote-form":form,"quote-whatsapp":link,"quote-whatsapp-feedback":feedback,"property_type":p,"service":s,"location":loc,"details":details,"phone":phone,"name":name};
 const document={getElementById:id=>fields[id],querySelectorAll:selector=>selector==="[data-quote-property]"?[card]:[]};
 const code=readFileSync("assets/cotizacion-rapida.js","utf8");
 vm.runInNewContext(code,{document,Event:class Event{constructor(type){this.type=type}},encodeURIComponent},{timeout:2500});
 return {link,feedback,p,s,loc,details,card};
}
test("al escoger estacionamiento preselecciona propiedad y servicio",()=>{
 const x=makeForm();
 x.card.events.click();
 assert.equal(x.p.value,"Estacionamiento");
 assert.equal(x.s.value,"Estacionamientos");
});
test("cotización WhatsApp requiere lo básico y no expone teléfono ni correo",()=>{
 const x=makeForm();let prevented=false;
 x.link.events.click({preventDefault:()=>{prevented=true}});
 assert.equal(prevented,true);
 assert.match(x.feedback.textContent,/propiedad/);
 x.p.value="Casa";x.s.value="Aceras y entradas";x.loc.value="La Chorrera";
 x.details.value="Un patio de 45 m2.";
 x.link.events.click({preventDefault:()=>{throw Error("No debe impedirse el envío manual")}});
 assert.match(x.link.href,/^https:\/\/wa\.me\/50762730591\?text=/);
 const message=decodeURIComponent(x.link.href.split("text=")[1]);
 assert.match(message,/La Chorrera/);
 assert.match(message,/Aceras y entradas/);
 assert.doesNotMatch(message,/phone|email/);
});