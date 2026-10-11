# HidroLav 507 Panamá — Sitio oficial

**Web pública existente:** https://hidrolav507.netlify.app

**Panel de administración (pendiente de conectar repositorio en Netlify):** https://hidrolav507.netlify.app/admin/

## Estado
- ✅ Web original e imágenes importadas desde Netlify, sin alterar la página pública.
- ✅ Administrador Sveltia CMS configurado para el repositorio privado `rrene7/hidrolav507-web`.
- ✅ Contenido editable en `content/site.json`.
- ✅ Nuevas fotografías se almacenarán en `assets/uploads` al guardarlas en el CMS.
- ⏳ Falta **vincular este repositorio al proyecto EXISTENTE** de Netlify `hidrolav507` (no crear otro proyecto).
- ⏳ Falta probar el primer acceso al administrador y la primera edición real.

## Conectar Netlify (solo una vez)
Desde tu proyecto ACTUAL `hidrolav507` en Netlify: **Project configuration → Build & deploy → Continuous deployment → Link repository** (el menú puede variar) → GitHub → `rrene7/hidrolav507-web`, branch `main`. Publicar desde la carpeta raíz `.` y sin comando de compilación.

**Comprueba la previsualización antes de confirmar el despliegue**, para conservar la web y sus fotos. No importes este repositorio como un sitio nuevo; se perdería la URL que ya anuncias.

## Editar desde el administrador
Luego de conectar Netlify:
1. Abre `https://hidrolav507.netlify.app/admin/`.
2. Inicia sesión con **Sign in with Token**, usando un token de GitHub **fine-grained** limitado exclusivamente a `rrene7/hidrolav507-web`, con **Contents: Read and write**. El token se crea desde [GitHub personal access tokens](https://github.com/settings/personal-access-tokens/new).
3. **Nunca compartas ni pegues el token en chats ni archivos del repositorio.** Úsalo únicamente en el formulario de Sveltia CMS y en un dispositivo de confianza.
4. Abre “Mi página web → Editar HidroLav 507”. Cambia textos, servicios, imágenes y presiona Publicar/Guardar. Los cambios se confirman en GitHub y Netlify los publicará automáticamente.

**Importante:** el token se guarda en el almacenamiento del navegador. Si usas equipos compartidos, cierra sesión y borra los datos del sitio.

## Verificaciones
- Workflow **Importar web publicada a GitHub** importó el diseño y 5 imágenes.
- Workflow **Validar sitio y administrador** verifica los archivos esenciales en cada cambio.

Las fotos de galería son ilustrativas hasta que agregues fotos auténticas; no se presentan como trabajos realizados por la empresa.

**WhatsApp:** +507 6273-0591 · **Cobertura:** Ciudad de Panamá y Panamá Oeste.
