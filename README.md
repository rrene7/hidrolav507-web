# HidroLav 507 Panamá — Página web oficial

**Sitio público actual:** https://hidrolav507.netlify.app

Este repositorio privado guardará la página web y el contenido editable (textos, servicios, fotos y cotizaciones mediante WhatsApp).

## Estado
- Repositorio creado.
- **Pendiente:** subir los archivos de la web; conectar este repositorio al proyecto Netlify **existente** llamado `hidrolav507`.
- **Pendiente:** activar el administrador Sveltia CMS en `/admin/`.
- La página que está publicada con Netlify Drop **continúa independiente** hasta enlazarla con GitHub.

## Instalación de los archivos
1. Obtén el paquete **HidroLav_507_Admin_Sveltia_GitHub.zip** entregado en el chat.
2. Descomprime el ZIP y abre esta carpeta en tu equipo.
3. En este repositorio usa **Add file → Upload files**. Arrastra el contenido **INTERNO** de esa carpeta, incluyendo `index.html`, `admin/`, `assets/`, `content/` y `netlify.toml`. No subas la carpeta contenedora como subcarpeta.
4. Crea el commit en la rama `main` y verifica que `index.html` está directamente en la raíz.
5. En tu proyecto **existente** de Netlify, vincula este repositorio para desplegar la rama main (directorio de publicación `.`, sin comando de compilación).

## Administración
El panel estará disponible en https://hidrolav507.netlify.app/admin/ **después del despliegue**.

Usa **Sveltia CMS con backend GitHub**; NO requiere Netlify Identity ni Git Gateway.
Por seguridad, el acceso inicial recomendado es mediante un token GitHub de alcance limitado (fine-grained), solo para `rrene7/hidrolav507-web` y con permiso **Contents: Read and write**.
**Nunca** pegues el token en GitHub, Netlify ni en el chat: introdúcelo únicamente en la pantalla de inicio de sesión de Sveltia CMS.
El contenido público estará en `content/site.json`, las fotografías nuevas en `assets/uploads/`.

> Antes de vincular GitHub a Netlify, revisa que los archivos e imágenes estén completos para evitar que la web pública pierda contenido.

Contactos del negocio: **+507 6273-0591** · Ciudad de Panamá y Panamá Oeste.
