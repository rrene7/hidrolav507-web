# Asistente IA real — HidroLav 507 Panamá

## Arquitectura
- Página pública: Netlify (sin migrar). Botón **Asistente IA** en el menú principal.
- API de conversaciones: Cloudflare Worker `hidrolav507-asistente`, código en `workers/hidrolav-ai/src/index.mjs`.
- Modelo: `@cf/meta/llama-3.1-8b-instruct-fp8-fast`, mediante binding `AI`, sin claves de IA expuestas en el navegador.
- Límites en Worker: 12 solicitudes/minuto por dirección IP y 60/minuto por centro de datos (binding Rate Limiting). Los contadores son aproximados y locales; **no** son un control perfecto contra abusos.
- Control de habilitación: `content/assistant.json`, editable desde Sveltia CMS. Comienza **desactivado**, sin URL inventada y sin botón engañoso. Una vez habilitado, el frontend verifica `GET /health` y sólo entonces muestra el chat.

## Desplegar Cloudflare Worker en plan Free (pasos del titular de la cuenta)

1. Entra en https://dash.cloudflare.com/ y crea o accede a tu cuenta con el plan **Workers Free**. No es necesario trasladar el dominio ni Netlify.
2. Ve a **Workers & Pages → Create application → Import a repository**. Conecta GitHub, autoriza el repositorio privado `rrene7/hidrolav507-web` y selecciona la rama `main`. **No compartas claves ni contraseñas por chat.**
3. Configura el nombre de Worker **`hidrolav507-asistente`**, la **Root directory `workers/hidrolav-ai`**, y el comando de despliegue **`npx wrangler deploy`**. El archivo `wrangler.json` ya define los bindings `AI`, `CHAT_RATE` y `CHAT_GLOBAL`.
4. Selecciona **Save and Deploy**. Espera a ver estado Published / Success y guarda la URL pública real `https://hidrolav507-asistente.TU-SUBDOMINIO.workers.dev`. La URL asignada la decide Cloudflare: no la adivines.
5. Visita `https://...workers.dev/health` desde tu navegador: debe mostrar `{"ok":true,"ai":true,"rate_limit":true}`. Si `ai` o `rate_limit` es falso, revisa los bindings y vuelve a desplegar.
6. Abre `https://hidrolav507.netlify.app/admin/` → **Asistente IA → Conexión Cloudflare Workers AI**. En **URL del endpoint HTTPS** pon la URL real + `/chat`; ejemplo `https://hidrolav507-asistente.TU-SUBDOMINIO.workers.dev/chat`. Activa **Activar asistente IA** y guarda.
7. Comprueba que Netlify haya publicado el cambio al `content/assistant.json` (la publicación puede tardar algunos minutos), recarga con Ctrl+F5 y abre el botón **Asistente IA** en la cabecera. Haz pruebas de servicios, zona atendida, planes 2+1, 4+1 y 6+1, cotizaciones sin tarifas inventadas y acceso al formulario.

**Importante:** Cloudflare tiene 10.000 neuronas gratis por día en Workers AI, no 10.000 mensajes. Si se supera la cuota, las peticiones fallan; para continuar gratis, espera al siguiente día. No actives Workers Paid si quieres cero cargos. Monitorea las neuronas en el panel Workers AI.

## Seguridad, privacidad y límites
- Sólo se aceptan peticiones con `Origin: https://hidrolav507.netlify.app`. Esto es una medida de compatibilidad/CORS, **no** autentica al usuario y no impide clientes automatizados que falsifiquen el origen.
- El servidor comprueba tamaños de solicitud, rol e historial, limita el contexto y no guarda conversaciones. La IA procesa los textos enviados: la privacidad de Cloudflare también aplica.
- No se transmiten fotografías a Workers AI, ni se envían automáticamente datos del formulario a la IA.
- No puede generar presupuestos vinculantes, fijar citas, recibir pagos, guardar clientes ni mandar notificaciones.
- Limitaciones por centro de datos y por IP **no garantizan** protección total contra abuso. Para una publicación de mayor volumen, habilita Cloudflare Turnstile con validación de tokens en el Worker y revisa métricas de consumo.
- Para una prueba local sin costos: desde cualquier Node >=20 usa `node --test workers/hidrolav-ai/test/worker.test.mjs`. Se simula el modelo, así que no se consumen neuronas.
- Si la API deja de estar disponible, el botón no aparecerá en recargas posteriores y los canales de WhatsApp y cotización siguen funcionando.

Referencias técnicas:
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers-ai/configuration/bindings/
- https://developers.cloudflare.com/workers/ci-cd/builds/
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
