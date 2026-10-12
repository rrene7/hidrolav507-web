/* Validación preventiva de adjuntos de Netlify Forms.
   No modifica ni transmite fotografías hasta que la persona pulse Enviar. */
(()=>{"use strict";
function init(){
 const form=document.getElementById("quote-form");
 const feedback=document.getElementById("photo-feedback");
 if(!form||!feedback)return;
 const fields=["foto_1","foto_2"].map(name=>form.elements.namedItem(name)).filter(Boolean);
 const accepted=new Set(["image/jpeg","image/png","image/webp"]);
 // Netlify admite como máximo 8 MB en toda la solicitud multipart.
 const maxPhotos=7*1024*1024;
 function validate(){
  const photos=fields.map(field=>field.files?.[0]).filter(Boolean);
  const bytes=photos.reduce((sum,file)=>sum+file.size,0);
  const invalidType=photos.find(file=>!accepted.has(file.type));
  let msg="",error=false;
  if(invalidType){msg="Formato no admitido. Utiliza JPG, PNG o WebP.";error=true}
  else if(bytes>maxPhotos){msg="Tus imágenes pesan "+(bytes/1048576).toFixed(1)+" MB. Elige fotografías más pequeñas (máximo 7 MB entre ambas).";error=true}
  else if(photos.length){msg=photos.length+" fotografía(s) seleccionada(s) · "+(bytes/1048576).toFixed(1)+" MB de 7 MB recomendados."}
  else{msg="Puedes adjuntar hasta dos fotografías. Máximo 7 MB entre ambas."}
  feedback.textContent=msg;
  feedback.classList.toggle("error",error);
  // Ocultar aviso repetitivo hasta que se adjunte una foto o haya un error.
  feedback.hidden=!photos.length&&!error;
  return !error;
 }
 fields.forEach(field=>field.addEventListener("change",validate));
 form.addEventListener("submit",event=>{
  if(!validate()){
   event.preventDefault();
   feedback.focus();
  }
 });
 validate();
}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init)}
else init();
})();