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
