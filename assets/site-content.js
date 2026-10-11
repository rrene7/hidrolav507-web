(async()=>{
"use strict";
let c;try{let r=await fetch("/content/site.json",{cache:"no-store"});if(!r.ok)throw Error("Contenido no disponible");c=await r.json();}catch(err){console.warn("Contenido estático:",err);return;}
const q=s=>document.querySelector(s);
const t=(s,v)=>{const e=q(s);if(e&&typeof v==="string")e.textContent=v;};
const valid=v=>typeof v==="string"&&/^\/(?:assets|images)\/[-\w./%]+$/i.test(v);
t(".brand b",c.brand_short);t(".hero .eyebrow",c.hero_eyebrow);
const h=q(".hero h1");if(h){h.textContent=c.hero_title||"";let e=document.createElement("em");e.textContent=" "+(c.hero_highlight||"");h.append(e);}
t(".hero h1 + p",c.hero_text);t(".hero-note strong",c.business_name);t(".hero-note small",c.tagline);
const hero=q(".hero-media img");if(hero&&valid(c.hero_image)){hero.src=c.hero_image;hero.alt=c.hero_image_description||"";}
t("#servicios .section-title .lead",c.intro_services);
if(Array.isArray(c.services)){
const p=q("#servicios .cards");if(p){p.replaceChildren();for(let s of c.services){let a=document.createElement("article");a.className="service";let i=document.createElement("div");i.className="sym";i.textContent=s.icon||"💧";let h=document.createElement("h3");h.textContent=s.title||"";let d=document.createElement("p");d.textContent=s.description||"";a.append(i,h,d);p.append(a);}}
const select=q("#service");if(select){select.querySelectorAll("option:not(:first-child)").forEach(o=>o.remove());for(let s of c.services){let o=document.createElement("option");o.textContent=s.title;o.value=s.title;select.append(o);}let other=document.createElement("option");other.textContent="Otro servicio";select.append(other);}}
t("#galeria .section-title h2",c.gallery_title);t("#galeria .section-title .lead",c.gallery_intro);
if(Array.isArray(c.gallery)){const g=q("#galeria .gallery");if(g){g.replaceChildren();for(const e of c.gallery){if(!valid(e.image))continue;let f=document.createElement("figure"),i=document.createElement("img"),p=document.createElement("figcaption");i.src=e.image;i.alt=e.description||e.title||"Fotografía";i.loading="lazy";p.textContent=e.title||"";f.append(i,p);g.append(f);}}
const note=q("#galeria .fineprint"),anyReal=c.gallery.some(x=>x.is_real),anyDemo=c.gallery.some(x=>!x.is_real);if(note)note.textContent=anyDemo?"Algunas imágenes son ilustrativas y no corresponden necesariamente a trabajos de HidroLav 507.":"Fotografías de trabajos compartidas por HidroLav 507.";t("#galeria .tag",anyReal?"Nuestros trabajos":"Referencias visuales");}
t(".coverage h2",c.coverage_title);t(".coverage p",c.coverage_text);
if(Array.isArray(c.areas)){const a=q(".cover-tags");if(a){a.replaceChildren();for(const x of c.areas){let e=document.createElement("span");e.textContent=typeof x==="string"?x:x?.area||"";a.append(e);}}}
if(c.announcement?.trim()){let x=document.createElement("p");x.textContent=c.announcement;x.style.cssText="padding:12px 15px;background:#ffc400;color:#061d36;border-radius:10px;font-weight:bold";h?.insertAdjacentElement("afterend",x);}
let wa=String(c.whatsapp||"").replace(/\D/g,"");if(/^507\d{8}$/.test(wa)){window.HIDROLAV_WA=wa;document.querySelectorAll('a[href^="https://wa.me/"]').forEach(a=>{let original=new URL(a.href);a.href="https://wa.me/"+wa+original.search;});let n=wa.slice(3),label="+507 "+n.slice(0,4)+"-"+n.slice(4);const phone=q(".phone-big");if(phone){phone.href="tel:+"+wa;phone.textContent="☎ "+label;}const top=q(".topbar a.secondary");if(top){top.href="tel:+"+wa;top.textContent="Consultas: "+label;}}
if(c.business_name)document.title=c.business_name+" | Limpieza profesional a presión";
})();