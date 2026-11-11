/* HidroLav 507 — GA4: se carga solo tras aceptación explícita. */
(()=>{'use strict';
const ID='G-JWL583NRP8', KEY='hidrolav507_analytics_consent_v1';
const QUOTE_KEY='hidrolav507_quote_pending_v1';
let active=false;
function read(){try{return localStorage.getItem(KEY)}catch{return null}}
function save(value){try{localStorage.setItem(KEY,value)}catch{}}
function start(){
 if(active)return;
 active=true;
 window.dataLayer=window.dataLayer||[];
 window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
 window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 window.gtag('consent','update',{analytics_storage:'granted'});
 window.gtag('js',new Date());
 window.gtag('config',ID,{send_page_view:true,anonymize_ip:true});
 const script=document.createElement('script');
 script.async=true;
 script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(ID);
 document.head.appendChild(script);
}
const style=document.createElement('style');
style.textContent='.hl-privacy{position:fixed;z-index:100000;bottom:12px;left:12px;right:12px;max-width:560px;margin:auto;padding:16px 18px;border:1px solid #c5d8e4;border-radius:14px;background:#fff;color:#102c42;box-shadow:0 8px 30px #001b3350;font:14px/1.45 system-ui,Arial,sans-serif}.hl-privacy p{margin:0 0 12px}.hl-privacy-actions{display:flex;flex-wrap:wrap;gap:8px}.hl-privacy button{background:#073b61;color:#fff;border:1px solid #073b61;border-radius:9px;padding:9px 12px;font:600 14px system-ui;cursor:pointer}.hl-privacy button[data-choice="reject"]{background:#fff;color:#073b61}.hl-privacy button:focus-visible,.hl-privacy-settings:focus-visible{outline:3px solid #0b9fe0;outline-offset:2px}.hl-privacy-settings{font:12px/1.4 system-ui,Arial,sans-serif;background:transparent;border:0;color:inherit;text-decoration:underline;cursor:pointer;margin-left:8px}';
document.head.appendChild(style);
function banner(){
 if(document.getElementById('hl-privacy-banner'))return;
 const box=document.createElement('section');box.id='hl-privacy-banner';box.className='hl-privacy';box.setAttribute('role','region');box.setAttribute('aria-label','Preferencias de privacidad');
 const p=document.createElement('p');p.textContent='¿Nos permites usar Google Analytics para medir visitas y mejorar HidroLav 507? Es opcional; no se activa hasta que aceptes.';
 const actions=document.createElement('div');actions.className='hl-privacy-actions';
 [['reject','No aceptar'],['accept','Aceptar estadísticas']].forEach(([choice,label])=>{
   const btn=document.createElement('button');btn.type='button';btn.dataset.choice=choice;btn.textContent=label;
   btn.addEventListener('click',()=>{save(choice);box.remove();if(choice==='accept')start();else if(active){if(typeof window.gtag==='function')window.gtag('consent','update',{analytics_storage:'denied'});location.reload();}});
   actions.appendChild(btn);
 });
 box.append(p,actions);document.body.appendChild(box);
}
function init(){
 const consent=read();
 // Un envío solo se cuenta al llegar a la confirmación de Netlify; nunca al pulsar el botón.
 const quoteForm=document.getElementById('quote-form');
 if(quoteForm){quoteForm.addEventListener('submit',(event)=>{
  if(!active||event.defaultPrevented||!quoteForm.checkValidity())return;
  try{sessionStorage.setItem(QUOTE_KEY,String(Date.now()))}catch{}
 });}
 if(location.pathname==='/gracias'||location.pathname==='/gracias.html'){
  let submitted=0;
  try{submitted=Number(sessionStorage.getItem(QUOTE_KEY)||0);sessionStorage.removeItem(QUOTE_KEY)}catch{}
  if(consent==='accept'&&submitted>0&&Date.now()-submitted<10*60*1000){
   start();
   window.gtag('event','quote_form_submitted',{event_category:'lead',transport_type:'beacon'});
  }
 }
 if(consent==='accept')start();else if(consent!== 'reject')banner();
 const footer=document.querySelector('footer');
 if(footer){
  const btn=document.createElement('button');btn.type='button';btn.className='hl-privacy-settings';btn.textContent='Privacidad y estadísticas';
  btn.addEventListener('click',banner);footer.appendChild(btn);
 }
 document.addEventListener('click',(e)=>{
  if(!active||typeof window.gtag!=='function'||e.defaultPrevented)return;
  const link=e.target.closest?.('a[href]');
  if(!link)return;
  try{if(new URL(link.href,location.href).hostname==='wa.me')window.gtag('event','contact_whatsapp_click',{event_category:'contact',transport_type:'beacon'});}catch{}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
