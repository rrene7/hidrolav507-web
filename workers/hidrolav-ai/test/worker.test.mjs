import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.mjs";

const origin="https://hidrolav507.netlify.app";
const makeEnv=(overrides={})=>({
 AI:{run:async(model,opts)=>({response:"Podemos evaluar tu área. Envíanos fotos por el formulario."})},
 CHAT_RATE:{limit:async()=>({success:true})},
 CHAT_GLOBAL:{limit:async()=>({success:true})},
 ...overrides
});
const request=(data,opts={})=>new Request("https://hidrolav507-asistente.ejemplo.workers.dev/chat",{
 method:"POST",headers:{"Origin":origin,"Content-Type":"application/json",...(opts.headers||{})},
 body:JSON.stringify(data)
});
test("health indica disponibilidad sin invocar IA",async()=>{
 const response=await worker.fetch(new Request("https://ejemplo.workers.dev/health",{headers:{Origin:origin}}),makeEnv());
 assert.equal(response.status,200);const data=await response.json();
 assert.equal(data.ok,true);assert.equal(data.ai,true);assert.equal(data.rate_limit,true);
});
test("deniega otros orígenes y no invoca IA",async()=>{
 let count=0;const env=makeEnv({AI:{run:async()=>{count++}}});
 const response=await worker.fetch(request({message:"Hola"},{headers:{"Origin":"https://sitio-malicioso.test"}}),env);
 assert.equal(response.status,403);assert.equal(count,0);
});
test("OPTIONS admite el sitio oficial",async()=>{
 const response=await worker.fetch(new Request("https://ejemplo.workers.dev/chat",{method:"OPTIONS",headers:{"Origin":origin}}),makeEnv());
 assert.equal(response.status,204);
 assert.equal(response.headers.get("access-control-allow-origin"),origin);
});
test("rechaza mensajes vacíos",async()=>{
 const response=await worker.fetch(request({message:"   "}),makeEnv());
 assert.equal(response.status,400);
});
test("exige binding de IA y limitadores",async()=>{
 const response=await worker.fetch(request({message:"Hola"}),makeEnv({AI:undefined}));
 assert.equal(response.status,503);
});
test("limita las solicitudes antes de usar IA",async()=>{
 let called=false;
 const response=await worker.fetch(request({message:"Cotización"}),makeEnv({
 CHAT_RATE:{limit:async()=>({success:false})},
 AI:{run:async()=>{called=true}}
 }));
 assert.equal(response.status,429);assert.equal(called,false);
});
test("usa un modelo real y reglas del negocio, sin guardar datos",async()=>{
 let model,options;
 const env=makeEnv({AI:{run:async(m,o)=>{model=m;options=o;return {response:"Cotizamos luego de evaluar el terreno."}}}});
 const response=await worker.fetch(request({message:"¿Qué precio tienen?",history:[{role:"user",content:"Soy de La Chorrera"}]}),env);
 assert.equal(response.status,200);
 assert.equal((await response.json()).reply,"Cotizamos luego de evaluar el terreno.");
 assert.match(model,/llama-3\.1-8b-instruct-fp8-fast/);
 assert.match(options.messages[0].content,/NO inventes tarifas/);
 assert.equal(options.messages.at(-1).content,"¿Qué precio tienen?");
 assert.equal(response.headers.get("cache-control"),"no-store");
});
test("no revela detalles técnicos cuando falla la IA",async()=>{
 const response=await worker.fetch(request({message:"Hola"}),makeEnv({AI:{run:async()=>{throw Error("SECRET INTERNAL")}}}));
 assert.equal(response.status,503);
 assert.doesNotMatch(JSON.stringify(await response.json()),/SECRET INTERNAL/);
});


test("no envía un número de WhatsApp de cliente al modelo",async()=>{
 let count=0;
 const env=makeEnv({AI:{run:async()=>{count++;return {response:"inseguro"}}}});
 const response=await worker.fetch(request({message:"Mi WhatsApp es 6241-2457, escríbeme por favor"}),env);
 assert.equal(response.status,200);
 const reply=(await response.json()).reply;
 assert.match(reply,/no compartas números|no compartas.*telef|privacidad/i);
 assert.equal(count,0);
});
test("rechaza también contactos con código internacional y excluye contactos del historial",async()=>{
 let calls=0,options;
 const env=makeEnv({AI:{run:async(_m,o)=>{calls++;options=o;return {response:"Puedes usar nuestro botón de WhatsApp para escribirnos."}}}});
 const first=await worker.fetch(request({message:"+507 6241 2457"}),env);
 assert.equal(first.status,200);assert.equal(calls,0);
 const second=await worker.fetch(request({message:"¿Cómo solicito una cotización?",history:[
  {role:"user",content:"Mi número es 6241-2457"},
  {role:"assistant",content:"Te enviaré un mensaje de WhatsApp."},
  {role:"user",content:"La Chorrera"}
 ]}),env);
 assert.equal(second.status,200);assert.equal(calls,1);
 const saved=options.messages.map(x=>x.content).join("\n");
 assert.doesNotMatch(saved,/6241-2457|Te enviaré un mensaje/);
 assert.match(saved,/La Chorrera/);
});
test("bloquea falsas promesas de enviar WhatsApp, aunque la IA las genere",async()=>{
 const examples=[
  "Te enviaré un mensaje de WhatsApp para confirmar tu cita.",
  "Voy a enviar un mensaje a tu número de WhatsApp.",
  "Te contactaremos para una cotización.",
  "¿Cuál es tu número de WhatsApp?",
  "Dime tu número para poder llamarte.",
  "Ya he registrado tu reserva.",
  "Recibirás un mensaje por WhatsApp pronto."
 ];
 for(const responseText of examples){
  const env=makeEnv({AI:{run:async()=>({response:responseText})}});
  const r=await worker.fetch(request({message:"Necesito cotizar"}),env);
  const reply=(await r.json()).reply;
  assert.equal(r.status,200);
  assert.match(reply,/No puedo enviar mensajes ni registrar cotizaciones/i,responseText);
  assert.match(reply,/Cotización|WhatsApp/);
  assert.doesNotMatch(reply,/Te enviaré|Te contactaremos|Cuál es tu número|Recibirás un mensaje/i);
 }
});
test("la IA puede orientar a formulario y WhatsApp sin prometer envíos",async()=>{
 const env=makeEnv({AI:{run:async()=>({response:"Para cotizar, pulsa «Cotización» y envía fotos. También puedes abrir WhatsApp y enviar el mensaje tú mismo."})}});
 const r=await worker.fetch(request({message:"Quiero limpiar mi patio"}),env);
 assert.equal(r.status,200);
 assert.match((await r.json()).reply,/envía fotos/);
});
