/* Selección de propiedad y WhatsApp rápido; Netlify Forms sigue independiente. */
(()=>{
"use strict";
const form=document.getElementById("quote-form");
if(!form)return;
const byId=id=>document.getElementById(id);
const property=byId("property_type"),service=byId("service"),locationField=byId("location");
for(const card of document.querySelectorAll("[data-quote-property]")){
 card.addEventListener("click",()=>{
  const value=card.getAttribute("data-quote-property");
  if(property&&Array.from(property.options).some(option=>option.value===value)){
   property.value=value;property.dispatchEvent(new Event("change",{bubbles:true}));
  }
  if(value==="Estacionamiento"&&service&&Array.from(service.options).some(o=>o.value==="Estacionamientos")){
   service.value="Estacionamientos";service.dispatchEvent(new Event("change",{bubbles:true}));
  }
 });
}
const link=byId("quote-whatsapp"),feedback=byId("quote-whatsapp-feedback");
if(!link)return;
link.addEventListener("click",event=>{
 const kind=property?.value||"",requestedService=service?.value||"",area=locationField?.value.trim()||"";
 if(!kind||!requestedService||!area){
  event.preventDefault();
  if(feedback)feedback.textContent="Selecciona tu propiedad, el servicio y el corregimiento para preparar el mensaje.";
  const firstMissing=(!kind&&property)||(!requestedService&&service)||(!area&&locationField);
  firstMissing?.focus();
  return;
 }
 if(feedback)feedback.textContent="";
 const note=byId("details")?.value.trim().slice(0,300)||"";
 const txt="Hola HidroLav 507. Quiero una cotización.\n"+
  "Propiedad: "+kind+"\n"+
  "Servicio: "+requestedService+"\n"+
  "Área o corregimiento: "+area+
  (note?"\nDetalles: "+note:"")+
  "\n¿Podrían indicarme cómo continuar?";
 link.href="https://wa.me/50762730591?text="+encodeURIComponent(txt);
 // El visitante debe pulsar «Enviar» dentro de WhatsApp. Nunca incluimos teléfono ni email del formulario.
});
})();