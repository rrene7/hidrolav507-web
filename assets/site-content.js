(async()=>{
"use strict";
let c;try{let r=await fetch("/content/site.json",{cache:"no-store"});if(!r.ok)throw Error("Contenido no disponible");c=await r.json();}catch(err){console.warn("Contenido estático:",err);return;}
const q=s=>document.querySelector(s);
const t=(s,v)=>{const e=q(s);if(e&&typeof v==="string")e.textContent=v;};
const validServicePage=v=>typeof v==="string"&&/^\/servicios\/[a-z0-9-]+\.html$/.test(v);
const valid=v=>{
  if(typeof v!=="string"||!/^\/(?:assets|images)\/[^?#]+$/u.test(v)||/[<>\\\u0000-\u001f]/u.test(v))return false;
  let decoded;try{decoded=decodeURIComponent(v);}catch{return false;}
  return !/[<>\\\u0000-\u001f]/u.test(decoded)&&!decoded.split("/").some(segment=>segment===".."||segment===".")
};
t(".brand b",c.brand_short);t(".hero .eyebrow",c.hero_eyebrow);
const h=q(".hero h1");if(h){h.textContent=c.hero_title||"";let e=document.createElement("em");e.textContent=" "+(c.hero_highlight||"");h.append(e);}
t(".hero h1 + p",c.hero_text);t(".hero-note strong",c.business_name);t(".hero-note small",c.tagline);
const hero=q(".hero-media img");if(hero&&valid(c.hero_image)){hero.src=c.hero_image;hero.alt=c.hero_image_description||"";}
t("#servicios .section-title .lead",c.intro_services);
if(Array.isArray(c.services)){
const p=q("#servicios .cards");if(p){p.replaceChildren();for(const s of c.services){
  const a=document.createElement("article");a.className="service";
  const body=document.createElement("div");body.className="service-details";
  if(valid(s.image)){
    a.classList.add("has-photo");
    const photo=document.createElement("img");photo.className="service-photo";
    photo.src=s.image;photo.alt="Fotografía del servicio: "+(s.title||"limpieza a presión");
    photo.loading="lazy";photo.decoding="async";photo.width=960;photo.height=600;
    photo.onerror=()=>{a.classList.remove("has-photo");photo.remove();if(!body.querySelector(".sym")){let icon=document.createElement("div");icon.className="sym";icon.textContent=s.icon||"💧";body.prepend(icon);}};
    a.append(photo);
  }else{
    const icon=document.createElement("div");icon.className="sym";icon.textContent=s.icon||"💧";body.append(icon);
  }
  const h=document.createElement("h3");h.textContent=s.title||"";
  const d=document.createElement("p");d.textContent=s.description||"";
  body.append(h,d);
  // Enlace interno real a la ficha: visible y navegable también con teclado.
  if(validServicePage(s.url)){
    const link=document.createElement("a");
    link.className="service-more";
    link.href=s.url;
    link.textContent="Conocer el servicio ↗";
    link.setAttribute("aria-label","Ver detalles: "+(s.title||"servicio de limpieza"));
    body.append(link);
  }
  a.append(body);p.append(a);
}}
const select=q("#service");if(select){select.querySelectorAll("option:not(:first-child)").forEach(o=>o.remove());for(let s of c.services){let o=document.createElement("option");o.textContent=s.title;o.value=s.title;select.append(o);}let other=document.createElement("option");other.textContent="Otro servicio";select.append(other);}}
t("#galeria .section-title h2",c.gallery_title);t("#galeria .section-title .lead",c.gallery_intro);
if(Array.isArray(c.gallery)){const g=q("#galeria .gallery");if(g){g.replaceChildren();for(const e of c.gallery){if(!valid(e.image))continue;let f=document.createElement("figure"),i=document.createElement("img"),p=document.createElement("figcaption");i.src=e.image;i.alt=e.description||e.title||"Fotografía";i.loading="lazy";p.textContent=e.title||"";
const kind=document.createElement("span");kind.className="gallery-caption-kind";
const named=typeof e.description==="string"&&/^(?:antes|despu[eé]s|resultado[s]?|durante)$/i.test(e.description.trim())?e.description.trim():"";
kind.textContent=e.is_real===true?(named||"Trabajo publicado"):"Imagen de referencia";
p.append(kind);f.append(i,p);g.append(f);}}
const note=q("#galeria .fineprint"),anyReal=c.gallery.some(x=>x.is_real),anyDemo=c.gallery.some(x=>!x.is_real);if(note)note.textContent=anyDemo?"Algunas imágenes son ilustrativas y no corresponden necesariamente a trabajos de HidroLav 507.":"Fotografías de trabajos compartidas por HidroLav 507.";t("#galeria .tag",anyReal&&anyDemo?"Trabajos y referencias":anyReal?"Nuestros trabajos":"Referencias visuales");}
t(".coverage h2",c.coverage_title);t(".coverage p",c.coverage_text);
if(Array.isArray(c.areas)){const a=q(".cover-tags");if(a){a.replaceChildren();for(const x of c.areas){let e=document.createElement("span");e.textContent=typeof x==="string"?x:x?.area||"";a.append(e);}}}
if(c.announcement?.trim()){let x=document.createElement("p");x.textContent=c.announcement;x.style.cssText="padding:12px 15px;background:#ffc400;color:#061d36;border-radius:10px;font-weight:bold";h?.insertAdjacentElement("afterend",x);}
// Campaña promocional opcional, administrable con Sveltia CMS.
let christmasCampaign;
try {
  const result = await fetch("/content/christmas.json", {cache:"no-store"});
  if (result.ok) christmasCampaign = await result.json();
} catch (err) { console.warn("No se pudo cargar la campaña de Navidad", err); }
if(christmasCampaign?.enabled===true){
  const promo=christmasCampaign;
  const container=document.createElement("section");
  container.className="seasonal-campaign";
  container.setAttribute("aria-label","Campaña especial de fin de año");
  const wrap=document.createElement("div");wrap.className="container seasonal-campaign-inner";
  const body=document.createElement("div");
  const eyebrow=document.createElement("div");eyebrow.className="seasonal-kicker";eyebrow.textContent=promo.eyebrow||"HidroLav 507 Panamá";
  const heading=document.createElement("h2");heading.textContent=promo.headline||"Prepara tus espacios para fin de año";
  const description=document.createElement("p");description.textContent=promo.description||"Cotiza tu limpieza a presión.";
  const action=document.createElement("a");action.className="seasonal-cta";
  const phone=String(c.whatsapp||"").replace(/\D/g,"");
  action.href="https://wa.me/"+(/^507\d{8}$/.test(phone)?phone:"50762730591")+"?text="+encodeURIComponent("Hola HidroLav 507, deseo cotizar la limpieza navideña de mi propiedad.");
  action.target="_blank";action.rel="noopener noreferrer";action.textContent=promo.cta_label||"Cotizar por WhatsApp";
  body.append(eyebrow,heading,description,action);wrap.append(body);
  const visual=document.createElement("div");visual.className="seasonal-visual";
  const fallback=()=>{visual.replaceChildren();const msg=document.createElement("span");msg.textContent="✨ Espacios listos para celebrar";visual.append(msg);};
  if(valid(promo.photo)){
    const img=document.createElement("img");img.src=promo.photo;
    img.alt="Imagen ilustrativa de la campaña de fin de año de HidroLav 507";img.loading="lazy";img.decoding="async";
    img.onerror=fallback;visual.append(img);
  }else{fallback();}
  wrap.append(visual);container.append(wrap);
  q(".hero")?.insertAdjacentElement("afterend",container);
}

let wa=String(c.whatsapp||"").replace(/\D/g,"");if(/^507\d{8}$/.test(wa)){window.HIDROLAV_WA=wa;document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a=>{let original=new URL(a.href);a.href="https://wa.me/"+wa+original.search;});let n=wa.slice(3),label="+507 "+n.slice(0,4)+"-"+n.slice(4);const phone=q(".phone-big");if(phone){phone.href="tel:+"+wa;phone.textContent="☎ "+label;}const top=q(".topbar a.secondary");if(top){top.href="tel:+"+wa;top.textContent="Consultas: "+label;}}
// El título SEO definido en index.html permanece estable al cargar el CMS.
})();