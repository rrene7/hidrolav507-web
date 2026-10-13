# Posicionamiento local de HidroLav 507

Sitio: https://hidrolav507.netlify.app

## Mejoras técnicas
- Metaetiquetas, canonical y previsualización social en la portada.
- Seis páginas informativas de servicios concretos enlazadas desde la portada, incluyendo pisos de concreto y exteriores comerciales. Cada página tiene contenidos y preguntas frecuentes específicos, canonical, descripción y datos estructurados `Service`; las nuevas incorporan además `BreadcrumbList`.
- Sitemap: https://hidrolav507.netlify.app/sitemap.xml
- Robots: https://hidrolav507.netlify.app/robots.txt
- En la portada: `ProfessionalService` con nombre, teléfono, correo oficial, URL, logo, `PostalAddress` a nivel de localidad (sin inventar una calle) y catálogo de servicios; en las páginas de servicios: datos `Service` y enlaces internos.
- La URL principal se enfoca en búsquedas relevantes como *hidrolavado en La Chorrera*, *limpieza a presión en Panamá Oeste* y *servicios de hidrolavado en Ciudad de Panamá*, sin prometer posiciones.
- El administrador `/admin/` no debe indexarse; mantiene el encabezado `X-Robots-Tag: noindex` de Netlify.

## Paso que debe completar el propietario
1. Abrir https://search.google.com/search-console/ con la cuenta de su negocio.
2. Agregar la propiedad tipo **Prefijo de URL**: `https://hidrolav507.netlify.app/`.
3. Verificar propiedad. Si Google proporciona metaetiqueta o archivo HTML, entrégalo para colocarlo en GitHub sin revelar contraseñas.
4. En **Sitemaps**, enviar `sitemap.xml`.
5. En inspección de URL, probar la portada y páginas del sitemap, y solicitar indexación si corresponde.
6. Revisar impresiones, clics, páginas y consultas reales cada 2 a 4 semanas. Posicionamiento no garantizado.

## Trabajo fuera de la web
- Optimizar el perfil de negocio existente de Google Maps, categoría real, horarios, servicios y fotografías **reales** de trabajos.
- Pedir reseñas honestas a clientes reales sin incentivos.
- Conseguir menciones y enlaces relevantes desde empresas, directorios comerciales locales y clientes.
- No crear páginas duplicadas por cada corregimiento, ni llenar textos de palabras clave sin aportar información.

## Medir el resultado de esta fase
- En Google Search Console, inspeccionar y solicitar rastreo de las dos páginas nuevas después de verificar el despliegue de Netlify.
- Reenviar el sitemap actualizado (`sitemap.xml`, siete URLs). No es necesario crear una propiedad nueva si la propiedad del sitio ya está verificada.
- Durante las próximas 4 a 8 semanas, comparar **impresiones**, **clics**, **consultas** y **páginas** para La Chorrera, Panamá Oeste, pisos de concreto y limpieza de exteriores comerciales. La indexación no está garantizada.
- Comprobar estado de cobertura y problemas de datos estructurados con [Rich Results Test](https://search.google.com/test/rich-results) y herramientas de inspección.
- Google Business Profile debe reflejar solo categorías, zonas de servicio y horarios reales; no inventar una dirección de atención pública si el negocio es a domicilio.
- Priorizar fotos reales, reseñas auténticas y un perfil verificado de Google Maps. El código no puede confirmar por sí solo impresiones o posiciones en Google.

## Editar posicionamiento desde el administrador
- Abre https://hidrolav507.netlify.app/admin/ y entra a **Posicionamiento en Google (SEO)** → **Qué escribir para encontrarnos en Google**.
- El título, descripción y previsualización social se guardan en `content/seo.json` y se aplican al **HTML estático** en cada publicación de Netlify mediante `scripts/generar-seo.mjs`. Se debe esperar a que termine el deploy, no se aplican al instante.
- El encabezado y párrafo informativo de los servicios también se publican como texto visible y editado, con enlaces a las seis páginas.
- La lista «Frases que pueden escribir para encontrarnos» sirve como **guía editorial y de medición**, no como etiqueta `meta keywords` (Google no utiliza esta etiqueta para posicionar).
- **No son los datos de Google Maps**: el Perfil de Empresa se administra aparte y los cambios aquí no actualizan Maps.
- Evita repetir palabras mecánicamente; describe solo los servicios y localidades realmente atendidos. Los resultados se medirán en Search Console con GSC Wizard de solo lectura.
