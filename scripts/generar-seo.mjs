#!/usr/bin/env node
// SEO renderizado en HTML durante el despliegue de Netlify: no requiere JS del visitante.
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const input=JSON.parse(fs.readFileSync(path.join(root,"content/seo.json"),"utf8"));
const file=path.join(root,"index.html");
let html=fs.readFileSync(file,"utf8");
const escapeHtml=value=>value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
function validate(name,max){
 const v=input[name];
 if(typeof v!=="string"||!v.trim()||v.length>max||/[\x00-\x1f\x7f]/.test(v))
  throw new Error("SEO inválido en "+name+" (texto obligatorio, máximo "+max+" caracteres)");
 return v.trim();
}
const title=escapeHtml(validate("title",75));
const description=escapeHtml(validate("description",220));
const ogTitle=escapeHtml(validate("og_title",100));
const ogDescription=escapeHtml(validate("og_description",240));
const heading=escapeHtml(validate("section_heading",120));
const intro=escapeHtml(validate("section_intro",500));
if(!Array.isArray(input.search_phrases)||!input.search_phrases.every(x=>typeof x==="string"&&x.length<100))
 throw new Error("Lista de frases SEO inválida");
function single(regex,replacement,label){
 const matches=[...html.matchAll(new RegExp(regex.source,regex.flags.includes("g")?regex.flags:regex.flags+"g"))];
 if(matches.length!==1)throw new Error("No se encontró una única etiqueta para "+label+": "+matches.length);
 html=html.replace(regex,replacement);
}
single(/<title>[^<]*<\/title>/,"<title>"+title+"</title>","title");
single(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+description+'">',"description");
single(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="'+ogTitle+'">',"og:title");
single(/<meta property="og:description" content="[^"]*">/,'<meta property="og:description" content="'+ogDescription+'">',"og:description");
single(/(<div class="seo-service-links" aria-label="Información detallada de servicios">\s*<h3>)[^<]*(<\/h3>\s*<p>)[^<]*(<\/p>)/,"$1"+heading+"$2"+intro+"$3","sección de servicios");
fs.writeFileSync(file,html);
console.log("SEO estático actualizado desde content/seo.json. Frases orientativas en el administrador: "+input.search_phrases.length);
